// background.js
// Service worker：DNR 移除 CSP/XFO、側邊欄行為、分頁提示詞轉發與 executeScript 後備。

const DNR_RULES = [
  {
    id: 1,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        { header: 'content-security-policy', operation: 'remove' },
        { header: 'x-frame-options', operation: 'remove' }
      ]
    },
    condition: {
      urlFilter: 'https://chat.openai.com/*',
      resourceTypes: ['main_frame', 'sub_frame']
    }
  },
  {
    id: 2,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        { header: 'content-security-policy', operation: 'remove' },
        { header: 'x-frame-options', operation: 'remove' }
      ]
    },
    condition: {
      urlFilter: 'https://chatgpt.com/*',
      resourceTypes: ['main_frame', 'sub_frame']
    }
  }
];

function ensurePanelBehavior() {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('Failed to set panel behavior:', error));
}

function ensureDnrRules() {
  return chrome.declarativeNetRequest.updateDynamicRules({
    addRules: DNR_RULES,
    removeRuleIds: DNR_RULES.map((r) => r.id)
  });
}

chrome.runtime.onInstalled.addListener(() => {
  ensureDnrRules();
  ensurePanelBehavior();
});

ensurePanelBehavior();

async function deliverPromptToTab(tabId, prompt, focusAfterInsert) {
  const message = { action: 'insert_prompt', prompt, focusAfterInsert };
  try {
    const result = await chrome.tabs.sendMessage(tabId, message);
    if (result && result.ok) return { ok: true, via: 'tabs.sendMessage' };
  } catch (_err) {
    // 繼續走後備
  }

  // 後備：重新注入 content.js（有全域守衛，不會重複掛 listener）再送訊息。
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ['content.js']
    });
    const result = await chrome.tabs.sendMessage(tabId, message);
    if (result && result.ok) return { ok: true, via: 'executeScript+sendMessage' };
    return { ok: false, via: 'executeScript+sendMessage', reason: result && result.reason };
  } catch (err) {
    return { ok: false, via: 'executeScript', error: String(err && err.message ? err.message : err) };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.action !== 'insert_prompt') {
    return;
  }

  const prompt = message.prompt;
  const focusAfterInsert = message.focusAfterInsert !== false;

  (async () => {
    const tabs = await chrome.tabs.query({
      url: ['https://chatgpt.com/*', 'https://chat.openai.com/*']
    });
    let delivered = 0;
    const errors = [];
    for (const tab of tabs) {
      if (!tab.id) continue;
      const result = await deliverPromptToTab(tab.id, prompt, focusAfterInsert);
      if (result.ok) {
        delivered += 1;
      } else if (result.error || result.reason) {
        errors.push(result.error || result.reason);
      }
    }
    sendResponse({ ok: delivered > 0, delivered, errors });
  })().catch((err) => {
    sendResponse({ ok: false, delivered: 0, errors: [String(err)] });
  });

  return true;
});
