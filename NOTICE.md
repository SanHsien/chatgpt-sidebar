# NOTICE

chatgpt-sidebar
Copyright 2026 SanHsien

本產品依 MIT License 授權，完整條款見同目錄的 [`LICENSE`](LICENSE)。

## 專案範圍

`chatgpt-sidebar`（顯示名稱：ChatGPT Side Panel Summarizer）是 Chrome Manifest V3 擴充功能：在 Chrome 側邊欄以 iframe 嵌入 ChatGPT，並提供「摘要當前頁面」按鈕，把目前分頁網址組成繁中摘要提示詞，寫入嵌入的 ChatGPT 輸入框。

本專案：

- 不代管 ChatGPT / OpenAI 帳號或 API key。
- 不把使用者瀏覽內容上傳到本專案伺服器（本專案也沒有後端）。
- 僅在本機擴充功能內運作；摘要能力依賴使用者自己的 ChatGPT 登入態與 ChatGPT 網頁介面。

## 安全邊界與風險聲明

為了讓 ChatGPT 能在側邊欄 iframe 中載入，背景 service worker 會透過
`chrome.declarativeNetRequest` 動態規則，移除 ChatGPT 網域回應中的
`Content-Security-Policy` 與 `X-Frame-Options` 標頭。

這會削弱瀏覽器對該網域的 clickjacking 防護。請僅在信任的本機環境使用，
不要把此擴充功能當作可廣泛散佈的一般用途產品。ChatGPT UI 或安全政策改版
可能隨時讓擴充功能失效。

## 第三方服務

本專案未獲 OpenAI 或 ChatGPT 官方關聯、背書或贊助。

ChatGPT、OpenAI、Chrome、Chromium 等名稱僅用於識別與互通。

使用者與維護者需自行遵守：

- OpenAI / ChatGPT 服務條款與使用政策。
- Chrome Web Store / Chromium 擴充功能政策（若未來上架）。
- 當地隱私、著作權與消費者保護法規。

## Secrets Caution

不要把 API key、token、個人 cookies、登入態或任何私密憑證提交進版控。
本擴充功能目前不需要自備 OpenAI API key；若未來新增相關設定，敏感值一律
走本機未追蹤的設定檔或瀏覽器 storage，不得寫進程式碼。

## AI Output Responsibility

由 ChatGPT 產生的摘要仍可能需要人工審閱，不得宣稱本工具保證正確、完整、
無偏誤或適合商業／法律用途。
