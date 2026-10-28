# Nicoa 個人作品集網站

以使用者提供的三張黑白點陣圖片為視覺參考，建立 Nicoa（Chung-Lun Wu）的繁體中文個人網站。內容包含程式開發、Scratch 教學、文章寫作及中英文翻譯。GitHub 儲存庫為 `NicoaTheSix/MyPortfolio`，GitHub Pages 部署由網站擁有者自行操作。

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

- 個人介紹與四項服務：修改 `index.html`。目前簡介及合作流程為依參考圖撰寫的第一版文案，可依實際習慣調整。
- 聯絡信箱：同步修改 `index.html`、`script.js`，並重新確認原始名片內的信箱。
- 字體、間距與色彩：修改 `styles.css`。
- 新增真實作品時，可在頁面加入作品介紹、實際貢獻、成果和 GitHub 連結。
- 所有站內資源使用 `./` 相對路徑，避免部署到 `/MyPortfolio/` 時遺失資源。

## 第一版驗證紀錄

- Node.js 檢查：站內錨點、六個資源相對路徑、PNG 格式、圖片替代文字與 JavaScript 語法通過。
- 本機瀏覽器：桌面 1440 px、手機 390 px、窄螢幕 320 px 版面檢查；沒有頁面水平溢出。
- 實際操作：服務小卡開啟、Escape 關閉、數位名片展開並載入、複製信箱成功。
- 五個寄信入口的 `mailto:` 收件地址及主旨已確認；未實際寄出郵件。
- 瀏覽器檢查時未發現 error 或 warning。

## 部署責任

此專案提供網站原始碼與本機預覽；GitHub Pages 啟用、發布來源及網域設定由擁有者自行處理。本程式不會修改 GitHub Pages 設定，也不包含自動部署工作流程。
