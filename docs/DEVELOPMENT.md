# Development

維護者與 AI 接手用：架構、本機載入、驗證、排查與輸入框選擇器。使用者入口在 [`README.md`](../README.md)；路線圖在 [`ROADMAP.md`](../ROADMAP.md)。

## 架構

```text
工具列圖示
   └─► Side Panel（panel.html + panel.js）
          ├─ 設定（storage.sync：網域／提示詞模板／聚焦）
          ├─ GET {origin}/api/auth/session
          │     ├─ authorized → iframe {origin}/chat
          │     └─ unauthorized / cloudflare / error → 提示＋重試
          └─ 點「摘要／翻譯／解釋／大綱」→ 模板渲染 {{url}}／{{title}}／{{selection}}／{{content}}
                    │
                    ├─ postMessage → iframe 內 content.js
                    │
                    └─（後備）runtime.sendMessage → background.js
                              └─ tabs.sendMessage
                                   └─（再失敗）executeScript 注入 content.js 後重送
```

無 bundler、無 npm runtime 相依。改完直接在 Chrome「載入未封裝項目」重載即可。

| 檔案 | 職責 |
|------|------|
| `manifest.json` | MV3 權限、side panel、content scripts、icons |
| `background.js` | 動態網路規則、側邊欄行為、分頁轉發 |
| `panel.html` / `panel.js` | 側邊欄 UI、iframe、動作按鈕 |
| `content.js` | 在 ChatGPT DOM 寫入提示詞 |
| `icons/` | 16 / 32 / 48 / 128 PNG |

## 本機載入

1. 安裝 Chrome（或可載入 MV3 的 Chromium）。
2. 開啟 `chrome://extensions/` → 開發人員模式 → **載入未封裝項目** → 選 repo 根目錄。
3. 修改程式後，在該頁按「重新載入」；若改到 `panel.*`，一併關閉再開側邊欄。

Cloud VM 快速啟動：

```bash
google-chrome --user-data-dir=/tmp/chatgpt-sidebar-profile --load-extension=/workspace --no-first-run --no-default-browser-check
```

## 驗證

```bash
node --check background.js content.js panel.js
node tools/validate-extension.mjs
git diff --check
```

打包（產出 `dist/chatgpt-sidebar-<version>/` 與 `.zip`）：

```bash
node tools/pack-extension.mjs
```

手動 smoke：

1. 側邊欄能開啟且 iframe 嘗試載入 ChatGPT。
2. 已登入時可看到聊天介面；未登入時可登入。
3. 開一般網頁分頁，按「摘要」等動作後，輸入框應出現對應繁中提示詞。

## CI

`.github/workflows/ci.yml` 在 push／PR 跑同上的 Node 語法檢查與 `validate-extension.mjs`。Dependabot 僅追蹤 GitHub Actions。

## 排查

### 擴充功能是否正確載入

1. `chrome://extensions/` → 確認已啟用 →「重新載入」後再開側邊欄。
2. 若從 Release zip 安裝，確認選到含 `manifest.json` 的資料夾。

### 登入／Cloudflare（session 檢查）

側邊欄請求 `{origin}/api/auth/session`：

| 狀態列 | 意義 | 建議 |
|--------|------|------|
| 已登入 | session 有 `accessToken` | 可執行動作 |
| 未登入 | 無有效 session | 「開啟 ChatGPT」在分頁登入後重試 |
| 需驗證 | HTTP 403（常見 Cloudflare） | 在一般分頁完成驗證後重試 |
| 檢查失敗 | 網路／權限錯誤 | 檢查連線與 host permissions |

> Cloudflare 實機擋下目前無法穩定重現；路徑已實作，遇阻再驗。

### iframe 空白（DNR／標頭）

靠 `declarativeNetRequest` 移除 ChatGPT 的 `Content-Security-Policy` 與 `X-Frame-Options`。

1. 確認 manifest 含 `declarativeNetRequest` 與對應 `host_permissions`。
2. 擴充功能 →「服務工作者」→ 檢查 DNR 錯誤。
3. 重新載入擴充功能（`onInstalled` 會重設動態規則）。
4. 換網域設定（`chatgpt.com`／`chat.openai.com`）後再試。

### 提示詞沒寫入

路徑：iframe `postMessage` → 後備 `tabs.sendMessage` → 再失敗則 `executeScript` 注入 `content.js`。

若「無輸入框／寫入逾時」：確認已登入且輸入框已出現；稍候再試；DOM 大改時依下方選擇器更新 `content.js`。

### 設定未生效

設定存在 `chrome.storage.sync`。按「儲存」後：變更網域會重跑 session 並重載 iframe；模板缺 `{{url}}` 時寫入會回退預設。

## ChatGPT 輸入框選擇器

`content.js` 依序嘗試（可見、非 disabled）：

1. `#prompt-textarea`
2. `textarea[data-id="root"]`
3. `div#prompt-textarea[contenteditable="true"]`
4. `[contenteditable="true"][data-placeholder]`
5. `textarea`
6. `[contenteditable="true"]`

寫入：先 `selectAll`＋`delete` 清空，再寫入。短文 `insertText`、長文**一次 paste** 後立即回報（不等 DOM 全渲染）。頁面附文盡量全文（約 10 萬字硬上限）。

DOM 改版時：在側邊欄 iframe 的 DevTools 找實際輸入節點，把穩定選擇器補進上列前端。

## 維護習慣

- 改權限或 host permissions 時同步 README、NOTICE、manifest。
- 改 header bypass 行為時不可刪除風險聲明。
- 修復 [`REVIEW.md`](../REVIEW.md) 列出的問題後回註 commit hash 與日期。
- 不提交 `.env`、cookies、打包私鑰（`.pem`）、未說明的發佈 zip。
