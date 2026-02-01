// content.js
// Injected into ChatGPT pages. Listens for 'setPrompt' messages from the
// extension and populates the chat input box with the supplied prompt.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'setPrompt') {
    const prompt = message.prompt || '';
    // Attempt to find the textarea used for the message input. The
    // selector may change over time as ChatGPT updates its UI. Using
    // a generic textarea query should handle most cases.
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
      // Set the value
      textarea.value = prompt;
      // Dispatch input events so that the framework detects the change
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
});