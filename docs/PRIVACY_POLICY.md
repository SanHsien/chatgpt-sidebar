# 隱私權政策（Chrome Web Store）

**產品**：ChatGPT Sidebar (Embedded)（`chatgpt-sidebar`）
**維護者**：SanHsien
**更新日期**：2026-08-14

本政策說明本 Chrome 擴充功能如何處理資料。

**商店審查用公開網址（靜態 HTML，不需登入、不需 JavaScript）：**

https://sanhsien.github.io/chatgpt-sidebar/privacy.html

若 GitHub Pages 尚未生效，可用：

https://cdn.jsdelivr.net/gh/SanHsien/chatgpt-sidebar@main/docs/privacy.html

請勿把 GitHub blob 頁（`github.com/.../blob/...`）填進 Chrome Web Store「隱私權政策」欄位；商店爬蟲常判該連結無效（Purple Nickel）。

## 我們收集什麼

本擴充功能**沒有自有後端**，不會把資料上傳到 SanHsien 的伺服器，也不販售使用者資料。

在你按下「摘要／翻譯／解釋／大綱」時，可能於**本機**讀取：

- 目前分頁的網址、標題
- 你選取的文字（翻譯／解釋）
- 頁面可見文字（摘要可關；大綱預設附上）

上述內容僅用來組成提示詞，寫入你自己的 ChatGPT 網頁輸入框。未按動作按鈕時，不會讀取或傳送頁面內容。

## 我們如何使用

- 提示詞只在本機組成並寫入 ChatGPT 輸入框。
- 是否送出訊息由你在 ChatGPT 介面決定。
- 設定（網域、模板等）存在 `chrome.storage.sync`（跟著你的 Chrome 同步帳戶，由 Google 處理同步）。
- 資料用途僅支援本產品單一功能：在側邊欄使用 ChatGPT，並依你的操作處理目前頁面／選取。

## 我們與誰分享

- **不會**把頁面內容分享給 SanHsien 或本專案伺服器（沒有後端）。
- 寫入 ChatGPT 後，若你送出，內容由 **OpenAI／ChatGPT** 依其服務條款與隱私政策處理。本專案非 OpenAI 官方產品。
- Chrome 同步儲存由 **Google** 依 Chrome／Google 帳戶政策處理。

## 網路與安全相關行為

為了在 Chrome 側邊欄 **iframe** 載入 ChatGPT，擴充功能會用 `declarativeNetRequest` 移除 ChatGPT 網域回應中的 `Content-Security-Policy` 與 `X-Frame-Options`。這會削弱該網域的 clickjacking 防護。詳見倉庫 [`NOTICE.md`](../NOTICE.md)。

主機權限包含 `http://*/*`、`https://*/*`，僅為在你點擊動作時以 `scripting` 讀取**當前內容分頁**；不常駐掃描所有分頁，也不追蹤瀏覽紀錄。

## Chrome Web Store 使用者資料政策

本產品處理的資料僅用於上述單一用途。若有使用 Google API 或 Chrome 同步所收到的資訊，將遵守 Chrome Web Store User Data Policy，包含 Limited Use 要求。

The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.

## 聯絡

安全與隱私問題：sanhsien (at) gmail.com（標題加 `[PRIVACY]` 或 `[SECURITY]`）。

## 變更

政策更新時會修改本檔、[`privacy.html`](privacy.html)，並更新「更新日期」。
