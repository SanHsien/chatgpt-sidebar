# chatgpt-sidebar 產品路線圖

更新日期：2026-07-31  
規劃基準：`v0.5.10`

這份路線圖描述建議的產品方向與里程碑順序。版本號代表依賴順序，不是日期承諾；變更紀錄見 [`CHANGELOG.md`](CHANGELOG.md)。

## 產品判斷

`chatgpt-sidebar` 最有價值的方向，不是做成完整 ChatGPT 客戶端或後端代理，而是：

> **在瀏覽網頁時，用最少步驟把「這頁／這段選取」丟進自己已登入的 ChatGPT 側邊欄。**

固定邊界（見 [`AGENTS.md`](AGENTS.md)／[`NOTICE.md`](NOTICE.md)）：

- 無 hosted backend、不代管 API key。
- 頁面文字僅在使用者按動作時本機讀取，寫入使用者自己的 ChatGPT。
- 保留 CSP／XFO 風險聲明並誠實披露（商店上架亦同）。

## 已完成里程碑

- [x] **v0.2.x**：摘要閉環、登入／Cloudflare 分流、極短狀態列。
- [x] **v0.3／v0.4**：設定、圖示、選擇器／排查文件、`executeScript` 分頁後備。
- [x] **v0.5.x**：多動作、頁面內文、寫入穩定性與效能；商店材料與隱私政策。
- [x] **商店**：維護者已送出 Chrome Web Store 審查（材料見 [`docs/STORE_LISTING.md`](docs/STORE_LISTING.md)）。

## 之後（非承諾）

- 等商店審核結果：通過則更新 README 商店連結；拒絕則依審核信回覆或改架構（須再拍板）。
- 更多動作或自訂動作按鈕列。
- ChatGPT DOM 改版時更新 `content.js` 選擇器（長期觀測）。

## 明確不做

- 代管 OpenAI API、自建摘要後端、把頁面內容上傳到本專案伺服器。
- 繞過 ChatGPT 付費牆或自動化濫發訊息。
- 為對齊其他專案而引入無必要的 bundler／大型框架。
