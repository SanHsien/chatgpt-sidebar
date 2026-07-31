// content.js
// 在 ChatGPT 頁面（頂層分頁或側邊欄 iframe）接收提示詞並寫入聊天輸入框。

(() => {
  if (globalThis.__chatgptSidebarContentReady) {
    return;
  }
  globalThis.__chatgptSidebarContentReady = true;

  const MESSAGE_SOURCE = 'chatgpt-sidebar';
  // 超過此長度改走一次 paste（比 insertText 快很多）
  const PASTE_THRESHOLD = 400;

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

  function textAppearsWritten(written, expected) {
    const w = normalizeText(written);
    const e = normalizeText(expected);
    if (!e) return w.length > 0;
    const head = e.slice(0, Math.min(20, e.length));
    return Boolean(head && w.includes(head));
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

  /** 明確清空（摘要／大綱／任何動作寫入前都要先清掉舊字）。 */
  function clearInput(el) {
    el.focus();
    selectAll(el);
    try {
      document.execCommand('delete', false, null);
    } catch (_err) {
      // ignore
    }
    // 若仍有殘留，再 selectAll 一次讓後續 insert／paste 覆蓋
    if ((readInputText(el) || '').trim()) {
      selectAll(el);
      try {
        document.execCommand('insertText', false, '');
      } catch (_err) {
        // ignore
      }
    }
  }

  function pasteText(el, text) {
    const dt = new DataTransfer();
    dt.setData('text/plain', text);
    return el.dispatchEvent(
      new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dt
      })
    );
  }

  /**
   * 先清空再寫入。短文 insertText；長文一次 paste（最快）。
   * 長文 paste 後不等 DOM 全同步，立即回報成功，避免卡住。
   */
  function setContentEditableValue(el, text) {
    clearInput(el);

    if (text.length >= PASTE_THRESHOLD) {
      try {
        pasteText(el, text);
      } catch (_err) {
        try {
          document.execCommand('insertText', false, text);
        } catch (_err2) {
          return { ok: false };
        }
      }
      // 長文：已送出 paste，視為成功（不等整段渲染完）
      return { ok: true, fast: true };
    }

    try {
      if (!document.execCommand('insertText', false, text)) {
        pasteText(el, text);
      }
    } catch (_err) {
      try {
        pasteText(el, text);
      } catch (_err2) {
        return { ok: false };
      }
    }

    if (textAppearsWritten(readInputText(el), text)) {
      return { ok: true };
    }
    // 短文驗證失敗再 paste 一次
    clearInput(el);
    try {
      pasteText(el, text);
    } catch (_err) {
      return { ok: false };
    }
    return { ok: textAppearsWritten(readInputText(el), text) };
  }

  function insertPrompt(promptText, options = {}) {
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
        const result = setContentEditableValue(input, text);
        if (!result.ok) {
          return { ok: false, reason: 'write_failed' };
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
   * 有輸入框時：最多寫兩次就結束（長文不狂重試）。
   * 無輸入框時：短輪詢等待出現。
   */
  function insertPromptWithRetry(promptText, options = {}, timeoutMs = 2000) {
    return new Promise((resolve) => {
      let settled = false;
      let interval = null;
      let timer = null;

      const finish = (result) => {
        if (settled) return;
        settled = true;
        if (interval != null) clearInterval(interval);
        if (timer != null) clearTimeout(timer);
        resolve(result);
      };

      const first = insertPrompt(promptText, options);
      if (first.ok) {
        finish(first);
        return;
      }
      if (first.reason !== 'no_input') {
        const second = insertPrompt(promptText, options);
        finish(second.ok ? second : first);
        return;
      }

      const start = Date.now();
      interval = setInterval(() => {
        const result = insertPrompt(promptText, options);
        if (result.ok) {
          finish(result);
          return;
        }
        if (result.reason !== 'no_input' || Date.now() - start > timeoutMs) {
          finish({
            ok: false,
            reason: findChatInput() ? result.reason || 'write_failed' : 'no_input'
          });
        }
      }, 200);

      timer = setTimeout(() => {
        finish({
          ok: false,
          reason: findChatInput() ? 'write_failed' : 'no_input'
        });
      }, timeoutMs + 100);
    });
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
    if (event.source !== window.parent) return;

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
