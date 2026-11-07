# 首頁肖像視窗互動交付清單

批次：portfolio-portrait-controls-20261107；來源對話：01a180bd-dd2d-7dd0-980d-2a516ebfb8b8。
來源指令：X 按下照片真的消失、縮放按下縮小、最小化按下收合。
起點提交：a7346f5c041b7ed119bdb2d615ae188d72c92cd0；正式版本維持 v1.04。本批待使用者確認，未推送或部署。

## 完成行為與驗證

- X 隱藏整個照片視窗；出現可重新開啟的按鈕，重新開啟回到原大小與展開狀態。關閉後焦點移至重開按鈕，重開後移至關閉鈕。
- 方框在 100%／68% 寬度間切換；收合狀態下按方框會展開，讓縮小效果可見。
- 減號隱藏照片與底部狀態列，保留標題列及三鈕，變成加號可再次展開。
- 同步繁中／英文可及性名稱與 ARIA 狀態，原生按鈕支援 Enter／Space；狀態只存在本頁，重新整理重設。原始照片不改動，無 JavaScript 時維持照片且隱藏操作鈕。
- 語法、雙語 id／錨點／38個資源、十六張影格表及81頁GTM均通過；git diff --check 通過。
- 瀏覽器中英文桌面及320／390px手機實際點選縮小／還原、收合／展開、關閉／重開，鍵盤關閉／重開通過；無水平溢出，未發現warning/error。

本機預覽：http://127.0.0.1:4197/MyPortfolio/ （English可切換）。

## 最終檔案

| 檔名 | 變更 | 用途 | 最終絕對路徑 |
| --- | --- | --- | --- |
| index.html | modified | 中文首頁可操作視窗、內容區與重新開啟入口 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\index.html |
| en/index.html | modified | 英文首頁可操作視窗、內容區與重新開啟入口 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\en\index.html |
| home-pixel.js | modified | 收合、縮小、關閉、重開及鍵盤焦點 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\home-pixel.js |
| home-pixel.css | modified | 視窗尺寸、標題列按鈕與關閉樣式 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\home-pixel.css |
| README.md | modified | 同目錄程式流程與實測結果 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\README.md |
| portrait-window-delivery.md | created | 本批交付與溯源清單 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\portrait-window-delivery.md |
| .preview/portrait-window-closed-desktop.png | created | 桌面關閉照片效果 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\portrait-window-closed-desktop.png |
| .preview/portrait-window-collapsed-desktop.png | created | 桌面只保留標題列的收合效果 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\portrait-window-collapsed-desktop.png |
| .preview/portrait-window-small-mobile.png | created | 手機縮小照片效果 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\portrait-window-small-mobile.png |

截圖依既有規則保留於 .preview，不加入 Git；中央事件記錄三張圖片的大小與SHA-256。中央檔案回讀不代表儀表板UI與雙向確認已接通。
