// content.js
// This script runs on ChatGPT pages (both top-level and in the side panel
// iframe). It listens for messages from the extension and inserts prompts
// into the ChatGPT input field when requested.

// Observe messages from other parts of the extension. When a message with
// action 'insert_prompt' is received, attempt to find the chat input and
// populate it with the provided prompt. Because the ChatGPT UI is dynamic,
// we poll for the textarea until it appears, then set its value and
// dispatch an input event so that React updates the UI accordingly.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.action !== 'insert_prompt') {
    return;
  }

  const promptText = message.prompt;

  const insertPrompt = () => {
    // ChatGPT currently uses a <textarea> for user input. It may have
    // dynamic attributes or IDs, so we simply look for the first visible
    // textarea.
    const textareas = document.querySelectorAll('textarea');
    for (const textarea of textareas) {
      // Skip hidden or disabled textareas.
      const style = window.getComputedStyle(textarea);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      try {
        textarea.focus();
        textarea.value = promptText;
        // Trigger input events so that frameworks like React notice the change.
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      } catch (err) {
        // If interacting with the textarea fails, ignore and continue.
        console.warn('Failed to set textarea value:', err);
      }
    }
    return false;
  };

  // Poll every 500ms until the prompt is inserted or timeout after 10s.
  const start = Date.now();
  const interval = setInterval(() => {
    const success = insertPrompt();
    if (success || Date.now() - start > 10000) {
      clearInterval(interval);
    }
  }, 500);
});