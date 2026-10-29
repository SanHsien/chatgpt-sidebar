# 路線圖

> 本 repo 後續工作的單一真相源。做完一項，就在同一個 commit 刪掉那一列；新工作只加在這裡。
> 現況段的數字是 2026-10-29 依 `main` `6e25686a36f1` 查的快照，開工前先重查 GitHub。

## 現況

`chatgpt-sidebar` 是 Chrome MV3 側邊欄擴充功能：把目前分頁或選取文字組成摘要／翻譯／解釋／大綱提示詞，寫進使用者自己已登入的 ChatGPT 輸入框（`AGENTS.md:7-9`）。`manifest.json:5` 為 0.5.11，與 GitHub Release 一致；商店公開的仍是 v0.5.10。
健康：open issue 0、open PR 0、Dependabot 與 code scanning 告警 0，CI／CodeQL／Pages 在 `main` 最近一次皆 success（2026-10-29 `gh` 查詢）。
v0.5.11 已於 2026-10-29 發 GitHub Release（`6e25686a36f1`），同日上傳 Chrome Web Store 送審，審核中。

## 近期：可以直接動手

| 項目 | 為什麼 | 驗收方式 | 建議執行者 | 證據 |
| --- | --- | --- | --- | --- |
| 在 Chrome Developer Dashboard 把商品「詳細說明」換成 `docs/STORE_LISTING.md` 的新文案 | 商店頁仍只提「摘要當前頁面」，與現有四個動作不符；不需新 zip、不需 bump 版本 | 商店公開頁的詳細說明出現摘要／翻譯／解釋／大綱四項；`docs/STORE_LISTING.md` 的「狀態」行同一個 commit 更新 | 維護者 | `docs/STORE_LISTING.md:13-18`、`docs/STORE.md:12`、`docs/DECISIONS.md:6` |
| 把寫入行為的實機 smoke 補進 `docs/DEVELOPMENT.md`「手動 smoke」：長提示詞寫入後輸入框非空且沒有變成「貼上的文字附件」、沒有自動送出、翻譯只含選取文字不含整頁內文 | 現有 smoke 只有 3 條（`docs/DEVELOPMENT.md:60-64`），沒涵蓋這輪修過的 `2393b86`（顯示已寫入但輸入框是空的）與 `1873aa4` 三項回歸；單元測試是假物件，擋不到 ChatGPT 實際編輯器行為。動手前 `git pull` 確認 `docs/DEVELOPMENT.md` smoke 段沒有同時被改 | `docs/DEVELOPMENT.md` smoke 段新增上述三條且每條可逐步照做；`node tools/validate-extension.mjs` 與 `git diff --check` 綠 | Claude Sonnet | `CHANGELOG.md` v0.5.11 段、`REVIEW.md` 結論第二段、`docs/DEVELOPMENT.md:60-64` |

## 中期：等條件成立再做

| 項目 | 觸發條件 | 驗收方式 | 建議執行者 | 證據 |
| --- | --- | --- | --- | --- |
| 把各文件的商店狀態改成「公開 v0.5.11」 | Chrome Web Store 通過 v0.5.11（2026-10-29 送審） | 商店公開頁版本為 0.5.11；`REVIEW.md`、`docs/STORE_LISTING.md`、`docs/STORE.md`、本檔現況段同一個 commit 改掉「審核中」 | Claude Haiku | `docs/DECISIONS.md` 2026-10-29 條、`REVIEW.md` 結論 |
| 更新 `content.js` 的 ChatGPT 輸入框選擇器與貼上策略 | 實機出現「無輸入框」「寫入逾時」「寫入失敗」，或 ChatGPT 再改變長文 paste 的處理方式 | 在側邊欄 iframe DevTools 找到實際節點並補進 `docs/DEVELOPMENT.md` 選擇器表；`tools/tests/content.test.mjs` 先有重現紅燈再轉綠；實機長提示詞寫入成功 | Claude Opus | `docs/DEVELOPMENT.md:114,120-133`、`REVIEW.md` 本機實測表「未來 DOM 改版」列、`2393b86` |
| 驗證 Cloudflare 擋下（HTTP 403）時的「需驗證」狀態列流程 | 維護者實機遇到 Cloudflare 驗證頁 | 側邊欄顯示「需驗證」，在一般分頁完成驗證後重試可恢復；結果寫回 `docs/DEVELOPMENT.md` 該段，並刪掉「無法穩定重現」註記 | 維護者 | `docs/DEVELOPMENT.md:99`、`REVIEW.md` 本機實測表 |
| 自訂或更多動作按鈕 | 維護者明確要求這個產品方向（`AGENTS.md` 不把它列入需決策清單，但屬於產品範圍擴張） | 設定頁可新增動作並存進 sync 儲存；單項超過 8 KB 時顯示錯誤（沿用 `1873aa4` 行為）；對應單元測試綠 | Claude Sonnet | `AGENTS.md:7-9`、`CHANGELOG.md` v0.5.11 段儲存失敗一條 |

## 刻意不做

| 不做什麼 | 理由 | 什麼情況下重新考慮 |
| --- | --- | --- |
| 代管 OpenAI API、自建摘要後端、把頁面內容送到本專案伺服器 | 與產品邊界衝突：無 hosted backend、不代管金鑰與登入態（`AGENTS.md:13`） | 維護者明確改變產品定位並先更新 `AGENTS.md` 與隱私政策 |
| 未經使用者確認自動送出訊息、繞過付費牆、自動化濫發 | 提示詞預設只寫入輸入框（`AGENTS.md:15-16`） | 同上，且屬「需要明確產品決策」（`AGENTS.md:22-31`） |
| 引入 bundler、框架或 `package.json` | 維持無建置系統的小型純 JS extension（`AGENTS.md:71`） | 出現原生 JS 無法合理處理的需求，且維護者同意 |
| 縮小 DNR 對全瀏覽器 `chatgpt.com` 移除 CSP／XFO 的範圍，或改成非 iframe 嵌入 | iframe＋DNR 是側邊欄體驗的前提，且列為需產品決策（`AGENTS.md:26`）；錨定修正已進 `main`（`0ddbf08`） | 商店審查要求，或出現不依賴移除標頭的嵌入方式 |

## 維護方式

自有 repo，直接推 `main`（`AGENTS.md:70`）。依賴面只有 workflow 釘住的 actions，由 Dependabot 每週一開 PR；合併前先讀 `gh pr diff`（`AGENTS.md:77`）。發版只在維護者決定時進行，純文件與內部整理不 bump 版本。
