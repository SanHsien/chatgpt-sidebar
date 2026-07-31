# Project Review 2026-07-31

## 結論

`v0.5.10`：寫入前先清空；附文盡量全文；長文一次 paste。維護者已**送出 Chrome Web Store 審查**（等待結果）。GitHub Release 仍為主要／並行發行管道。

## 本機實測（維護者）

| 項目 | 結果 |
| --- | --- |
| 已登入 → `/chat` → 提示詞寫入 | **勉強可接受**（速度） |
| Notion 等頁翻譯／解釋／大綱 | **v0.5.4** 起有主機權限 |
| Cloudflare 阻擋 UI | **目前無法測試** |
| 未來 DOM 改版 | **長期觀測** |
| Chrome Web Store | **審查中** |

## 已修復（節錄）

- 寫入未清空；附文截太短 — **v0.5.10**（`3c7ff44`，2026-07-31）
- 寫入成功 TDZ — **v0.5.9**（`f3f97d7`，2026-07-31）
- 寫入過慢／逾時相關 — **v0.5.6～v0.5.8**
- 翻譯／解釋缺選取提示；大綱全文優先 — **v0.5.5**
- 缺主機權限無法讀頁 — **v0.5.4**

## 安全／隱私／商店

- CSP／XFO 與頁面文字：[`NOTICE.md`](NOTICE.md)、[`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md)
- 商店：[`docs/STORE.md`](docs/STORE.md)、[`docs/STORE_LISTING.md`](docs/STORE_LISTING.md)
