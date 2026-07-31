// panel.js
// 側邊欄：登入檢查、多動作（摘要／翻譯／解釋／大綱）、頁面內文本機讀取、設定。

const MESSAGE_SOURCE = 'chatgpt-sidebar';
/** 頁面可見文字上限（盡量全文；僅防極端超大頁面拖垮記憶體）。 */
const CONTENT_MAX_CHARS = 100000;
/** 選取文字上限 */
const SELECTION_MAX_CHARS = 100000;

const STORAGE_KEYS = {
  origin: 'chatgptOrigin',
  focusAfterInsert: 'focusAfterInsert',
  includePageContent: 'includePageContent',
  templates: 'actionTemplates'
};

const DEFAULT_TEMPLATES = {
  summarize:
    '請依下列網頁資料以繁體中文摘要。\n\n' +
    '網址：{{url}}\n標題：{{title}}\n\n' +
    '頁面可見文字（可能截斷）：\n{{content}}\n\n' +
    '1) 用 5–7 句話概述主要觀點。\n' +
    '2) 依序分析背景、問題、方法與結論；未提及處標「未提及」。\n' +
    '3) 提供 3 個對讀者有用的具體建議。\n' +
    '若文字不足，可搭配網址判斷，但不要杜撰細節。',
  translate:
    '請把下列選取文字翻譯成流暢的繁體中文；保留專有名詞原文於括號（若有需要）。\n\n' +
    '來源網址：{{url}}\n\n選取文字：\n{{selection}}',
  explain:
    '請用繁體中文解釋下列選取文字的意思、脈絡與可能的背景；條理清楚、避免廢話。\n\n' +
    '來源網址：{{url}}\n標題：{{title}}\n\n選取文字：\n{{selection}}',
  outline:
    '請依下列網頁可見文字以繁體中文產出結構大綱（層級標題＋要點），並在最後給 3 句重點回顧。\n\n' +
    '網址：{{url}}\n標題：{{title}}\n\n頁面可見文字（可能截斷）：\n{{content}}'
};

const DEFAULT_SETTINGS = {
  chatgptOrigin: 'https://chatgpt.com',
  focusAfterInsert: false,
  includePageContent: true,
  actionTemplates: { ...DEFAULT_TEMPLATES }
};

const ACTION_LABELS = {
  summarize: '摘要',
  translate: '翻譯',
  explain: '解釋',
  outline: '大綱'
};

function normalizeOrigin(origin) {
  if (origin === 'https://chat.openai.com') return origin;
  return 'https://chatgpt.com';
}

function isSummarizableUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    if (parsed.hostname === 'chatgpt.com' || parsed.hostname === 'chat.openai.com') return false;
    return true;
  } catch {
    return false;
  }
}

function mergeTemplates(stored) {
  const out = { ...DEFAULT_TEMPLATES };
  if (stored && typeof stored === 'object') {
    for (const key of Object.keys(DEFAULT_TEMPLATES)) {
      if (typeof stored[key] === 'string' && stored[key].trim()) {
        out[key] = stored[key];
      }
    }
  }
  return out;
}

async function loadSettings() {
  const stored = await chrome.storage.sync.get([
    STORAGE_KEYS.origin,
    STORAGE_KEYS.focusAfterInsert,
    STORAGE_KEYS.includePageContent,
    STORAGE_KEYS.templates,
    'promptTemplate'
  ]);

  // 相容 v0.4 單一 promptTemplate → summarize
  let templates = mergeTemplates(stored[STORAGE_KEYS.templates]);
  if (
    typeof stored.promptTemplate === 'string' &&
    stored.promptTemplate.trim() &&
    !(stored[STORAGE_KEYS.templates] && stored[STORAGE_KEYS.templates].summarize)
  ) {
    templates = {
      ...templates,
      summarize: stored.promptTemplate.includes('{{url}}')
        ? stored.promptTemplate
        : templates.summarize
    };
  }

  return {
    chatgptOrigin: normalizeOrigin(stored[STORAGE_KEYS.origin] || DEFAULT_SETTINGS.chatgptOrigin),
    focusAfterInsert: Boolean(stored[STORAGE_KEYS.focusAfterInsert]),
    includePageContent:
      stored[STORAGE_KEYS.includePageContent] === undefined
        ? true
        : Boolean(stored[STORAGE_KEYS.includePageContent]),
    actionTemplates: templates
  };
}

