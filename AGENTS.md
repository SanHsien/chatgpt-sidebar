# AGENTS.md

給 Codex 與其他 AI coding agents 在本專案工作時的指引。Claude Code 專屬補充見 [`CLAUDE.md`](CLAUDE.md)，兩者主要規則一致。

## 專案宗旨

`chatgpt-sidebar` 是 Chrome Manifest V3 擴充功能：在 Chrome 側邊欄嵌入 ChatGPT，並提供一鍵「摘要當前頁面」按鈕。摘要提示詞以繁體中文組成，包含目前分頁網址，寫入嵌入的 ChatGPT 輸入框；實際摘要由使用者自己的 ChatGPT 工作階段完成。

## 硬性邊界

- 不新增 hosted backend、不代管 OpenAI / ChatGPT API key 或帳號。
- 不提交 API key、token、cookies、登入態或任何私密憑證。
- 不移除 [`NOTICE.md`](NOTICE.md) 中關於移除 CSP / X-Frame-Options 的安全風險聲明。
- 不宣稱本專案為 OpenAI / ChatGPT 官方或背書產品。
- 不把擴充功能改成大量自動抓取、繞過付費牆，或未經使用者確認就代送訊息。
- 若需求往「規避 ChatGPT 存取控制／自動化濫用」方向走，停下來告知使用者，不要自行實作。

## 架構速覽

```text
使用者點工具列圖示
        │
        ▼
Chrome Side Panel（panel.html / panel.js）
        │  iframe → https://chat.openai.com /
        │  按鈕「摘要當前頁面」→ 組繁中 prompt（含目前分頁 URL）
        ▼
background.js（service worker）
  - declarativeNetRequest：移除 ChatGPT 網域 CSP / XFO
  - sidePanel openPanelOnActionClick
        ▼
content.js（在 ChatGPT 頁面／iframe 內）
  - 收到 insert_prompt → 寫入可見 textarea 並 dispatch input/change
```

| 檔案 | 職責 |
|------|------|
| `manifest.json` | MV3 權限、side panel、content scripts、icons |
| `background.js` | 動態網路規則、側邊欄行為 |
| `panel.html` / `panel.js` | 側邊欄 UI、iframe、摘要按鈕 |
| `content.js` | 在 ChatGPT DOM 寫入提示詞 |
| `icons/` | 16 / 32 / 48 / 128 PNG |

## 開發原則

- 最小干預：維持「無建置步驟的純 JS 擴充功能」；除非需求明確，不引入 bundler / framework。
- 不主動大重構；修 bug 時優先補驗證（見 `tools/validate-extension.mjs`）或回歸說明。
- 使用繁體中文回覆與撰寫維護文件；程式識別名稱、commit message 維持英文。
- 面向使用者的說明改 [`README.md`](README.md)／[`README.en.md`](README.en.md)；架構與載入步驟進 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)；重要取捨進 [`docs/DECISIONS.md`](docs/DECISIONS.md)。
- **修 bug 必回註 `REVIEW.md`（適用所有 AI agent：Claude、Codex、Gemini 等，維護者 2026-07-19 指示，常態慣例）**：每修復 `REVIEW.md` 列出的問題，須回到對應項目標註修復 commit hash 與日期；修復過程中額外發現並修掉的 bug 也要補註。review 維持 latest-only，但修復狀態必須跟上現況。

## 驗證方向

改動後至少確認：

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
git diff --check
```

手動 smoke（本機 Chrome）：

1. `chrome://extensions` → 開發人員模式 → 載入未封裝項目 → 選本 repo 根目錄。
2. 點工具列圖示，確認側邊欄 iframe 可載入 ChatGPT（需已登入或可登入）。
3. 開任意文章分頁，按「摘要當前頁面」，確認提示詞有寫入聊天輸入框。

不接受「應該可以」——行為改動要用語法檢查／驗證腳本或本機實載佐證。

## 文件入口

- [`README.md`](README.md) / [`README.en.md`](README.en.md)：使用者入口（中文為主）。
- [`CHANGELOG.md`](CHANGELOG.md)：版本變更。
- [`REVIEW.md`](REVIEW.md)：最新專案 review。
- [`NOTICE.md`](NOTICE.md)：授權、安全風險與第三方聲明。
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)：架構、本機載入、驗證。
- [`docs/DECISIONS.md`](docs/DECISIONS.md)：決策紀錄。
- [`docs/GITHUB_ABOUT.md`](docs/GITHUB_ABOUT.md)：GitHub About（description / topics / homepage）建議值。
- [`CONTRIBUTING.md`](CONTRIBUTING.md) / [`SECURITY.md`](SECURITY.md)：貢獻與安全回報。
