# 黑白像素電腦桌

以使用者提供的桌面截圖和 [原始 SVG](../../pixel-studio-desk.svg) 為參考，在 [Higgsfield 3D Jutsu 專案](https://higgsfield.ai/3d-jutsu/69823a37-b240-42c9-b822-ce3d12efc182) 建立場景。第 5 版包含 2.5 公分薄冊與 10.8 公分厚精裝書，並拉開薄冊與桌面的距離。左側抽屜及右側終端機沿用第 3 版配置。輸出為可編輯的 GLB 與 850 × 680 的透明鏡頭圖。

## 製作流程

1. 在 3D Jutsu 以公尺設定工作檯尺寸、物件位置、鏡頭與兩盞燈。初步渲染後檢查桌腳、桌上物件的接觸位置和整體構圖。
2. 為終端機、鍵盤、滑鼠、馬克杯、桌上筆記本、兩顆星星與三本浮空書建立獨立幾何。點陣格線與粒子分屬兩個環境群組。
3. 從交付鏡頭渲染 [nicoa-pixel-desk.png](./nicoa-pixel-desk.png)，並匯出 [nicoa-pixel-desk.glb](./nicoa-pixel-desk.glb)。透明鏡頭圖用於 WebGL 不可用的情況，環境則由網頁繪製。

在 GLB 的場景樹中選取 `01 Desk` 至 `11 Thick hardcover` 可分別移動或調整各物件。首頁的 2D 文字、粒子、星星與書本在視窗後方隨捲動飄移。重新匯出 GLB 後，在網站根目錄執行 `npm run build:studio` 更新雙語首頁共用的腳本。
