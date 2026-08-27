# Project Review 2026-08-27

## 結論

`v0.5.10` 仍是商店與 GitHub Release 的發行版：寫入前先清空；附文盡量全文；長文一次 paste。Chrome Web Store 已通過（公開頁見 [`docs/STORE.md`](docs/STORE.md)）；商品詳細說明仍是舊的「摘要當前頁面」文案，須在 Dashboard 改正，不必出新版。`main` 另有未發行的 postMessage 來源比對與逾時文案修正，等維護者決定要發布修補時再 bump／Release。

## 本機實測（維護者）

| 項目 | 結果 |
| --- | --- |
| 已登入 → `/chat` → 提示詞寫入 | **勉強可接受**（速度） |
| Notion 等頁翻譯／解釋／大綱 | **v0.5.4** 起有主機權限 |
| Cloudflare 阻擋 UI | **目前無法測試** |
| 未來 DOM 改版 | **長期觀測** |
| Chrome Web Store | **已通過**（v0.5.10）；詳細說明待 Dashboard 更新 |

## 已修復（節錄）

- 寫入未清空；附文截太短 — **v0.5.10**（`3c7ff44`，2026-07-31）
- 寫入成功 TDZ — **v0.5.9**（`f3f97d7`，2026-07-31）
- 寫入過慢／逾時相關 — **v0.5.6～v0.5.8**
- 翻譯／解釋缺選取提示；大綱全文優先 — **v0.5.5**
- 缺主機權限無法讀頁 — **v0.5.4**

## 安全／隱私／商店

- CSP／XFO 與頁面文字：[`NOTICE.md`](NOTICE.md)、[`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md)
- 商店：[`docs/STORE.md`](docs/STORE.md)、[`docs/STORE_LISTING.md`](docs/STORE_LISTING.md)
- CWS 公開頁：https://chromewebstore.google.com/detail/chatgpt-sidebar-embedded/kilnbieekgofpkgbhohmogcjkebfflkd
- CWS Purple Nickel（隱私權政策連結無效，2026-08-02）— 改 [`docs/privacy.html`](docs/privacy.html) 公開頁後重送通過
