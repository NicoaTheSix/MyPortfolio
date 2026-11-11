## 黑白像素工作室（本機預覽）

雙語首頁從首屏到頁尾共用固定的黑色點陣背景。pixel-studio.css 設定點陣、備用粒子與前後層級。區塊文字使用淺色，視窗與海報沿用各自的面板底色。

首頁採用寬版方案 A。視窗寬度達 1440 CSS px 時，導覽、首屏、合作流程、工作室、服務、作品與頁尾共用約 86% 寬度的格線，上限為 2880 CSS px。自介段落限制行寬，英文工作室大標保留兩行。3D 桌面沿格線右緣對齊；達 1920 CSS px 時，四張服務卡改為同列。樣式集中在 pixel-studio.css，由繁中與英文首頁共同載入。

繁中與英文首頁將自我介紹放進首屏視窗，合作流程緊接在首屏下方。聯絡區置中排列社群圖示，信箱和寫信入口放在圖示下方。

四張服務海報從一般腳本讀取動畫資料，並用圖片元素載入影格表。直接開啟本機 HTML 時，播放流程不需要讀取 JSON 或載入 JavaScript 模組。更新兩份動畫 JSON 後，執行 node sync-poster-animation-data.mjs。程式先列出輸入與輸出絕對路徑，再依序讀取規格、產生腳本與寫入 poster-animation-data.js。執行 node sync-poster-animation-data.mjs --check 可以核對產出。

服務視窗的方框鈕可縮小和還原。正常大小保留動畫、標題懸停／點選變色和卡片文字。縮小時兩支海報程式會停止播放並只顯示原圖，樣式同時收起操作列和下方內容。還原後回到該海報先前選擇的原圖或動畫，播放設定及影格會保留。海報的顯示切換位於圖下，避免英文按鈕和標題感應區重疊。

雙語首頁的固定背景把終端機、電腦桌及桌面小物放在前景視窗後方。桌子左側放抽屜，終端機位於右側。寬版畫面有六本浮空書。左側三本共用原本的打開書、薄冊和厚精裝書幾何，各自設定尺寸、角度及路徑。全螢幕畫布保留原來的桌面鏡頭位置，窄版畫面顯示桌面附近的三本。捲動時書本、星星和 2D 文字按不同幅度飄移。2D 光點分佈在 3D 場景的固定座標，即使停止捲動也各自按不同頻率閃爍。畫面更新約每秒 30 次，捲動和尺寸變動時立即排程。暫停動畫、系統減少動態與分頁隱藏都會停止閃爍計時。

更新 [3D 場景](assets/3d/studio-desk/README.md) 後，執行 `npm ci` 和 `npm run build:studio`。build-studio-space.mjs 先列出 studio-space.mjs、GLB 及生成腳本的絕對路徑，再以 Three.js 載入模型並打包到 studio-space.js。HTML 使用一般 defer 腳本，模型與程式一起載入，因此直接開啟本機 HTML 也可執行。瀏覽器先列出網頁、腳本、備用圖片與背景輸出的絕對 URL，接著掛載粒子與文字、讀取模型、初始化捲動。WebGL 2 不可用時，頁面顯示透明渲染圖作為備用背景。

首頁上方的語言列與主導覽共用一個置頂視窗。首屏的介紹、肖像和工作室共用黑色點陣背景。pixel-studio.css 先建立背景與視窗陰影，再於桌面尺寸加上不同相位的上下浮動；滑鼠移入或鍵盤焦點進入視窗時暫停該視窗。手機及減少動態模式保留陰影和層次，桌面亦可用原有的「暫停動畫」停止浮動。首屏由 index.html 與 en/index.html 共用相同結構。

中英文首頁的「進入像素工作室」連到 #studio。前景內容隨頁面捲動，手機採單欄視窗。

雙語文案及連結由 index.html、en/index.html 維護。home-pixel.js 先列出輸入頁面、前端、樣式與各視窗輸出 DOM 的絕對 URL，再依序建立標題列、接上按鈕並設定鍵盤焦點。導覽、介紹、肖像、三個工作室視窗及四張服務卡各自有最小化、縮小／還原、關閉三顆原生按鈕。最小化只留標題列，關閉後可在原位置重開。停用 JavaScript 時仍顯示各區內容。

從本目錄執行以下命令，依序啟動預覽及檢查。serve.mjs 會先列出絕對輸入目錄及本機輸出 URL，再回報預覽進度。

~~~powershell
$env:PORT = '4203'
node serve.mjs
~~~

另開終端執行以下檢查。開啟 http://127.0.0.1:4203/MyPortfolio/ 或 http://127.0.0.1:4203/MyPortfolio/en/，從首屏向下捲動，確認轉場、視窗收合、雙語連結及手機單欄。

~~~powershell
node --check home-pixel.js
node check-site.mjs
node sync-poster-animation-data.mjs --check
node check-pixel-homepages.mjs --url http://127.0.0.1:4203/MyPortfolio/
node sync-google-tag.mjs --check
~~~

本機預覽截圖放在同目錄的 .preview 資料夾，檔名為 pixel-studio-desktop.jpg、pixel-studio-windows.jpg 與 pixel-studio-mobile.jpg。
首屏浮動修訂的桌面與手機截圖分別為 pixel-studio-floating-home-desktop.jpg 與 pixel-studio-floating-home-mobile.jpg。
分層桌面、工作室電腦桌和服務卡的驗收截圖分別為 pixel-studio-layered-home.jpg、pixel-studio-layered-desk.jpg 與 pixel-studio-layered-services.jpg。
復古視窗與社群圖示的驗收截圖分別為 pixel-studio-retro-windows.jpg 與 pixel-studio-social-icons.jpg。
英文服務卡正常大小與縮小狀態的對照截圖為 pixel-studio-service-zoom.jpg。

## 雙語履歷頁（2026-11-09，v1.09）

首頁新增履歷入口，連到中文 /resume/ 或英文 /resume/en/。公開版依使用者的履歷整理學歷、研究、專案、技術與求職方向。維持 Nicoa The Six 的公開名稱，原始 PDF 與私密欄位不進網站。使用者確認部署後，本批正式版本由 v1.08 升為 v1.09。

從根目錄執行 `node build-resume.mjs`。程式先列印輸入與輸出絕對路徑，再套用共用品牌與分析標記，依序生成兩個語系。預覽、驗證與維護細節見 [履歷 README](resume/README.md)；本批的檔案及檢查見 [履歷交付清單](resume-delivery.md)。

## Nicoa'Lab 外圍透明 Logo（2026-11-08，v1.08）

網站預覽採已核准的品牌素材 v1.02：外圍透明，保留雙黑框及框內淺底。雙語首頁與文章區沿用原位置、比例與手機切換，favicon 改用同一透明圖。使用者已指示完成後部署；本批正式版本由 v1.07 升為 v1.08。詳見 [交付紀錄](brand-alpha-delivery.md)。

重建方式同下方命令：先執行 `build-brand-assets.py`（Python 3 / Pillow），再執行 `node sync-brand.mjs`。前者先列出輸入與輸出絕對路徑，核對透明來源的 SHA-256、尺寸與 alpha、複製原圖、等比輸出八張 PNG／WebP 並重新解碼核對，最後寫入清單；後者更新兩個首頁與三個文章頁面。舊白底版保留供歷史查閱。

## Nicoa'Lab 標準 Logo 網站替換（2026-11-07，已驗收發布 v1.07）

本批替換雙語首頁品牌入口、主視覺、頁尾，以及文章區品牌外框與 favicon。使用通用廣告部門已核准的黑框單字母與橫式原圖；個人介紹、作品、產品 Logo、服務海報和影片保持原內容。使用者已在本對話以「可以部署了」核准快照 5242665cc45a8577c03b2656fd1245fdcb294781，本批正式版本 v1.06 → v1.07；實際 Pages 部署與公開檔案核對結果保存中央活動紀錄。交付與核對見 [Logo 交付清單](brand-logo-delivery.md)，素材來源見 [品牌素材 README](assets/brand/README.md)。

程式與流程（先列出絕對輸入／輸出，再顯示階段進度）：

```powershell
& 'C:\Users\nick5\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' build-brand-assets.py --source 'D:\VIDEOS\designs\nicoa-lab-brand-icon\standards'
node sync-brand.mjs
node check-site.mjs
node check-pixel-homepages.mjs
node check-blog.mjs
node sync-google-tag.mjs --check
```

