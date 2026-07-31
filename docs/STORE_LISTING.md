# Chrome Web Store 上架包（挑戰申請）

更新日期：2026-07-31  
決策：維護者要求**挑戰申請**上架（接受 iframe＋DNR 審核風險）。

> **無法由 Cloud Agent 代登 Google／代按送出。** 本環境沒有瀏覽器自動化 MCP；Developer Dashboard 必須用你的 Google 開發者帳號登入（含 $5 註冊費、可能的 2FA）。下列內容請你本機開啟 Dashboard 貼上。

## 你要做的步驟（約 15–30 分鐘＋審核等待）

1. 開 [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 若尚未註冊：付一次 **USD $5**，接受開發者協議
3. **新增項目** → 上傳 zip：  
   - Release：https://github.com/SanHsien/chatgpt-sidebar/releases/tag/v0.5.10  
   - 檔案：`chatgpt-sidebar-0.5.10.zip`（解壓後應直接是含 `manifest.json` 的根目錄；若 Dashboard 要求「zip 根目錄就是擴充功能」，用 `dist` 打包產物即可）
4. 依下方文案填 **Store listing**／**Privacy**／**Distribution**
5. 上傳至少 **1 張** 1280×800（或 640×400）真實截圖（側邊欄＋動作列）
6. 勾選確認後 **Submit for review**（建議先取消「審核通過立即公開」，改手動發佈）

官方流程：https://developer.chrome.com/docs/webstore/publish

## 上傳用套件

```bash
node tools/pack-extension.mjs
# 產出 dist/chatgpt-sidebar-<version>.zip
```

目前建議上傳：**v0.5.10** 的 zip。

## Store listing（可直接貼）

### 名稱（≤45）

```text
ChatGPT Side Panel Summarizer
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
ChatGPT Side Panel Summarizer 讓你在瀏覽網頁時，於 Chrome 側邊欄使用自己的 ChatGPT 工作階段，並一鍵把目前頁面組成繁體中文提示詞。

主要功能
• 側邊欄 iframe 載入 ChatGPT（需已登入）
• 摘要／翻譯／解釋／大綱（翻譯／解釋需先選取文字）
• 本機讀取目前分頁網址、標題、選取或可見文字；不上傳到本專案伺服器
• 可編輯提示詞模板；設定存於 chrome.storage.sync

重要安全說明
為了在側邊欄嵌入 ChatGPT，本擴充功能會移除 ChatGPT 網域的 Content-Security-Policy 與 X-Frame-Options。這會削弱 clickjacking 防護。請了解風險後再使用。本專案非 OpenAI／ChatGPT 官方產品。

隱私政策：https://github.com/SanHsien/chatgpt-sidebar/blob/main/docs/PRIVACY_POLICY.md
原始碼與 Release：https://github.com/SanHsien/chatgpt-sidebar
```

### 類別

建議：`Productivity`（生產力）

### 語言

`zh-TW`（可另加 `en`）

### 隱私政策 URL（必填）

```text
https://github.com/SanHsien/chatgpt-sidebar/blob/main/docs/PRIVACY_POLICY.md
```

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

- 可見性：公開（或先 Unlisted 測審核）
- 地區：全球或你指定
- 建議：**審核通過後手動發佈**（不要自動公開）

## 截圖（你必須本機拍攝）

至少 1 張，建議 1280×800：

1. 側邊欄已登入 ChatGPT＋頂部動作列（摘要／翻譯／解釋／大綱）
2. （可選）設定面板
3. （可選）說明條提示「請先選取文字」

圖示已有：`icons/icon128.png` 等。

## 風險與預期

- 審核可能因 **修改安全標頭**、**廣域 host 權限**、或品牌近似 ChatGPT 而拒絕或要求改文案。
- 同族產品有上架先例，但**不保證**通過。
- 若被拒：依審核信回覆或改架構（需再拍板）。

## Agent 做不到的事

- 登入你的 Google 帳號／通過 2FA  
- 代付 $5 開發者費  
- 代按 Submit for review  
- 拍攝你本機已登入 ChatGPT 的真實截圖  

請你完成 Dashboard 操作後，把項目公開連結或審核結果貼回即可。
