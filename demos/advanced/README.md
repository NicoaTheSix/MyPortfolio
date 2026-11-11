# 四種網站進階版

從專案根目錄執行 `npm run preview`，在 <http://127.0.0.1:4173/MyPortfolio/#website-demos> 開啟中英文作品集。原有 URL 保留，各站新增 `advanced/`。四個頁面的頁尾可下載 512 × 512 的品牌底色版和透明 PNG。

英文作品集的進階版入口連到各站 `advanced/en/`。兩種語言共用圖像、Logo、樣式和互動。頁首可切換語言，原版功能的連結會標示語言。英文林達頁換算住宅案例面積為平方公尺，杉溪鄉筆記與林達諮詢表單沿用繁中原版。

| 網站 | 進階互動 | Uberdesigner 參考 |
| --- | --- | --- |
| [林達](../lin-da/advanced/index.html) | 紙本看房誌，以目錄、按鈕或方向鍵翻閱三個虛構住宅案例 | [Lamplit](https://uberdesigner.ai/t/lamplit) 的目錄與翻頁 |
| [杉溪鄉](../town-memory/advanced/index.html) | 四站捲動旅程，導覽顯示進度，溪岸隨捲動由白天轉為入夜 | [Paper Worlds](https://uberdesigner.ai/t/paper-worlds) 的捲動旅程與場景過渡 |
| [嗶嗶電子雞](../pixel-pets/advanced/index.html) | 四層機身隨捲動展開，可指定部件、選 16 隻寵物和五種動作，沿用商品、購物車和模擬結帳 | [Vibetyper](https://uberdesigner.ai/t/vibetyper) 的產品分層和零件解說 |
| [棲光爬蟲咖啡](../reptile-cafe/advanced/index.html) | 有景深的六種住民照片轉盤，支援按鈕、方向鍵、觸控滑動與放大 | [Wild Gallery](https://uberdesigner.ai/t/wild-gallery) 的旋轉攝影作品與點圖詳情 |

## 路徑與運作

專案根目錄為 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\`。共用輸入為 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\advanced\advanced.css` 與 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\advanced\advanced.js`。每個示範的 `advanced\index.html` 使用原站影像或角色資料。互動輸出在目前頁面，電子雞沿用原站本機購物車，其他三站不寫檔。

品牌輸出絕對目錄如下。每個目錄內包含 `logo.png`（品牌底色）和 `logo-transparent.png`（透明背景）。

- `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\lin-da\advanced\`，以平面圖和門廊構成 LD，供林達的各版本共用。
- `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\town-memory\advanced\`，山稜、交趾陶與一點螢光。
- `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\pixel-pets\advanced\`，像素電子雞和擲筊形腳座。
- `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\reptile-cafe\advanced\`，守宮繞成杯把，杯口有一片葉子。

ImageGen 原圖位於 `C:\Users\nick5\.codex\generated_images\01a1c3be-7542-73b0-9494-1a46b82f2e20\`。轉換前列出每張原圖與輸出的絕對路徑，再使用 ImageMagick 縮至 512 像素、保留 alpha，並以同一透明版合成品牌底色版。逐張確認 alpha 最小值 0、最大值 1。原圖和雜湊另記於儀表板交付事件。

啟動預覽時，伺服器先列出絕對輸入與輸出 URL，再顯示白名單及啟動進度。頁面控制台依序列出 `[進階示範 0/3]` 的輸入與輸出、辨識元件、綁定操作與就緒狀態。系統開啟減少動態效果時，仍可切換頁面、操作圖鑑和查看機身。

驗證從 `node check-site.mjs` 和 `node --check demos/advanced/advanced.js` 開始。接著從作品集開啟進階版，確認既有 URL、標誌下載、翻頁、捲動場景、試玩與購物車、照片切換和放大，以及手機寬度。

英文版輸入為上述四個品牌輸出目錄內的 `index.html`，各自的英文輸出為同目錄的 `en\index.html`。檢查時先列出路徑，再核對中英文對應網址、連結、資源和互動。公開部署紀錄為 [GitHub Pages 作業 42981180661](https://github.com/NicoaTheSix/MyPortfolio/actions/runs/42981180661)，部署內容是實作英文版之前的快照 `28458a5`。