`build-brand-assets.py` 四階段核對兩份固定 SHA／尺寸、保存原始 PNG、LANCZOS 等比縮小並保存 lossless WebP／PNG、寫入逐檔清單；不裁切、改色或重繪。輸入為 `D:\VIDEOS\designs\nicoa-lab-brand-icon\standards\nicoa-lab-{symbol,wordmark}.png`，輸出為 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand`。`sync-brand.mjs` 三階段更新兩份首頁與三頁文章外框；`brand.mjs` 提供共用標記，`brand.css` 控制頁首／主視覺／頁尾比例與手機單字母來源。`serve.mjs` 白名單加入品牌清單及 WebP MIME。此流程不會自行推送或升版。
## DeskTiles v1.02 細邊圖示與雙平台下載

同步中英文 DeskTiles 專區與首頁作品卡。沿用同目錄的 `build-desktiles.mjs` 及 `check-desktiles.mjs`，按 [DeskTiles 維護說明](desktiles/README.md) 驗證本機和公開檔案。

## DeskTiles v1.01 圖示與雙平台下載（網站 v1.06）

本批整合既有遠端 Mac 下載更新，更新平滑圓角 Logo、兩平台 ZIP、雙語介紹與 Mac 指南，保留舊網址。使用者已授權本次更新與部署；網站正式版僅增加一次。建置與驗證流程、絕對輸入輸出、平台差異及已知限制見 [DeskTiles 維護說明](desktiles/README.md)，完整產出清單見 [發布交付](desktiles/release-delivery.md)。

# Nicoa The Six 個人作品集網站

## 首頁肖像視窗控制（2026-11-07，已核准發布）

中英文首頁的右上角改為真實按鈕：減號收合圖片與底部狀態列，保留標題列並可再次展開；方框縮小至原寬 68%，再次按下還原，收合時按方框會先展開；X 隱藏整個肖像視窗。關閉後出現「重新開啟照片」，點選回到原始大小與展開狀態。英文頁使用對應英文標籤。狀態只保留在目前頁面，重新整理回復預設。

本目錄 `home-pixel.js` 在執行前列出來源圖片、腳本、樣式與輸出視窗 DOM 的絕對 URL，三階段建立收合／縮放、關閉與重新開啟、雙語控制就緒；既有動畫及閱讀進度維持原流程。`home-pixel.css` 負責縮小比例、工具列與關閉樣式。`index.html`、`en/index.html` 提供原生按鈕、ARIA 狀態與通知；Enter／Space 可操作，關閉後焦點移到重新開啟按鈕。JavaScript 未載入時顯示原照片、隱藏操作鈕。

驗證方式：`node --check home-pixel.js`、`node check-site.mjs`、`node check-pixel-homepages.mjs`、`node sync-google-tag.mjs --check`，再於本機預覽確認中英文及手機的縮小／還原、收合／展開、關閉／重開與鍵盤流程。程式及說明均在本目錄；不修改照片檔案。使用者以「開始部署」核准快照 369f9fcb846c504bced2188dd1fe96818876541b；正式版本由 v1.04 增加一次為 v1.05。發布前確認核准快照與語法／首頁檢查，更新同目錄 VERSION 及說明，依階段顯示進度；建立正式提交與 v1.05 標籤並推送 main，沿用 GitHub Pages 根目錄發布流程。發布後比對中英文首頁、腳本、樣式與線上操作，實際提交、工作編號與結果寫入中央事件。

本批驗證通過：中英文桌面原寬 521.479 px 縮至 354.604 px（68%），再次點擊還原；收合隱藏圖片與狀態列；X 隱藏整個視窗並將焦點移到重新開啟按鈕。Enter 關閉與空白鍵重開正常，重新開啟回到原大小並展開。英文 320 px、中文 390 px 的縮小、收合、關閉及重開正常，三鈕皆 28 × 28 px，無水平溢出。38 個首頁資源、十六張動畫影格表及全站 81 頁 GTM 檢查通過，瀏覽器未發現 warning／error。交付檔案與三張預覽見 [肖像視窗交付清單](portrait-window-delivery.md)。

## 本站原文標示（2026-11-06，已確認發布）

依「現在以這裡的網頁做為原文」調整 `build-blog.mjs` 的雙語文章頁說明：本站為原文與主要更新版本，Medium 連結改標為刊載版本。文章正文、四張來源圖片及歷史匯入紀錄不變；canonical 維持 `https://nicoathesix.github.io/MyPortfolio/blog/mitre-att-ck-introduction/`。Medium 平台的 canonical 未由此更改。

流程仍為同目錄 `node build-blog.mjs`：執行前列出文章輸入及生成 HTML 的絕對路徑，五階段驗證資訊、整理內容、產生公開檔案、更新首頁、回報完成。使用 `node check-blog.mjs` 驗證正文與圖片雜湊、canonical、生成資料及草稿處理，`node sync-google-tag.mjs --check` 核對追蹤模板；本機瀏覽器確認文末標示。程式只重建既有文章頁，不編輯 Medium。使用者以「好的 開始部署」核准快照 0db2c0a09df3fc28753e609ae1eb5657636aa510，正式版本由 v1.03 增加一次為 v1.04。發布流程沿用 main 根目錄 GitHub Pages，推送正式提交與 v1.04 標籤後，核對 Pages 工作結果、線上文章全文與文末標示及本站 canonical；實際 commit 與部署工作編號記錄於中央事件。

## Blog 文章主要版本（2026-11-06，已驗收發布）

依使用者要求新增 `/blog/`，第一篇來源為指定的 Medium 文章，從公開 RSS 匯入 Markdown 並保留原圖片與來源雜湊。原文不擅自改寫；站內新增 canonical、雙語索引、RSS、blog 範圍 sitemap 與首頁入口。詳細編輯及匯入流程見 [Blog README](blog/README.md)。

同目錄程式 `build-blog.mjs` 執行前列出文章輸入、所有生成檔與首頁的絕對輸入／輸出路徑，依五階段驗證資訊、清理並重算文章引用、產生公開頁與訂閱資料、更新雙語首頁入口、完成回報。`npm run build:blog` 產製；`npm run check:blog` 進行隔離發布／草稿及 HTML 安全檢查，所有階段顯示進度。`serve.mjs` 的白名單從 `blog/source-manifest.json` 取得公開產物；`sync-google-tag.mjs` 納入 blog，避免新增頁面漏裝 GTM。程式與說明不需要更新 Fusion／DeskTiles 的原始手冊。

本批建立三頁（雙語索引及一篇繁中原文）、四張來源原圖與訂閱資料。檢查涵蓋原文與圖片雜湊、固定網址、草稿撤稿、安全 HTML、11 份本機 HTTP 產物，以及既有首頁與全站 81 頁 GTM。桌面與 390／320 px 手機版已檢查，首頁文章入口在窄螢幕仍可見。交付檔案與截圖絕對路徑見 [本批交付清單](blog/delivery-report.md)。使用者於 2026-11-06 明確表示「驗收完畢 開始部署」，核准快照 c5af03495f852647073a127bac6bf3d1ed8c116f；本批正式版本由 v1.02 增加一次為 v1.03。

正式發布流程：先核對已驗收快照、原文雜湊、首頁與 GTM，更新同目錄 VERSION 及本說明並顯示進度；建立帶有 Dashboard-Batch 與 Dashboard-Confirmation 的正式提交與 v1.03 標籤，沿用既有 main 根目錄 Pages 流程推送。部署後比對公開 Blog 的 HTML／CSS／XML／JSON（統一換行）及四張 PNG（逐位元組），並在瀏覽器確認首頁入口、文章與語言切換。確認 ID、實際發布 commit、工作編號與檢查結果記錄於中央事件；不改 Pages 設定。

## 網站俐方體（2026-11-06，已核准發布）

中英文首頁、Fusion Studio 與 DeskTiles 文件介面使用官方俐方體 11 號（Cubic 11）WOFF2；圖片內文字與程式碼字型保留。來源固定 commit、授權、大小／SHA-256 與完整載入流程見 [字型說明](assets/fonts/README.md)。`styles.css`、`fusion-studio/docs.css` 載入共用 `assets/fonts/fonts.css`；`home-pixel.css` 移除原 Silkscreen 遠端匯入，避免英文介面混用另一字型。