async function saveSettings(settings) {
  await chrome.storage.sync.set({
    [STORAGE_KEYS.origin]: normalizeOrigin(settings.chatgptOrigin),
    [STORAGE_KEYS.focusAfterInsert]: Boolean(settings.focusAfterInsert),
    [STORAGE_KEYS.includePageContent]: Boolean(settings.includePageContent),
    [STORAGE_KEYS.templates]: mergeTemplates(settings.actionTemplates)
  });
}

async function getActiveContentTab() {
  const tabs = await chrome.tabs.query({ lastFocusedWindow: true });
  const active = tabs.find((t) => t.active && isSummarizableUrl(t.url));
  if (active) return active;
  const any = tabs.find((t) => isSummarizableUrl(t.url));
  if (any) return any;
  const all = await chrome.tabs.query({});
  return all.find((t) => t.active && isSummarizableUrl(t.url)) || null;
}

function extractPageContextInPage(maxChars, selectionMax) {
  const selectionRaw = (window.getSelection && window.getSelection().toString()) || '';
  let selection = selectionRaw.trim();
  if (selection.length > selectionMax) {
    selection = `${selection.slice(0, selectionMax)}\n…（選取已截斷）`;
  }
  const title = document.title || '';
  const url = location.href;
  const root =
    document.querySelector('article, main, [role="main"]') || document.body || document.documentElement;
  let content = root && root.innerText ? root.innerText : '';
  content = content.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (content.length > maxChars) {
    content = `${content.slice(0, maxChars)}\n…（已截斷）`;
  }
  return {
    url,
    title,
    selection,
    content
  };
}

async function readPageContext(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: extractPageContextInPage,
      args: [CONTENT_MAX_CHARS, SELECTION_MAX_CHARS]
    });
    const first = results && results[0] && results[0].result;
    if (!first) {
      throw new Error('empty_context');
    }
    return first;
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    if (/Cannot access contents|must request permission|host/i.test(msg)) {
      const e = new Error(msg);
      e.code = 'no_host_permission';
      throw e;
    }
    throw err;
  }
}

async function fetchAuthSession(origin) {
  const sessionUrl = `${origin}/api/auth/session`;
  try {
    const response = await fetch(sessionUrl, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store'
    });

    if (response.status === 403) {
      return {
        state: 'cloudflare',
        message: `ChatGPT 回傳 403（常見於 Cloudflare）。請先在分頁開啟 ${origin.replace('https://', '')} 完成驗證與登入，再按「重試」。`
      };
    }

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || !data || !data.accessToken) {
      return {
        state: 'unauthorized',
        message: `尚未登入 ChatGPT。請先在分頁開啟 ${origin.replace('https://', '')} 登入，再按「重試」。`
      };
    }

    return { state: 'authorized' };
  } catch (error) {
    console.error('Error fetching ChatGPT session:', error);
    return {
      state: 'error',
      message: '無法檢查登入狀態（網路或權限問題）。請稍後重試。'
    };
  }
}

function renderTemplate(template, ctx) {
  return template
    .split('{{url}}')
    .join(ctx.url || '')
    .split('{{title}}')
    .join(ctx.title || '')
    .split('{{selection}}')
    .join(ctx.selection || '（無選取文字）')
    .split('{{content}}')
    .join(ctx.content || '（未能讀取頁面文字；請改依網址判斷，或於設定關閉摘要附內文。）');
}

/** 不再為加速而截斷整段提示詞；長文靠 content.js 一次 paste。 */
function clampPrompt(prompt) {
  return String(prompt || '');
}

function withTimeout(promise, ms, reason) {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      resolve({ ok: false, reason: reason || 'timeout' });
    }, ms);
    Promise.resolve(promise).then(
      (value) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve({ ok: false, reason: String(err && err.message ? err.message : err) });
      }
    );
  });
}

