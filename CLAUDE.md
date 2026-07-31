# CLAUDE.md

Claude Code 在本專案工作時的指引。**專案定位、硬性邊界、架構速覽、驗證方向的唯一真相源是 [`AGENTS.md`](AGENTS.md)**——先讀它，本檔只補 Claude 專屬要點，不重複規則。

## 回覆要求

- 使用繁體中文，先講修改、驗證、剩餘事項。
- 不要把簡單任務寫成冗長架構分析。
- 動到權限、host permissions、header bypass 或訊息傳遞時，同步更新 [`README.md`](README.md)、[`NOTICE.md`](NOTICE.md) 與 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)。

## 文件同步

新增／改動功能後，同步對應文件（各主題單一真相源）：使用者說明 [`README.md`](README.md)／[`README.en.md`](README.en.md)、最新覆核 [`REVIEW.md`](REVIEW.md)、變更 [`CHANGELOG.md`](CHANGELOG.md)、決策理由 [`docs/DECISIONS.md`](docs/DECISIONS.md)、授權與風險 [`NOTICE.md`](NOTICE.md)。

## 驗證

- 程式修改至少跑 `node --check background.js content.js panel.js` 與 `node tools/validate-extension.mjs`。
- 修復 [`REVIEW.md`](REVIEW.md) 的問題後，回註修復 commit 與日期。
