# ChatGPT Side Panel Summarizer

[繁體中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Platform](https://img.shields.io/badge/Platform-Chrome-lightgrey.svg)](#installation)
[![CI](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml/badge.svg)](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml)

Embed ChatGPT in Chrome’s side panel and one-click insert a **Traditional Chinese** summarisation prompt built from the **current tab URL**.

This extension has **no backend and does not host API keys**. Summaries rely on your own ChatGPT session and the ChatGPT web UI.

> [!IMPORTANT]
> To load ChatGPT inside a side-panel iframe, the extension strips `Content-Security-Policy` and `X-Frame-Options` from ChatGPT domain responses. That weakens clickjacking protection—use only in a trusted local environment. See [`NOTICE.md`](NOTICE.md).

## Features

- **Embedded ChatGPT in the side panel**: toolbar icon opens Chrome Side Panel with ChatGPT in an iframe.
- **One-click summarise**: reads the active tab URL, builds a Traditional Chinese summary prompt, and writes it into the chat input (you review and send).
- **Existing session**: if you are signed in to ChatGPT in the browser, the iframe reuses that session; otherwise you can sign in inside the iframe.

## Installation

1. Clone or download this repository.
2. Open Chrome → `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this repo root (the folder that contains `manifest.json`).
5. The extension icon should appear in the toolbar.

## Usage

1. Click the extension icon to open the side panel; sign in inside the iframe if needed.
2. Switch to the page tab you want summarised.
3. Click **摘要當前頁面** in the side panel. The extension will:
   - read the active tab URL;
   - compose a Traditional Chinese summary prompt (short overview, background / problem / method / conclusion, three suggestions);
   - insert the prompt into the embedded chat input for you to review and send.

## Project layout

```text
.
├── manifest.json
├── background.js
├── panel.html / panel.js
├── content.js
├── icons/
├── tools/
├── docs/
├── README.md / README.en.md / CHANGELOG.md / REVIEW.md
├── AGENTS.md / CLAUDE.md / SKILL.md
└── NOTICE.md / LICENSE
```

## Development

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
```

See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) and [`AGENTS.md`](AGENTS.md).

## Security notes

- Use only on a trusted local machine.
- Never commit cookies, session state, or secrets.
- ChatGPT UI changes may break the content-script selectors in `content.js`.

## License

MIT. See [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md).
