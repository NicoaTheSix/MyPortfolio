# v1.32 發布交付

使用者已確認快照 `01932e169b89cf50d31c6a6be10d3b56dfcf993a`；批次 `portfolio-visual-liquid-controls`，確認 ID `portfolio-visual-liquid-controls-user-approval-20261119`。正式版本 v1.31 → v1.32。

公開入口：[互動骰子](https://nicoathesix.github.io/MyPortfolio/demos/visual-design/?mode=dice)。沿用 main 根目錄 GitHub Pages。實際發布 commit、工作編號及部署結果記入中央活動事件。

## 流程與檢查

1. 核對 origin/main 是已確認快照的祖先，保留現有線上內容與其他工作目錄。
2. 已驗證四種效果、五種色調、粗細及透明度的兩端值、開關、網址保留、雙語與手機版面；未修改已確認的產品程式。
3. 網站 83 個資源與雙語入口、前端語法及 Git 差異檢查通過。舊首頁像素檢查仍預期四張服務卡，目前已有五張；該區與檢查器相對正式版無變更。Google tag 原始檢查對 CRLF 敏感；以記憶體正規化換行核對，不改既有文件與追蹤設定。
4. 更新版本及發布文件，建立 v1.32 提交與標籤，快轉推送 main。
5. 等待 Pages 工作結果，再核對公開版 VERSION、首頁入口、雙語展示、CSS 與打包 JS；於瀏覽器操作正式頁。

所有程式執行前列出絕對輸入與輸出路徑並回報各階段進度。此清單依相對 origin/main 的實際檔案變更生成；檔案大小及 SHA-256 記入中央事件。

## 檔案清單

| 檔案（最終絕對路徑） | 類型 | 用途 |
|---|---|---|
| [README.md](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/README.md>) | 修改 | 專案入口與發布流程 |
| [demos/visual-design/README.md](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/README.md>) | 修改 | 操作、建置與發布維護說明 |
| [demos/visual-design/build-dice.mjs](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/build-dice.mjs>) | 新增 | 靜態打包與進度顯示 |
| [demos/visual-design/dice-physics.mjs](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/dice-physics.mjs>) | 新增 | 三種骰子碰撞與慣性 |
| [demos/visual-design/en/index.html](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/en/index.html>) | 修改 | 英文展示與外觀控制 |
| [demos/visual-design/index.html](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/index.html>) | 修改 | 中文展示與外觀控制 |
| [demos/visual-design/liquid-glass.mjs](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/liquid-glass.mjs>) | 新增 | 四種軌跡、色調與透明度 |
| [demos/visual-design/poster-dice.js](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/poster-dice.js>) | 新增 | 公開瀏覽器打包程式 |
| [demos/visual-design/site.js](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/site.js>) | 修改 | 模式與參數控制 |
| [demos/visual-design/style.css](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/style.css>) | 修改 | 灰底圓角場景及響應式面板 |
| [demos/visual-design/three-dice.mjs](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/three-dice.mjs>) | 新增 | 3D 材質與效果合成 |
| [en/index.html](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/en/index.html>) | 修改 | 英文首頁骰子入口 |
| [index.html](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/index.html>) | 修改 | 中文首頁骰子入口 |
| [package-lock.json](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/package-lock.json>) | 修改 | 鎖定物理引擎依賴 |
| [package.json](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/package.json>) | 修改 | 新增物理引擎依賴 |
| [serve.mjs](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/serve.mjs>) | 修改 | 本機打包檔預覽白名單 |
| [VERSION](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/VERSION>) | 修改 | 正式版本 v1.32 |
| [demos/visual-design/release-delivery.md](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/release-delivery.md>) | 新增 | 本次完整交付清單 |
