# 林達｜房地產個人網站示範

林達的繁體中文房仲網站提供第一版靜態頁與三鏡頭動畫版。林達與住宅案例均為虛構，照片皆由 ImageGen 生成。表單在當前頁面示範驗證與送出。

## 開啟與操作

直接在瀏覽器開啟同目錄的 `index.html` 或 `motion.html`。也可在作品集根目錄執行 `npm run preview`，再開啟[第一版靜態頁](http://127.0.0.1:4173/MyPortfolio/demos/lin-da/)或[三鏡頭動畫版](http://127.0.0.1:4173/MyPortfolio/demos/lin-da/motion.html)。網站使用相對路徑且無建置依賴。

1. 兩個頁面皆包含住宅案例、全身肖像、服務流程與諮詢區。動畫版載入 `motion.css` 和 `motion.js`。三張片頭照解碼後自動播放一次，共 9.6 秒。播放鍵可暫停、接續與重播，點選鏡頭可直接定格查看。系統設定減少動態效果時，三個鏡頭可逐一手動查看。
2. `site.js` 和 `motion.js` 在開發者工具的 Console 各自列出輸入檔案與頁面更新目標的絕對 URL，再回報住宅篩選、諮詢表單和片頭的初始化及鏡頭進度。預覽程式也會先顯示專案輸入的絕對路徑與本機預覽 URL。
3. 案例展開使用瀏覽器原生的 `details` 元素。
4. 選擇住宅類型會更新卡片與可讀的結果數量。從案例開啟諮詢會預選主題，並在需求欄為空時帶入案例名稱。提交時檢查必填欄位，清空表單並在本頁顯示結果。表單不發送網路請求，也不將欄位寫入瀏覽器儲存空間。

## 輸入與輸出位置

- 簡介來源為 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\lin-da\profile.md`。
- 生成照歸檔於 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\lin-da\assets\images`。兩版共用人物照與三張案例照。靜態版首圖為 `hero-residence.png`。動畫版依序載入 `taiwan-street-hero.png`、`taiwan-entry-color.png`、`taiwan-living-room-color.png`。
- 靜態版入口為 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\lin-da\index.html`。動畫版入口為 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\lin-da\motion.html`，樣式與腳本同目錄。互動在瀏覽器內輸出。

## Motion Prompt 運鏡、轉場與調色

- 黑白街區 3 秒。畫面從巷道仰移，交代臺灣住宅街廓的尺度。以瀏覽器平移與縮放生成照來模擬鏡頭仰移。[#026 Tilt](https://showheyohtaki.github.io/motion-prompt/#026)
- 低飽和、偏暗的彩色門廳 3 秒。從街區直接切到騎樓，再由左向右掃到鐵門與樓梯。CSS 飽和度為 76%，亮度為 90%。[#025 Pan](https://showheyohtaki.github.io/motion-prompt/#025)
- 飽和度較高、較明亮的彩色客廳 3.6 秒。門廳以 0.68 秒疊化進客廳，再緩慢拉近窗邊。CSS 飽和度為 112%，亮度為 107%。最後兩段標題各用 0.7 秒揭露，第二段晚 0.14 秒出現。[#044 Cross dissolve](https://showheyohtaki.github.io/motion-prompt/#044)、[#028 Zoom in](https://showheyohtaki.github.io/motion-prompt/#028)、[#005 Mask reveal](https://showheyohtaki.github.io/motion-prompt/#005)、[#002 Stagger](https://showheyohtaki.github.io/motion-prompt/#002)

## 影像設定

觀察臺灣租屋與中古屋刊登常見的磁磚地坪、鋁窗、前陽台、分離式冷氣、透天車庫與遮雨棚。住宅照片以文字描述重新生成，網站中的影像與案例均為虛構。人物肖像的提示詞保存在 `profile.md`。

**`taiwan-street-hero.png`**

使用者附圖 `C:\Users\nick5\AppData\Local\Temp\codex-clipboard-dec9fd8c-7136-4a24-a788-04d553ef7ba2.png` 提供仰角、黑白反差與寬幅構圖參考。ImageGen 以此生成虛構臺灣街景，標題和動畫由網頁呈現。

> Create an original photorealistic 2:1 wide cinematic black-and-white architecture photograph for the title frame of an independent real-estate portfolio demo. Reference attachment is for dramatic upward camera perspective, deep monochrome contrast and widescreen framing ONLY; disregard all typography and architecture from that image. Depict an entirely imaginary modern Taiwanese urban residential street from a low street-level camera tilted up between buildings, 20 mm lens, strong converging lines and a narrow wedge of bright overcast sky. On left foreground a dark mid-rise mixed-use Taiwan apartment building with tiny dark square ceramic facade tiles, deeply shaded concrete arcade columns, projecting aluminum balconies and orderly split-AC compressor boxes. On right a pale ceramic-tile Taiwanese apartment facade with recessed balconies and typical metal window grilles, staggered massing, visual contrast. In distance a plain taller residential block with concrete sunshades. A few discreet pipes and a little foliage visible at lower edge. Natural strong light on right side, shadows on left, authentic contemporary urban fabric, editorial fine-grain monochrome photography with crisp real architectural texture, strong depth, medium-dark lower-middle portion so overlaid title can read. Full bleed. Invent every structure, no famous silhouettes or recognisable location, no logos, no readable signs, no people, no lettering, no graphics, no watermark, no typography.

**`taiwan-entry-color.png`**

使用前一版的 `taiwan-entry.png` 作為 ImageGen 上色底圖。

> Colorize this fictional Taiwanese apartment entrance as a natural full-color photograph. Restore light cream and faint blush pink mosaic on the building wall, deep muted moss-green tiles on the arcade column, subdued dark forest-green painted steel door frame and brushed silver hardware, pale gray terrazzo with small muted warm stone fragments, fresh green leaves and a reddish-brown clay pot. Keep the outside softly cool with ordinary daylight and the shaded entrance gently muted, retaining the reflected sunlight on the stairs. This is a colorization/edit of the supplied fictional photograph. Preserve the exact camera position, panoramic 2:1 composition, architecture, object placement, perspective, lighting direction, shadows, and film grain. Return one photographic image. Reconstruct natural distinct local colors per material, with neutral highlights and multiple clearly identifiable hues. Do not apply any overall sepia wash, single-color tint, or vintage color cast. No additions, no new lettering, no logos, no text, no watermark.

**`taiwan-living-room-color.png`**

使用前一版的 `taiwan-living-room.png` 作為 ImageGen 上色底圖。

> Colorize this fictional Taiwanese apartment living room as a natural full-color photograph. Make the fabric sofa slate blue, with subtle brick and cream threads in the plaid cushion; use medium brown wood for the tea table, fresh varied green foliage in the window plants, a pale ivory tile floor, white lace curtains and warm but neutral daylight. Restore quiet light blue and cream building tiles outside. Keep distinct true-to-life blues, greens, warm browns and neutral whites, with a bright inviting afternoon interior. Preserve window highlight detail. This is a colorization/edit of the supplied fictional photograph. Preserve the exact camera position, panoramic 2:1 composition, architecture, object placement, perspective, lighting direction, shadows, and film grain. Return one photographic image. Reconstruct natural distinct local colors per material, with neutral highlights and multiple clearly identifiable hues. Do not apply any overall sepia wash, single-color tint, or vintage color cast. No additions, no new lettering, no logos, no text, no watermark.

**`taiwan-entry.png`（前一版底圖）**

> Second shot in a Taiwanese apartment homecoming film. Eye-level documentary wide angle from within the shaded entrance arcade of an ordinary 1990s Taiwanese walk-up apartment. At left show a dark tiled square column and part of an anonymous street beyond, composition then leads rightward to a half-open typical steel-and-glass security gate and a modest shared terrazzo stairwell beyond. Off-white tiny square wall tiles, brushed tubular steel handrail, old tiled threshold and a small unbranded plant pot. One slanted band of reflected street daylight cuts across the stairs, tactile, quiet and ordinary. Preserve visible architectural detail around middle of image even with narrow center crop. Wide 2:1 panoramic horizontal still, photorealistic fine-grain black-and-white film photography. Cohesive with a previous high-contrast grayscale still of a fictional narrow Taiwanese residential lane and small square tile facades. Original imaginary architecture, no landmark, no recognizable real property or company, no text, signs, logos, readable numbers, plates, people, watermark or graphics.

**`taiwan-living-room.png`（前一版底圖）**

> Final shot in a Taiwanese apartment homecoming film. Eye-level cinematic wide angle just inside a modest imagined 1990s Taiwanese apartment living room with a compact fabric sofa and simple dark wooden low table left, discreet split-unit AC, pale 60 cm square glossy ceramic floor tiles with grout lines, sliding aluminum window at center right and a modest balcony outside. Light through a gauzy curtain falls across the tiled floor, neighboring generic ceramic-tile apartments soft through the windows, practical furniture and a small plant. Quiet feeling of coming home, noticeably brighter and gentler midtones than the street scene, strong window light without white clipping. Visually important window in central 50 percent for mobile crop. Wide 2:1 panoramic horizontal still, photorealistic fine-grain black-and-white film photography. Cohesive with a previous high-contrast grayscale still of a fictional narrow Taiwanese residential lane and small square tile facades. Original imaginary architecture, no landmark, no recognizable real property or company, no text, signs, logos, readable numbers, plates, people, watermark or graphics.

**`hero-residence.png`（靜態版主圖）**

> Realistic architecture photograph of an invented everyday Taiwanese residential lane on a bright, softly cloudy day. Show three contiguous 4–5-storey mid-1990s walk-up apartments with pale buff and earthy red small square ceramic tile façades, practical shallow balconies with varied metal railings, aluminum windows, discreet wall AC outdoor units, a few balcony plants, tiled ground-level setback, a parked scooter seen from the side without a readable plate. Tidy, inhabited and ordinary, with gentle foliage and a few subtle signs of age, naturally composed from eye level in the lane. Warm neutral tones, natural documentary listing photography. Generate a new scene from these general characteristics, without reproducing any real property, listing photograph or exact location. No names, readable text, address numbers, business names, logos, watermarks, faces, legible plates or landmarks. Photorealistic, landscape 3:2.

**`woodland-home.png`**

> Realistic resale listing photograph of an invented 1990s Taiwanese three-bedroom walk-up apartment, camera standing just inside the living room. Show modest ivory square glossy ceramic floor tiles with grout lines, off-white walls, typical white wall-mounted split air conditioner, practical grey fabric sofa with a dark wood side table, a compact storage unit and dark aluminum sliding glass door to the shallow front balcony. Through glass, show muted leaves and parts of nearby generic tiled buildings. Soft light, accurate modest dimensions, plausible lived-in touches, clean, daylight white balance, no luxury designer interior. Generate a new scene from these general characteristics, without reproducing any real property, listing photograph or exact location. No names, readable text, address numbers, business names, logos, watermarks, faces, legible plates or landmarks. Photorealistic, landscape 3:2.

**`daylight-flat.png`**

> Realistic Taiwanese rental listing photograph of an original compact two-bedroom apartment living and dining area. White 60 cm porcelain floor tiles, off-white painted walls, economical wall-mount split air conditioner, basic light gray sofa, small laminate dining table, compact galley kitchenette visible through an opening, simple aluminum sliding window and utility balcony with washer visible in the distance. An ordinary neighboring apartment block partly visible across the lane; no skyline, rich wood flooring or luxury staging. Daylight, believable small dimensions, perspective from an ordinary wide lens without distortions. Generate a new scene from these general characteristics, without reproducing any real property, listing photograph or exact location. No names, readable text, address numbers, business names, logos, watermarks, faces, legible plates or landmarks. Photorealistic, landscape 3:2.

**`courtyard-house.png`**

> Realistic Taiwan resale listing photograph of a fictional 3-storey attached Taiwanese townhouse with a modest tiled front setback on a quiet neighborhood lane. Narrow vertical form with neighboring buildings, cream and muted warm gray ceramic tile cladding, aluminum sliding windows, slim projecting upper balconies with steel rails and a simple translucent awning. A partially open steel roller door reveals an unbranded car-free ground-floor garage, two big potted plants near the entrance, brushed concrete lane in foreground, mild tile weathering, ordinary daylight. Practical semi-outdoor parking space, not an estate garden. Generate a new scene from these general characteristics, without reproducing any real property, listing photograph or exact location. No names, readable text, address numbers, business names, logos, watermarks, faces, legible plates or landmarks. Photorealistic, landscape 3:2.
