# ChatGPT Side Panel Summarizer

[繁體中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Release](https://img.shields.io/github/v/release/SanHsien/chatgpt-sidebar?sort=semver&display_name=tag)](https://github.com/SanHsien/chatgpt-sidebar/releases)
[![Platform](https://img.shields.io/badge/Platform-Chrome-lightgrey.svg)](#安裝)
[![CI](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml/badge.svg)](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml)

在 Chrome 側邊欄嵌入 ChatGPT，並用一鍵把**目前分頁網址**組成繁體中文摘要提示詞，寫入聊天輸入框。

本擴充功能**無後端、不代管 API key**；摘要能力依賴你自己的 ChatGPT 登入態與網頁介面。

> [!IMPORTANT]
> 為了讓 ChatGPT 能在側邊欄 iframe 載入，擴充功能會移除 ChatGPT 網域回應中的 `Content-Security-Policy` 與 `X-Frame-Options`。這會削弱 clickjacking 防護，請只在信任的本機環境使用。細節見 [`NOTICE.md`](NOTICE.md)。

## 功能

- **側邊欄嵌入 ChatGPT**：工具列圖示開啟 Chrome Side Panel，以 iframe 載入 ChatGPT。
- **登入態檢查**：載入前請求 ChatGPT `/api/auth/session`，區分已登入、未登入與 Cloudflare 阻擋，並提供重試。
- **多動作**：摘要、翻譯選取、解釋選取、產生大綱；各自動作有可編輯提示詞模板。
- **頁面可見文字（可關）**：執行時於本機讀取目前分頁可見文字／選取（需 `http(s)://*/*` 主機權限；不上傳到本專案伺服器）。見 [`NOTICE.md`](NOTICE.md)「隱私」。
- **可設定**：網域、是否附內文、寫入後是否聚焦、各動作模板；存於 Chrome 同步儲存。
- **沿用既有登入**：若瀏覽器已登入 ChatGPT，嵌入畫面會沿用該工作階段；未登入則引導你先在分頁完成登入。

## 安裝

### 方法一：下載 Release（推薦）

1. 到 [Releases](https://github.com/SanHsien/chatgpt-sidebar/releases) 下載 `chatgpt-sidebar-<版本>.zip`（例如 [v0.5.10](https://github.com/SanHsien/chatgpt-sidebar/releases/tag/v0.5.10)）。
2. 解壓後得到 `chatgpt-sidebar-<版本>` 資料夾。
3. Chrome 開啟 `chrome://extensions/` → 開啟**開發人員模式**。
4. 點**載入未封裝項目**，選擇該資料夾。
5. 可用同目錄的 `.sha256` 檔驗證 zip 完整性。

### 方法二：從原始碼載入

1. Clone 或下載本 repository。
2. （可選）`node tools/pack-extension.mjs` 產生 `dist/` 發行目錄。
3. Chrome → `chrome://extensions/` → 開發人員模式 → **載入未封裝項目**。
4. 選 repo 根目錄，或 `dist/chatgpt-sidebar-<版本>`。
5. 工具列應出現擴充功能圖示。

## 使用

1. 點擴充功能圖示，開啟側邊欄；必要時依提示在分頁登入 ChatGPT 後按「重試／檢查」。
2. 切到要處理的網頁分頁（翻譯／解釋請先選取文字）。
3. 點**摘要**／**翻譯**／**解釋**／**大綱**（翻譯／解釋請先選取文字；大綱用頁面可見全文，不需選取）。擴充功能會本機讀取網址／標題／選取或可見文字，組成提示詞寫入 ChatGPT 輸入框，由你確認後送出。缺選取或讀取失敗時會顯示說明條。

## 專案結構

```text
.
├── manifest.json          # MV3 宣告
├── background.js          # service worker：DNR 規則、側邊欄行為、分頁轉發
├── panel.html / panel.js  # 側邊欄 UI、iframe、摘要按鈕（postMessage）
├── content.js             # 在 ChatGPT 頁面寫入提示詞
├── icons/                 # 擴充功能圖示
├── tools/                 # 驗證腳本
├── docs/                  # DEVELOPMENT／STORE／DECISIONS
├── ROADMAP.md             # 產品路線圖
├── README.md / README.en.md / CHANGELOG.md / REVIEW.md
├── AGENTS.md / CLAUDE.md / SKILL.md
└── NOTICE.md / LICENSE
```

## 開發與驗證

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
```

開發／排查見 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)。路線圖見 [`ROADMAP.md`](ROADMAP.md)。隱私與風險見 [`NOTICE.md`](NOTICE.md)、[`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md)。商店挑戰上架見 [`docs/STORE.md`](docs/STORE.md)、[`docs/STORE_LISTING.md`](docs/STORE_LISTING.md)。

## 安全注意

- 本工具只應在本機、受信任環境使用。
- 不要把 cookies、登入態或私密憑證提交進版控。
- ChatGPT UI 改版可能讓 content script 選取器失效；屆時需更新 `content.js`。

## 其他可參考專案

下列專案與本 repo **無程式碼衍生關係**，僅作側邊欄嵌入 ChatGPT 的實作參考：

| 專案 | 說明 |
|------|------|
| [PeterPorzuczek/chatgpt-panel-chrome-extension](https://github.com/PeterPorzuczek/chatgpt-panel-chrome-extension)（[Chrome Web Store](https://chromewebstore.google.com/detail/chatgpt-panel/oakbdpbfmbadiphcepefmkhabehadepk)） | 側邊欄 iframe 嵌入 ChatGPT、`declarativeNetRequest` 移除 CSP／XFO、載入前檢查 `/api/auth/session`。MIT。本專案另有一鍵摘要提示詞注入，產品目標不同。 |

## 授權

MIT。見 [`LICENSE`](LICENSE) 與 [`NOTICE.md`](NOTICE.md)。