function pingFrame(frame, timeoutMs = 600) {
  return new Promise((resolve) => {
    if (!frame || !frame.contentWindow) {
      resolve(false);
      return;
    }
    const requestId = `ping-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      resolve(ok);
    };
    const onMessage = (event) => {
      const data = event.data;
      if (!data || data.source !== MESSAGE_SOURCE || data.action !== 'pong') return;
      if (data.requestId !== requestId) return;
      finish(true);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    window.addEventListener('message', onMessage);
    try {
      frame.contentWindow.postMessage(
        { source: MESSAGE_SOURCE, action: 'ping', requestId },
        '*'
      );
    } catch (_err) {
      finish(false);
    }
  });
}

function postPromptToFrame(frame, prompt, focusAfterInsert) {
  return new Promise((resolve) => {
    if (!frame || !frame.contentWindow) {
      resolve({ ok: false, reason: 'iframe_missing' });
      return;
    }

    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    // 內容腳本端最長約 2.5s；這裡給一點緩衝即可
    const timeoutMs = 4000;
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      resolve(result);
    };

    const onMessage = (event) => {
      const data = event.data;
      if (!data || data.source !== MESSAGE_SOURCE || data.action !== 'insert_prompt_result') {
        return;
      }
      if (data.requestId !== requestId) return;
      finish({ ok: Boolean(data.ok), reason: data.reason || null });
    };

    const timer = setTimeout(() => {
      finish({ ok: false, reason: 'timeout' });
    }, timeoutMs);

    window.addEventListener('message', onMessage);

    try {
      frame.contentWindow.postMessage(
        {
          source: MESSAGE_SOURCE,
          action: 'insert_prompt',
          prompt,
          requestId,
          focusAfterInsert: Boolean(focusAfterInsert)
        },
        '*'
      );
    } catch (err) {
      finish({ ok: false, reason: String(err && err.message ? err.message : err) });
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const chatFrame = document.getElementById('chatFrame');
  const noticeEl = document.getElementById('notice');
  const noticeTitle = document.getElementById('noticeTitle');
  const noticeMessage = document.getElementById('noticeMessage');
  const noticeRetryBtn = document.getElementById('noticeRetryBtn');
  const noticeOpenLink = document.getElementById('noticeOpenLink');
  const actionButtons = Array.from(document.querySelectorAll('.action-btn'));
  const reloadSessionBtn = document.getElementById('reloadSessionBtn');
  const settingsToggleBtn = document.getElementById('settingsToggleBtn');
  const settingsEl = document.getElementById('settings');
  const originSelect = document.getElementById('originSelect');
  const includePageContentEl = document.getElementById('includePageContent');
  const focusAfterInsertEl = document.getElementById('focusAfterInsert');
  const templateActionSelect = document.getElementById('templateActionSelect');
  const promptTemplateEl = document.getElementById('promptTemplate');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const resetTemplateBtn = document.getElementById('resetTemplateBtn');
  const statusEl = document.getElementById('status');
  const hintBar = document.getElementById('hintBar');
  const hintTitle = document.getElementById('hintTitle');
  const hintMessage = document.getElementById('hintMessage');
  const hintDismissBtn = document.getElementById('hintDismissBtn');

  let chatReady = false;
  let settings = await loadSettings();
  let draftTemplates = { ...settings.actionTemplates };
  let actionBusy = false;

  function setStatus(text, title) {
    statusEl.textContent = text;
    statusEl.title = title || text || '';
  }

  function hideActionHint() {
    hintBar.classList.remove('is-visible');
    hintTitle.textContent = '';
    hintMessage.textContent = '';
  }

  /** 狀態列＋說明條：讀不到選取等情況要讓使用者看得見，不能只改右側短字。 */
  function showActionHint(title, message) {
    setStatus(title, message);
    hintTitle.textContent = title;
    hintMessage.textContent = message;
    hintBar.classList.add('is-visible');
  }

  function syncActionButtons() {
    const enabled = chatReady && !actionBusy;
    for (const btn of actionButtons) btn.disabled = !enabled;
  }

  function setActionBusy(busy) {
    actionBusy = Boolean(busy);
    syncActionButtons();
  }

  function setActionsEnabled(enabled) {
    // enabled=false 時強制停用；true 時仍受 actionBusy／chatReady 約束
    if (!enabled) {
      for (const btn of actionButtons) btn.disabled = true;
      return;
    }
    syncActionButtons();
  }

  function fillSettingsForm() {
    originSelect.value = settings.chatgptOrigin;
    includePageContentEl.checked = Boolean(settings.includePageContent);
    focusAfterInsertEl.checked = Boolean(settings.focusAfterInsert);
    const key = templateActionSelect.value || 'summarize';
    draftTemplates = { ...settings.actionTemplates };
    promptTemplateEl.value = draftTemplates[key] || DEFAULT_TEMPLATES[key];
    noticeOpenLink.href = `${settings.chatgptOrigin}/`;
  }

  function showNotice(title, message) {
    chatReady = false;
    setActionBusy(false);
    setActionsEnabled(false);
    chatFrame.classList.remove('is-visible');
    chatFrame.removeAttribute('src');
    noticeEl.classList.add('is-visible');
    noticeTitle.textContent = title;
    noticeMessage.textContent = message;
  }

  function showChatFrame() {
    chatReady = true;
    setActionBusy(false);
    syncActionButtons();
    noticeEl.classList.remove('is-visible');
    chatFrame.classList.add('is-visible');
    const chatUrl = `${settings.chatgptOrigin}/chat`;
    if (chatFrame.getAttribute('src') !== chatUrl) {
      chatFrame.src = chatUrl;
    }
  }

  async function refreshSessionUi() {
    setActionBusy(false);
    setStatus('檢查中…');
    setActionsEnabled(false);
    reloadSessionBtn.disabled = true;
    noticeRetryBtn.disabled = true;

    const auth = await fetchAuthSession(settings.chatgptOrigin);

    reloadSessionBtn.disabled = false;
    noticeRetryBtn.disabled = false;

    if (auth.state === 'authorized') {
      showChatFrame();
      setStatus('已登入');
      return;
    }

    const titles = {
      unauthorized: '需要登入 ChatGPT',
      cloudflare: '需要通過安全檢查',
      error: '無法確認登入狀態'
    };
    const shortStatus = {
      unauthorized: '未登入',
      cloudflare: '需驗證',
      error: '檢查失敗'
    };
    showNotice(titles[auth.state] || '無法載入', auth.message || '請稍後再試。');
    setStatus(shortStatus[auth.state] || '尚未就緒', auth.message);
  }

  function toggleSettings(forceOpen) {
    const open = typeof forceOpen === 'boolean' ? forceOpen : !settingsEl.classList.contains('is-open');
    settingsEl.classList.toggle('is-open', open);
    settingsEl.setAttribute('aria-hidden', open ? 'false' : 'true');
    settingsToggleBtn.textContent = open ? '關閉' : '設定';
  }

  async function deliverPrompt(prompt) {
    const alive = await pingFrame(chatFrame, 500);
    if (!alive) {
      // 內容腳本未就緒時，仍嘗試寫入一次；失敗再回報
      console.warn('content script ping failed; trying insert anyway');
    }

    const frameResult = await postPromptToFrame(
      chatFrame,
      prompt,
      settings.focusAfterInsert
    );
    if (frameResult.ok) {
      return { ok: true, via: 'frame' };
    }

    const tabResult = await withTimeout(
      chrome.runtime.sendMessage({
        action: 'insert_prompt',
        prompt,
        focusAfterInsert: settings.focusAfterInsert
      }),
      5000,
      'tab_timeout'
    );

    if (tabResult && tabResult.ok) {
      return { ok: true, via: 'tab' };
    }

    // ping 失敗且 frame 逾時：多半是 iframe 內腳本未載入
    if (!alive && frameResult.reason === 'timeout') {
      return { ok: false, reason: 'no_content_script' };
    }

    return {
      ok: false,
      reason: frameResult.reason || (tabResult && tabResult.reason) || 'unknown'
    };
  }

  async function runAction(actionKey) {
    if (!chatReady || actionBusy) {
      if (!chatReady) showActionHint('請先登入', '請先完成 ChatGPT 登入後再按動作按鈕。');
      return;
    }

    setActionBusy(true);
    hideActionHint();
    setStatus('讀取頁面…');
    try {
      const tab = await getActiveContentTab();
      if (!tab || !tab.id) {
        showActionHint('無可讀取頁面', '請先開啟一般 http(s) 網頁分頁（例如文章頁），再回來按動作。');
        return;
      }

      let ctx = {
        url: tab.url || '',
        title: tab.title || '',
        selection: '',
        content: ''
      };
      let outlineFallbackToUrl = false;

      const needsContent =
        settings.includePageContent ||
        actionKey === 'outline' ||
        actionKey === 'translate' ||
        actionKey === 'explain' ||
        actionKey === 'summarize';

      if (needsContent) {
        try {
          ctx = await readPageContext(tab.id);
        } catch (err) {
          console.warn('readPageContext failed:', err);
          const noPerm = err && err.code === 'no_host_permission';
          if (actionKey === 'translate' || actionKey === 'explain') {
            showActionHint(
              '無法讀取選取文字',
              noPerm
                ? `「${ACTION_LABELS[actionKey]}」需要讀取目前分頁的選取內容。請到 chrome://extensions 重新載入本擴充功能以套用網站權限，在網頁上選取文字後再按「${ACTION_LABELS[actionKey]}」。`
                : `「${ACTION_LABELS[actionKey]}」需要讀取目前分頁的選取內容。請確認該分頁仍開啟，在網頁上選取文字後再按「${ACTION_LABELS[actionKey]}」。`
            );
            return;
          }
          if (actionKey === 'outline') {
            outlineFallbackToUrl = true;
            ctx = {
              url: tab.url || '',
              title: tab.title || '',
              selection: '',
              content: noPerm
                ? '（未能讀取頁面可見文字：缺少網站存取權限；請主要依網址與標題判斷結構，勿杜撰細節。）'
                : '（未能讀取頁面可見文字；請主要依網址與標題判斷結構，勿杜撰細節。）'
            };
          } else {
            ctx = {
              url: tab.url || '',
              title: tab.title || '',
              selection: '',
              content: noPerm
                ? '（未能讀取頁面可見文字：缺少網站存取權限；請主要依網址判斷，勿杜撰細節。）'
                : '（未能讀取頁面可見文字；請主要依網址判斷，勿杜撰細節。）'
            };
          }
        }
      }

      if (!settings.includePageContent && actionKey === 'summarize') {
        ctx = {
          ...ctx,
          content: '（使用者關閉「附上頁面可見文字」；請主要依網址判斷，勿杜撰細節。）'
        };
      }

      if ((actionKey === 'translate' || actionKey === 'explain') && !ctx.selection) {
        showActionHint(
          `請先選取要${ACTION_LABELS[actionKey]}的文字`,
          `「${ACTION_LABELS[actionKey]}」不會使用整頁，只處理你在網頁上反白選取的文字。請到目前分頁選取一段文字後，再按「${ACTION_LABELS[actionKey]}」。`
        );
        return;
      }

      if (actionKey === 'outline') {
        const raw = ctx.content ? String(ctx.content).trim() : '';
        const hasBody =
          raw && !raw.startsWith('（未能讀取') && !raw.startsWith('（此頁沒有');
        if (!hasBody) {
          outlineFallbackToUrl = true;
          if (!raw) {
            ctx = {
              ...ctx,
              content: '（此頁沒有可讀取的可見文字；請主要依網址與標題判斷結構，勿杜撰細節。）'
            };
          }
        }
      }

      const template = settings.actionTemplates[actionKey] || DEFAULT_TEMPLATES[actionKey];
      const prompt = clampPrompt(renderTemplate(template, ctx));

      if (outlineFallbackToUrl) {
        showActionHint(
          '大綱改以網址／標題產生',
          '未能附上頁面全文。結構大綱較依賴可見內文；這次會寫入以網址與標題為主的提示詞，結果可能較弱。若可讀到頁面，請重新載入擴充功能或重新整理分頁後再試。'
        );
      }

      setStatus('寫入中…');
      const result = await withTimeout(deliverPrompt(prompt), 8000, 'timeout');
      if (result.ok) {
        hideActionHint();
        setStatus(outlineFallbackToUrl ? '已寫入（僅網址）' : result.via === 'tab' ? '已寫入（分頁）' : '已寫入');
        return;
      }

      if (result.reason === 'no_content_script') {
        showActionHint(
          '聊天腳本未就緒',
          '側邊欄 ChatGPT 尚未載入寫入腳本。請按「檢查」重載聊天畫面後再試。'
        );
      } else if (result.reason === 'timeout' || result.reason === 'tab_timeout') {
        showActionHint(
          '寫入逾時',
          '寫入 ChatGPT 輸入框過慢。已縮短附文長度；請再試一次，或按「檢查」後重試。'
        );
      } else if (result.reason === 'no_input') {
        showActionHint('找不到輸入框', '請稍候 ChatGPT 畫面載入完成後再試。');
      } else if (result.reason === 'write_failed') {
        showActionHint('寫入失敗', '已找到輸入框但無法寫入文字，請再試一次或重新載入擴充功能。');
      } else {
        showActionHint('寫入失敗', '提示詞未能寫入 ChatGPT 輸入框，請稍後再試或按「檢查」。');
      }
    } catch (error) {
      console.error('runAction failed:', error);
      showActionHint('發生錯誤', String(error && error.message ? error.message : error));
    } finally {
      setActionBusy(false);
    }
  }

  for (const btn of actionButtons) {
    btn.addEventListener('click', () => {
      const actionKey = btn.dataset.action;
      if (settingsEl.classList.contains('is-open')) {
        templateActionSelect.value = actionKey;
        promptTemplateEl.value = draftTemplates[actionKey] || DEFAULT_TEMPLATES[actionKey];
      }
      runAction(actionKey);
    });
  }

  hintDismissBtn.addEventListener('click', () => {
    hideActionHint();
  });

  settingsToggleBtn.addEventListener('click', () => {
    if (!settingsEl.classList.contains('is-open')) {
      fillSettingsForm();
    } else {
      draftTemplates[templateActionSelect.value] = promptTemplateEl.value;
    }
    toggleSettings();
  });

  templateActionSelect.addEventListener('change', () => {
    const key = templateActionSelect.value;
    promptTemplateEl.value = draftTemplates[key] || DEFAULT_TEMPLATES[key];
  });

  promptTemplateEl.addEventListener('input', () => {
    draftTemplates[templateActionSelect.value] = promptTemplateEl.value;
  });

  saveSettingsBtn.addEventListener('click', async () => {
    draftTemplates[templateActionSelect.value] = promptTemplateEl.value;
    const next = {
      chatgptOrigin: normalizeOrigin(originSelect.value),
      focusAfterInsert: focusAfterInsertEl.checked,
      includePageContent: includePageContentEl.checked,
      actionTemplates: mergeTemplates(draftTemplates)
    };
    const originChanged = next.chatgptOrigin !== settings.chatgptOrigin;
    settings = next;
    await saveSettings(settings);
    noticeOpenLink.href = `${settings.chatgptOrigin}/`;
    setStatus('已儲存');
    toggleSettings(false);
    if (originChanged || !chatReady) {
      await refreshSessionUi();
    }
  });

  resetTemplateBtn.addEventListener('click', () => {
    const key = templateActionSelect.value;
    promptTemplateEl.value = DEFAULT_TEMPLATES[key];
    draftTemplates[key] = DEFAULT_TEMPLATES[key];
  });

  noticeOpenLink.addEventListener('click', (event) => {
    event.preventDefault();
    chrome.tabs.create({ url: `${settings.chatgptOrigin}/` });
  });

  noticeRetryBtn.addEventListener('click', () => {
    refreshSessionUi();
  });

  reloadSessionBtn.addEventListener('click', () => {
    refreshSessionUi();
  });

  fillSettingsForm();
  await refreshSessionUi();
});
