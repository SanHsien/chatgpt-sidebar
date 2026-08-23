# AGENTS.md

本檔是 **SanHsien/chatgpt-sidebar** 的 AI coding agent 主要維護規則。Claude 薄入口見 [`CLAUDE.md`](CLAUDE.md)，快速索引見 [`SKILL.md`](SKILL.md)；若有衝突，以本檔為準。

## 專案定位

**ChatGPT Sidebar** 是純 JavaScript、Chrome Manifest V3 的側邊欄工具：讓使用者在目前網頁旁使用自己已登入的 ChatGPT，並把頁面／選取文字組成摘要、翻譯、解釋或大綱提示詞寫入輸入框。

產品重點是：**目前頁面 → 少量操作 → 自己的 ChatGPT 側邊欄**。它不是完整 ChatGPT client，也不是 AI backend。

## 硬性產品邊界

- 不新增 hosted backend，不代管 OpenAI / ChatGPT API key、帳號、cookies 或登入態。
- 不提交 token、cookies、session、測試帳號或其他私密憑證。
- 提示詞預設只寫入輸入框，**不得未經使用者確認自動送出**。
- 不把產品改成大量抓取、自動濫發、繞過付費牆或規避 ChatGPT 存取控制的工具。
- 不宣稱本專案為 OpenAI / ChatGPT 官方或背書產品。
- 只要仍以 iframe 嵌入 ChatGPT 並移除 CSP / X-Frame-Options，就必須在公開文件保留明確的 anti-framing / clickjacking 風險聲明。
- 頁面內容可在使用者執行動作時於本機讀取；若內容之後被使用者送進 ChatGPT，文件不得誤導成「永遠不會離開瀏覽器」。
- 不為了工程整齊把產品改成獨立 ChatGPT 分頁或移除 side panel 核心體驗。

## 需要明確產品決策的變更

下列項目不要順手改：

- iframe / DNR 嵌入方式
- `host_permissions` 或權限模型的大幅變更
- Chrome Web Store 上架策略
- 是否改成其他 AI provider / web app
- 自動送出訊息
- hosted backend

可以先做研究或提出可逆方案，但不要把這些重大方向混進一般 bugfix / maintenance PR。

## 架構地圖

```text
Chrome action
    │
    ▼
Side Panel (`panel.html` / `panel.js`)
    │
    ├─ iframe → ChatGPT web UI
    └─ actions → summarize / translate / explain / outline
                    │
                    ▼
           current tab content
                    │
                    ▼
          prompt composition
                    │
                    ▼
`content.js` writes into ChatGPT input

`background.js` → sidePanel behavior, tab forwarding, DNR rules
```

主要位置：

- `manifest.json`：MV3 metadata、permissions、host permissions
- `background.js`：service worker、Side Panel、DNR/header 規則與分頁轉發
- `panel.html` / `panel.js`：側邊欄 UI、session 狀態、提示詞動作
- `content.js`：ChatGPT DOM 定位與提示詞寫入
- `tools/validate-extension.mjs`：extension layout / contract 驗證
- `tools/pack-extension.mjs`：建立 Release 用乾淨封裝
- `docs/DEVELOPMENT.md`：架構、排查與手動 smoke

## 開發原則

- 一般變更直接推 `origin/main`，不開功能分支、不開維護 PR（主人 2026-08-22 指示）。只有在需要他人審查、或改動風險高到值得先讓 CI 在 PR 上跑一輪時，才退回 **branch → PR → CI → merge**。
- 維持無 bundler、無 framework、無 `package.json` 的小型純 JS extension；除非產品需求明確，不引入建置系統。
- 修 bug 以最小變更為主；可自動驗證的行為優先補進 `tools/validate-extension.mjs` 或既有檢查。
- ChatGPT DOM / selector 是外部 UI 契約；修改時要保留失敗時的可理解提示，不要假設 selector 永久穩定。
- 動到 permissions、host permissions、DNR/header bypass、頁面內容讀取或跨 frame 訊息傳遞時，同步檢查 [`NOTICE.md`](NOTICE.md)、[`SECURITY.md`](SECURITY.md) 與 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)。
- 不為了「完整」新增 governance workflow；目前 CI + Pages 已足以服務這個小型 extension。
- 純文件、agent 規則或內部整理不需要 bump `manifest.json` 版本，也不需要建立 Release。
- **合併任何 PR 前先讀 diff**（包含 Dependabot 開的）：`gh pr diff <編號>`。CI 綠燈證明的是「測試沒紅」，不是「改了什麼、該不該進 main」——lockfile 的連鎖升級、transitive major、跨出宣告範圍的變更，只有讀 diff 看得到。核准或合併訊息要寫出讀到什麼、為什麼可接受。

## 文件分工

- `README.md` / `README.en.md`：產品入口、安裝、使用、必要隱私／安全摘要
- `NOTICE.md`：權限、第三方服務、CSP/XFO、隱私與 provenance
- `SECURITY.md`：安全回報與核心安全邊界
- `ROADMAP.md`：產品方向與商店狀態
- `CHANGELOG.md`：正式 Release 的使用者可見變更
- `REVIEW.md`：最近一次人工覆核與仍需追蹤的驗收事項
- `docs/DEVELOPMENT.md`：架構、載入、驗證、selector / iframe 排查
- `docs/STORE.md` / `docs/STORE_LISTING.md`：Chrome Web Store 工作
- `docs/DECISIONS.md`：耐久性的產品／架構決策

只更新**真正受本次變更影響**的文件。修 bug 若正好關閉 `REVIEW.md` 已追蹤項目，才回註該項；一般 bug 已有測試、PR 與 CHANGELOG/commit evidence 時，不額外把 REVIEW 變成強制流水帳。

## 驗證

程式或 extension metadata 變更至少執行：

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
git diff --check
```

涉及 UI、iframe、session、selector、頁面讀取或提示詞寫入時，再做 Chrome 手動 smoke：

1. Load unpacked。
2. 開啟 Side Panel。
3. 確認 ChatGPT 登入／未登入狀態合理。
4. 在一般頁面執行受影響動作。
5. 確認提示詞正確寫入、未被自動送出。

沒有可用的已登入 ChatGPT 工作階段時，不得聲稱已完成該部分端對端驗證；把自動檢查與手動 smoke 分開回報。

## Release 原則

只有在**打算發布新的 extension 版本**時才：

1. 更新 `manifest.json` version。
2. 更新 `CHANGELOG.md`。
3. 驗證並執行 `node tools/pack-extension.mjs`。
4. 建立對應 tag / GitHub Release，附 zip 與 checksum。

文件整理、CI 維護、agent 規則等不影響發行內容的變更不需要製造空 Release。
