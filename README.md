# ChatGPT Side Panel Summarizer (Embedded)

This Chrome extension adds a ChatGPT panel inside Chrome's side panel and a button that summarises the current page.  It uses dynamic network rules to remove `Content‑Security‑Policy` and `X‑Frame‑Options` response headers from ChatGPT domains so that the chat interface can be embedded in an `<iframe>` in the side panel.  The summarisation button reads the URL of the active tab, constructs a prompt in Chinese instructing ChatGPT to summarise the page's content, and writes it into the conversation input box inside the embedded ChatGPT UI.

## Features

- **Embedded ChatGPT in the side panel.**  The extension loads ChatGPT in a side‑panel iframe so you can chat without leaving your current page.
- **Header bypass for embedding.**  A dynamic rule in the background service worker removes restrictive headers (`Content‑Security‑Policy` and `X‑Frame‑Options`) from responses from `chat.openai.com` and `chatgpt.com` to permit the iframe.
- **Summarisation button.**  A button in the side panel reads the URL of the active tab and generates a Chinese‑language prompt asking ChatGPT to summarise the page.  The prompt is automatically inserted into the chat input field.
- **Session support.**  If you are signed in to ChatGPT, the embedded chat will use your session.  If you are not signed in, the iframe will prompt you to log in.

## Installation

1. Clone or download this repository.
2. In Chrome, open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the extension directory.
5. An icon labelled **ChatGPT Side Panel Summarizer** will appear in the toolbar.

## Usage

1. Click the extension icon to open the side panel.  The embedded ChatGPT interface will load; sign in if required.
2. Navigate to the web page you want to summarise.
3. In the side panel, click **摘要當前頁面**.  The extension will:
   - Get the URL of the active tab.
   - Compose a Chinese summarisation prompt including the URL (for example, asking ChatGPT to summarise the article in 5–8 sentences and list background, problem, method and conclusion).
   - Inject the prompt into the chat input inside the side panel.  You can review and send it.
4. ChatGPT will return a summary directly in the side panel.

## How it works

- The **background service worker** (`background.js`) installs a dynamic network rule via `chrome.declarativeNetRequest.updateDynamicRules` that strips `content‑security‑policy` and `x‑frame‑options` headers from responses from ChatGPT domains.  It also ensures the side panel opens when the action icon is clicked.
- The **side panel page** (`panel.html` and `panel.js`) contains an `<iframe>` whose `src` is set to `https://chat.openai.com/`.  The page also includes a button that sends a `setPrompt` message to the background script when clicked.
- A **content script** (`content.js`) runs on ChatGPT pages.  When it receives a `setPrompt` message, it finds the visible textarea within the chat interface, sets its value to the supplied prompt, and dispatches input events so ChatGPT recognises the new text.

## Security considerations

This extension bypasses certain security headers (specifically `Content‑Security‑Policy` and `X‑Frame‑Options`) on ChatGPT domains to allow them to be framed.  This weakens the built‑in protection against clickjacking attacks.  Use this extension only in a trusted environment and do not distribute it widely.  Be aware that future changes to ChatGPT's UI or security policies may break the extension.

## License

MIT
