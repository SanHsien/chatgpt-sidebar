# ChatGPT Sidebar

[繁體中文](README.md) | [English](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Manifest](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/kilnbieekgofpkgbhohmogcjkebfflkd.svg)](https://chromewebstore.google.com/detail/chatgpt-sidebar-embedded/kilnbieekgofpkgbhohmogcjkebfflkd)
[![Release](https://img.shields.io/github/v/release/SanHsien/chatgpt-sidebar?sort=semver&display_name=tag)](https://github.com/SanHsien/chatgpt-sidebar/releases/latest)
[![Platform](https://img.shields.io/badge/Platform-Chrome-lightgrey.svg)](#安裝)
[![CI](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml/badge.svg)](https://github.com/SanHsien/chatgpt-sidebar/actions/workflows/ci.yml)

**在瀏覽目前頁面的同時，把頁面／選取文字快速帶進自己已登入的 ChatGPT 側邊欄。**

ChatGPT Sidebar 是一個純前端 Chrome Manifest V3 擴充功能。它不提供自己的 AI 後端，也不代管 API key；你仍使用瀏覽器裡自己的 ChatGPT 工作階段。

[下載最新版](https://github.com/SanHsien/chatgpt-sidebar/releases/latest) · [Chrome 線上應用程式商店](https://chromewebstore.google.com/detail/chatgpt-sidebar-embedded/kilnbieekgofpkgbhohmogcjkebfflkd) · [隱私權政策](https://sanhsien.github.io/chatgpt-sidebar/privacy.html) · [安全與技術風險](NOTICE.md)

## 能做什麼

| 動作 | 行為 |
| --- | --- |
| 摘要 | 把目前頁面網址、標題與可選的可見文字組成繁中摘要提示詞 |
| 翻譯 | 把目前選取文字組成翻譯提示詞 |
| 解釋 | 把目前選取文字組成說明／解釋提示詞 |
| 大綱 | 以目前頁面的可見內容組成大綱提示詞 |

另外支援：

- 直接在 Chrome Side Panel 內顯示 ChatGPT。
- 檢查目前 ChatGPT 登入工作階段，區分未登入與載入受阻狀態。
- 自訂每個動作的提示詞模板。
- 選擇是否附上頁面可見文字、寫入後是否聚焦輸入框。
- 設定保存在 `chrome.storage.sync`。
- 提示詞只先寫入 ChatGPT 輸入框，**不會由擴充功能自動送出**；你可以先檢查再傳送。

## 怎麼運作

```text
目前網頁／選取文字
        │
        ▼
Chrome Side Panel
        │
        ├─ 摘要／翻譯／解釋／大綱
        │
        ▼
本機組成提示詞
        │
        ▼
寫入你已登入的 ChatGPT 輸入框
        │
        ▼
由你確認是否送出
```

沒有本專案的 hosted backend，也沒有把 OpenAI / ChatGPT 憑證交給本專案伺服器的流程。

## 隱私與安全邊界

### 頁面內容

擴充功能只在你執行動作時讀取目前分頁需要的網址、標題、選取文字或可見文字。這些內容**不會上傳到本專案自己的伺服器，因為本專案沒有後端**。

但如果你確認並送出已產生的提示詞，提示詞中的頁面內容就會依 ChatGPT 本身的服務流程傳送給 ChatGPT / OpenAI。不要把「沒有本專案後端」理解成「內容永遠不離開瀏覽器」。

### iframe 嵌入風險

> [!IMPORTANT]
> 為了讓 ChatGPT 能在側邊欄 iframe 載入，目前實作會針對 ChatGPT 網域移除回應中的 `Content-Security-Policy` 與 `X-Frame-Options`。這會削弱原網站的 anti-framing / clickjacking 防護。**只建議在你信任的本機瀏覽器環境使用。**

完整權限、CSP/XFO、隱私與第三方服務邊界見 [`NOTICE.md`](NOTICE.md) 與 [`SECURITY.md`](SECURITY.md)。

## 安裝

### Chrome 線上應用程式商店（推薦）

1. 開啟 [ChatGPT Sidebar (Embedded)](https://chromewebstore.google.com/detail/chatgpt-sidebar-embedded/kilnbieekgofpkgbhohmogcjkebfflkd)。
2. 按「加到 Chrome」。

商店目前發行 **v0.5.10**。GitHub Release 仍提供 zip 與 checksum，供核對或 Load unpacked。

### 下載 Release（開發人員模式）

1. 從 [Latest Release](https://github.com/SanHsien/chatgpt-sidebar/releases/latest) 下載 `chatgpt-sidebar-<version>.zip`。
2. 解壓縮。
3. 開啟 `chrome://extensions/`，啟用**開發人員模式**。
4. 選擇**載入未封裝項目**，指定解壓後資料夾。
5. Release 同時提供 `.sha256`，可用來核對下載檔案。

### 從原始碼載入

```bash
git clone https://github.com/SanHsien/chatgpt-sidebar.git
cd chatgpt-sidebar
node tools/validate-extension.mjs
```

接著在 `chrome://extensions/` 以**載入未封裝項目**選擇 repo 根目錄。也可執行 `node tools/pack-extension.mjs` 產生乾淨的 `dist/` 發行目錄。

## 使用

1. 點擴充功能圖示開啟側邊欄。
2. 若尚未登入 ChatGPT，先依畫面提示在一般分頁登入，再回側邊欄重試。
3. 切換到要處理的網頁；使用翻譯／解釋時先選取文字。
4. 點選**摘要、翻譯、解釋或大綱**。
5. 檢查寫入 ChatGPT 的提示詞，再自行送出。

## 開發與驗證

這是一個無 bundler、無 `package.json`、無後端的純 JavaScript MV3 extension。

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
```

CI 會執行相同的語法與 extension layout 驗證。

## 文件

- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)：架構、載入、驗證與排查
- [`NOTICE.md`](NOTICE.md)：權限、隱私、CSP/XFO 與第三方風險
- [`ROADMAP.md`](ROADMAP.md)：產品方向與 Chrome Web Store 狀態
- [`docs/STORE.md`](docs/STORE.md)：商店策略與已上架狀態
- [`docs/STORE_LISTING.md`](docs/STORE_LISTING.md)：商店文案（含 Dashboard 待改正文）
- [`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md)：隱私權政策來源
- [`CHANGELOG.md`](CHANGELOG.md)：版本歷史

## 授權與來源

程式碼採 [MIT License](LICENSE)。相關 prior art、第三方服務聲明與來源說明見 [`NOTICE.md`](NOTICE.md)。本專案不是 OpenAI / ChatGPT 官方產品，也未獲官方背書。
