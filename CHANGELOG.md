# Changelog

本檔記錄 `chatgpt-sidebar` 的版本變更。產品說明見 [`README.md`](README.md)；架構與載入步驟見 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)。

## Unreleased

- **開發環境對齊**：依 SanHsien 其他專案慣例補齊中英 README、`AGENTS.md`／`CLAUDE.md`／`SKILL.md`、`LICENSE`／`NOTICE.md`、`CONTRIBUTING.md`／`SECURITY.md`、`CHANGELOG.md`／`REVIEW.md`、`docs/`、`.gitignore`、GitHub Issue／PR 模板與簡易 CI。
- **圖示路徑修正**：將 `icon*.png` 移入 `icons/`，與 `manifest.json` 宣告一致。
- **驗證腳本**：新增 `tools/validate-extension.mjs`，檢查 manifest JSON、必要檔案與 JS 語法。

## v0.1.0

- 初版 Chrome MV3 擴充功能：側邊欄嵌入 ChatGPT、動態移除 CSP／XFO、摘要當前頁面按鈕。
