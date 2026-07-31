# Development

維護者與 AI 接手用的開發文件：架構、本機載入、驗證。使用者入口在 [`README.md`](../README.md)；版本紀錄在 [`CHANGELOG.md`](../CHANGELOG.md)；決策在 [`DECISIONS.md`](DECISIONS.md)；最新 review 在 [`REVIEW.md`](../REVIEW.md)。

## 架構

```text
工具列圖示
   └─► Side Panel（panel.html + panel.js）
          ├─ iframe → ChatGPT（chat.openai.com）
          └─「摘要當前頁面」→ 組 prompt（含 active tab URL）
                    │
                    ▼
         background.js（service worker）
          ├─ declarativeNetRequest：移除 CSP / XFO
          └─ sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
                    │
                    ▼
         content.js（matches ChatGPT 網域，all_frames）
          └─ 寫入可見 textarea + input/change 事件
```

無 bundler、無 npm runtime 相依。改完直接在 Chrome「載入未封裝項目」重載即可。

## 本機載入

1. 安裝 Chrome（或可載入 MV3 的 Chromium）。
2. 開啟 `chrome://extensions/` → 開發人員模式 → **載入未封裝項目** → 選 repo 根目錄。
3. 修改程式後，在該頁按「重新載入」；若改到 `panel.*`，一併關閉再開側邊欄。

## 驗證

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
git diff --check
```

手動 smoke：

1. 側邊欄能開啟且 iframe 嘗試載入 ChatGPT。
2. 已登入時可看到聊天介面；未登入時可登入。
3. 按「摘要當前頁面」後，輸入框應出現含目前 URL 的繁中提示詞（若失敗，對照 [`REVIEW.md`](../REVIEW.md) 的訊息路徑項目）。

## CI

`.github/workflows/ci.yml` 在 push／PR 跑同上的 Node 語法檢查與 `validate-extension.mjs`。Dependabot 僅追蹤 GitHub Actions（本專案無 npm／pip 相依）。

## 維護習慣

- 改權限或 host permissions 時同步 README、NOTICE、manifest。
- 改 header bypass 行為時不可刪除風險聲明。
- 修復 [`REVIEW.md`](../REVIEW.md) 列出的問題後回註 commit hash 與日期。
- 不提交 `.env`、cookies、打包私鑰（`.pem`）、未說明的發佈 zip。
