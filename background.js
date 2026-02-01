// background.js
// Service worker for the ChatGPT summarizer sidebar extension.
// Maintains a pinned ChatGPT tab and forwards prompts from the side panel
// to the content script running in that tab.

let chatGPTTabId = null;

/**
 * Ensure there is a pinned ChatGPT tab open. If one exists, reuse it,
 * otherwise create a new pinned tab pointing at chat.openai.com.
 * @returns {Promise<number>} The tab ID of the ChatGPT tab.
 */
async function ensureChatGPTTab() {
  // Look for existing ChatGPT tabs (either chat.openai.com or chatgpt.com)
  const candidates = await chrome.tabs.query({
    url: ["https://chat.openai.com/*", "https://chatgpt.com/*"]
  });
  // Prefer a pinned tab if available
  const pinned = candidates.find(t => t.pinned);
  if (pinned) {
    chatGPTTabId = pinned.id;
    return chatGPTTabId;
  }
  if (candidates.length > 0) {
    // Pin the first existing ChatGPT tab
    chatGPTTabId = candidates[0].id;
    await chrome.tabs.update(chatGPTTabId, {pinned: true});
    return chatGPTTabId;
  }
  // No existing tab – create one and pin it
  const newTab = await chrome.tabs.create({
    url: "https://chat.openai.com/",
    pinned: true,
    active: false
  });
  chatGPTTabId = newTab.id;
  return chatGPTTabId;
}

// Open the side panel when the user clicks the extension icon
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Use an async function so that we can await ensureChatGPTTab
  (async () => {
    if (message.type === 'ensureTab') {
      const id = await ensureChatGPTTab();
      sendResponse({ tabId: id });
      return;
    }
    if (message.type === 'setPrompt') {
      // Guarantee ChatGPT tab exists
      if (!chatGPTTabId) {
        await ensureChatGPTTab();
      }
      if (chatGPTTabId) {
        try {
          await chrome.tabs.sendMessage(chatGPTTabId, { type: 'setPrompt', prompt: message.prompt });
        } catch (err) {
          // If tab is closed or content script not ready, attempt to recreate and resend
          chatGPTTabId = null;
          const id = await ensureChatGPTTab();
          await chrome.tabs.sendMessage(id, { type: 'setPrompt', prompt: message.prompt });
        }
      }
    }
  })();
  // Indicate we'll send a response asynchronously if needed
  return true;
});