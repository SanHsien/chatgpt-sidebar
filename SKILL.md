---
name: chatgpt-sidebar
description: 維護 SanHsien/chatgpt-sidebar。Chrome MV3 側邊欄嵌入 ChatGPT，並以一鍵把目前分頁網址組成繁中摘要提示詞寫入聊天輸入框；無後端、不代管 API key。
---

# chatgpt-sidebar

## 何時使用

使用者要維護 `SanHsien/chatgpt-sidebar`，或開發這個 Chrome 側邊欄摘要擴充功能：

- 調整 side panel UI、摘要提示詞文案或 iframe 來源網域。
- 維護 `declarativeNetRequest` 規則（CSP / XFO 移除）。
- 修復 content script 寫入 ChatGPT 輸入框的選擇器／事件。
- 更新文件、CI 驗證腳本或 GitHub 協作模板。

## 不適用

- 架後端、代管 OpenAI API key 或使用者對話。
- 自動大量抓取、繞過付費牆，或未經使用者確認代送訊息。
- 宣稱 OpenAI / ChatGPT 官方背書。
- 移除安全風險聲明後對外廣傳。

## 快速定位

- `README.md` / `README.en.md`：使用者入口與安裝步驟。
- `REVIEW.md`：最新一次覆核與未驗證項。
- `NOTICE.md`：授權與 CSP/XFO 風險聲明。
- `AGENTS.md` / `CLAUDE.md`：AI 接手規則。
- `manifest.json`：權限與擴充功能宣告。
- `background.js` / `panel.js` / `content.js`：核心執行路徑。
- `docs/DEVELOPMENT.md`：架構與本機載入。
- `tools/validate-extension.mjs`：manifest／路徑／語法檢查。

## 完成回報

回報時列出：

- 修改了哪些檔案。
- 是否改到權限、host permissions、header bypass 或訊息傳遞。
- 執行過哪些驗證（`node --check` / `validate-extension` / 本機載入）。
- 是否需更新 README、NOTICE 或 REVIEW 回註。
