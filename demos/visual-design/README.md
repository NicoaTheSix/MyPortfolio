# 網頁視覺設計展示

`/MyPortfolio/demos/visual-design/` 是繁中版，`/MyPortfolio/demos/visual-design/en/` 是英文版。桌面以同色背景置中展示完整海報，手機保留原圖 2:3。靜態模式顯示海報本身，動態模式用兩層 CSS 霧氣做不同速度的漂移。系統偏好減少動態效果時，霧氣停在靜止狀態。

`site.js` 先印出頁面、海報和腳本的絕對 URL，再掛接模式、全螢幕與備援按鈕。瀏覽器無法進入原生全螢幕時會填滿目前視窗，按離開全螢幕或 Esc 返回。`?mode=mist` 可直接進入霧氣模式。

海報以 ImageMagick 從歸檔 PNG 輸出 1024×1536 與 640×960 WebP。轉檔前列出來源及輸出絕對路徑，轉檔後以 `magick identify` 核對尺寸。站點根目錄設定 `$env:PORT='4261'` 後執行 `node serve.mjs`。在雙語首頁檢查示範卡，在展示頁檢查兩種模式、全螢幕及手機比例。執行 `node sync-seo.mjs` 更新雙語中繼資料和 sitemap，再用 `node check-site.mjs` 與 `node sync-seo.mjs --check` 驗證。