執行前列出字型及樣式輸入／輸出的絕對路徑，再依序取得官方 WOFF2 與原授權、核對大小及來源 Git blob SHA-1、調整共用樣式、擴充本機字型白名單與 MIME。執行 `node check-site.mjs`、`node check-pixel-homepages.mjs`、`node --check serve.mjs`，並啟動 `node serve.mjs` 在瀏覽器確認字型載入與手機排版。此調整不需重新建置原始手冊或生成圖片。使用者於 2026-11-06 表示「好那進行部署」，核准本批快照 `a05a0996444ffa8ac29ff502fcdb1d748420d6a9`；正式版本由 `v1.01` 增加一次為 `v1.02`。

發布流程：核對工作目錄與核准快照一致、遠端 main 為本機歷史祖先，僅更新本 README、`VERSION` 與交付清單的版本登記；建立本機 `v1.02` 正式提交與標籤，推送 main 及本批正式標籤。等 GitHub Pages 工作完成後，比對正式網址的字型、授權、共用樣式及雙語頁面，確認正式畫面，再以同一批次與確認 ID 回報中央完成事件。既有未追蹤 AGENTS.md 不納入部署。發布結果與實際 Git SHA 保存在中央事件，避免把未完成的工作預先宣告成功。

本次核對：官方 WOFF2 格式、400228 bytes 與來源 Git blob SHA-1 相符；七個字型／授權／樣式 HTTP 內容及 WOFF2 MIME 通過。瀏覽器確認 1280px 桌面與 390／320px 雙語首頁、Fusion 中文首頁、DeskTiles 英文指南使用 Cubic 11；程式碼保留系統等寬字型。390px 中文導覽原先略為溢出，已在 420px 以下隱藏「作品與文章」導覽入口，內容區仍保留完整作品。修正後窄螢幕無頁面水平溢出。畫面與逐檔用途見 [本批交付清單](font-change-report.md)。

## 正式版本與驗收登記

目前正式版本記錄於同目錄 `VERSION`，為 `v1.02`。2026-11-05 使用者確認「前面待驗收都確認驗收」，將歷史盤點中的 16 項已交付成果合併驗收為 `v1.01`。既有交付快照 `53143573cdacd7a0ebdc0a815f04ed52b86788e9` 為 `v1` 基準；每批僅增加一次 `0.01`，不按歷史任務數逐項升版。2026-11-06 俐方體批次經使用者核准部署，登記為 `v1.02`。

批次：`portfolio-historical-acceptance-20261105`。確認 ID：`portfolio-acceptance-1793858526402-l4ew3b-confirmation`。此次驗收不包含聖誕節活動待補內容、Fusion 手冊自動同步、sitemap／聯絡意圖事件與 GA4 實際收數確認；不新增功能或重新部署。

版本登記流程：先顯示輸入快照及 `VERSION`、`README.md` 的絕對路徑，核對追蹤檔與交付快照一致，保留既有未追蹤檔；記錄使用者原始訊息及中央確認事件，建立 `v1` 基準，更新版本資訊，執行既有網站檢查，再僅提交版本資訊並建立 `v1.01` 標籤。最後追加中央完成事件並更新專案 metadata。中央檔案寫入與儀表板 UI／雙向橋接的實際狀態分開回報。

## DeskTiles GitHub 與星星提示（2026-11-02）

中英文首頁作品卡及 DeskTiles 介紹頁加入 GitHub 專案連結與邀請按 Star 的文案。來源為 `build-desktiles.mjs` 的共用 `githubSupport()`；執行 `node build-desktiles.mjs --source 'D:\DeskTile'`，先顯示所有輸入／輸出絕對路徑，再依五階段更新公開素材、六頁文件、搜尋索引及兩個首頁。維護流程見 [DeskTiles README](desktiles/README.md)，建置後執行 `node check-desktiles.mjs` 與 `node check-site.mjs`。

## 中英文正式首頁：黑白像素與十六格動畫（2026-10-31）

### 海報底圖慢速載入修正

原問題：動畫的 1-bit 影格表比約 1.3–1.6 MB 的原始海報更早載入，而前端只等待影格表，即切換到動畫，底圖的標題、外框及四格標籤便暫時空白。已使用正式首頁、正式腳本與延遲 15 秒的真實圖片 HTTP 回應重現：`data-view=animated`、四個 Canvas 已顯示，但底圖 `naturalWidth=0`。這是載入順序問題。

新增本目錄 `poster-image-ready.js`，由兩支動畫前端共用。開始前列出底圖絕對輸入 URL 與輸出 DOM 的絕對 URL，兩階段依序顯示載入提示、等待實際 `<img>` 載入及 `decode()` 成功。每張海報只有底圖與影格表均就緒才開啟動畫；等待時顯示中／英文載入提示，不展示缺少背景的動畫。底圖立即請求，不依賴懶載入或 SVG 遮罩的快取；失敗時顯示中／英文重試按鈕，點選用新查詢參數重試，成功後自動恢復完整海報。三張額外服務的播放時鐘不再等待全部底圖，單張慢速或失敗不會卡住其餘海報。正式中、英文頁已換新版腳本／CSS 查詢版本，原型共用相同修正。

本目錄 `check-poster-loading.mjs` 是受控瀏覽器回歸頁：先在另一終端執行 `node .\serve.mjs`，再執行 `node .\check-poster-loading.mjs`，開啟 `http://127.0.0.1:4174/#service-office`。程式先顯示首頁、PNG 的絕對輸入路徑、本機素材代理輸入 URL 與輸出 URL，再以三階段讀取正式 HTML、代理原有公開素材、延遲送出文書海報底圖。預設延遲 15000ms，可用 `--delay 1000` 指定 0–60000ms；`--english` 測英文頁，`--fail-once` 讓第一次圖片回應為 503，供測試重試按鈕。只在 loopback 提供測試頁，不修改圖片，不列入正式網站白名單。

回歸判定：底圖尚未完成時，文書海報維持原圖模式、四格動畫隱藏、載入提示可見；其餘三項服務可播放。底圖送達並解碼後，載入提示移除，四格與完整底圖一起顯示。第一次失敗時維持相同保護，點選重試後恢復動畫；英文提示與按鈕亦須正確。

本次回歸已通過：同一個延遲 15 秒頁面在修正前得到 `animated + naturalWidth=0`，修正後為 `original + imageState=loading` 並顯示載入提示；完成後為 `animated + imageState=ready + naturalWidth=1536`。另外英文首次 503 的情況維持原圖模式並顯示 Retry image，實際點選後重新請求成功、提示移除並恢復四格。38 個本機首頁與動畫資源的 HTTP 內容比對及雙語頁面既有檢查通過。

正式入口為 `/MyPortfolio/` 及 `/MyPortfolio/en/`。兩頁已整合試作的白底黑框、像素字標、階梯進場、閃爍游標、閱讀進度及四項服務共十六格動畫。各服務保留原海報 2×2 排列，懸停／鍵盤焦點／點選標題顯示各自漸層；右上可切換原圖／動畫。「播放控制」可展開暫停、逐格、滑桿與 GIF 下載，「放大原圖」保留既有對話框。英文頁使用四張英文海報，標題遮罩與動畫區依英文字形／版面調整，按鈕、提示、Canvas 替代文字及 GUI 七個欄位均為英文。作品、文件、下載、社群、名片、郵件、語言切換及 GTM 保留。文件專區不載入首頁像素樣式。

`build-pixel-homepages.mjs`、`home-pixel.js`、`home-pixel.css`、`check-pixel-homepages.mjs` 與本 README 同目錄。頁面整合器執行 `node .\build-pixel-homepages.mjs`，先列出自身、追蹤模板、原型與雙語首頁的絕對輸入／輸出路徑，再以四階段讀取程式開發海報模板、分別整合中英文正式頁、完成輸出；重跑會跳過既有海報，避免巢狀互動與重複 id，原有正式內容不從原型覆蓋。後續文案直接維護雙語 HTML；共用外觀與互動維護三支前端及兩支 CSS。GTM 由 `google-tag.mjs` 保留原模板格式。

`home-pixel.js` 開始前輸出輸入頁面、腳本與樣式的絕對 URL，以及輸出 DOM 的絕對 URL；依三階段建立雙語全站暫停／系統減少動態偏好、區塊進場與重播、閱讀進度。`pixel-scenes.js` 與 `pixel-service-posters.js` 維持各自分階段進度；資產根路徑依腳本絕對 URL 解析，因此英文 `/en/` 不會誤讀 `/en/assets/`。四組海報可獨立控制，離開視野／背景分頁／原圖模式不更新，系統減少動態與全站暫停均適用。播放控制與額外場景於成功載入後才顯示，停用 JavaScript 或素材失敗時保留可讀原圖。原圖與影格表分離，標題漸層不修改 PNG。

