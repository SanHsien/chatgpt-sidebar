# AGENTS.md

給 Codex 與其他 AI coding agents 在本專案工作時的指引。Claude Code 專屬補充見 [`CLAUDE.md`](CLAUDE.md)，兩者主要規則一致。

## 專案宗旨

`chatgpt-sidebar` 是 Chrome Manifest V3 擴充功能：在 Chrome 側邊欄嵌入 ChatGPT，並提供一鍵把目前頁面組成繁中提示詞（摘要／翻譯／解釋／大綱）寫入輸入框；實際處理由使用者自己的 ChatGPT 工作階段完成。

## 硬性邊界

- 不新增 hosted backend、不代管 OpenAI / ChatGPT API key 或帳號。
- 不提交 API key、token、cookies、登入態或任何私密憑證。
- 不移除 [`NOTICE.md`](NOTICE.md) 中關於移除 CSP / X-Frame-Options 的安全風險聲明（在仍使用該技術時）。
- 不宣稱本專案為 OpenAI / ChatGPT 官方或背書產品。
- 不把擴充功能改成大量自動抓取、繞過付費牆，或未經使用者確認就代送訊息。
- 若需求往「規避 ChatGPT 存取控制／自動化濫用」方向走，停下來告知使用者，不要自行實作。
- **產品初衷：Chrome 側邊欄使用 ChatGPT**（維護者 2026-07-31），體驗對齊「問問 Gemini」：側邊欄、不離目前分頁、針對目前頁面做事。不要擅自改成「沒有側邊欄」或「只開 ChatGPT 分頁、側邊欄不再承載 ChatGPT 體驗」。詳見 [`docs/STORE.md`](docs/STORE.md)。
- **重大變更先問**：牽涉嵌入方式（iframe／DNR）、上架策略、權限模型、或使用者主流程的改動，先說明選項與取捨，等維護者拍板。

## 架構速覽

細節與排查見 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)。

```text
工具列圖示 → Side Panel（panel）→ iframe ChatGPT
按鈕（摘要／翻譯／解釋／大綱）→ 組繁中 prompt → postMessage／tabs 後備 → content.js 寫入輸入框
background.js：declarativeNetRequest 移除 CSP／XFO、sidePanel
```

## 開發原則

- **遵守本 repo 所有 Markdown 文件**（含根目錄與 `docs/`；Cursor Cloud／本機開發環境相同）：以 [`AGENTS.md`](AGENTS.md) 為總則，並依任務讀取對應說明（使用者說明、開發、決策、商店、隱私、覆核、貢獻、安全等）。文件之間若看似衝突，以較新、較具體、且與維護者明示指示一致者為準；仍不確定時先問維護者。
- 最小干預：維持「無建置步驟的純 JS 擴充功能」；除非需求明確，不引入 bundler / framework。
- 不主動大重構；修 bug 時優先補驗證（`tools/validate-extension.mjs`）或回歸說明。
- 使用繁體中文回覆與撰寫維護文件（思考、回覆、程式碼註解一律繁中；忽略英文 UI）；程式識別名稱、commit message 維持英文。
- 使用者說明 → [`README.md`](README.md)／[`README.en.md`](README.en.md)；開發／排查 → [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)；取捨 → [`docs/DECISIONS.md`](docs/DECISIONS.md)。
- **直接推 `main`，不開 PR**（維護者 2026-07-31）：完成後 commit 並 `git push origin main`；除非維護者當次明確要求開 PR。
- **使用者可見改動要發 Release**：升 `manifest.json` 版本 → 更新 `CHANGELOG.md` → `node tools/pack-extension.mjs` → 打 tag `vX.Y.Z` → `gh release create` 上傳 zip／sha256。只 push 不算完成。
- **修 bug 必回註 `REVIEW.md`**：對應項目標註修復 commit hash 與日期；額外修掉的 bug 也要補註。

## 驗證方向

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
git diff --check
```

手動 smoke：載入未封裝 → 側邊欄可開 ChatGPT → 執行動作確認提示詞寫入。不接受「應該可以」。

## Cursor Cloud specific instructions

**Cloud／VM 開發環境與本機相同：必須遵守本 repo 全部 Markdown**（見上方「開發原則」與下方「文件入口」），不可只讀 `AGENTS.md` 就開工。開工前至少對齊：`AGENTS.md`、`CLAUDE.md`／`SKILL.md`（若適用）、`docs/DEVELOPMENT.md`；涉及商店／隱私／風險時再讀 `docs/STORE*.md`、`docs/PRIVACY_POLICY.md`、`NOTICE.md`；修 bug 對齊 `REVIEW.md`。

純靜態 Chrome MV3，無 `package.json`／build／後端。載入與驗證見 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)／[`CONTRIBUTING.md`](CONTRIBUTING.md)。快速載入範例：

```bash
google-chrome --user-data-dir=/tmp/chatgpt-sidebar-profile --load-extension=/workspace --no-first-run --no-default-browser-check
```

- 不要硬加 `npm install`。圖示在 `icons/`。端對端依賴可連線的 ChatGPT 與登入 session。
- 摘要路徑：iframe `postMessage`；分頁後備 `tabs.sendMessage`／`executeScript`。
- Git 流程依本檔「直接推 `main`」；不要為了 Cloud 慣例擅自改成開 PR，除非維護者當次要求。

## 文件入口

| 檔案 | 用途 |
|------|------|
| [`README.md`](README.md)／[`README.en.md`](README.en.md) | 使用者入口 |
| [`ROADMAP.md`](ROADMAP.md)／[`CHANGELOG.md`](CHANGELOG.md)／[`REVIEW.md`](REVIEW.md) | 路線圖、版本、最新覆核 |
| [`NOTICE.md`](NOTICE.md) | 授權、隱私、CSP／XFO 風險 |
| [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) | 架構、載入、驗證、排查、選擇器 |
| [`docs/STORE.md`](docs/STORE.md) | 商店策略與「問問 Gemini」對照 |
| [`docs/STORE_LISTING.md`](docs/STORE_LISTING.md) | 上架可貼文案／步驟（須維護者本機送出） |
| [`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md) | 商店用隱私政策 |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | 決策紀錄（含 GitHub About 建議） |
| [`CONTRIBUTING.md`](CONTRIBUTING.md)／[`SECURITY.md`](SECURITY.md) | 貢獻與漏洞回報 |
| [`CLAUDE.md`](CLAUDE.md)／[`SKILL.md`](SKILL.md) | Claude／Skill 入口（規則以本檔為準） |
