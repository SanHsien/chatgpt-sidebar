# CLAUDE.md

Claude Code 在本專案工作時，先讀 [`AGENTS.md`](AGENTS.md)。專案定位、產品邊界、架構、文件分工、驗證與 Release 原則均以該檔為準；本檔只補 Claude 專屬工作方式。

## 回覆方式

- 使用繁體中文，先說修改、驗證、剩餘限制。
- 不為簡單 extension 維護製造大型架構重構或治理文件。
- 不把自動檢查當成已完成 Chrome / ChatGPT 端到端 smoke。

## 高風險變更

動到下列項目時，先讀對應專門文件並明確說明影響：

- permissions / host permissions
- iframe / DNR / CSP / X-Frame-Options
- 頁面文字讀取
- 跨 frame / tab 訊息傳遞
- ChatGPT DOM selector
- Chrome Web Store 上架策略

相關文件：[`NOTICE.md`](NOTICE.md)、[`SECURITY.md`](SECURITY.md)、[`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)、[`docs/STORE.md`](docs/STORE.md)。

## 文件與驗證

只更新真正受變更影響的文件。若修復的是 [`REVIEW.md`](REVIEW.md) 已追蹤問題，再同步回註；一般 bug 不必把 REVIEW 當第二份 issue tracker。

程式修改至少執行：

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
```

UI / iframe / selector / session 變更需要可用瀏覽器環境時，再依 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) 做手動 smoke。