驗證執行 `node .\check-site.mjs`、`node .\check-pixel-homepages.mjs --url 'http://127.0.0.1:4173/MyPortfolio/'`、`node .\sync-google-tag.mjs --check`。像素檢查器先列出雙語頁面、前端、樣式與規格的絕對輸入路徑，輸出僅終端；分四階段檢查海報結構／正確語系原圖／無巢狀按鈕／可索引設定、前端語法／十六張 1-bit 影格表／七個互動區、所有動態素材存在，以及選用 HTTP 內容逐十項比對。正式發布後把 `--url` 換成 `https://nicoathesix.github.io/MyPortfolio/`，可確認部署內容。既有 GitHub Pages 由 main 根目錄發布；不改 Pages 設定。

本次正式頁驗證：雙語站內錨點、36 個靜態引用、英文文案與原圖、35 個英文文件返回入口通過；37 個首頁與動態動畫資源的本機 HTTP 內容比對通過；全站 78 頁 GTM 驗證通過。瀏覽器確認兩頁各載入十六張 Canvas，英文控制／替代文字無未翻譯中文，四種漸層對準英文標題；GUI 點選反白顯示英文狀態，原圖／動畫切換、英文原圖放大與關閉、全站暫停同步四組控制均正常。從英文切換繁中保留 `#services`。實際桌面 1107 CSS px 與窄螢幕 300 CSS px 皆無頁面水平溢出，每張海報內仍維持四格排列；未發現瀏覽器 warning／error。截圖存於 `.preview/production-en-desktop.png`、`.preview/production-en-mobile.png`、`.preview/production-zh-mobile.png`。

公開比對時，HTML／CSS／JS／JSON 先統一 CRLF 與 LF 再比較全文，避免 Git 在 Windows 工作目錄與 Pages 產物之間轉換換行而誤判；PNG／GIF 仍逐位元組比較。內容不符時僅回報資源路徑，不列出整份二進位差異。

發布紀錄：首頁提交 `b5b0a45` 已推送 main，GitHub Pages 工作 `41207877411` 回報 success。正式網址的 37 個首頁／動畫資源全部比對通過；公開英文頁確實載入十六格，播放影格前進、標題點選變色正常，未出現 warning／error。

## 黑白像素視覺測試版（以下為試作紀錄，已整合正式首頁）

### 四項服務、十六個場景（目前版本）

測試頁 `pixel-prototype.html#pixel-lab` 保留程式開發四格，新增 `#scratch-lab`、`#translation-lab`、`#office-lab`，每項服務皆完整四格動畫，並提供頂部服務動畫導覽。三張新海報沿用各自原圖的外框、中文標題、標籤與 2×2 排列。每張獨立切換原圖／動畫、暫停、下一格、影格滑桿及 GIF 下載，頁面底部全站動畫開關與系統減少動態設定同時適用。正式首頁未改動。

配色：程式開發保留粉紅 `#ff5cb8` → 黃色 `#ffe65b`；Scratch 教學為橙色 `#ff7a18` → 珊瑚粉 `#ff4b83`；中英文翻譯為藍色 `#45a8ff` → 紫色 `#a66bff`；文書自動化為綠色 `#19b986` → 青色 `#53d8ed`。各 SVG 漸層、反相濾鏡與遮罩皆使用服務前綴，避免海報間引用錯誤。Scratch 原標題為空心字，漸層沿用其黑色描邊形狀。標題支援懸停、鍵盤焦點及點選保留彩色。

十二個新場景：Scratch 的積木依序亮起與教學對話、貓角色走向旗幟與方向鍵、三格跑步動畫與時間軸、邏輯積木檢查與錯誤轉勾選；翻譯的 EN／中介面切換、文件雙向對照、鉛筆書寫與文章轉換、用詞選取與語氣確認；文書的資料逐格轉換、1 至 5 加總為 15、圖片掃描與文字逐行輸出、齒輪批次處理與文件依序完成。每個場景都具有獨立變化，不是整張圖位移。

產生器 `build-service-animations.py` 與本 README 同目錄。執行：`& 'C:\Users\nick5\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' .\build-service-animations.py`。需 Python 與 Pillow。開始前列出自身絕對輸入路徑及全部 19 個絕對輸出路徑，以逐行立即輸出的五階段進度完成：建立繪圖元件、逐場景繪製並回報 1/12 至 12/12、輸出三份 GIF／預覽、檢查黑白兩色與 1-bit PNG 及影格變化、寫入規格。各場景畫布 240×122，24 格／3 秒循環；每個場景至少四個不同影格。輸出為 `assets/{service}-{scene}-pixel.png` 十二張影格表、`assets/{service}-animation-preview.gif` 三份 GIF、同名 PNG 預覽三張，以及 `assets/service-animation-manifest.json`。重跑僅覆寫這 19 個生成檔，不讀取或覆寫原始海報。

前端共用 `pixel-service-posters.js`，與本 README 同目錄；原程式開發維持既有 `pixel-scenes.js`。前端在載入素材前先列出頁面、腳本、樣式、JSON、原圖及十二張影格表的絕對輸入 URL，和三個海報 DOM 的絕對輸出 URL；先回報規格載入，再分服務回報四階段（建立介面、96 格載入、縮放與控制、就緒），最後啟動共用 8fps 時鐘。各服務的播放狀態獨立，四格略微錯開時序；僅在動畫模式、海報可見、分頁前景且未暫停時更新。所有 Canvas 禁用平滑插值並以 pixelated 等比放大。新增素材已列入唯讀預覽白名單，變更後需重啟 `npm run preview`。腳本或素材失敗時保留原圖；互動版請使用本機預覽 URL。

本次驗證：產生器確認十二張影格表皆為 1-bit、每個場景至少四個不同影格；三份 GIF 皆為黑白兩色、24 格／3000ms。前端與預覽伺服器語法檢查通過。瀏覽器確認三張新海報各有四格，標題橙粉／藍紫／綠青漸層與原圖字形貼合；每張的原圖／動畫切換、滑桿與下一格正常，切換前後皆維持 1160×773.33 CSS px。已固定場景的 DOM 閱讀順序，避免素材載入速度改變順序。獨立播放時其他暫停海報的影格保持不變；全站暫停會同步停用三組播放按鈕。320px 手機維持 2×2 排列、無水平溢出，觸控標題變色及右上切換正常。未發現瀏覽器 error／warning。截圖存於 `.preview/scratch-poster-colour.png`、`.preview/translation-poster-colour.png`、`.preview/office-poster-colour.png`、`.preview/services-mobile.png`。此版本僅本機測試，未發布。

### 原圖版面、漸層標題與原圖／動畫切換（程式開發）

測試入口維持 `pixel-prototype.html#pixel-lab`。海報改為原始 `assets/service-development-zh.png` 作為底圖，保留外框、Nicoa 字樣、程式開發標題、技術橫條及原本的四格中文標籤。四個動畫僅覆蓋各格內的圖案區，桌面與手機都保留 2×2 排列，不再改成手機單欄。手機整張等比例縮小；底部控制列維持可操作尺寸。

「程式開發」是原圖字形上的透明互動區。滑鼠懸停或鍵盤焦點時，以 SVG 反相亮度遮罩貼合原圖的黑色筆畫，套用上粉紅 `#ff5cb8`、下黃色 `#ffe65b` 的垂直漸層；不重新排字或改寫原圖。點選可切換保留彩色效果，供觸控裝置使用。圖的右上方提供「原圖／動畫」兩個原生按鈕，帶有 aria-pressed 狀態與讀屏提示。素材載入完成後預設動畫；原圖模式隱藏四個 Canvas 與互動區、停止前進影格，隱藏並停用底部播放控制但保留其空間，海報尺寸不跳動。標題互動在兩個模式皆可使用。載入失敗或關閉 JavaScript 時仍保留原始海報。

前端仍使用同目錄的 `pixel-scenes.js`、`pixel-scenes.css`，執行前列出原圖、腳本、樣式、規格與影格表的絕對輸入 URL，以及輸出頁面 DOM 的絕對 URL，沿用五階段進度。載入後以原影格表的 `(8,28,240,122)` 內容區繪製 Canvas，去掉試作素材自帶的標題列與外框；GUI 七個反白區同步換算裁切後的座標。Canvas 關閉平滑插值、CSS 使用 pixelated，依海報區域等比縮放，為保持原構圖可能使用非整數顯示倍率；底層影格素材仍為原始黑白逐格圖片。原圖與所有生成素材皆未覆寫。既有 GIF 是前一版獨立四格動畫示範，沒有網站標題的懸停效果或顯示模式切換。

