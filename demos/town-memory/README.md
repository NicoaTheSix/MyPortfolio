# 杉溪鄉｜地方記憶誌

地方發展是作品集規劃的第四類示範網站。本頁以虛構的臺灣山腳鄉鎮呈現交趾陶、登山步道、螢火蟲與交趾陶陶藝節，並提供本機記憶筆記。六張照片均以 ImageGen 生成彩色情境照。

## 開啟與操作

直接以瀏覽器開啟 `index.html`，或在作品集根目錄執行 `npm run preview`，再從中英文首頁的「示範網站」開啟 <http://127.0.0.1:4173/MyPortfolio/demos/town-memory/>。頁面不需安裝套件或建置。

1. `index.html` 提供四章與地方發展記錄方法。CSS 依螢幕寬度調整圖文順序及欄數。系統設定減少動態效果時，照片固定顯示，螢火蟲章顯示夜景。
2. `site.js` 先列出頁面、程式、六張圖片及章節與筆記區的絕對 URL，再在 Console 依序回報初始化捲動運鏡、讀取本機筆記、建立介面與就緒。
3. 選主題並填標題與內容，時間或地點可選填。新增後，筆記依建立時間顯示，並寫入目前瀏覽器的 `localStorage`。瀏覽器限制儲存時，當頁仍可編寫及匯出。筆記只在此頁及目前瀏覽器處理。
4. 匯出鍵會下載 `杉溪鄉-地方記憶.json`，檔案由瀏覽器存到使用者設定的下載位置。刪除單筆筆記前會先顯示確認。

## 輸入與輸出

- 網頁入口為 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\town-memory\index.html`。同目錄包含 `styles.css` 與 `site.js`。
- 六張彩色生成照歸檔於 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\town-memory\assets\images`。日景取用同目錄 `firefly-creek.png` 作為光線編輯底圖。
- 筆記內容來自訪客填寫。輸出為瀏覽器本機資料及訪客自行下載的 JSON。

## 內容參考

