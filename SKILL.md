---
name: chatgpt-sidebar
description: 維護 SanHsien/chatgpt-sidebar：純 JavaScript Chrome MV3 側邊欄工具，使用使用者既有 ChatGPT 工作階段，把目前頁面／選取文字組成摘要、翻譯、解釋或大綱提示詞；無 hosted backend、不代管 API key。
---

# chatgpt-sidebar

## 何時使用

使用者要維護 `SanHsien/chatgpt-sidebar` 時使用，例如：

- 調整 Side Panel UI 或提示詞動作。
- 修復 ChatGPT DOM selector / 提示詞寫入。
- 維護 session 檢查、tab / frame 訊息傳遞。
- 調整 MV3 metadata、permissions 或 DNR 規則。
- 更新 GitHub Release、Chrome Web Store 文件或隱私政策。

## 核心邊界

- Side Panel 是產品核心，不改成純分頁工具。
- 不新增 hosted backend，不代管 ChatGPT / OpenAI 憑證。
- 不自動送出提示詞；由使用者確認後送出。
- 不做大量抓取、付費牆繞過或存取控制規避。
- iframe / CSP / X-Frame-Options 風險必須持續公開揭露。
- 頁面內容雖不送到本專案伺服器，但使用者送出提示詞後會進入 ChatGPT；文件不得混淆兩者。

完整規則以 [`AGENTS.md`](AGENTS.md) 為準。

## 快速定位

- `README.md` / `README.en.md`：產品入口
- `manifest.json`：MV3 metadata / permissions
- `background.js`：Side Panel、DNR、tab forwarding
- `panel.html` / `panel.js`：側邊欄 UI 與 actions
- `content.js`：ChatGPT DOM / prompt insertion
- `tools/validate-extension.mjs`：自動驗證
- `tools/pack-extension.mjs`：Release 封裝
- `NOTICE.md` / `SECURITY.md`：隱私與安全邊界
- `docs/DEVELOPMENT.md`：架構與排查
- `docs/STORE.md` / `docs/STORE_LISTING.md`：Chrome Web Store
- `ROADMAP.md`：產品方向與商店狀態

## 驗證

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
git diff --check
```

涉及 UI、iframe、session、selector 或提示詞寫入時，若環境允許再做 Chrome 手動 smoke，並把未驗證項明確列出。
