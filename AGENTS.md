# AGENTS.md

本檔供 Claude Code、Codex、Gemini 等 AI coding agent 在此 repo 工作時使用。

## 專案定位

這是「ChatGPT Side Panel Summarizer」Chrome 擴充功能：在 Chrome 側邊欄嵌入 ChatGPT，並提供一鍵摘要目前頁面的按鈕。

## 協作約定

- **一律使用繁體中文**：思考、回覆使用者、以及撰寫程式碼註解時，請一律使用繁體中文（忽略英文 UI）。
- **修 bug 必回註 `REVIEW.md`（適用所有 AI agent：Claude、Codex、Gemini 等，維護者 2026-07-19 指示，常態慣例）**：每修復 `REVIEW.md`（或本 repo 的 review 文件）列出的問題，須回到對應項目標註修復 commit hash 與日期；修復過程中額外發現並修掉的 bug 也要補註。review 維持 latest-only，但修復狀態必須跟上現況。若本 repo 尚無 `REVIEW.md`，第一次做 review 時建立並適用本規則。

## Cursor Cloud specific instructions

本專案是**純靜態 Chrome MV3 擴充功能**，沒有 `package.json`、沒有 build、沒有本地後端；也沒有 lint / 單元測試腳本。

### 如何「跑起來」

依 `README.md`：Chrome → `chrome://extensions` → 開啟 Developer mode → **Load unpacked** → 選 repo 根目錄。

快速啟動（Cloud VM）可用：

```bash
google-chrome --user-data-dir=/tmp/chatgpt-sidebar-profile --load-extension=/workspace --no-first-run --no-default-browser-check
```

### 非顯而易見的注意事項

- **沒有依賴可安裝**：update script 幾乎是 no-op；不要為此專案硬加 `npm install`。
- **圖示路徑**：`manifest.json` 指向 `icons/icon*.png`，但 repo 根目錄目前是 `icon*.png`（沒有 `icons/`）。載入時工具列圖示可能缺失，但不影響側邊欄與摘要核心流程。若本地要補齊，可暫時建立 `icons/` 並連結／複製根目錄圖示（勿把絕對路徑 symlink commit 進 repo）。
- **端對端依賴外部 ChatGPT**：側邊欄 iframe 會載入 `https://chat.openai.com`；完整摘要流程需要可連線的網路，以及（可選）已登入的 ChatGPT session。未登入時 iframe 會停在登入頁，但擴充功能本身仍可載入與開啟側邊欄。
- **Hello-world 驗收建議**：Load unpacked → 點擴充功能圖示開 side panel → 開一個一般網頁分頁 → 按「摘要當前頁面」。未登入 ChatGPT 時，至少應看到狀態文字更新（例如取得網址／傳送提示）。
