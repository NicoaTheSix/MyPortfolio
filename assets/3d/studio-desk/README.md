# 黑白像素電腦桌

以使用者提供的桌面截圖和 [原始 SVG](../../pixel-studio-desk.svg) 為參考，在 [Higgsfield 3D Jutsu 專案](https://higgsfield.ai/3d-jutsu/69823a37-b240-42c9-b822-ce3d12efc182) 建立場景。第 2 版的本機輸出包含可編輯的 GLB 場景與 1000 × 800 的鏡頭預覽圖。

## 製作流程

1. 在 3D Jutsu 以公尺設定工作檯尺寸、物件位置、鏡頭與兩盞燈。初步渲染後檢查桌腳、桌上物件的接觸位置和整體構圖。
2. 為終端機、鍵盤、滑鼠、馬克杯、筆記本和星星補上各自的幾何及材質。電腦桌包含桌面、桌腳和三層抽屜。點陣和地板格線歸入獨立環境群組。
3. 從交付鏡頭渲染 [nicoa-pixel-desk.png](./nicoa-pixel-desk.png)，匯出 [nicoa-pixel-desk.glb](./nicoa-pixel-desk.glb)，並檢查匯出的八個物件根節點與子網格。

在 GLB 的場景樹中選取 `01 Desk` 至 `08 Lower star` 可分別移動或調整各物件。終端機群組包含螢幕與下方主機。兩顆星星各有自己的根節點。
