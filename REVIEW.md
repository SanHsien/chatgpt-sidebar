# Project Review 2026-07-31

## 結論

本輪以 SanHsien 其他專案（`yt_fetch`、`sticker-forge`、`openshelf`、`gpt-ai-assistant` 等）的開發環境慣例為基準，為 `chatgpt-sidebar` 補齊文件、授權、協作模板與驗證腳本。產品仍是小型 Chrome MV3 擴充功能：側邊欄嵌入 ChatGPT + 一鍵摘要提示詞。

擴充功能**可載入**，但「摘要當前頁面」的訊息路徑在程式碼層級看起來有缺口（見下方未通過項），需後續修復與本機實測後才能宣稱功能完整。

## 本輪實證

- 工作樹對齊開發環境改寫；`manifest.json` 宣告的 icons 路徑為 `icons/icon*.png`，已把根目錄圖示移入 `icons/`。
- `node --check background.js content.js panel.js` 與 `node tools/validate-extension.mjs` 預期作為 CI／本機門檻。
- 未在本環境啟動真實 Chrome 載入擴充功能（cloud agent 無桌面 Chrome Side Panel 驗收）。

## 已修復

| 問題 | 嚴重度 | 修復 |
| --- | --- | --- |
| `manifest.json` 指向 `icons/`，但圖示檔在 repo 根目錄，未封裝載入會缺圖示 | P2 | （本輪）移至 `icons/`，與 manifest 一致 |
| 缺少 SanHsien 慣用的 LICENSE／NOTICE／中英 README／AGENTS／CI 等開發環境檔 | P2 | （本輪）依其他專案慣例補齊 |

## 尚未通過

### P1：`insert_prompt` 可能未送到 content script

`panel.js` 使用 `chrome.runtime.sendMessage({ action: 'insert_prompt', ... })`，而 `content.js` 以 `chrome.runtime.onMessage` 監聽。`background.js` 目前**沒有**轉發該訊息到 ChatGPT tab／frame。

依 Chrome 擴充功能訊息模型，extension page 的 `runtime.sendMessage` 預設不會直接投遞到 content script；通常需要 `chrome.tabs.sendMessage`（或由 background 轉發）。

**預期修復方向**（尚未實作）：

1. 在 `background.js` 監聽 `insert_prompt`；
2. 找出 ChatGPT 相關 tab／side panel frame，以 `tabs.sendMessage` 送出；
3. 本機驗證「摘要當前頁面」確實寫入輸入框。

### P2：ChatGPT DOM 選擇器脆弱

`content.js` 只找可見 `<textarea>`。ChatGPT UI 若改用 `contenteditable`／其他元件，寫入會失敗。需以實機 DOM 再確認，並視需要擴充選取策略。

### P2：iframe 來源僅 `chat.openai.com`

`panel.js` 的 `CHATGPT_ORIGIN` 固定為 `https://chat.openai.com`；manifest 雖同時允許 `chatgpt.com`。若帳號／地區導向不同網域，可能需可設定或自動切換。

## 安全提醒（非 bug，屬產品邊界）

移除 CSP／XFO 是功能前提，但也是已知風險；文件已寫在 [`NOTICE.md`](NOTICE.md)、[`SECURITY.md`](SECURITY.md) 與 README。不要在未更新風險聲明的情況下對外廣傳。
