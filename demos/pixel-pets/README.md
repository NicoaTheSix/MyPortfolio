# 嗶嗶電子雞

繁體中文電商示範。機器人、小生物、外星人與實體各有四隻原創像素寵物。實體類以日常物件化身為寵物。商品視窗的兩角各有一個紅色像素筊杯。

## 開啟與操作

直接以瀏覽器開啟同目錄的 `index.html`，或從作品集根目錄執行 `npm run preview`，瀏覽 <http://127.0.0.1:4173/MyPortfolio/demos/pixel-pets/>。中英文作品集的「示範網站」也有入口。

1. `pets.js` 定義角色、分類、示範價格與像素圖稿，依每個角色的色盤畫到 16 × 16 Canvas。視窗放大畫布時保留清楚的像素邊緣。
2. `site.js` 先列出 HTML、CSS、腳本、字型與頁面輸出的絕對 URL，再依序回報建立商品分類、啟動跑動背景、讀取購物車與就緒。
3. 用分類切換商品。每個商品視窗可把該角色加入購物車。購物車可調整數量，數量降到零就移除該角色，模擬結帳後清空購物車。瀏覽器允許時，購物車會存在本機 `localStorage`。所有價格和結帳結果皆供示範。
4. 背景角色在商品視窗後方從兩側跑過。頁尾可暫停或繼續背景，系統設定減少動態效果時以靜態桌面呈現。

## 輸入與輸出

- 網頁位於 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\pixel-pets\index.html`。同目錄有 `pets.js`、`site.js` 與 `styles.css`。
- 共用字型來自 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\fonts\cubic-11.woff2`。
- 角色和背景輸出到頁面的 Canvas。購物車只寫入目前瀏覽器，沒有產出獨立圖片或訂單檔案。
