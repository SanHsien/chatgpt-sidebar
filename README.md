# ChatGPT Side Panel Summarizer

[繁體中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Platform](https://img.shields.io/badge/Platform-Chrome-lightgrey.svg)](#安裝)
[![CI](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml/badge.svg)](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml)

在 Chrome 側邊欄嵌入 ChatGPT，並用一鍵把**目前分頁網址**組成繁體中文摘要提示詞，寫入聊天輸入框。

本擴充功能**無後端、不代管 API key**；摘要能力依賴你自己的 ChatGPT 登入態與網頁介面。

> [!IMPORTANT]
> 為了讓 ChatGPT 能在側邊欄 iframe 載入，擴充功能會移除 ChatGPT 網域回應中的 `Content-Security-Policy` 與 `X-Frame-Options`。這會削弱 clickjacking 防護，請只在信任的本機環境使用。細節見 [`NOTICE.md`](NOTICE.md)。

## 功能

- **側邊欄嵌入 ChatGPT**：工具列圖示開啟 Chrome Side Panel，以 iframe 載入 ChatGPT。
- **一鍵摘要**：按鈕讀取目前分頁 URL，組成繁中摘要提示詞並寫入聊天輸入框（你可再檢查後送出）。
- **沿用既有登入**：若瀏覽器已登入 ChatGPT，嵌入畫面會沿用該工作階段；未登入則可在 iframe 內登入。

## 安裝

1. Clone 或下載本 repository。
2. 開啟 Chrome → `chrome://extensions/`。
3. 開啟右上角**開發人員模式**。
4. 點**載入未封裝項目**，選擇本 repo 根目錄（含 `manifest.json` 的那層）。
5. 工具列應出現擴充功能圖示。

## 使用

1. 點擴充功能圖示，開啟側邊欄；必要時在 iframe 內登入 ChatGPT。
2. 切到要摘要的網頁分頁。
3. 在側邊欄按**摘要當前頁面**。擴充功能會：
   - 取得目前分頁 URL；
   - 組成繁中摘要提示（約 5–7 句概述、背景／問題／方法／結論、3 點建議）；
   - 把提示詞寫入嵌入的聊天輸入框，由你確認後送出。

## 專案結構

```text
.
├── manifest.json          # MV3 宣告
├── background.js          # service worker：DNR 規則、側邊欄行為
├── panel.html / panel.js  # 側邊欄 UI 與摘要按鈕
├── content.js             # 在 ChatGPT 頁面寫入提示詞
├── icons/                 # 擴充功能圖示
├── tools/                 # 驗證腳本
├── docs/                  # 開發、決策、GitHub About
├── README.md / README.en.md / CHANGELOG.md / REVIEW.md
├── AGENTS.md / CLAUDE.md / SKILL.md
└── NOTICE.md / LICENSE
```

## 開發與驗證

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
```

完整說明見 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)。AI agent 接手規則見 [`AGENTS.md`](AGENTS.md)。

## 安全注意

- 本工具只應在本機、受信任環境使用。
- 不要把 cookies、登入態或私密憑證提交進版控。
- ChatGPT UI 改版可能讓 content script 選取器失效；屆時需更新 `content.js`。

## 授權

MIT。見 [`LICENSE`](LICENSE) 與 [`NOTICE.md`](NOTICE.md)。
