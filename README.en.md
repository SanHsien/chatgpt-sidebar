# ChatGPT Sidebar

[繁體中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/kilnbieekgofpkgbhohmogcjkebfflkd.svg)](https://chromewebstore.google.com/detail/chatgpt-sidebar-embedded/kilnbieekgofpkgbhohmogcjkebfflkd)
[![Release](https://img.shields.io/github/v/release/SanHsien/chatgpt-sidebar?sort=semver&display_name=tag)](https://github.com/SanHsien/chatgpt-sidebar/releases/latest)
[![Platform](https://img.shields.io/badge/Platform-Chrome-lightgrey.svg)](#installation)
[![CI](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml/badge.svg)](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml)

**Bring the current page or selected text into your own signed-in ChatGPT session without leaving the page.**

ChatGPT Sidebar is a frontend-only Chrome Manifest V3 extension. It does not run its own AI backend and does not host API keys; it uses your existing ChatGPT browser session.

[Latest release](https://github.com/SanHsien/chatgpt-sidebar/releases/latest) · [Chrome Web Store](https://chromewebstore.google.com/detail/chatgpt-sidebar-embedded/kilnbieekgofpkgbhohmogcjkebfflkd) · [Privacy policy](https://sanhsien.github.io/chatgpt-sidebar/privacy.html) · [Security and technical risks](NOTICE.md)

## What it does

| Action | Behavior |
| --- | --- |
| Summarize | Builds a Traditional Chinese summary prompt from the current page URL, title, and optionally visible text |
| Translate | Builds a translation prompt from the current selection |
| Explain | Builds an explanation prompt from the current selection |
| Outline | Builds an outline prompt from visible content on the current page |

It also supports:

- ChatGPT directly inside Chrome Side Panel.
- Session checks that distinguish signed-out and blocked-loading states.
- Editable prompt templates for every action.
- Optional visible-page text and focus-after-insert behavior.
- Settings stored in `chrome.storage.sync`.
- Prompt insertion without automatic submission: **you review and send the prompt yourself**.

## How it works

```text
Current page / selected text
          │
          ▼
Chrome Side Panel
          │
          ├─ Summarize / Translate / Explain / Outline
          │
          ▼
Build prompt locally
          │
          ▼
Insert into your signed-in ChatGPT input
          │
          ▼
You decide whether to send it
```

There is no hosted backend operated by this project and no project server that receives your OpenAI / ChatGPT credentials.

## Privacy and security boundaries

### Page content

The extension reads the current page URL, title, selection, or visible text only when needed for an action. That content is **not uploaded to a server operated by this project because this project has no backend**.

However, if you review and submit the generated prompt, any included page content is then sent through ChatGPT according to ChatGPT / OpenAI's own service behavior. “No project backend” does **not** mean the content can never leave your browser.

### iframe embedding risk

> [!IMPORTANT]
> To load ChatGPT inside the side-panel iframe, the current implementation removes `Content-Security-Policy` and `X-Frame-Options` from responses on ChatGPT domains. This weakens the site's anti-framing / clickjacking protections. **Use it only in a local browser environment you trust.**

See [`NOTICE.md`](NOTICE.md) and [`SECURITY.md`](SECURITY.md) for permissions, CSP/XFO, privacy, and third-party-service boundaries.

## Installation

### Chrome Web Store (recommended)

1. Open [ChatGPT Sidebar (Embedded)](https://chromewebstore.google.com/detail/chatgpt-sidebar-embedded/kilnbieekgofpkgbhohmogcjkebfflkd).
2. Click **Add to Chrome**.

The store listing currently ships **v0.5.10**. GitHub Releases still provide the zip and checksum for verification or Load unpacked.

### Download a Release (developer mode)

1. Download `chatgpt-sidebar-<version>.zip` from the [Latest Release](https://github.com/SanHsien/chatgpt-sidebar/releases/latest).
2. Unzip it.
3. Open `chrome://extensions/` and enable **Developer mode**.
4. Choose **Load unpacked** and select the extracted folder.
5. Releases also include a `.sha256` file for download verification.

### Load from source

```bash
git clone https://github.com/SanHsien/chatgpt-sidebar.git
cd chatgpt-sidebar
node tools/validate-extension.mjs
```

Then use **Load unpacked** in `chrome://extensions/` and select the repository root. You can also run `node tools/pack-extension.mjs` to create a clean `dist/` package directory.

## Usage

1. Click the extension icon to open the side panel.
2. If ChatGPT is not signed in, sign in in a normal tab and retry from the side panel.
3. Switch to the page you want to work with; select text first for Translate or Explain.
4. Choose **Summarize, Translate, Explain, or Outline**.
5. Review the prompt inserted into ChatGPT, then send it yourself.

## Development and validation

This is a plain-JavaScript MV3 extension with no bundler, no `package.json`, and no backend.

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
```

CI runs the same syntax and extension-layout checks.

## Documentation

- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md): architecture, loading, validation, and troubleshooting
- [`NOTICE.md`](NOTICE.md): permissions, privacy, CSP/XFO, and third-party risks
- [`ROADMAP.md`](ROADMAP.md): product direction and Chrome Web Store status
- [`docs/STORE.md`](docs/STORE.md): store strategy and live listing
- [`docs/STORE_LISTING.md`](docs/STORE_LISTING.md): listing copy (including Dashboard text still to correct)
- [`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md): privacy-policy source
- [`CHANGELOG.md`](CHANGELOG.md): release history

## License and origin

Source code is available under the [MIT License](LICENSE). See [`NOTICE.md`](NOTICE.md) for prior art, third-party-service notices, and provenance. This project is not an official OpenAI / ChatGPT product and is not endorsed by OpenAI.
