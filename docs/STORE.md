# Chrome Web Store 與「問問 Gemini」對照

更新日期：2026-07-31（維護者指示：**挑戰申請上架**）

## 目前發行與上架策略

- **持續**：GitHub Release／Load unpacked  
- **進行中**：Chrome Web Store **已送出審查**（等待 Google 結果；通過後再更新 README 商店連結）。
- **操作手冊與可貼文案**：[`STORE_LISTING.md`](STORE_LISTING.md)  
- **隱私政策（上架 URL）**：[`PRIVACY_POLICY.md`](PRIVACY_POLICY.md)

Cloud Agent 無法代登 Dashboard。技術代價（iframe＋移除 CSP／XFO）已在上架材料中披露。

## 一句話對照

| | 問問 Gemini | 本專案（v0.5 iframe） | 商店上常見第三方「ChatGPT 側邊欄」 |
|--|-------------|----------------------|----------------------------------|
| 是什麼 | **Chrome 內建**（Google 一等公民） | 第三方擴充功能 | 多半也是第三方擴充功能 |
| 側邊欄裡是什麼 | **瀏覽器原生 UI**，連 Google Gemini | **iframe 載入 chatgpt.com** | 常同樣 iframe＋改標頭，或自製 UI＋API |
| 要不要拔 XFO／CSP | **不用** | **要** | iframe 派通常要；API 派不用 |
| 「上架／可用」 | 隨 Chrome 發佈 | Release＋**挑戰商店審核** | 有些通過＝審核裁量＋披露，≠官方保證安全 |

## 「問問 Gemini」在做什麼

依 [Google 說明](https://support.google.com/chrome/answer/16283624)：點工具列 → 右側**側邊欄** → 依**目前分頁內容**回答。這是 **Gemini in Chrome**，不是 iframe 嵌 `gemini.google.com`。

## 本專案初衷

產品體驗對齊「問問 Gemini」用法：側邊欄、不離目前分頁、針對目前頁。技術上第三方需 iframe＋DNR；見 [`AGENTS.md`](../AGENTS.md)。

## 為什麼商店裡還有類似擴充功能？

1. **也用 iframe＋改標頭**（與本專案同族）：例如 [chatgpt-panel](https://github.com/PeterPorzuczek/chatgpt-panel-chrome-extension)。通過當次審核≠無安全代價。  
2. **側邊欄自製 UI＋API／開官網分頁**：不必拔標頭。  
3. **Chrome 內建**：「問問 Gemini」。

## 上架選項（已選 1）

1. **✓ 進行中**：維持 iframe＋拔標頭，準備披露並接受審核不確定性。  
2. 側邊欄保留不離頁，但改 ChatGPT 呈現方式（須另拍板）。  
3. 只做 Release（目前並行保留）。
