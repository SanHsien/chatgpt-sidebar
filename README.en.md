# ChatGPT Side Panel Summarizer

[繁體中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Release](https://img.shields.io/github/v/release/SanHsien/chatgpt-sidebar?sort=semver&display_name=tag)](https://github.com/SanHsien/chatgpt-sidebar/releases)
[![Platform](https://img.shields.io/badge/Platform-Chrome-lightgrey.svg)](#installation)
[![CI](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml/badge.svg)](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml)

Embed ChatGPT in Chrome’s side panel and one-click insert a **Traditional Chinese** summarisation prompt built from the **current tab URL**.

This extension has **no backend and does not host API keys**. Summaries rely on your own ChatGPT session and the ChatGPT web UI.

> [!IMPORTANT]
> To load ChatGPT inside a side-panel iframe, the extension strips `Content-Security-Policy` and `X-Frame-Options` from ChatGPT domain responses. That weakens clickjacking protection—use only in a trusted local environment. See [`NOTICE.md`](NOTICE.md).

## Features

- **Embedded ChatGPT in the side panel**: toolbar icon opens Chrome Side Panel with ChatGPT in an iframe.
- **Session check**: requests ChatGPT `/api/auth/session` before embedding, with retry for signed-out / Cloudflare states.
- **Multiple actions**: summarize, translate selection, explain selection, outline; each has an editable prompt template.
- **Optional page text**: on run, reads visible page text / selection locally (not uploaded to this project). See privacy section in [`NOTICE.md`](NOTICE.md).
- **Settings**: origin, include-page-text, focus-after-insert, per-action templates in `chrome.storage.sync`.
- **Existing session**: reuses your ChatGPT browser session when available.

## Installation

### Option A: Download a Release (recommended)

1. Download `chatgpt-sidebar-<version>.zip` from [Releases](https://github.com/SanHsien/chatgpt-sidebar/releases) (e.g. [v0.5.10](https://github.com/SanHsien/chatgpt-sidebar/releases/tag/v0.5.10)).
2. Unzip to get the `chatgpt-sidebar-<version>` folder.
3. Open Chrome → `chrome://extensions/` → enable **Developer mode**.
4. Click **Load unpacked** and select that folder.
5. Optionally verify the zip with the accompanying `.sha256` file.

### Option B: Load from source

1. Clone or download this repository.
2. Optionally run `node tools/pack-extension.mjs` to build `dist/`.
3. Open Chrome → `chrome://extensions/` → **Developer mode** → **Load unpacked**.
4. Select the repo root, or `dist/chatgpt-sidebar-<version>`.
5. The extension icon should appear in the toolbar.

## Usage

1. Click the extension icon to open the side panel; sign in on a ChatGPT tab if needed, then retry.
2. Switch to the page tab you want (select text first for translate / explain).
3. Click **摘要** / **翻譯** / **解釋** / **大綱**. The extension reads URL / title / selection or visible text locally, inserts a Traditional Chinese prompt into the chat input for you to review and send.

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
├── ROADMAP.md
├── README.md / README.en.md / CHANGELOG.md / REVIEW.md
├── AGENTS.md / CLAUDE.md / SKILL.md
└── NOTICE.md / LICENSE
```

## Development

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
```

See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) (dev + troubleshooting), [`ROADMAP.md`](ROADMAP.md), [`NOTICE.md`](NOTICE.md) (privacy + risks), [`docs/STORE.md`](docs/STORE.md) (store / Ask Gemini), and [`AGENTS.md`](AGENTS.md).

## Security notes

- Use only on a trusted local machine.
- Never commit cookies, session state, or secrets.
- ChatGPT UI changes may break the content-script selectors in `content.js`.

## Other projects for reference

The following projects are **not** source parents of this repo; they are listed only as related prior art for embedding ChatGPT in a side panel:

| Project | Notes |
|------|------|
| [PeterPorzuczek/chatgpt-panel-chrome-extension](https://github.com/PeterPorzuczek/chatgpt-panel-chrome-extension) ([Chrome Web Store](https://chromewebstore.google.com/detail/chatgpt-panel/oakbdpbfmbadiphcepefmkhabehadepk)) | Side-panel iframe embedding, `declarativeNetRequest` CSP/XFO stripping, and `/api/auth/session` checks before load. MIT. This project additionally injects one-click summary prompts and has a different product goal. |

## License

MIT. See [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md).
