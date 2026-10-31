# DeskTiles 網站發布與維護

這是 Nicoa The Six 作品集中的 DeskTiles 專區。沿用既有黑白文件版型、語言切換、側欄、章節目錄、搜尋與 GTM，提供中英文專案介紹、使用說明與專案 README。英文文字為原中文文件的網站翻譯；實際程式截圖保留原中文介面。沒有宣稱專案開源，也沒有猜測原始碼倉庫網址。

## 建置流程

在上一層網站根目錄執行：

```powershell
node .\build-desktiles.mjs --source 'D:\DeskTile'
node .\check-desktiles.mjs
```

`build-desktiles.mjs` 的輸入只限明確列出的 README、使用說明、五張截圖、兩個 Logo、ZIP、SHA256 清單、範例配置與驗證摘要。只讀來源；不掃描或存取 LocalAppData、使用者版面與日誌，不執行 EXE，不重新打包 ZIP。

程式運作前列出所有輸入與輸出檔案的絕對路徑，接著分階段：

1. 盤點來源並核對 ZIP 與 SHA256SUMS 的雜湊。
2. 原樣複製文件、截圖、Logo、範例與下載檔，記錄大小與 SHA-256。原始中文 Markdown 保留來源位元組；下載後其中相對路徑仍依原專案目錄定義。
3. 將中文來源與網站英文翻譯轉成清理過的 HTML，調整線上版的圖片與下載連結；線上版省略給網站管理員的內部交接段落，原始 README 下載仍保留原文。
4. 建立六個 HTML、雙語搜尋索引與來源清單。各頁皆嵌入一份共用 GTM head 與 body noscript。
5. 更新中英文首頁專案卡，提供專案／使用說明／ZIP 入口。日後執行會替換同一張卡片，不重複新增。

線上 README 省略來源專案的本機搬移說明與網站管理員交接段落，下載版保留完整原始文件；中文檔名連結先解碼再映射到網站相對路徑。

`content/guide-en.md` 與 `content/readme-en.md` 是網站英文翻譯來源。原中文文件更新後，需同步檢查翻譯；此建置不是自動排程。產品截圖與中文來源下載原檔保持不變。

## 驗證流程

`check-desktiles.mjs` 先顯示來源清單、網站及報告的絕對路徑，再檢查六頁導覽／語言對應／唯一 id／章節錨點、公開圖片與下載、GTM 唯一性、搜尋索引、所有複製資產與來源記錄的雜湊、ZIP 及 SHA256SUMS。一份結果寫至 `validation-report.json`，逐階段顯示進度。

本機預覽執行根目錄的 `node .\serve.mjs`，再執行 `node .\check-desktiles.mjs --url 'http://127.0.0.1:4173/MyPortfolio/desktiles/'`；會逐批核對 HTTP 回應內容及下載 MIME。發布後可將 URL 換成公開網站，確認 HTML、圖片與 ZIP 和本機產物一致。瀏覽器另外驗證桌面、390／320 px 手機版、文件搜尋、語言切換、導覽與實際下載。

## 公開入口

- `/MyPortfolio/desktiles/`：中文專案頁。
- `/MyPortfolio/desktiles/guide.html`：中文使用說明。
- `/MyPortfolio/desktiles/readme.html`：中文專案 README。
- `/MyPortfolio/desktiles/en/`：英文專案頁，並提供英文使用說明及 README。
- `downloads/`：原始 Markdown、英文翻譯、免安裝 ZIP、SHA256、範例 JSON 與驗證摘要。

ZIP 中的第三方 MIT 授權完整保留。170 項核心與 123 項 Windows 整合檢查是來源專案提供的本機驗證結果；網站發布只驗證文件與下載完整性，不將短時間效能樣本描述成跨電腦保證。