- 由地方生活切入變遷的敘事角度參考公視《我們的島》〈拆遷倒數〉。節目索引的 10:10 章節是安置住宅品質疑慮。本示範以四個指定主題另外建構一個虛構鄉鎮。[公視章節索引](https://news.pts.org.tw/video/23066)
- 交趾陶的工藝背景參考文化部文化資產局的記錄。[國家文化記憶庫](https://tcmb.culture.tw/zh-tw/detail?id=20180606000005&indexCode=BOCH_CountryCulture_42)
- 山林與溪邊螢火蟲場景參考臺灣的步道生態介紹。[台灣山林悠遊網](https://recreation.forest.gov.tw/Trail/RT?tr_id=096&typ=1)

## 捲動運鏡與轉場

程式在捲動和視窗尺寸變動時，每一畫格最多更新一次。首圖以離開頁首的距離計算進度，其餘鏡頭以章節相對於視窗的位置計算。點章節連結到達後，繼續往下捲可看到運鏡收尾，往上捲可反向觀看。寬螢幕的照片在章節內短暫停留，窄螢幕則維持單欄捲動。CSS 根據捲動進度調整照片的移動、縮放、對焦或疊化。

- 首圖從聚落往山稜仰移。[#026 Tilt](https://showheyohtaki.github.io/motion-prompt/#026)
- 交趾陶逐步變清晰，模擬對焦的觀感。[#033 Rack focus](https://showheyohtaki.github.io/motion-prompt/#033)
- 登山步道沿著石階拉近。[#028 Zoom in](https://showheyohtaki.github.io/motion-prompt/#028)
- 螢火蟲章以相同構圖的日景和夜景疊化，兩張照片載入後才啟用。[#044 Cross dissolve](https://showheyohtaki.github.io/motion-prompt/#044)
- 陶藝節由左往右橫搖帶過攤位。[#025 Pan](https://showheyohtaki.github.io/motion-prompt/#025)

## 彩色照片生成提示詞
+
**`town-valley.png`**

> Wide cinematic 2:1 photograph from a low hillside overlooking a small fictional Taiwanese foothill township in the humid early morning. Red tile roofs and simple gray concrete houses are tucked between dense green bamboo and broadleaf trees, scattered tea and vegetable plots and a narrow creek, layers of misty blue-green hills fading into the distance. The village is in the right two thirds and lower center, with darker leafy hillside in the left third suitable for a text overlay. Subtle dawn amber on roofs, vivid but natural greens, slate blue mountains. Geographically believable central-southern Taiwan, compact rural scale, no tourist landmark or heroic skyline. Authentic Taiwanese documentary still for a fictional township's local memory archive, photorealistic in FULL COLOR, tactile natural materials, nuanced believable light, quiet editorial composition. Original imagined setting, no legible words, no signs with readable writing, no visible brands, no watermark, no famous or identifiable real-world place. No collages or frames.

**`koji-ceramics.png`**

> Wide 3:2 close documentary photograph inside a modest Taiwanese traditional ceramic workshop. A weathered worktable holds two small original Taiwanese Koji pottery relief figures inspired by traditional temple ornaments, one stylized bird with emerald and cobalt low-temperature glazes, the other small ochre-red and turquoise decorative figure with clearly sculpted details. Nearby are one small brush, unmarked bowls of colored glaze, and an unfinished clay piece. Tangible glossy enamel with slight irregularities, soft side daylight, warm dark wood, craft editorial photography. Focus on the forms, not people. Authentic Taiwanese documentary still for a fictional township's local memory archive, photorealistic in FULL COLOR, tactile natural materials, nuanced believable light, quiet editorial composition. Original imagined setting, no legible words, no signs with readable writing, no visible brands, no watermark, no famous or identifiable real-world place. No collages or frames.

**`forest-trail.png`**

> Wide 3:2 eye-level photo of an original modest Taiwanese mountain hiking trail climbing gently through wet evergreen broadleaf forest and bamboo on a foothill. Uneven old stone steps with moss, dark earth, a simple modest wooden handrail on one stretch, small ferns, filtered sun breaking through above at the turn. Authentic humid subtropical foliage, muted moss and jade greens, earthy reds and browns, photographic light and depth. No people, no text, no identifiable real trail. Authentic Taiwanese documentary still for a fictional township's local memory archive, photorealistic in FULL COLOR, tactile natural materials, nuanced believable light, quiet editorial composition. Original imagined setting, no legible words, no signs with readable writing, no visible brands, no watermark, no famous or identifiable real-world place. No collages or frames.

**`firefly-creek.png`**

> Wide 3:2 full-color blue-hour photograph of a quiet fictional Taiwanese foothill creek habitat, bank with broad leaves and ferns, subtle flowing water reflecting a dark blue sky, dozens of tiny soft yellow-green firefly points low among the plants, fine natural texture visible in foreground. A real nocturnal ecology documentary look, indigo, blue and dark jade remain clearly in color. Glows are scattered at plausible scale, no giant orbs, no sky full of stars, no fairy-tale illustration, no people or flash lighting. Authentic Taiwanese documentary still for a fictional township's local memory archive, photorealistic in FULL COLOR, tactile natural materials, nuanced believable light, quiet editorial composition. Original imagined setting, no legible words, no signs with readable writing, no visible brands, no watermark, no famous or identifiable real-world place. No collages or frames.

**`daylight-creek.png`**

以 `firefly-creek.png` 為 ImageGen 光線編輯底圖。

> Create a full-color daytime lighting edit of this exact fictional Taiwanese foothill creek photograph, for a precisely matched day-to-night dissolve. Match the image geometry, camera position, lens, framing, 3:2 aspect ratio, horizon, canopy silhouette, rocks, tree trunks, river path, leaves and every spatial feature as closely as possible. Change the time of day only to bright soft late-afternoon daylight, with cool pale blue sky, clear natural greens, gray-brown rocks and soft neutral water reflections. Remove all glowing firefly points during daytime. Authentic photographic detail, no people, no new objects, no text or branding. The reference is the exact edit target; do not reinterpret the composition.

**`ceramic-festival.png`**

> Wide 3:2 street-level documentary still of a fictional Taiwanese community Koji pottery arts festival in an old neighborhood courtyard at late afternoon. Trestle tables under a simple canopy display small glossy handmade temple-inspired ceramic birds and figures in distinct turquoise, honey-yellow, jade, cinnabar, and cobalt. A few local adults and families are naturally seen from behind or at soft distance, examining pottery and taking part in a hands-on clay workshop. Red brick, worn terrazzo and a row of small paper lanterns make the setting feel Taiwanese and community-run. Focus the foreground on ceramic details, warm rich daylight. No readable notices or banners, no event branding. Authentic Taiwanese documentary still for a fictional township's local memory archive, photorealistic in FULL COLOR, tactile natural materials, nuanced believable light, quiet editorial composition. Original imagined setting, no legible words, no signs with readable writing, no visible brands, no watermark, no famous or identifiable real-world place. No collages or frames.