本次驗證：前端語法通過；桌面確認原字形的漸層上粉紅／下黃色、切換按鈕與選取狀態正確、原圖模式影格停留在相同位置，恢復動畫與裁切後 GUI 的點選／Tab 反白正常。兩種模式的海報皆維持 1160×773.33 CSS px，無切換尺寸跳動。320px 手機無水平溢出，四格維持左右兩欄、上下兩列，標題點選變色與右上切換可用。未發現瀏覽器 error／warning。完整海報及手機預覽分別存於 `.preview/pixel-poster-colour.png`、`.preview/pixel-poster-mobile.png`。此變更只在測試頁，未發布。

### 四格互動動畫擴充（前一版）

同一個 `pixel-prototype.html#pixel-lab` 已擴充成四格：圖形化介面／自動化工具／API 串接／技術文件，桌面兩欄、手機單欄。正式首頁、原服務圖片及既有內容不受影響。圖形化介面的兩個欄位、兩個按鈕、三個側欄項目，共七個真實互動區域；滑鼠懸停、Tab 焦點、手機點選皆切換黑底白字。這些是視覺示範按鈕，並非資料輸入表單。API 箭頭向左右逐格移動，線路中資料來回傳輸；技術文件逐行寫入程式碼、閃爍游標，最後顯示完成勾選。自動化工具保留原先齒輪與清單動畫。

建置程式為本目錄 `build-pixel-scenes.py`，執行方式：`& 'C:\Users\nick5\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' .\build-pixel-scenes.py`。需 Python 與 Pillow；其他電腦可換成當地已安裝 Pillow 的 Python。運作前先列出自身與自動化產生器的絕對輸入路徑、生成中介輸入與六項輸出的絕對路徑。六階段依序：呼叫既有齒輪產生器（會重建原有四項自動化素材，並自行列路徑與進度）、繪製新場景與分批回報、輸出 GUI 八個狀態與 API／文件各 24 格影格表、合成四格 GIF／靜態圖、驗證黑白兩色／PNG bit depth／影格變化與 GIF 總長、寫入 JSON 規格。原始服務圖片只是構圖參考，不由程式讀取、裁切或覆寫。

新增輸出：`assets/gui-pixel-states.png`、`assets/api-pixel-sprite.png`、`assets/docs-pixel-sprite.png`、`assets/development-pixel.gif`、`assets/development-pixel-still.png`、`assets/development-pixel-manifest.json`。每個場景維持 256×160 固定像素格；PNG 為 1-bit，GIF 僅黑白兩色、24 格／3000ms。GIF 內 GUI 由游標依序示範反白，不能接收真實滑鼠互動；實際懸停請使用測試頁。

瀏覽器改載入同目錄 `pixel-scenes.js`／`pixel-scenes.css`，舊的單格 `pixel-automation.js`／CSS 保留但不再載入。前端先在主控台列出所有輸入的絕對 URL 與四個 Canvas 的輸出頁面 URL，再顯示五階段進度：載入規格、載入影格、建立七個欄位、整數縮放與控制、播放就緒。透明原生按鈕覆蓋於 GUI 圖中，位置來自 JSON 的邏輯像素矩形，放大時同步縮放；無縮放圖片旋轉、無抗鋸齒。GUI 反白會即時重繪，動畫暫停時仍可操作。其餘三格共用 8fps 時鐘，可暫停、逐格、拖曳影格滑桿，並遵守全站暫停、系統減少動態、背景分頁與離開畫面設定。桌面依容器採 1 或 2 倍，手機為 1 倍；載入失敗或關閉 JavaScript 時顯示四格靜態圖。

預覽白名單已加入新 JS／CSS 與六項素材，修改後需重啟 `npm run preview`。不連線真實 API、不寄出表單、不儲存欄位內容。

本次驗證：生成器檢查三張新增 PNG 皆為 1-bit、GIF 全部 24 影格僅黑白、循環總長 3000ms，各場景內容確實改變；四格 GIF 為 599645 bytes。前端與伺服器語法檢查通過。瀏覽器驗證滑鼠進入欄位（未聚焦時已反白）、七個區域以 Tab 逐一切換、全站暫停、暫停時欄位仍可操作、下一格會同步前進齒輪／API／文件，恢復播放後持續更新。曾發現舊滑鼠懸停位置優先於新鍵盤焦點，已改成依最後使用的輸入方式選擇高亮。桌面 1280px 四張 Canvas 皆為 512px 寬，320px 與 390px 皆無頁面水平溢出，手機為 256px 原尺寸。未發現 console error／warning。截圖存於 `.preview/pixel-scenes-desktop.png` 與 `.preview/pixel-scenes-mobile.png`。互動版會 fetch 素材規格，請使用本機預覽 URL；直接以 file 開啟時可能僅顯示靜態圖。

### 自動化工具：真正黑白像素動畫試作

在原型頁新增 `#pixel-lab`：<http://127.0.0.1:4173/MyPortfolio/pixel-prototype.html#pixel-lab>。只參考原服務插畫右上角構圖，透過程式重繪三個齒輪、傳輸線與任務清單，沒有改動原圖或正式首頁。圖像為 256×160 的固定網格、純黑白兩色、24 格／3 秒循環；PNG 為真正 1-bit，GIF 為只使用黑白的索引色格式，並非宣稱符合特定遊戲機硬體限制。

生成程式 `build-pixel-automation.py` 與本 README 同目錄，需要 Python 及 Pillow。本工作環境可執行 `& 'C:\Users\nick5\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' .\build-pixel-automation.py`。其他電腦可使用已安裝 Pillow 的 Python 執行相同腳本。

執行流程：先顯示程式輸入與四項輸出的絕對路徑，再依五階段建立網格與手寫 5×7 點陣字、分批繪製 24 格（每六格回報進度）、輸出圖檔、驗證所有 GIF 影格只有黑白與總長 3000ms、寫入素材規格 JSON。輸出至 `assets/automation-pixel-sprite.png`、`assets/automation-pixel.gif`、`assets/automation-pixel-still.png`、`assets/automation-pixel-manifest.json`，重跑會覆寫這四個生成檔。素材完全由程式繪製，沒有使用圖片生成服務。

瀏覽器流程由同目錄 `pixel-automation.js`／`pixel-automation.css` 負責：運作前在主控台列出頁面、腳本、樣式與素材的絕對輸入 URL、Canvas 輸出位置；三階段完成畫布、素材載入與互動、每秒 8 格播放。Canvas 僅複製完整影格，不進行平滑旋轉或抗鋸齒；依容器寬度採 1、2 或 3 倍整數放大。支援獨立暫停、下一格與滑桿，並遵守全站動畫暫停及系統減少動態設定；離開畫面或背景分頁時不前進影格。素材載入失敗或停用 JavaScript 時保留靜態圖。GIF 下載檔本身獨立循環，不受網頁動畫開關控制。

預覽伺服器已加入兩個新前端檔與四個素材的白名單及 GIF MIME；修改白名單後需重新啟動 `npm run preview`。

本次驗證：生成器核對全部 24 格均僅黑白、總時長 3000ms，且影格內容確實改變；輸出 GIF 約 290 KB、網頁影格表約 12 KB。前端與伺服器語法檢查通過。瀏覽器確認播放會前進影格、暫停與下一格、滑桿 Home／向右鍵、全站暫停連動；390px 與 320px 無水平溢出，Canvas 均為 256px 寬，1280px 桌面為 768px 寬（3 倍整數放大）。未發現 console error／warning。測試截圖存於 `.preview/pixel-automation-desktop.png`、`.preview/pixel-automation-mobile.png`。底部「像素動畫」可直接跳到試作區，頂部閱讀關卡已擴充為六區段。尚未發布正式網站。

獨立入口為 `pixel-prototype.html`，搭配同目錄 `pixel-prototype.css` 與 `pixel-prototype.js`，用一版可丟棄的原型比較「NES 風格黑白介面＋街機動畫節奏」。正式中英文首頁與樣式保留。這是視覺討論稿，尚未發布，沒有分析追蹤、資料儲存或新增套件。

