// content.js
// 在 ChatGPT 頁面（頂層分頁或側邊欄 iframe）接收提示詞並寫入聊天輸入框。

(() => {
  if (globalThis.__chatgptSidebarContentReady) {
    return;
  }
  globalThis.__chatgptSidebarContentReady = true;

  const MESSAGE_SOURCE = 'chatgpt-sidebar';
  // ChatGPT 會把 text/html 超過約 10 萬字元的 paste 整個丟掉（2026-10 實測 98k 可、109k 不可）。
  // panel.js 的 PASTE_HTML_MAX 必須同值，並用同一套 toPasteHtml 規則估長度。
  const PASTE_HTML_MAX = 95000;
  // execCommand('selectAll') 之後 ProseMirror 要等 selectionchange 才同步選取；
  // 立刻 paste 會用舊選取，變成接在舊字後面而不是取代。
  const SELECTION_SETTLE_MS = 50;

  function isVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function findChatInput() {
    const selectors = [
      '#prompt-textarea',
      'div#prompt-textarea[contenteditable="true"]',
      'textarea[data-id="root"]',
      '[contenteditable="true"][data-placeholder]',
      'textarea',
      '[contenteditable="true"]'
    ];
    const seen = new Set();
    for (const sel of selectors) {
      for (const el of document.querySelectorAll(sel)) {
        if (seen.has(el)) continue;
        seen.add(el);
        if (!isVisible(el)) continue;
        if (el.getAttribute('aria-hidden') === 'true') continue;
        if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;
        return el;
      }
    }
    return null;
  }

  function setNativeTextareaValue(textarea, text) {
    const proto = window.HTMLTextAreaElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
    if (descriptor && descriptor.set) {
      descriptor.set.call(textarea, text);
    } else {
      textarea.value = text;
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function readInputText(el) {
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      return el.value || '';
    }
    return el.innerText || el.textContent || '';
  }

  function normalizeText(s) {
    return String(s || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, '');
  }

  /** 輸入框內容就是這段提示詞：開頭相同、長度相近（擋「接在舊字後面」與「變成附件、框內空白」）。 */
  function textFullyWritten(written, expected) {
    const w = normalizeText(written);
    const e = normalizeText(expected);
    if (!e) return false;
    if (!w.startsWith(e.slice(0, Math.min(20, e.length)))) return false;
    return Math.abs(w.length - e.length) <= Math.max(20, Math.ceil(e.length * 0.05));
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** HTML 會把連續空白與行首空白壓成一個；改成 &nbsp; 保住縮排。 */
  function keepSpaces(s) {
    return s.replace(/ {2,}/g, (m) => `${'&nbsp;'.repeat(m.length - 1)} `).replace(/^ /, '&nbsp;');
  }

  /** 一行一個 <p>。panel.js 有同一份 toPasteHtml 用來估長度，兩份必須一致。 */
  function toPasteHtml(text) {
    return text
      .split('\n')
      .map((line) => `<p>${keepSpaces(escapeHtml(line))}</p>`)
      .join('');
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function selectAll(el) {
    el.focus();
    try {
      document.execCommand('selectAll', false, null);
      return true;
    } catch (_err) {
      const selection = window.getSelection();
      if (!selection) return false;
      const range = document.createRange();
      range.selectNodeContents(el);
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    }
  }

  /**
   * 只放 text/html：ChatGPT 會把長的 text/plain paste 轉成「貼上的文字附件」，
   * 輸入框裡什麼都沒有。text/html 會照段落留在輸入框。
   */
  function pasteHtml(el, html) {
    const dt = new DataTransfer();
    dt.setData('text/html', html);
    return el.dispatchEvent(
      new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dt
      })
    );
  }

  /**
   * 全選後一次 paste 取代舊字，寫完讀回輸入框比對；沒真的進框就回報失敗，不假報成功。
   * 不用 execCommand('delete') 清空：ProseMirror 刪長文要數十秒、整頁卡住。
   * 也不用逐行 insertText：5000 字就要 10 秒。
   */
  async function setContentEditableValue(el, text) {
    const html = toPasteHtml(text);
    if (html.length > PASTE_HTML_MAX) return { ok: false, reason: 'too_long' };

    selectAll(el);
    await sleep(SELECTION_SETTLE_MS);

    let handled = false;
    try {
      // dispatchEvent 回 false = 編輯器 preventDefault 了，表示它自己接手處理。
      handled = pasteHtml(el, html) === false;
    } catch (_err) {
      handled = false;
    }
    // 合成 paste 沒被編輯器處理就什麼都不會寫入；此時改用 insertText（取代目前選取）。
    if (!handled) {
      try {
        if (!document.execCommand('insertText', false, text)) return { ok: false };
      } catch (_err) {
        return { ok: false };
      }
    }
    return { ok: textFullyWritten(readInputText(el), text) };
  }

  async function insertPrompt(promptText, options = {}) {
    const input = findChatInput();
    if (!input) return { ok: false, reason: 'no_input' };

    const text = String(promptText ?? '');
    if (!text) return { ok: false, reason: 'empty' };

    try {
      input.focus();
      if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
        setNativeTextareaValue(input, ''); // 先清空
        setNativeTextareaValue(input, text);
      } else if (input.isContentEditable || input.getAttribute('contenteditable') === 'true') {
        const result = await setContentEditableValue(input, text);
        if (!result.ok) {
          return { ok: false, reason: result.reason || 'write_failed' };
        }
      } else {
        return { ok: false, reason: 'no_input' };
      }

      if (options.focusAfterInsert === true) {
        input.focus();
      }
      return { ok: true };
    } catch (err) {
      console.warn('Failed to insert prompt:', err);
      return { ok: false, reason: String(err && err.message ? err.message : err) };
    }
  }

  /**
   * 有輸入框時只寫一次：長文 paste 要 1～2 秒，重試會超過 panel 等待的時間。
   * 無輸入框時：短輪詢等待出現。
   */
  async function insertPromptWithRetry(promptText, options = {}, timeoutMs = 2000) {
    const first = await insertPrompt(promptText, options);
    if (first.ok || first.reason !== 'no_input') return first;

    const start = Date.now();
    while (Date.now() - start <= timeoutMs) {
      await sleep(200);
      const result = await insertPrompt(promptText, options);
      if (result.ok) return result;
      if (result.reason !== 'no_input') return result;
    }
    return { ok: false, reason: 'no_input' };
  }

  function replyToParent(requestId, result) {
    const payload = {
      source: MESSAGE_SOURCE,
      action: 'insert_prompt_result',
      requestId,
      ok: Boolean(result.ok),
      reason: result.reason || null
    };
    try {
      window.parent.postMessage(payload, '*');
    } catch (err) {
      console.warn('Failed to post result to parent:', err);
    }
  }

  window.addEventListener('message', (event) => {
    // 只認側邊欄 parent 送來的 ping／寫入請求；嵌套 frame 或頁內腳本直接落地。
    if (event.source !== window.parent) return;
    const data = event.data;
    if (!data || data.source !== MESSAGE_SOURCE) return;

    if (data.action === 'ping') {
      try {
        window.parent.postMessage(
          { source: MESSAGE_SOURCE, action: 'pong', requestId: data.requestId },
          '*'
        );
      } catch (_err) {
        // ignore
      }
      return;
    }

    if (data.action !== 'insert_prompt') return;

    const requestId = data.requestId;
    const options = { focusAfterInsert: data.focusAfterInsert === true };
    insertPromptWithRetry(data.prompt, options).then((result) => {
      if (requestId) replyToParent(requestId, result);
    });
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message) return;
    if (message.action === 'ping') {
      sendResponse({ ok: true, action: 'pong' });
      return;
    }
    if (message.action !== 'insert_prompt') return;
    const options = { focusAfterInsert: message.focusAfterInsert === true };
    insertPromptWithRetry(message.prompt, options)
      .then((result) => {
        try {
          sendResponse(result);
        } catch (_err) {
          // ignore
        }
      })
      .catch((err) => {
        try {
          sendResponse({ ok: false, reason: String(err && err.message ? err.message : err) });
        } catch (_err) {
          // ignore
        }
      });
    return true;
  });
})();
