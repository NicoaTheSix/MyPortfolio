# 網頁視覺設計展示

`/MyPortfolio/demos/visual-design/` 是繁中版，`/MyPortfolio/demos/visual-design/en/` 是英文版。桌面置中展示完整海報，手機保留原圖 2:3。

- **靜態**顯示無霧的 1024×1536 或 640×960 海報，瀏覽器按視窗大小選取 WebP。
- **動態霧氣**（`?mode=mist`）在無霧海報上疊加 Three.js 透明畫布。自訂 GLSL shader 讓霧帶隨時間漂移與變形。
- **分層霧氣**（`?mode=layers`）先載入並解碼地板、去背角色和去背字標。合成順序由底到頂為地板、後方霧、角色、腳邊前景淡霧、字標。圖檔載入失敗時顯示靜態海報與提示。

分層模式的角色圖採用無彩色打光的透明石墨灰服裝。ImageGen 保留原機位、姿勢與布料細節，將紫紅邊光及發光零件改為中性材質。ImageMagick 將透明 PNG 編碼為展示用 WebP，保留原海報的 1024×1536 畫布。瀏覽器使用同一張角色圖的透明通道限制紫紅主光與紫色補光，並在角色輪廓加上細邊光。用 `?mode=layers&lighting=off` 檢視原始服裝和相同霧效，方便與打光畫面比較。

分層模式的打光選單可以切換分區遮罩（`lighting=mask`）、貼地掃光（`lighting=sweep`）及法線打光（`lighting=normal`）。遮罩集中在頭盔、肩線及手臂。掃光在岩地、足部與前景霧的範圍移動。法線打光根據角色透明圖的亮度和近似體積估算表面方向，滑鼠移動或點按海報時重算光照。系統減少動態時使用固定燈位。

`site.js` 先印出頁面、圖檔和腳本的絕對 URL，接著掛接模式、全螢幕與備援按鈕。瀏覽器無法進入原生全螢幕時會填滿目前視窗，按離開全螢幕或 Esc 返回。`three-fog.mjs` 使用 Three.js ShaderMaterial 將多層雜訊移至 GPU。分層模式的前景霧落在海報高度 69% 至 91%，保持字標疊在最上方。海報霧繪圖寬度上限為 448 像素，並限制更新頻率。靜態模式和背景分頁暫停更新，系統偏好減少動態效果時只繪製一幀。WebGL 無法使用時改用 `fog.js` 的 Canvas 2D 霧。

分層打光（`?mode=layers&lighting=layered`）使用同一張去背角色圖。程式依原圖畫出四張獨立遮罩，分別對應肩背、近側手臂、頭盔及立領，並以圖像透明度裁邊。各層使用不同深度、曲面法線、高光強度及高光範圍。移燈時從頭盔、立領、近側手臂的遮罩取樣，在立領或肩背上投出柔和偏移陰影。角色圖保持固定，瀏覽器即時重算上半身區域。近景霧與字標在打光層上方。

在分層霧選「分層打光」後可用滑鼠移燈，手機在角色區域拖曳，其他區域可正常捲動。用 Tab 聚焦角色區後支援方向鍵與 Home。程式列出角色圖和畫布的絕對 URL，並依序回報遮罩、材質及首幀。此功能無需重新建置霧氣套件。預覽可用 `$env:PORT='4295'` 後執行 `node serve.mjs`。

動態霧氣可在原版海報與分層打光間切換（`?mode=mist&lighting=layered`）。選取分層打光才會下載去背角色、地板與字標，沿用同一份遮罩和移燈操作。動態霧是一層跨過角色的霧；分層霧使用角色後方與腳邊前方兩層。字標在兩種模式都位於最上方。切換模式會記住各自的打光選項，中英文入口保留目前選項。動態霧的圖層載入失敗時，回到原版動態霧並顯示提示。

「原海報打光」（`lighting=original-lit`）使用 v1.29 中已帶紫紅輪廓光與指示燈的透明角色 WebP。位元組原樣複製到 `assets/character-original-lit.webp`，未進行去光或重新編碼。角色以獨立圖層顯示，字標和霧氣維持各模式原有順序。「2.5D 原海報打光」（`lighting=layered-lit`）使用同一張去背圖為底，在四個打光區域以 Screen 疊加移動光，遮影只降低新增光層。兩個選項皆可在動態霧和分層霧選取，可用 `?mode=mist&lighting=layered-lit` 或 `?mode=layers&lighting=layered-lit` 直達。

霧效參考多層雜訊生成雲和取樣座標扭曲的公開範例。 [The Book of Shaders](https://thebookofshaders.com/13/) [JayKay Cooperations 的互動示範](https://jaykaycooperations.com/domainWarping/)

以原紫紅海報為 ImageGen 的輸入，保留原機位、角色、岩地與紫紅邊光，清除畫面內所有霧氣，另輸出只含岩地、只含透明角色、只含透明像素字標的 PNG。原圖歸檔在 `.preview/visual-design-assets/`。ImageMagick 轉成網站使用的 WebP，地板與角色保留共同畫布，字標裁成獨立的橫幅。轉檔前列出來源及輸出絕對路徑，轉檔後以 `magick identify` 核對尺寸與透明通道。

站點根目錄設定 `$env:PORT='4262'` 後執行 `node serve.mjs`。在雙語首頁檢查示範卡，在展示頁檢查三種模式、全螢幕及手機比例。執行 `node check-site.mjs` 與 `node sync-seo.mjs --check` 驗證站點。

使用 `node demos/visual-design/build-poster-fog.mjs` 打包 Three.js 海報霧。指令先列出 `three-fog.mjs` 與 `poster-fog.js` 的絕對路徑，再顯示打包與輸出進度。加上 `&fog=classic` 可比較 Canvas 2D 霧，中英文切換會保留霧氣模式。正式站提供靜態、動態霧氣、分層霧氣與分層打光。