啟動方式：在本目錄執行 `npm run preview`，開啟 <http://127.0.0.1:4173/MyPortfolio/pixel-prototype.html>。若預覽埠已使用，可在 PowerShell 設定 `$env:PORT = '4174'` 後執行相同命令，並改開 4174。也可直接以瀏覽器開啟 HTML；剪貼簿功能依安全環境與權限提供手動複製提示。三個新檔案已加入既有預覽伺服器白名單。

執行流程：

1. 預覽伺服器先列出本機絕對輸入目錄、輸出 URL，再顯示三階段進度。頁面載入後，`pixel-prototype.js` 在瀏覽器開發者主控台先列出 HTML、CSS、JavaScript 與全部圖片素材的絕對輸入 URL、選用字型來源及輸出頁面 DOM 的絕對 URL；不寫入檔案。實體輸入皆以本 README 所在目錄為根，圖片沿用 `assets/`、`desktiles/assets/` 與既有 Fusion Studio 圖示。
2. 第一階段讀取系統減少動態設定，建立「暫停／啟用動畫」控制；偏好僅保存在記憶體。
3. 第二階段以 IntersectionObserver 觸發服務與作品的階梯式進場，每個區塊每次重播只進場一次。底部「重播進場」回到首頁並重播標題／區塊；停用 JavaScript 或不支援觀察器時仍能閱讀全部內容。
4. 第三階段以實際捲動位置更新六區段狀態列與閱讀進度，依序為首頁、像素動畫、服務、關於、作品、聯絡。捲動事件以 requestAnimationFrame 合併更新。
5. 第四階段提供複製既有信箱與成功／手動複製提示。服務郵件、專案文件、社群與返回原站均為可用連結，不會自動寄信。

美術包含 SVG 像素字標、既有黑白肖像、四張服務插畫、按鈕按壓、閃爍游標與星形裝飾。文字及邊框為 HTML/CSS，未套用或複製付費樣板原始碼。英文字型選用 Google Fonts Silkscreen（需網路），失敗則回退本機等寬字型；中文使用系統可讀字型。此版尚未加入 YouTube 播放器，因尚未指定要展示的影片。系統偏好減少動態時停用動畫及平滑捲動，控制列可另外暫停全部動態效果。手機改為單欄。

驗證：JavaScript 與預覽伺服器語法檢查通過。瀏覽器確認七張圖片載入、服務／作品／聯絡導覽、五區段狀態列、動畫暫停與啟用、鍵盤重播回到 `#home`、複製信箱成功提示；未發現 console error／warning。桌面與 390px、320px 手機尺寸檢查通過，手機導覽與關卡列分兩行，頁面無水平溢出。預覽截圖放在 `.preview/pixel-prototype-desktop.png` 與 `.preview/pixel-prototype-mobile.png`，不隨網站發布。重播直接回頂端後才重播標題，避免從長頁底部平滑捲動時錯過開場。

## DeskTiles 桌面拼格專案

2026-11-11 同步 Windows v1.03 下載、多套桌面配置與 CMD／PowerShell 指令說明。Mac 維持 v1.02。執行 `node build-desktiles.mjs --source D:\DeskTile` 時會先列出絕對輸入與輸出，再核對套件、複製正式來源、重建中英文說明與搜尋索引，並就地更新首頁作品卡。詳細步驟見 [DeskTiles 維護說明](desktiles/README.md)。

新增 `/MyPortfolio/desktiles/` 與 `/MyPortfolio/desktiles/en/`，提供專案介紹、中英文使用說明、專案 README、原始 Markdown、含圖片的範例 JSON 與 Windows x64 免安裝 ZIP。根目錄中英文首頁提供專案卡與桌面導覽入口。倉庫已確認為 `https://github.com/NicoaTheSix/DeskTile`；整體專案授權未指定，不宣稱開源授權。

2026-11-01 修正版：採用本機 `D:\DeskTile\release\DeskTiles-Windows-x64.zip`（459907 bytes），SHA-256 `8B506C952970AD54C37015F493739D7B0B87792868C28C6BFCB54545212724B9`。新版支援繁中／English 即時切換、偏好保存，修正一般啟動黑色／不可見圖形、透明顯示與置頂／桌面模式。首頁作品卡、雙語介紹與文件已同步，保留現有首頁動畫 class。頁面提醒先從舊版系統匣儲存並結束，不能只按 X；既有配置不需刪除。下載以驗證完成的本機 release 為準，不從尚未包含全部修正的遠端重建。

建置器先列出所有輸入／輸出絕對路徑，再依五階段校驗指定 ZIP 與 EXE、原樣複製中英文指南／六張截圖／示範影片／其他明列素材、產生六頁文件與 70 筆搜尋、記錄來源、更新首頁。英文指南直接來自 `docs/UserGuide.en.md`；只有英文 README 是網站翻譯。下載與媒體附日期版本參數，避免舊快取。示範 MP4 使用 controls／playsinline，不自動播放；預覽沿用既有 MP4 Range。維護詳見 [DeskTiles 維護說明](desktiles/README.md)。

建置與驗證程式位於本 README 相同目錄。先執行 `node .\build-desktiles.mjs --source 'D:\DeskTile'`，再執行 `node .\check-desktiles.mjs`。建置器在操作前列出來源、所有素材／翻譯輸入、所有產物與首頁輸出的絕對路徑，依五階段核對 ZIP 雜湊、原樣複製明確指定素材、產生六個 HTML、建立雙語搜尋與來源清單、更新首頁卡片。驗證器先列出絕對輸入與報告輸出，再逐階段檢查頁面／錨點、資產與原始下載雜湊、雙語導覽與搜尋、追蹤設定，以及選用的 HTTP 發布內容比對。

本機執行 `node .\serve.mjs` 後，可用 `node .\check-desktiles.mjs --url 'http://127.0.0.1:4173/MyPortfolio/desktiles/'` 核對所有公開檔案與 ZIP。發布後將 URL 換成 `https://nicoathesix.github.io/MyPortfolio/desktiles/`。預覽白名單依專案來源清單擴充，支援 Markdown 與 ZIP 的下載 MIME。`sync-google-tag.mjs` 同時納入六個新頁面，與原有 72 頁共用同一 GTM，合計 78 頁；新增頁面重用原文件的導覽／搜尋程式，其 console 進度前綴由頁面專案名稱決定。

只讀交接提供的專案文件與明列素材，不讀取、複製或發布 LocalAppData、個人版面或日誌；不執行或重包 EXE／ZIP。最新 179 項核心、繁中與英文各 166 項 Windows 整合、解壓後一般啟動 64 項實際螢幕檢查，均為來源提供的驗證結果；網站只核對發布內容與下載完整性，不將短時間效能樣本寫成通用保證。詳細流程見 [DeskTiles 維護說明](desktiles/README.md)。

2026-10-31 發布驗證：六頁文件、15 份公開素材、54 筆搜尋索引、24 個專區 HTTP 檔案及既有 70 頁 Fusion Studio 文件檢查通過；全站 78 頁 GTM 檢查通過。瀏覽器檢查 1440px 桌面、390px 與 320px 手機；中文「透明」與英文「timer」搜尋、同頁語言切換及手機導覽正常，表格在容器內捲動。Windows ZIP 已透過網站下載，與來源 SHA-256 相同。首頁服務圖卡及手機僅顯示圖片／標籤的設定保留。

首頁 styles.css 加上 `v=20261031-desktiles`，讓已造訪過網站的瀏覽器取得新增的作品卡樣式。

## 公開名稱與名片更新

網站對外名稱為 `Nicoa The Six`。中英文頁面的姓名、SEO 描述、圖片替代文字與個人介紹已改用此名稱；像素字標保留 Nicoa，下一行顯示 THE SIX，合為完整品牌。兩張名片內的原姓名也替換為 The Six。聯絡信箱、社群連結與作品網址依既有設定保留。

`update-portfolio-brand.mjs` 的輸入為中、英文新版名片 PNG，依序執行 `node .\update-portfolio-brand.mjs 'C:\素材\business-card-zh.png' 'C:\素材\business-card-en.png'`。程式先列出圖片與所有文字檔的絕對輸入／輸出路徑，再依四階段驗證比例、複製名片、更新中英文頁面與文件返回入口／產生器、檢查 72 頁無原姓名。名片沿用原檔名覆寫，頁面加上版本查詢參數以更新快取；生成來源保留原位。根目錄 README 與歷史圖片提示詞中的姓名也一併更新，歷史提示詞的姓名欄因此是調整後版本。新名片生成方式與完整提示詞見 [名稱更新圖片紀錄](brand-image-prompts.md)。

