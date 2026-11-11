# 林達｜房地產個人網站示範

靜態繁體中文單頁。林達及住宅案例均為虛構，五張照片皆由 ImageGen 生成。瀏覽器直接載入本機檔案，表單在當前頁面示範驗證與送出。

## 開啟與操作

直接在瀏覽器開啟同目錄的 `index.html`，或在作品集根目錄執行 `npm run preview`，再開啟 <http://127.0.0.1:4173/MyPortfolio/demos/lin-da/>。網站使用相對路徑且無建置依賴。

1. HTML 顯示導覽、住宅案例、全身肖像、服務流程與諮詢區。CSS 依畫面寬度調整欄數。
2. `site.js` 首先在開發者工具的 Console 列出 HTML、CSS、JS、五張照片及頁面更新目標的絕對 URL。預覽程式也會先顯示專案輸入的絕對路徑與本機預覽 URL。
3. Console 接著顯示三階段進度，依序啟用住宅篩選、諮詢表單並回報就緒。案例展開使用瀏覽器原生的 `details` 元素。
4. 選擇住宅類型會更新卡片與可讀的結果數量。從案例開啟諮詢會預選主題，並在需求欄為空時帶入案例名稱。提交時檢查必填欄位，清空表單並在本頁顯示結果。表單不發送網路請求，也不將欄位寫入瀏覽器儲存空間。

## 輸入與輸出位置

- 簡介來源為 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\lin-da\profile.md`。
- 生成照歸檔於 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\lin-da\assets\images`，包含 `lin-da-full-body.png`、`hero-residence.png`、`woodland-home.png`、`daylight-flat.png` 與 `courtyard-house.png`。
- 網頁入口為 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\demos\lin-da\index.html`，同目錄包含 `styles.css` 與 `site.js`。互動在瀏覽器內輸出。

## 影像設定

觀察臺灣租屋與中古屋刊登常見的磁磚地坪、鋁窗、前陽台、分離式冷氣、透天車庫與遮雨棚。住宅照片以文字描述重新生成，網站中的影像與案例均為虛構。人物肖像的提示詞保存在 `profile.md`。

**`hero-residence.png`**

> Realistic architecture photograph of an invented everyday Taiwanese residential lane on a bright, softly cloudy day. Show three contiguous 4–5-storey mid-1990s walk-up apartments with pale buff and earthy red small square ceramic tile façades, practical shallow balconies with varied metal railings, aluminum windows, discreet wall AC outdoor units, a few balcony plants, tiled ground-level setback, a parked scooter seen from the side without a readable plate. Tidy, inhabited and ordinary, with gentle foliage and a few subtle signs of age, naturally composed from eye level in the lane. Warm neutral tones, natural documentary listing photography. Generate a new scene from these general characteristics, without reproducing any real property, listing photograph or exact location. No names, readable text, address numbers, business names, logos, watermarks, faces, legible plates or landmarks. Photorealistic, landscape 3:2.

**`woodland-home.png`**

> Realistic resale listing photograph of an invented 1990s Taiwanese three-bedroom walk-up apartment, camera standing just inside the living room. Show modest ivory square glossy ceramic floor tiles with grout lines, off-white walls, typical white wall-mounted split air conditioner, practical grey fabric sofa with a dark wood side table, a compact storage unit and dark aluminum sliding glass door to the shallow front balcony. Through glass, show muted leaves and parts of nearby generic tiled buildings. Soft light, accurate modest dimensions, plausible lived-in touches, clean, daylight white balance, no luxury designer interior. Generate a new scene from these general characteristics, without reproducing any real property, listing photograph or exact location. No names, readable text, address numbers, business names, logos, watermarks, faces, legible plates or landmarks. Photorealistic, landscape 3:2.

**`daylight-flat.png`**

> Realistic Taiwanese rental listing photograph of an original compact two-bedroom apartment living and dining area. White 60 cm porcelain floor tiles, off-white painted walls, economical wall-mount split air conditioner, basic light gray sofa, small laminate dining table, compact galley kitchenette visible through an opening, simple aluminum sliding window and utility balcony with washer visible in the distance. An ordinary neighboring apartment block partly visible across the lane; no skyline, rich wood flooring or luxury staging. Daylight, believable small dimensions, perspective from an ordinary wide lens without distortions. Generate a new scene from these general characteristics, without reproducing any real property, listing photograph or exact location. No names, readable text, address numbers, business names, logos, watermarks, faces, legible plates or landmarks. Photorealistic, landscape 3:2.

**`courtyard-house.png`**

> Realistic Taiwan resale listing photograph of a fictional 3-storey attached Taiwanese townhouse with a modest tiled front setback on a quiet neighborhood lane. Narrow vertical form with neighboring buildings, cream and muted warm gray ceramic tile cladding, aluminum sliding windows, slim projecting upper balconies with steel rails and a simple translucent awning. A partially open steel roller door reveals an unbranded car-free ground-floor garage, two big potted plants near the entrance, brushed concrete lane in foreground, mild tile weathering, ordinary daylight. Practical semi-outdoor parking space, not an estate garden. Generate a new scene from these general characteristics, without reproducing any real property, listing photograph or exact location. No names, readable text, address numbers, business names, logos, watermarks, faces, legible plates or landmarks. Photorealistic, landscape 3:2.
