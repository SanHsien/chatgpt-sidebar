# Chrome Web Store 上架包

更新日期：2026-08-27
狀態：**已通過並公開**（套件仍為 v0.5.10；Dashboard 顯示 Updated 2026-08-18）

公開頁：https://chromewebstore.google.com/detail/chatgpt-sidebar-embedded/kilnbieekgofpkgbhohmogcjkebfflkd
項目 ID：`kilnbieekgofpkgbhohmogcjkebfflkd`

> Cloud Agent 無法代登 Google Developer Dashboard。商品說明必須你本機貼上。

## 已上架後立刻要改（不需新 zip、不出新版）

商店**詳細說明**目前仍是舊文案（只提「摘要當前頁面」、依網址產生提示），與 v0.5 的摘要／翻譯／解釋／大綱不符。英文短句 Overview 第一行已正確。

請開 [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole) → 項目 **ChatGPT Sidebar (Embedded)** → **Store listing**：

1. **簡短說明**若仍是舊句，改貼下方「簡短說明」。
2. **詳細說明**整段換成下方「詳細說明」全文。
3. 按 **儲存**。

這只改商店商品頁，不必上傳新套件，也不必出 v0.5.11。

## 目前套件

商店與 GitHub Release 都是 **[v0.5.10](https://github.com/SanHsien/chatgpt-sidebar/releases/tag/v0.5.10)**。未決定發布修補前：不要 bump `manifest.json`、不要建 GitHub Release、不要把未發行 zip 上傳到商店。

若之後決定出修補，再執行 `node tools/pack-extension.mjs` 並上傳對應 zip。

## Store listing（可直接貼）

### 名稱（≤45）

```text
ChatGPT Sidebar (Embedded)
```

### 簡短說明（≤132）

```text
在 Chrome 側邊欄嵌入 ChatGPT：一鍵摘要／翻譯／解釋／大綱（本機讀取頁面，無自有後端）。
```

英文備選：

```text
Embed ChatGPT in Chrome’s side panel. One-click summarize, translate, explain, outline from the current page.
```

### 詳細說明

```text
ChatGPT Sidebar (Embedded) 讓你在瀏覽網頁時，於 Chrome 側邊欄使用自己的 ChatGPT 工作階段，並一鍵把目前頁面組成繁體中文提示詞。

主要功能
• 側邊欄 iframe 載入 ChatGPT（需已登入）
• 摘要／翻譯／解釋／大綱（翻譯／解釋需先選取文字）
• 本機讀取目前分頁網址、標題、選取或可見文字；不上傳到本專案伺服器
• 可編輯提示詞模板；設定存於 chrome.storage.sync

重要安全說明
為了在側邊欄嵌入 ChatGPT，本擴充功能會移除 ChatGPT 網域的 Content-Security-Policy 與 X-Frame-Options。這會削弱 clickjacking 防護。請了解風險後再使用。本專案非 OpenAI／ChatGPT 官方產品。

隱私政策：https://sanhsien.github.io/chatgpt-sidebar/privacy.html
原始碼與 Release：https://github.com/SanHsien/chatgpt-sidebar
商店頁：https://chromewebstore.google.com/detail/chatgpt-sidebar-embedded/kilnbieekgofpkgbhohmogcjkebfflkd
```

### 類別

建議：`Productivity`（生產力）

### 語言

`zh-TW`（可另加 `en`）

### 隱私權政策 URL（必填，貼在 Privacy 分頁指定欄位）

```text
https://sanhsien.github.io/chatgpt-sidebar/privacy.html
```

不要用 GitHub blob、raw.githubusercontent 或 jsDelivr。

### 首頁／支援

```text
https://github.com/SanHsien/chatgpt-sidebar
https://github.com/SanHsien/chatgpt-sidebar/issues
```

## Privacy 分頁（建議勾選／填寫）

**Single purpose（單一用途）**：

```text
在 Chrome 側邊欄嵌入 ChatGPT，並依使用者操作把目前頁面／選取組成提示詞寫入 ChatGPT 輸入框，方便摘要、翻譯、解釋與大綱。
```

**處理的使用者資料**（依實際行為如實勾選）：

- 網站內容：是（使用者點動作時本機讀取目前分頁文字／選取）
- 個人通訊：否
- 身分／驗證：否（沿用使用者自己的 ChatGPT 登入 cookie／工作階段，本擴充功能不代管帳密）
- 位置：否
- 使用者活動：否（不做追蹤分析）
- 網站瀏覽紀錄：否（不永久儲存瀏覽史；僅當下讀取作用中分頁）

**遠端程式碼**：否（純本機擴充功能檔案；ChatGPT 網頁本身由 OpenAI 提供）

**資料用途說明**：

```text
僅在使用者按下動作時於本機讀取目前分頁內容以組成提示詞，寫入使用者自己的 ChatGPT 輸入框。無自有後端，不上傳到開發者伺服器。寫入後是否送出由使用者在 ChatGPT UI 決定，並受 OpenAI 條款約束。
```

## 權限理由（Dashboard 若要求說明）

| 權限 | 理由 |
|------|------|
| `sidePanel` | 在 Chrome 側邊欄顯示 UI 與嵌入的 ChatGPT |
| `storage` | 儲存使用者設定與提示詞模板 |
| `tabs` / `activeTab` | 取得目前內容分頁資訊、必要時轉發寫入 |
| `scripting` | 在使用者點擊動作時讀取頁面文字／選取，並於 ChatGPT 頁寫入提示詞 |
| `declarativeNetRequest` (+WithHostAccess) | 移除 ChatGPT 網域 CSP／XFO，使側邊欄 iframe 可載入 |
| 主機 `chatgpt.com`／`chat.openai.com` | 載入與操作 ChatGPT 網頁 |
| 主機 `http(s)://*/*` | 使用者點擊動作時讀取任意內容頁（如 Notion）；不常駐掃描 |

## Distribution

- 可見性：公開
- 地區：全球或你指定

## 截圖

至少 1 張，建議 1280×800：側邊欄已登入 ChatGPT＋頂部動作列（摘要／翻譯／解釋／大綱）。圖示：`icons/icon128.png`。

## 打包（僅在決定發布修補時）

```bash
node tools/pack-extension.mjs
# 產出 dist/chatgpt-sidebar-<version>.zip
```

## 歷史：2026-08-02 拒絕後已完成的修正

拒絕信（Purple Nickel）：隱私權政策連結無效。原因是 GitHub blob 頁對商店爬蟲不友善。已改靜態 HTML 公開頁 https://sanhsien.github.io/chatgpt-sidebar/privacy.html ，並於 2026-08 重送通過。

## Agent 做不到的事

- 登入你的 Google 帳號／通過 2FA
- 代改 Developer Dashboard 的商品說明
- 代上傳 zip 或按發布
- 拍攝你本機已登入 ChatGPT 的真實截圖