本次驗證：72 頁無原姓名；中英文頁面、文件與 GTM 檢查通過。瀏覽器以桌面 1440 px、英文手機 390 px、中文窄螢幕 320 px 檢查，沒有頁面水平溢出；語言切換與新版名片載入正常，未發現 error／warning。桌面截圖保存在本機 `.preview/nicoa-the-six-desktop.png`（不隨網站發布）。

## Google 網站驗證檔

根目錄的 `google6c8f54a1ecc35592.html` 為擁有者提供的 Google 網站驗證檔，從 `C:\Users\nick5\Downloads\google6c8f54a1ecc35592.html` 原樣複製，並以 SHA-256 核對內容一致。推送至 `main` 且 GitHub Pages 發布完成後，公開位置為 <https://nicoathesix.github.io/MyPortfolio/google6c8f54a1ecc35592.html>。保留原始檔名與內容，以供 Google 驗證網站所有權。

## Google Tag Manager 與 GA4

目前使用 GTM 容器 `GTM-N43HBCRC`。中英文首頁與 Fusion Studio 的 70 頁 HTML（共 72 頁）各安裝一份官方 head 初始化碼與 body noscript。移除先前直接載入 `G-YN3DEJ0WBH` 的 gtag.js，GA4 改由 GTM 容器管理，避免兩種安裝方式重複統計。Google 網站驗證檔保留原文，不加入追蹤。

`google-tag.mjs` 是維護工具使用的共用代碼來源。瀏覽器讀取各頁內嵌程式，先將 `gtm.start`／`gtm.js` 初始化事件加入 `dataLayer`，再非同步載入指定容器；JavaScript 關閉時使用官方 noscript iframe。網站不額外將信箱、文件搜尋內容或表單內容設為自訂分析參數。原本的 gtag.js 字串僅留在維護模組，供辨識並替換舊碼，未內嵌到網站頁面。

2026-10-29 導入時唯讀檢查發現：GTM 已發布版本 1 的 `tags`、`rules` 為空，尚未包含 GA4。安裝容器不等於 GA4 設定完成；擁有者仍需在 GTM 新增 Google 代碼 `G-YN3DEJ0WBH`、選擇 `Initialization - All Pages` 並提交發布，才會恢復 GA4 資料收集。完整操作見 [GTM 設定步驟](GTM_SETUP.md)。

維護流程（Node.js 20 以上）：

1. `node .\sync-google-tag.mjs`：先顯示設定檔、文件頁清單、產生器與每個頁面的絕對輸入／輸出路徑，再分四階段盤點、驗證、原檔寫入及完成回報。只移除本專案已知的舊 GA4／GTM 片段，再插入目前 GTM head／body 代碼。所有頁面先驗證成功才開始寫入；重跑不重複插入，遇到其他追蹤設定則停止。
2. `node .\sync-google-tag.mjs --check`（或 `npm run check:analytics`）：檢查 72 頁與產生器模板的 head／body 位置、唯一容器 ID 及直接 GA4 舊碼清除。在隔離的模擬 DOM 執行本機初始化碼，確認只產生一個 `gtm.js` 事件及一個非同步容器載入，不執行遠端程式。結果僅輸出終端，不寫入檔案。
3. `node .\sync-google-tag.mjs --check --url 'https://nicoathesix.github.io/MyPortfolio/'`：本機檢查通過後，每批八頁讀取公開網站，確認每頁 HTTP 200 且相同代碼已發布，逐批顯示進度。
4. `build-fusion-docs.mjs` 直接引用共用 head／body 代碼，日後重建文件仍會保留 GTM 設定。切換其他容器時須明確處理舊容器片段；同步程式不會自動覆寫未辨識的 ID。

