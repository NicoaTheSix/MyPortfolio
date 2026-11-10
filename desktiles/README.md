# DeskTiles 網站發布與維護

## DeskTiles v1.02 細邊圖示與雙平台下載（2026-11-10）

從 DeskTiles 正式發行 v1.02 取得共用 SVG／PNG、Windows x64 與 macOS Universal 2 ZIP。Logo 外圈為 #404040，厚度為 1024 尺寸下的 20 單位。兩平台檔案的大小、SHA-256 及來源提交見 release.mjs 與 source-manifest.json。

從網站根目錄執行 `node build-desktiles.mjs --source 'D:\DeskTile'`。程式先列出絕對輸入與輸出，逐階段校驗、複製公開素材、生成中英文文件與搜尋索引，再更新兩個首頁的 DeskTiles 卡片。執行 `node check-desktiles.mjs` 核對本機產物，部署後加上 `--url https://nicoathesix.github.io/MyPortfolio/desktiles/` 比對公開頁面與原始 ZIP 的雜湊。

## DeskTiles 雙平台圓角圖示發布（2026-11-07）

本節取代下方歷史版本的套件、功能及驗證數字。使用者於 DeskTile 專員對話選定 A 圓角圖示並授權更新、部署 Windows／Mac 與 Portfolio。本批整合遠端 ce98930 的 Mac 下載內容，保留既有 macos.html、Markdown、範例與授權下載網址。

輸入根目錄 `D:\DeskTile`；輸出根目錄 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles`。執行 `node build-desktiles.mjs --source D:\DeskTile`：先列出全部絕對輸入／輸出，再依五階段校驗指定 ZIP／EXE、複製 27 份來源、產生八頁雙語文件及舊 Mac 網址、搜尋索引與首頁卡片。`release.mjs` 固定來源版本、雜湊與大小；`publish-content.mjs` 維護雙語介紹；`content/readme-en.md` 與 `content/mac-en.md` 為網站英文文件。原始下載維持來源位元組，不執行 EXE、不重新打包 ZIP。舊 Python 上架入口改呼叫同一建置器，避免用歷史版型覆蓋新版。

Logo 使用來源平滑 SVG／PNG，網站以 image-rendering:auto 顯示。同步更新中英文 Windows 控制畫面、鬧鐘與啟動同意圖。既有操作影片保留並註明介面可能不同。Windows：222 核心／192 整合；Mac：170 核心、Universal 2 與圖示簽章檢查，均為專案提供的結果。網站僅核對交付檔，不聲稱重新跑過應用程式測試。

Windows 鬧鐘重啟啟用問題未修復；登入啟動預設關閉。Mac 中文介面、無 Windows 鬧鐘／語言切換／登入啟動，ad-hoc 簽章、未 Apple 公證，Intel 實機及多螢幕仍待驗證。Windows 匯出 v3、讀取 v1–v3；Mac 僅匯出與讀取 v1/v2，不能直接匯入 Windows v3，即使沒有鬧鐘亦同；Windows 可匯入 Mac v2。Logo 圓形不代表新增圓形格子。

執行 `node check-desktiles.mjs --url http://127.0.0.1:4198/MyPortfolio/desktiles/`：顯示絕對輸入／報告路徑，分五階段檢查八頁、語言對應、唯一 ID、87 筆搜尋、29 份素材及兩平台 SHA256、舊網址相容、41 份 HTTP 檔案和影片 Range。瀏覽器另確認手機不溢出、搜尋和語言切換。發布後用公開網址重跑 HTTP 比對。`validation-report.json` 保存最近一次驗證；本批檔案清單見 `release-delivery.md`。

## GitHub 與星星提示（2026-11-02）

中英文作品集 DeskTiles 卡片與專案介紹頁的下載入口下方，提供 `https://github.com/NicoaTheSix/DeskTile` 及邀請按 Star 的文字。連結另開分頁並設定 `noopener noreferrer`。執行根目錄 `node build-desktiles.mjs --source 'D:\DeskTile'` 時，先顯示來源與輸出的絕對路徑，再分階段複製素材、產生文件與搜尋索引、更新兩張首頁卡片；`githubSupport()` 共用文案確保重新建置後仍保留。執行 `node check-desktiles.mjs` 與 `node check-site.mjs` 驗證輸出與連結。

這是 Nicoa The Six 作品集中的 DeskTiles 專區。沿用既有黑白文件版型、語言切換、側欄、章節目錄、搜尋與 GTM，提供中英文專案介紹、使用說明與專案 README。英文指南直接採用來源 `docs/UserGuide.en.md`，英文 README 為網站翻譯；英文控制視窗使用原生英文截圖，其他設定截圖保留中文並註明。倉庫已確認為 https://github.com/NicoaTheSix/DeskTile，尚未指定整體專案授權，不宣稱開源授權。

## 2026-11-01 修正版

同一 EXE 提供繁中／英文即時切換與偏好保存，修正一般啟動的黑色／不可見圖形、透明顯示與置頂／桌面模式。頁面提供清楚的更新提醒：先從舊版系統匣儲存並結束，關閉控制視窗 X 不會退出；不需刪除配置。保留 Linux 尚未提供及相容性驗收限制。

