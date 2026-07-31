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

- `README.md` / `README.en.md`：使用者入口。
- `REVIEW.md`／`NOTICE.md`：覆核；授權／隱私／CSP·XFO 風險。
- `AGENTS.md`／`CLAUDE.md`：AI 規則（以 AGENTS 為準）。
- `docs/DEVELOPMENT.md`：架構、載入、排查、選擇器。
- `docs/STORE.md`：商店與「問問 Gemini」對照。
- `manifest.json`、`background.js`／`panel.js`／`content.js`：核心路徑。
- `tools/validate-extension.mjs`：驗證。

## 完成回報

- 改了哪些檔；是否動到權限／header bypass／訊息傳遞。
- 跑過哪些驗證；是否需更新 README、NOTICE 或 REVIEW 回註。
