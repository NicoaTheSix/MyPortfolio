# 棲光爬蟲咖啡｜Perch & Pour

繁體中文靜態店家示範。店名、地址、站名、停車場、步行時間、菜單與店務設定皆為虛構，沒有地圖定位或訂位流程。需求中的「截角守宮」以常用名「睫角守宮」呈現。

## 檔案與運作

- 輸入與交付目錄：`C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\reptile-cafe\`。同目錄的 `index.html` 放店家資料，`styles.css` 負責版面，`site.js` 負責篩選，`assets\images\` 收錄八張彩色情境照。
- 從專案根目錄執行 `npm run preview`，開啟 <http://127.0.0.1:4173/MyPortfolio/demos/reptile-cafe/>，或直接開啟 `index.html`。中英文作品集也有入口。預覽伺服器依序顯示絕對輸入、輸出網址、白名單與啟動進度。
- 瀏覽器控制台 `[棲光 0/3]` 先顯示頁面與腳本的絕對 URL，以及分類畫面的輸出位置，不寫入檔案；接著顯示讀取住民、綁定按鈕及就緒。訪客可選「全部／守宮／蛇類」，顯示數量隨之更新；停用 JavaScript 時仍可瀏覽六張卡片。
- 檢查：`node check-site.mjs` 核對中英文首頁入口；`node --check demos/reptile-cafe/site.js` 核對腳本。瀏覽器另確認六、四、兩種的分類切換、圖片載入、站內錨點、返回作品集和手機排版。

## 生成照片

ImageGen 以虛構的臺灣咖啡廳為設定，獨立生成店景、生態缸與六個物種。店景以深木色、植物與展示缸為主；生態缸採樹皮、苔蘚及蕨類近照；每個物種個別取景，使用自然色、沒有真人、品牌與文字。網站上的情境照不作為飼育指引。

原圖保留於 `C:\Users\nick5\.codex\generated_images\01a1c3be-7542-73b0-9494-1a46b82f2e20\`。轉換前列出每組輸入和輸出的絕對路徑；ImageMagick 輸出品質 88 的 WebP，保留店景尺寸、其餘照片縮至寬 1200 像素，再逐張驗證尺寸與容量。

| 輸出檔案（`assets/images/`） | 內容 |
| --- | --- |
| `cafe-interior.webp` | 咖啡廳店景 |
| `vivarium.webp` | 獨立玻璃生態缸 |
| `gargoyle-gecko.webp` | 蓋勾亞守宮 |
| `crested-gecko.webp` | 睫角守宮 |
| `leopard-gecko.webp` | 豹紋守宮 |
| `giant-gecko.webp` | 巨人守宮 |
| `ball-python.webp` | 球蟒 |
| `red-tail-boa.webp` | 紅尾蚺 |

訪客衛生文字參考美國 CDC 的[爬蟲與兩棲類指引](https://www.cdc.gov/healthy-pets/about/reptiles-and-amphibians.html)與[參觀動物展示的衛生指引](https://www.cdc.gov/healthy-pets/about/staying-healthy-at-animal-exhibits.html)。
