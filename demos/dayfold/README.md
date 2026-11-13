# 折日生活 Dayfold Living

折日生活是虛構生活用品公司，周禾安是虛構的租屋選品顧問。訪客從廚房、浴室、洗衣陽台選用品，把六項虛構商品中感興趣的項目加入清單，再查看合計與預算差額。預約只顯示示範時段，不蒐集資料或連線送出。

## 真實案例

在臺灣營運的安麗日用品股份有限公司透過官網展示居家商品，並另設直銷商及生活會員資訊入口。折日生活借鑑商品體驗與加入資訊分流的方式。網站內容、人物、商品規格、圖像與 Logo 另外設計。

- [安麗台灣官方首頁](https://web.amway.com.tw/)
- [安麗直銷商與生活會員申辦權益](https://web.amway.com.tw/join-amway/rights/)
- [臺灣《多層次傳銷管理法》第 11、12 條](https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=J0150017)

## 輸入、輸出與運作

- 專案絕對目錄為 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\dayfold\`。入口為 `index.html` 與 `en\index.html`，共用 `site.js`、`style.css` 與 `assets\`。
- 照片由 ImageGen 生成，原檔位於 `C:\Users\nick5\.codex\generated_images\01a1c3be-7542-73b0-9494-1a46b82f2e20\`。轉檔前輸出每組來源與目的的絕對路徑。四張相片輸出為 `kitchen.webp`、`bathroom.webp`、`laundry.webp`、`advisor.webp`。品牌標誌有 `logo-transparent.png` 及 `logo.png` 兩種 512 × 512 PNG，可在頁尾下載。
- 從專案根目錄執行 `npm run preview`，開啟 <http://127.0.0.1:4173/MyPortfolio/demos/dayfold/>。伺服器顯示輸入根目錄、預覽網址與啟動進度。
- 網站程式先在控制台列出輸入與互動區的絕對 URL，再顯示空間和商品、清單和預算、預約預覽三個階段。清單在切換房間時保留，重整或切換語言會重新開始。所有操作只影響目前畫面。
- 核對中英文作品集入口、商品標記與按鈕、預算超額和移除、模擬時段、中英切換、Logo 下載與手機寬度。SEO 和 sitemap 沿用專案的 `npm run seo` 流程。
