# 貢獻指南（Contributing）

感謝你對 `chatgpt-sidebar` 有興趣。這是一個小型 Chrome 擴充功能，歡迎 issue 與 PR。送出前請先讀本頁，尤其是「專案邊界」。

## 專案邊界（最重要）

本專案只做：

- 在 Chrome 側邊欄嵌入 ChatGPT；
- 一鍵把目前分頁網址組成繁中摘要提示詞並寫入輸入框。

**以下方向的貢獻一律不接受，PR 會直接關閉：**

- 新增 hosted backend，或代管 OpenAI / ChatGPT API key／帳號。
- 規避付費牆、自動化大量抓取，或未經使用者確認代送訊息。
- 移除 [`NOTICE.md`](NOTICE.md) 中關於 CSP／XFO 風險的聲明後對外廣傳。
- 宣稱 OpenAI／ChatGPT 官方關聯或背書。

## 開發環境

需要可執行的 Node.js（僅用於語法檢查與驗證腳本；擴充功能本身無 npm 相依）。

```bash
git clone https://github.com/SanHsien/chatgpt-sidebar.git
cd chatgpt-sidebar
node --check background.js content.js panel.js
node tools/validate-extension.mjs
```

在 Chrome 以「載入未封裝項目」選本 repo 根目錄做手動驗證。細節見 [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md)。

## 送出前的檢查

1. 跑上面兩道 Node 檢查。
2. 若改到 UI／訊息傳遞／權限，請在本機實際載入擴充功能 smoke test。
3. 風格採最小干預：不主動大改命名、不引入 bundler／framework，除非 PR 明確需要。
4. 使用繁體中文更新使用者文件；程式識別名稱維持英文。

## 不要提交的東西

`.env`、cookies、登入態、打包產物（`.crx`／`.pem`／未說明的 `.zip`）、IDE 本機設定等已列入 [`.gitignore`](.gitignore)，請勿移除或繞過。

## 提交流程

1. Fork 並開分支。
2. 提交清楚的 commit message。
3. 確認驗證通過。
4. 開 PR，說明動機與改了什麼；若涉及 header bypass 或權限，請明確標註。

## 授權

送出貢獻即表示你同意你的貢獻以本專案的授權 **[MIT](LICENSE)** 釋出。
