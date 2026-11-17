# 網頁視覺設計展示

`/MyPortfolio/demos/visual-design/` 是繁中版，`/MyPortfolio/demos/visual-design/en/` 是英文版。桌面置中展示完整海報，手機保留原圖 2:3。

- **靜態**顯示無霧的 1024×1536 或 640×960 海報，瀏覽器按視窗大小選取 WebP。
- **動態霧氣**（`?mode=mist`）在無霧海報上疊加 Canvas。雜訊取樣隨時間平移與扭曲，改變霧氣形狀。
- **分層霧氣**（`?mode=layers`）先載入並解碼地板、去背角色和去背字標。合成順序由底到頂為地板、Canvas 霧、角色、字標。圖檔載入失敗時顯示靜態海報與提示。

`site.js` 先印出頁面、圖檔和腳本的絕對 URL，接著掛接模式、全螢幕與備援按鈕。瀏覽器無法進入原生全螢幕時會填滿目前視窗，按離開全螢幕或 Esc 返回。`fog.js` 以 128×112 的 Canvas 產生紫紅透明霧，每秒最多更新 24 幀。靜態模式和背景分頁暫停更新，系統偏好減少動態效果時只繪製一幀。

霧效參考多層雜訊生成雲和取樣座標扭曲的公開範例。 [The Book of Shaders](https://thebookofshaders.com/13/) [JayKay Cooperations 的互動示範](https://jaykaycooperations.com/domainWarping/)

以原紫紅海報為 ImageGen 的輸入，保留原機位、角色、岩地與紫紅邊光，清除畫面內所有霧氣，另輸出只含岩地、只含透明角色、只含透明像素字標的 PNG。原圖歸檔在 `.preview/visual-design-assets/`。ImageMagick 轉成網站使用的 WebP，地板與角色保留共同畫布，字標裁成獨立的橫幅。轉檔前列出來源及輸出絕對路徑，轉檔後以 `magick identify` 核對尺寸與透明通道。

站點根目錄設定 `$env:PORT='4262'` 後執行 `node serve.mjs`。在雙語首頁檢查示範卡，在展示頁檢查三種模式、全螢幕及手機比例。執行 `node check-site.mjs` 與 `node sync-seo.mjs --check` 驗證站點。
