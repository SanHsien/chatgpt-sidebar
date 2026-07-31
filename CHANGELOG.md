# Changelog

本檔記錄 `chatgpt-sidebar` 的版本變更。產品說明見 [`README.md`](README.md)；路線圖見 [`ROADMAP.md`](ROADMAP.md)。

## Unreleased

- **商店**：維護者已送出 Chrome Web Store 審查；材料見 [`docs/STORE_LISTING.md`](docs/STORE_LISTING.md)、[`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md)。
- **文件**：`ROADMAP`／`REVIEW` 對齊「已送審」現況。

## v0.5.10

- **修復**：摘要／大綱等寫入前先清空輸入框（`selectAll`＋`delete`），再貼上新提示詞。
- **效能／內容**：頁面附文改回盡量全文（約 10 萬字硬上限）；長文一次 paste 後立刻回報，加快寫入。

## v0.5.9

- **修復**：寫入成功時 `finish` 提早清 `interval`／`timer` 觸發 `Cannot access 'interval' before initialization`，導致 promise 未 resolve、看起來像寫入失敗。

## v0.5.8

- **效能**：寫入慢／常逾時——頁面附文改約 3,500 字、提示詞硬上限約 5,000 字；長文一次 paste 而非反复 insertText；寫入前 ping、縮短重試與逾時。

## v0.5.7

- **文案**：設定改為「摘要時附上頁面可見文字」；大綱本來就不吃此開關（一律附全文），避免標成「摘要／大綱」造成誤解。

## v0.5.6

- **修復**：寫入逾時／卡在「寫入中」——不再用 `innerHTML` 硬清 ProseMirror（會弄壞編輯器）；改 selectAll＋insertText；放寬寫入驗證；縮短重試並為 background 轉發加逾時；忙碌狀態正確解除。

## v0.5.5

- **UX**：翻譯／解釋讀不到或未選取時，顯示說明條（標題＋說明＋「知道了」），不再幾乎無反應。
- **大綱**：不需選取；優先附頁面全文。讀不到全文時改以網址／標題寫入，並說明結果可能較弱。

## v0.5.4

- **修復**：翻譯／解釋／大綱在 Notion 等網站無效——側邊欄按鈕無法靠 `activeTab` 讀頁，改宣告 `http://*/*`／`https://*/*` 主機權限；缺權時狀態列顯示「無頁面權限」。請重新載入擴充功能後再試。

## v0.5.3

- **修復**：所有動作（摘要／翻譯／解釋／大綱）寫入 ChatGPT 輸入框皆「先清空再送出」，避免殘留舊文字時 ProseMirror／contenteditable 寫入失敗。

## v0.5.2

- **UX**：工具列併成一行——摘要／翻譯／解釋／大綱／檢查／設定與狀態文字（如「已寫入」）。

## v0.5.1

- **UX**：拿掉多餘的「執行」按鈕；點「摘要／翻譯／解釋／大綱」即直接寫入提示詞。
- **文件**：合併精簡——「問問 Gemini」對照併入 [`docs/STORE.md`](docs/STORE.md)；排查／選擇器併入 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)；隱私併入 [`NOTICE.md`](NOTICE.md)；GitHub About 併入 [`docs/DECISIONS.md`](docs/DECISIONS.md)。

## v0.5.0

- **多動作**：摘要／翻譯／解釋／大綱；各自動作可編輯模板（`{{url}}`／`{{title}}`／`{{selection}}`／`{{content}}`）。
- **頁面可見文字**：執行時以 `activeTab`＋`scripting` 本機讀取（約 12,000 字截斷）；設定可關閉摘要附內文。隱私見 [`NOTICE.md`](NOTICE.md)。
- **Chrome Web Store**：評估後維持不上架、僅 GitHub Release／Load unpacked；見 [`docs/STORE.md`](docs/STORE.md)。

## v0.4.0

- **圖示重畫**：深青石底＋薄荷側欄＋摘要線，16／32／48／128；`tools/generate-icons.py` 可重產。
- **設定**（`chrome.storage.sync`）：ChatGPT 網域、`{{url}}` 提示詞模板、寫入後是否聚焦輸入框（預設關）。
- **韌性**：分頁寫入失敗時以 `scripting.executeScript` 再注入 `content.js` 後重試；選擇器與排查見 `docs/DEVELOPMENT.md`。
- 路線圖 v0.3／v0.4 項目完結。

## v0.2.2

- **側邊欄工具列**：狀態列改為極短文案（如「已登入」「已寫入」）；完整說明改放 `title` 提示。按鈕「摘要本頁」不換行。

## v0.2.1

- **登入態檢查**（參考 chatgpt-panel）：載入前請求 `/api/auth/session`，區分已登入／未登入／Cloudflare 403／錯誤。
- **聊天路徑**：通過後 iframe 載入 `/chat`；摘要按鈕就緒前停用。

## v0.2.0

- **GitHub Release**、打包腳本、postMessage 摘要路徑、contenteditable、預設 `chatgpt.com`、路線圖。

## v0.1.0

- 初版 Chrome MV3 擴充功能與開發環境對齊。