來源 ZIP 必須為 459907 bytes、SHA-256 `8B506C952970AD54C37015F493739D7B0B87792868C28C6BFCB54545212724B9`；來源 EXE 為 1330688 bytes、SHA-256 `3B27F00AC33C7DF41EFC86C5031C06F546E8DFC871BD26B26D5BE9B4C8836106`。建置器在複製前驗證兩者，但只發布完整 ZIP，不另行發布 EXE。下載以本機 release 為準，不從尚未包含全部修正的遠端原始碼重建。ZIP 六個檔案與第三方聲明原樣保留，另以唯讀 .NET ZIP 串流確認內部 EXE 雜湊。

## 建置流程

在上一層網站根目錄執行：

```powershell
node .\build-desktiles.mjs --source 'D:\DeskTile'
node .\check-desktiles.mjs
```

`build-desktiles.mjs` 的輸入只限明確列出的 README、中英文使用說明、六張截圖、兩個 Logo、30 秒示範 MP4、ZIP、SHA256 清單、範例配置與驗證摘要；EXE 僅用於校驗。只讀來源；不掃描或存取 LocalAppData、使用者版面與日誌，不執行 EXE，不重新打包 ZIP。

程式運作前列出所有輸入與輸出檔案的絕對路徑，接著分階段：

1. 盤點來源並核對 ZIP 與 SHA256SUMS 的雜湊。
2. 原樣複製文件、截圖、Logo、範例與下載檔，記錄大小與 SHA-256。原始中文 Markdown 保留來源位元組；下載後其中相對路徑仍依原專案目錄定義。
3. 將中英文指南與網站英文 README 翻譯轉成清理過的 HTML，調整線上版的圖片與下載連結；線上版省略給網站管理員的內部交接段落，原始 README 下載仍保留原文。章節 id 預留頁面外框的識別名稱，避免英文 Content 章節與主區塊重複。
4. 建立六個 HTML、雙語搜尋索引與來源清單。各頁皆嵌入一份共用 GTM head 與 body noscript。
5. 更新中英文首頁專案卡，提供專案／使用說明／ZIP 入口。日後執行會替換同一張卡片，不重複新增，保留現有 pixel-reveal 等動畫 class。圖片、樣式與下載附發布日期版本，避免訪客讀到舊快取。

線上 README 省略來源專案的本機搬移說明與網站管理員交接段落，下載版保留完整原始文件；中文檔名連結先解碼再映射到網站相對路徑。

`content/readme-en.md` 是網站英文 README 翻譯來源。英文指南已改用專案原生版本，刪除不再使用的舊網站翻譯。原文件更新後需同步檢查 README 翻譯；此建置不是自動排程。所有來源下載與截圖原樣複製。

## 驗證流程

`check-desktiles.mjs` 先顯示來源清單、網站及報告的絕對路徑，再檢查六頁導覽／語言對應／唯一 id／章節錨點、公開圖片與下載、GTM 唯一性、搜尋索引、所有複製資產與來源記錄的雜湊、指定新版 ZIP 及 SHA256SUMS、更新提醒與原生英文截圖。HTTP 模式核對 26 個公開檔案，另檢查 MP4 MIME、206 Range 和首 1024 bytes；報告寫至 `validation-report.json`，逐階段顯示進度。

本機預覽執行根目錄的 `node .\serve.mjs`，再執行 `node .\check-desktiles.mjs --url 'http://127.0.0.1:4173/MyPortfolio/desktiles/'`；會逐批核對 HTTP 回應內容及下載 MIME。發布後可將 URL 換成公開網站，確認 HTML、圖片與 ZIP 和本機產物一致。瀏覽器另外驗證桌面、390／320 px 手機版、文件搜尋、語言切換、導覽與實際下載。

## 公開入口

- `/MyPortfolio/desktiles/`：中文專案頁。
- `/MyPortfolio/desktiles/guide.html`：中文使用說明。
- `/MyPortfolio/desktiles/readme.html`：中文專案 README。
- `/MyPortfolio/desktiles/en/`：英文專案頁，並提供英文使用說明及 README。
- `downloads/`：原始 Markdown、英文翻譯、免安裝 ZIP、SHA256、範例 JSON 與驗證摘要。

ZIP 中的第三方 MIT 授權完整保留。179 項核心、繁中與英文各 166 項 Windows 整合，以及解壓後一般啟動的 64 項實際螢幕檢查均為來源專案提供的結果；網站發布只驗證文件、媒體與下載完整性，不將短時間效能樣本描述成跨電腦保證。

本次網站驗證：六頁雙語文件、17 份來源素材／下載、70 筆搜尋、26 個 HTTP 檔案、MP4 MIME／206 Range 與全站 78 頁 GTM 通過。瀏覽器確認影片長度 30 秒且點擊後持續播放，390px、320px 手機無水平溢出，英文截圖載入正常，ui-settings.json 搜尋找到兩個章節；首頁四項海報動畫結構檢查通過。