發布檔案檢查只能證實 GTM 已安裝；容器內 GA4 標籤是否觸發及資料是否送達，需在 Google Tag Assistant 與 GA4「即時」報表確認。放置方式依據 [官方 GTM 安裝文件](https://support.google.com/tagmanager/answer/14847097)。

以使用者提供的黑白點陣圖片為視覺參考，建立 Nicoa The Six的繁體中文與英文個人網站。目前服務包含程式開發、Scratch 教學、中英文翻譯及文書資料整理；文章寫作服務已依要求移除，作品區的文章與筆記保留。更新流程見 [服務圖片維護說明](service-images/README.md)。GitHub 儲存庫為 `NicoaTheSix/MyPortfolio`。

## 網站結構與執行流程

1. 瀏覽器開啟 `index.html`，讀取 `styles.css`，呈現自適應版面。
2. 載入 `assets/portrait.png`；服務小卡及數位名片提供圖片預覽與下載。
3. `script.js` 先在開發者主控台顯示輸入頁面的絕對 URL 與輸出目的（目前頁面 DOM，不寫入檔案），再依序顯示品牌字樣、圖片預覽、聯絡功能三階段進度。
4. 導覽連至同頁內容；服務詢問及聯絡按鈕使用 `mailto:` 開啟訪客的郵件程式。網站本身沒有寄信後端。
5. 複製信箱透過瀏覽器 Clipboard API；權限不足或不支援時會顯示手動複製提示。
6. 服務小卡使用原生 `dialog`；支援關閉鈕、Escape 和點擊外側關閉。名片以原生 `details` 展開。

網站不需套件安裝、編譯、資料庫、API 金鑰或外部字型。作品區提供 Mal-GPT 論文、MITREATTACK_SIMULATOR 程式專案與 Agent 架構實作筆記的外部連結。聖誕節卡片活動目前只有名稱，未設定日期或活動入口。

## 檔案

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 網頁內容、SEO 基本資料、導覽與服務內容 |
| `styles.css` | 黑白復古設計、手機及桌面版面、鍵盤焦點與減少動態效果 |
| `script.js` | 點陣品牌字樣、年份、圖片對話框與複製信箱 |
| `assets/` | 原始肖像、服務小卡、名片及 SVG 網站圖示 |
| `prepare-assets.mjs` | 將使用者提供的三張原始 PNG 複製到網站素材目錄 |
| `prepare-social-assets.mjs` | 依 LinkedIn、GitHub、Medium、YouTube 順序複製四張社群 PNG |
| `serve.mjs` | 本機靜態預覽；只允許讀取網站公開檔案 |
| `check-site.mjs` | 檢查錨點、相對路徑、PNG、替代文字與外部連結 |
| `.nojekyll` | 靜態檔案標記 |

## 本機預覽

需要 Node.js 18 以上版本。於本目錄執行：

```powershell
node .\serve.mjs
```

啟動前會列出輸入目錄的絕對路徑及輸出 URL，接著依序顯示白名單設定、子路徑設定、啟動完成三階段進度。

開啟 <http://127.0.0.1:4173/MyPortfolio/>。這個路徑模擬專案型網站的子目錄。按 Ctrl+C 停止。若埠號被使用：

```powershell
$env:PORT = '4174'
node .\serve.mjs
```

亦可直接開啟 `index.html`；複製信箱是否可用由瀏覽器安全環境及權限決定，建議用本機預覽。

## 素材準備

三張圖已放入 `assets/`，一般使用不需重新執行此步驟。要替換時，依服務小卡、肖像、橫幅名片的順序提供檔案的絕對路徑：

```powershell
node .\prepare-assets.mjs 'C:\素材\服務小卡.png' 'C:\素材\肖像.png' 'C:\素材\名片.png'
```

程式會先顯示三個輸入與三個輸出檔案的絕對路徑，再檢查輸入、建立素材目錄、依序複製並顯示每階段進度。不修改原始圖片內容，會覆寫 `assets/` 中對應的三個目標檔案。

## 檢查

```powershell
node .\check-site.mjs
node --check .\script.js
```

檢查程式會先顯示絕對輸入路徑與輸出目的，再依序驗證頁面結構、素材引用、基本可及性。結果顯示於終端，不寫入檔案。瀏覽器應另確認桌面、手機、圖片預覽、鍵盤操作與聯絡入口。

## 社群連結與內容更新

社群圖示直接使用擁有者提供的四張原始圖片，以 90 × 90 CSS 像素顯示。圖片位於本機 `assets/social-*.png`，瀏覽時不向 HackMD 取得圖片；點選後才在新分頁開啟對應社群網站。

重新準備圖示時，在本目錄執行：

```powershell
node .\prepare-social-assets.mjs 'C:\素材\linkedin.png' 'C:\素材\github.png' 'C:\素材\medium.png' 'C:\素材\youtube.png'
```

程式先顯示四個輸入及四個輸出檔案的絕對路徑，再檢查檔案、依序複製並顯示五階段進度；會覆寫對應的四個目標圖檔。預覽伺服器的公開檔案白名單已加入四張圖片，新增其他素材時也要同步修改 `serve.mjs`。

頁面顯示流程：作品與文章在「做過的事，寫下的想法」區；聯絡區顯示委託／詢問信箱，再依序顯示 LinkedIn、GitHub、Medium、YouTube 圖示連結。連結均依使用者提供的地址設定，沒有取得或重新發布外部論文、文章內容。

| 類別 | 地址 |
| --- | --- |
| LinkedIn | https://www.linkedin.com/in/nicoa-wu-39301a266/ |
| GitHub | https://github.com/NicoaTheSix |
| Medium | https://medium.com/@nick5901879 |
| YouTube | https://www.youtube.com/@NicoaTheSix |
| 論文 | https://drive.google.com/file/d/1PhfLBf8n64QebqmwCDCnP-i2PVZu2-I4/view?usp=sharing |
| 專案 | https://github.com/NicoaTheSix/MITREATTACK_SIMULATOR |
| 文章 | https://hackmd.io/@nicoathe6/Bk5yICs_fl |

此次更新驗證：10 個站內資源路徑及 PNG 檢查通過；桌面 1440 px、手機 390 px 與 320 px 無水平溢出；四張社群圖片均成功載入且顯示為 90 × 90；七個新增外部入口的網址已與提供內容核對，均以新分頁開啟；瀏覽器未發現 error 或 warning。外部文件及社群內容的登入／分享權限仍由各平台管理。

## 更新內容

- 個人介紹與五項服務：同步修改 `index.html` 與 `en/index.html`，保留相同的區塊 id，讓切換語言後可留在對應區塊。
- 聯絡信箱：同步修改 `index.html`、`script.js`，並重新確認原始名片內的信箱。
- 字體、間距與色彩：修改 `styles.css`。
- 新增真實作品時，可在頁面加入作品介紹、實際貢獻、成果和 GitHub 連結。
- 所有站內資源使用相對路徑，避免部署到 `/MyPortfolio/` 時遺失資源。

## 第一版驗證紀錄

- Node.js 檢查：站內錨點、六個資源相對路徑、PNG 格式、圖片替代文字與 JavaScript 語法通過。
- 本機瀏覽器：桌面 1440 px、手機 390 px、窄螢幕 320 px 版面檢查；沒有頁面水平溢出。
- 實際操作：服務小卡開啟、Escape 關閉、數位名片展開並載入、複製信箱成功。
- 五個寄信入口的 `mailto:` 收件地址及主旨已確認；未實際寄出郵件。
- 瀏覽器檢查時未發現 error 或 warning。

## Fusion Studio 技術文件專區

網站入口為 `./fusion-studio/`，從首頁導覽及 Fusion Studio 作品卡可進入。操作手冊以來源專案 `manual/` 為唯一主要維護位置，本站提供可重建的雙語 HTML 發布版本，不移動或修改來源手冊。

根目錄新增程式流程：

1. `npm ci` 依 `package-lock.json` 安裝固定的 Markdown 轉換／HTML 清理／文件驗證依賴（僅建置時使用，訪客無須安裝）。
2. `node .\build-fusion-docs.mjs --source 'D:\MITREATTACK_SIMULATOR'` 先顯示絕對來源與輸出路徑，再依階段盤點手冊、記錄來源 commit 與未提交狀態、收集必要公開素材、轉換連結與雙語頁面、建立搜尋及來源清單。只讀來源，輸出至本 repo 的 `fusion-studio/`。
3. `node .\check-fusion-docs.mjs` 顯示絕對輸入與報告輸出，檢查完整指南、頁面及錨點、圖片／下載、語言對應及搜尋索引，產生 `fusion-studio/validation-report.json`。
4. `serve.mjs` 除既有首頁檔案外，僅允許提供 `fusion-studio/` 中的公開 HTML/CSS/JS/JSON 與選定素材，排除來源工具及隱藏檔。瀏覽 `http://127.0.0.1:4173/MyPortfolio/fusion-studio/` 檢查與 GitHub Pages 相同的子路徑。

網站介面、產物／來源分離、影片、搜尋、連結處理與維護細節見 [文件網站 README](fusion-studio/README.md)。首次安裝建置工具需要 Node.js 20 以上；原有靜態首頁及本機預覽不需額外建置。

HTTP 驗證可執行 `node .\check-fusion-docs.mjs --url 'http://127.0.0.1:4173/MyPortfolio/fusion-studio/'`，在靜態驗證後逐批檢查所有頁面與素材的 HTTP 內容與本次產物一致、影片 Range/MIME 正確，以及本機伺服器不提供 Git 設定與建置工具。每批顯示完成數，結果寫入同一驗證報告。

## 部署責任

GitHub Pages 已使用既有 `main` 根目錄發布設定。本次依擁有者指示將雙語頁面與素材推送到 `main`，由既有 Pages 流程發布。程式不修改 Pages 設定，也不另增部署工作流程。

## 雙語個人網站與圖片

- 繁體中文首頁：`/MyPortfolio/`；英文首頁：`/MyPortfolio/en/`。兩頁都是可直接開啟的靜態 HTML。
- 頁面最頂端的語言列提供「繁體中文 / English」，並標示目前語言。`script.js` 在點擊時將目前錨點附加至另一語言的連結，保留所在區塊；沒有自動重新導向。
- 英文頁使用英文導覽、服務、作品介紹、合作流程、圖片說明、預覽／下載與信箱複製回饋。肖像與社群標誌共用；有中文文案的服務卡、名片及文書卡分別提供英文圖片。
- 兩頁都新增獨立的文書處理與資料整理服務，可放大或下載對應語言圖卡。
- 英文頁進入 Fusion Studio 英文文件，35 個英文文件頁的 Nicoa 返回入口連至英文作品集。`build-fusion-docs.mjs` 模板也已更新；本次沒有重新讀取或改寫來源手冊。

### 素材與文件入口準備流程

圖片已備妥，日常維護不需重跑。`prepare-portfolio-locales.mjs` 的四個輸入依序是英文服務卡、英文名片、中文文書卡、英文文書卡：

```powershell
node .\prepare-portfolio-locales.mjs 'C:\素材\services-en.png' 'C:\素材\business-card-en.png' 'C:\素材\office-zh.png' 'C:\素材\office-en.png'
```

程式先顯示四張輸入圖片、文件清單及所有輸出檔案／目錄的絕對路徑，再依序：

1. 驗證四個 PNG 與比例（名片為橫幅，其餘正方形）。
2. 複製至 `assets/services-poster-en.png`、`assets/business-card-en.png`、`assets/office-services-poster.png`、`assets/office-services-poster-en.png`，逐張顯示進度。
3. 依 `fusion-studio/source-manifest.json` 盤點英文文件，只更新 35 頁的 Nicoa 返回連結；手冊正文與來源素材保持原樣。
4. 顯示完成狀態；原始生成圖片保留在原位。生成工具、完整提示詞及來源位置見 [圖片生成紀錄](portfolio-image-prompts.md)。

`serve.mjs` 白名單已納入英文頁與四張新圖。`check-site.mjs` 先列出雙語輸入檔案絕對路徑，再分四階段檢查：頁面錨點及對應 id、兩頁資源與跨頁錨點、語言切換與基本可及性、英文圖片／文案及文件返回入口。結果僅寫入終端。執行 `node .\check-site.mjs`，再用瀏覽器檢查語言切換、圖片預覽與手機版。

### 本次雙語驗證紀錄

- 雙語頁面 id 一致，19 個站內資源、跨頁錨點、PNG、替代文字、英文圖卡引用與 35 個文件返回連結通過。
- JavaScript、素材準備程式與文件產生器語法通過。文件網站 70 頁、14 份來源素材及 378 筆搜尋章節通過；本機 HTTP 的 87 個頁面／素材與產物完全一致，影片 Range 正常。
- 瀏覽器互動確認：英文兩張服務卡開啟、Escape／按鈕關閉、英文名片展開載入、信箱複製成功並顯示英文提示。英文切換至中文後保留 `#services`，窄螢幕時語言列仍固定在頂端。
- 讀取瀏覽器 DOM 尺寸時，實際視窗寬度為 1107 與 300 CSS px，頁面未水平溢出；本次截圖工具未成功回傳截圖，因此沒有宣稱完成截圖視覺驗證。英文圖片本身已逐張目視核對。
