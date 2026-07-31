# Decisions

## 2026-07-31：開發環境對齊 SanHsien 其他專案

- 以 `yt_fetch`、`sticker-forge`、`openshelf`、`gpt-ai-assistant`、`github-stars-organizer-playbook` 的慣例為基準。
- 採「中文 README 為主 + `README.en.md`」、`AGENTS.md`／`CLAUDE.md`／`SKILL.md`、`LICENSE`／`NOTICE.md`、`CHANGELOG.md`／`REVIEW.md`、`CONTRIBUTING.md`／`SECURITY.md`、`docs/`、`.github` 模板與簡易 CI。
- 維持純 JS、無 bundler；驗證用 Node 內建能力即可，不為了對齊而硬加 Python／npm 執行時相依。

## 2026-07-31：圖示目錄

- `manifest.json` 已宣告 `icons/icon{16,32,48,128}.png`。
- 決策：把根目錄圖示移入 `icons/`，而不是改 manifest 指回根目錄，以便與常見擴充功能佈局一致。

## 2026-07-31：GitHub About

建議值集中在 [`GITHUB_ABOUT.md`](GITHUB_ABOUT.md)。因 Cloud Agent 的 `gh` 對此 repo 為唯讀，About 需由維護者在 GitHub 設定頁手動套用一次。

## 產品方向（既有）

- Chrome Side Panel 嵌入 ChatGPT + 一鍵摘要提示詞。
- 不架後端、不代管 API key。
- 以動態 DNR 規則移除 ChatGPT 網域 CSP／XFO 作為嵌入前提；風險必須寫在 NOTICE／README。
