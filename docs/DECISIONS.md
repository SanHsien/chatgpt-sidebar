# Decisions

## 2026-07-31：挑戰 Chrome Web Store 上架

- 維護者指示挑戰申請上架（接受 iframe＋DNR 審核風險）。
- Cloud Agent 無法代登 Google Dashboard；材料見 [`STORE_LISTING.md`](STORE_LISTING.md)、隱私政策 [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md)。
- 發行仍保留 GitHub Release。


- 開關只控制**摘要**是否附上頁面可見文字。
- **大綱**一律附全文（讀不到才退回網址）；設定文案不得寫成「摘要／大綱」以免誤解。


- **翻譯／解釋**：必須有選取文字；讀不到或未選取時顯示說明條（不只改狀態列短字）。
- **大綱**：不需選取；優先附頁面可見全文（結構大綱靠內文才穩）。讀不到全文時退回網址／標題並寫入提示詞，同時說明結果可能較弱——只給網址時模型常無法可靠抓頁，品質不如附全文。


- `WHY_GEMINI_CAN` 併入 [`STORE.md`](STORE.md)；排查與選擇器併入 [`DEVELOPMENT.md`](DEVELOPMENT.md)；`GITHUB_ABOUT` 併入本檔；隱私細節併入 [`NOTICE.md`](../NOTICE.md)。
- 目的：減少重複入口，保留單一真相源。

## 2026-07-31：產品初衷與重大變更須先問

- 初衷是 **Chrome 側邊欄使用 ChatGPT**；產品體驗對齊「問問 Gemini」那種側邊欄用法，不是改成僅開分頁。
- 不可擅自取消側邊欄內的 ChatGPT 體驗，或改成「只開 ChatGPT 分頁」當主流程。
- 嵌入方式、上架策略、權限模型等重大變更，須先問維護者。
- 紀錄於 [`AGENTS.md`](../AGENTS.md)；對照見 [`STORE.md`](STORE.md)。

## 2026-07-31：v0.5 再評估項落地與商店決策

- 實作頁面可見文字本機讀取與多動作（摘要／翻譯／解釋／大綱）；隱私寫在 [`NOTICE.md`](../NOTICE.md)。
- Chrome Web Store：**不上架**，理由見 [`STORE.md`](STORE.md)；發行維持 GitHub Release。

## 2026-07-31：直接推 main，不開 PR

- 維護者指示：後續變更完成後直接 commit 並推到 `main`。
- 不要為常規工作建立或更新 pull request，除非當次任務明確要求開 PR。

## 2026-07-31：開發環境對齊 SanHsien 其他專案

- 以 `yt_fetch`、`sticker-forge`、`openshelf`、`gpt-ai-assistant`、`github-stars-organizer-playbook` 的慣例為基準。
- 採「中文 README 為主 + `README.en.md`」、`AGENTS.md`／`CLAUDE.md`／`SKILL.md`、`LICENSE`／`NOTICE.md`、`CHANGELOG.md`／`REVIEW.md`、`CONTRIBUTING.md`／`SECURITY.md`、`docs/`、`.github` 模板與簡易 CI。
- 維持純 JS、無 bundler；驗證用 Node 內建能力即可。

## 2026-07-31：圖示目錄

- `manifest.json` 已宣告 `icons/icon{16,32,48,128}.png`。
- 決策：把根目錄圖示移入 `icons/`，而不是改 manifest 指回根目錄。

## 2026-07-31：GitHub About（建議值）

因 Cloud Agent 的 `gh` 對此 repo 為唯讀，About 需由維護者在 GitHub → Settings／About 手動套用。

**Description：**

```text
在 Chrome 側邊欄嵌入 ChatGPT：摘要／翻譯／解釋／大綱（本機讀取頁面文字）。｜Side panel ChatGPT: summarize, translate, explain, outline from the current page.
```

較短備選：`Chrome side panel with embedded ChatGPT + one-click Traditional Chinese page-summary prompts.`

**Homepage：** 可留空。

**Topics：** `chrome-extension`、`chrome-side-panel`、`chatgpt`、`openai`、`summarizer`、`manifest-v3`、`javascript`、`traditional-chinese`、`browser-extension`

| 項目 | 建議 |
|------|------|
| Issues | 開啟 |
| Projects / Wiki / Discussions | 可關 |
| License | MIT |

## 產品方向（既有）

- Chrome Side Panel 嵌入 ChatGPT + 一鍵提示詞。
- 不架後端、不代管 API key。
- 以動態 DNR 規則移除 ChatGPT 網域 CSP／XFO；風險必須寫在 NOTICE／README。
