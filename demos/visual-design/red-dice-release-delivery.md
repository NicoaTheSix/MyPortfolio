# v1.33 紅骰透光發布

2026-11-20 使用者以「部署上線」核准快照 `969e5c026d4c1b76800bbc225368a66165908dac`。批次：`portfolio-red-dice-transparency`；確認 ID：`portfolio-red-dice-user-approval-20261120`。正式版本 v1.32 → v1.33。

公開入口：[互動骰子](https://nicoathesix.github.io/MyPortfolio/demos/visual-design/?mode=dice)。

## 發布流程

1. 核對最新 origin/main 為核准快照祖先；保留其他工作目錄。
2. 核對產品程式與已確認快照一致；JavaScript 語法及網站 83 個資源與雙語入口檢查通過。
3. 更新 VERSION 及發布文件，建立 v1.33 正式提交與標籤，再快轉推送至既有 main 根目錄 Pages 發布。
4. 等待 Pages 工作結果，比對公開 VERSION、雙語 HTML、site.js 及 poster-dice.js，並在公開頁確認紅色材質、白點及互動。
5. 實際正式 commit、工作編號、公開比對與瀏覽器結果寫入中央事件，完成後才回報上線成功。

所有程式執行前列出絕對輸入輸出，依階段顯示進度。本機與遠端文本比對統一 CRLF/LF；不修改已核准的材質。

## 交付檔案

| 最終絕對路徑 | 變更類型 | 用途 |
|---|---|---|
| [VERSION](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/VERSION>) | 修改 | 正式版本 v1.33 |
| [README.md](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/README.md>) | 修改 | 專案發布流程 |
| [demos/visual-design/README.md](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/README.md>) | 修改 | 材質修訂與運作流程 |
| [demos/visual-design/three-dice.mjs](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/three-dice.mjs>) | 修改 | 清透紅色外殼與不透明白點 |
| [demos/visual-design/poster-dice.js](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/poster-dice.js>) | 修改 | 瀏覽器用打包程式 |
| [demos/visual-design/site.js](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/site.js>) | 修改 | 材質模組快取版本 |
| [demos/visual-design/index.html](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/index.html>) | 修改 | 中文入口快取版本 |
| [demos/visual-design/en/index.html](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/en/index.html>) | 修改 | 英文入口快取版本 |
| [demos/visual-design/red-dice-release-delivery.md](<C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/visual-spheres/demos/visual-design/red-dice-release-delivery.md>) | 新增 | 本次交付清單與發布流程 |
