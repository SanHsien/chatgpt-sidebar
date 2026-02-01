// panel.js
// This script runs inside the side panel. It registers a click handler
// on the "summarize" button, constructs a prompt based on the current
// active tab's URL, ensures the ChatGPT tab is available, and then
// instructs the background script to set the prompt in that tab.

document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('summarize');
  button.addEventListener('click', async () => {
    // Obtain the currently active tab in the current window
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab || !activeTab.url) {
      return;
    }
    const url = activeTab.url;
    // Compose a detailed prompt instructing ChatGPT to summarise the article
    const prompt =
      `請對以下網址的內容做摘要，使用繁體中文撰寫，並提供 5 到 7 句重點整理，涵蓋文章的主要資訊與結論：\n${url}\n如果您無法訪問該網址或獲取內容，請告知我。`;
    // Ensure the ChatGPT tab exists and is pinned
    await chrome.runtime.sendMessage({ type: 'ensureTab' });
    // Send the prompt to the background to forward to the ChatGPT content script
    await chrome.runtime.sendMessage({ type: 'setPrompt', prompt });
  });
});