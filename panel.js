// panel.js
// Handles loading ChatGPT into the side panel and sending summary prompts.

// Domain of ChatGPT to load in the iframe. You can switch between
// chat.openai.com and chatgpt.com as needed.
const CHATGPT_ORIGIN = 'https://chat.openai.com';

document.addEventListener('DOMContentLoaded', () => {
  const chatFrame = document.getElementById('chatFrame');
  const summarizeBtn = document.getElementById('summarizeBtn');
  const statusEl = document.getElementById('status');

  // Load the ChatGPT interface into the iframe. The path `/` will redirect
  // to the login or chat page as appropriate. The CSP and XFO headers are
  // removed by the background service worker.
  chatFrame.src = `${CHATGPT_ORIGIN}`;

  // Handle click on the summarize button. Retrieves the URL of the active
  // tab and sends it as part of a prompt to the content script running in
  // the ChatGPT iframe.
  summarizeBtn.addEventListener('click', async () => {
    statusEl.textContent = '取得頁面網址中...';
    try {
      // Get the currently active tab in the last focused window.
      const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (!activeTab || !activeTab.url) {
        statusEl.textContent = '找不到目前頁面網址。';
        return;
      }

      // Build the prompt for summarizing the current URL. Adjust the text
      // here to customize the behaviour of ChatGPT.
      const prompt = `請閱讀以下網址的文章內容並以繁體中文總結：${activeTab.url}\n\n` +
        '1) 請使用 5–7 句話概述文章的主要觀點。\n' +
        '2) 依序分析背景、問題、方法和結論，若沒有相關資訊請標註「未提及」。\n' +
        '3) 最後提供 3 個具體建議說明這篇文章能如何幫助讀者。\n' +
        '如果無法取得該網址內容，請直接說明原因，並不要杜撰資訊。';

      statusEl.textContent = '傳送摘要請求中...';

      // Send the prompt to all frames via runtime message. The content script
      // running inside ChatGPT will listen for this message and inject the
      // prompt into the chat input.
      await chrome.runtime.sendMessage({ action: 'insert_prompt', prompt });
      statusEl.textContent = '已輸入摘要提示，請切換至聊天視窗檢查。';
    } catch (error) {
      console.error('Error sending summary prompt:', error);
      statusEl.textContent = '傳送提示時發生錯誤。';
    }
  });
});