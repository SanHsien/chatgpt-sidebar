# NOTICE

chatgpt-sidebar
Copyright 2026 SanHsien

本產品依 MIT License 授權，完整條款見同目錄的 [`LICENSE`](LICENSE)。

## 專案範圍

`chatgpt-sidebar`（顯示名稱：ChatGPT Side Panel Summarizer）是 Chrome Manifest V3 擴充功能：在 Chrome 側邊欄以 iframe 嵌入 ChatGPT，並提供摘要／翻譯／解釋／大綱等動作，把目前分頁網址、選取或可見文字組成繁中提示詞，寫入嵌入的 ChatGPT 輸入框。

本專案：

- 不代管 ChatGPT / OpenAI 帳號或 API key。
- 不把使用者瀏覽內容上傳到本專案伺服器（本專案也沒有後端）。
- 僅在本機擴充功能內運作；摘要能力依賴使用者自己的 ChatGPT 登入態與 ChatGPT 網頁介面。

## 隱私（頁面文字讀取）

按下動作按鈕（摘要／翻譯／解釋／大綱）時，可於**本機**讀取目前分頁的可見文字／選取，用來組成提示詞並寫入你自己的 ChatGPT 輸入框。

| 欄位 | 來源 |
|------|------|
| `{{url}}` | 分頁網址 |
| `{{title}}` | 分頁標題 |
| `{{selection}}` | 目前選取文字（翻譯／解釋需要） |
| `{{content}}` | `article`／`main`／`body` 的可見文字（盡量全文；僅極端超大頁約 10 萬字截斷） |

讀取透過 `scripting.executeScript`（manifest 宣告 `http://*/*`／`https://*/*` 主機權限）。側邊欄內按鈕點擊**不會**像工具列圖示那樣自動取得 `activeTab` 暫時存取，因此必須有廣域主機權限才能讀 Notion 等任意網站；僅在你點擊動作當下對**當前內容分頁**讀取，不常駐掃描所有分頁。

不會做：沒有本專案後端、不上傳頁面內容到 SanHsien 伺服器、不代管 OpenAI API key；提示詞是否送出由你在 ChatGPT UI 決定。關閉設定「摘要時附上頁面可見文字」後，摘要模板的 `{{content}}` 會改為占位說明；**大綱不受此開關影響，仍會附上頁面可見全文**（結構大綱依賴內文）。

仍請注意：寫入 ChatGPT 後內容進入 **OpenAI／ChatGPT** 處理流程；請勿對含機密、個資或無權分享的頁面附上可見文字。

## 安全邊界與風險聲明

為了讓 ChatGPT 能在側邊欄 iframe 中載入，背景 service worker 會透過
`chrome.declarativeNetRequest` 動態規則，移除 ChatGPT 網域回應中的
`Content-Security-Policy` 與 `X-Frame-Options` 標頭。

這會削弱瀏覽器對該網域的 clickjacking 防護。請了解風險後再使用。
ChatGPT UI 或安全政策改版可能隨時讓擴充功能失效。上架策略與披露見 [`docs/STORE.md`](docs/STORE.md)、[`docs/STORE_LISTING.md`](docs/STORE_LISTING.md)。

## 第三方服務

本專案未獲 OpenAI 或 ChatGPT 官方關聯、背書或贊助。

ChatGPT、OpenAI、Chrome、Chromium 等名稱僅用於識別與互通。

使用者與維護者需自行遵守：

- OpenAI / ChatGPT 服務條款與使用政策。
- Chrome Web Store / Chromium 擴充功能政策（若未來上架）。
- 當地隱私、著作權與消費者保護法規。

## Credits and Acknowledgments

概念參考（未複製其原始碼）見 README「其他可參考專案」：

- [PeterPorzuczek/chatgpt-panel-chrome-extension](https://github.com/PeterPorzuczek/chatgpt-panel-chrome-extension)（MIT）：側邊欄嵌入與 `/api/auth/session` 登入分流的 UX 參考。

## Secrets Caution

不要把 API key、token、個人 cookies、登入態或任何私密憑證提交進版控。
本擴充功能目前不需要自備 OpenAI API key；若未來新增相關設定，敏感值一律
走本機未追蹤的設定檔或瀏覽器 storage，不得寫進程式碼。

## AI Output Responsibility

由 ChatGPT 產生的摘要仍可能需要人工審閱，不得宣稱本工具保證正確、完整、
無偏誤或適合商業／法律用途。
