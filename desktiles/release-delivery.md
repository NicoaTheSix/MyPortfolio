# DeskTiles 雙平台網站發布交付

網站版本：v1.05 → v1.06；應用程式版本：v1.01。本批來源為 DeskTile 專員轉交的使用者明確部署授權，選用 A 圓角幾何 Logo。來源發行提交 e3ddc9b95d34f0c8716697908ba749aa2d553e8f；文件校正提交 2f5678e2e1d67701dbe639af5b1817a2e3f7d3ae。網站整合遠端 ce9893055f04b6a23acd043df815bf0260d2344e，保留既有網址與其他已發布功能。

更新首頁雙語作品卡、八頁文件、舊 Mac 網址相容、平滑 SVG/PNG、Windows 控制面板／鬧鐘／啟動同意截圖、兩平台 ZIP 與校驗檔。既有 Windows 示範影片未重製，已註明介面差異。完整來源及逐檔雜湊見 source-manifest.json。

## 已執行驗證

- 八頁標題、唯一 ID、542 個站內引用、87 筆雙語搜尋與 29 份素材／下載雜湊通過。
- 本機 41 份 HTTP 產物逐檔比對、兩平台 ZIP MIME、MP4 MIME／206 Range 通過。
- ZIP 內 EXE 串流 SHA256 與正式來源一致，未啟動應用程式。
- 首頁雙語與像素動畫、Blog 原文及隔離安全檢查、全站 83 主要頁 GTM 通過；舊 macos.html 與新指南內容相同，保留 GTM。
- 瀏覽器確認桌面、320px 中英文專區與 Mac 指南、390px 首頁作品卡無水平溢出，Logo image-rendering:auto、雙平台入口與語言切換正常；搜尋 v3 找到 11 筆相關章節。瀏覽器無 warning/error。

## 套件完整性

| 檔案 | bytes | SHA-256 |
|---|---:|---|
| Windows ZIP | 504041 | 507C4B6DC30CA8D50418D4EE83A60847E0CBC3CDBB04B31CB328D4A9FC0FD79E |
| ZIP 內 Windows EXE | 1068032 | DC69FBB53EA3454954B0140983D48227F0F21A7AA7D857AFE4002FF093A90606 |
| macOS Universal 2 ZIP | 425519 | 9A4182F469863228F3B63F5899C2BA3FB269541632D4849C3447E7672EFA7032 |

## 已知限制

Windows 鬧鐘重啟啟用問題仍待修復，登入啟動預設關閉。Mac 未 Developer ID 簽章／Apple 公證、Intel 實機與多螢幕等尚待驗證，未提供 Windows 鬧鐘、語言切換及登入啟動。Windows 匯出 v3、讀取 v1–v3；Mac 僅 v1/v2，無法直接匯入 Windows v3，即使沒有鬧鐘亦同；Windows 可匯入 Mac v2。網站未重跑專案應用程式測試。

## 檔案交付清單

下表包含本批及整合遠端更新的檔案。新增／修改以 v1.05 為基準。完整絕對路徑供本機開啟；中央結果事件另記逐檔大小與雜湊。

| 類型 | 檔案絕對路徑 | 用途 |
|---|---|---|
| 新增 | [add-macos-download.py](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\add-macos-download.py>) | 來源文件、範例或校驗 |
| 修改 | [build-desktiles.mjs](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\build-desktiles.mjs>) | 發布建置、檢查或版型 |
| 修改 | [check-desktiles.mjs](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\check-desktiles.mjs>) | 發布建置、檢查或版型 |
| 新增 | [desktiles/assets/alarm-en.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\assets\alarm-en.png>) | Logo／應用程式畫面 |
| 新增 | [desktiles/assets/alarm.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\assets\alarm.png>) | Logo／應用程式畫面 |
| 修改 | [desktiles/assets/control-en.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\assets\control-en.png>) | Logo／應用程式畫面 |
| 修改 | [desktiles/assets/control.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\assets\control.png>) | Logo／應用程式畫面 |
| 修改 | [desktiles/assets/DeskTiles-logo.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\assets\DeskTiles-logo.png>) | Logo／應用程式畫面 |
| 修改 | [desktiles/assets/DeskTiles.svg](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\assets\DeskTiles.svg>) | Logo／應用程式畫面 |
| 新增 | [desktiles/assets/reminder.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\assets\reminder.png>) | Logo／應用程式畫面 |
| 新增 | [desktiles/assets/startup-consent.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\assets\startup-consent.png>) | Logo／應用程式畫面 |
| 新增 | [desktiles/content/mac-en.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\content\mac-en.md>) | 發布版本與維護紀錄 |
| 修改 | [desktiles/content/readme-en.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\content\readme-en.md>) | 發布版本與維護紀錄 |
| 修改 | [desktiles/desktiles.css](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\desktiles.css>) | 發布建置、檢查或版型 |
| 新增 | [desktiles/downloads/DeskTiles-macOS-universal.zip](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\DeskTiles-macOS-universal.zip>) | 新版完整下載包 |
| 修改 | [desktiles/downloads/DeskTiles-Windows-x64.zip](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\DeskTiles-Windows-x64.zip>) | 新版完整下載包 |
| 新增 | [desktiles/downloads/example-macos.json](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\example-macos.json>) | 來源文件、範例或校驗 |
| 修改 | [desktiles/downloads/guide-en.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\guide-en.md>) | 來源文件、範例或校驗 |
| 新增 | [desktiles/downloads/guide-macos-zh.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\guide-macos-zh.md>) | 來源文件、範例或校驗 |
| 修改 | [desktiles/downloads/guide-zh.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\guide-zh.md>) | 來源文件、範例或校驗 |
| 新增 | [desktiles/downloads/icon-update-delivery.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\icon-update-delivery.md>) | 來源文件、範例或校驗 |
| 新增 | [desktiles/downloads/mac-en.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\mac-en.md>) | 來源文件、範例或校驗 |
| 修改 | [desktiles/downloads/readme-en.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\readme-en.md>) | 來源文件、範例或校驗 |
| 新增 | [desktiles/downloads/README-macOS.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\README-macOS.md>) | 來源文件、範例或校驗 |
| 修改 | [desktiles/downloads/README.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\README.md>) | 來源文件、範例或校驗 |
| 新增 | [desktiles/downloads/SHA256SUMS-macOS.txt](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\SHA256SUMS-macOS.txt>) | 來源文件、範例或校驗 |
| 修改 | [desktiles/downloads/SHA256SUMS.txt](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\SHA256SUMS.txt>) | 來源文件、範例或校驗 |
| 新增 | [desktiles/downloads/THIRD-PARTY-NOTICES-macOS.txt](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\THIRD-PARTY-NOTICES-macOS.txt>) | 來源文件、範例或校驗 |
| 修改 | [desktiles/downloads/validation.txt](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\downloads\validation.txt>) | 來源文件、範例或校驗 |
| 修改 | [desktiles/en/guide.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\en\guide.html>) | 雙語網站頁面 |
| 修改 | [desktiles/en/index.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\en\index.html>) | 雙語網站頁面 |
| 新增 | [desktiles/en/mac.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\en\mac.html>) | 雙語網站頁面 |
| 修改 | [desktiles/en/readme.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\en\readme.html>) | 雙語網站頁面 |
| 修改 | [desktiles/guide.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\guide.html>) | 雙語網站頁面 |
| 修改 | [desktiles/index.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\index.html>) | 雙語網站頁面 |
| 新增 | [desktiles/mac.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\mac.html>) | 雙語網站頁面 |
| 新增 | [desktiles/MACOS-PUBLISHING.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\MACOS-PUBLISHING.md>) | 發布版本與維護紀錄 |
| 新增 | [desktiles/macos.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\macos.html>) | 雙語網站頁面 |
| 新增 | [desktiles/publish-content.mjs](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\publish-content.mjs>) | 發布建置、檢查或版型 |
| 修改 | [desktiles/readme.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\readme.html>) | 雙語網站頁面 |
| 修改 | [desktiles/README.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\README.md>) | 發布版本與維護紀錄 |
| 新增 | [desktiles/release-delivery.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\release-delivery.md>) | 發布版本與維護紀錄 |
| 新增 | [desktiles/release.mjs](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\release.mjs>) | 發布建置、檢查或版型 |
| 修改 | [desktiles/search-index.json](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\search-index.json>) | 發布版本與維護紀錄 |
| 修改 | [desktiles/source-manifest.json](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\source-manifest.json>) | 發布版本與維護紀錄 |
| 修改 | [desktiles/validation-report.json](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\desktiles\validation-report.json>) | 發布版本與維護紀錄 |
| 修改 | [en/index.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\en\index.html>) | 雙語網站頁面 |
| 修改 | [home-pixel.css](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\home-pixel.css>) | 發布建置、檢查或版型 |
| 修改 | [index.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\index.html>) | 雙語網站頁面 |
| 修改 | [README.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\README.md>) | 發布版本與維護紀錄 |
| 修改 | [VERSION](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\VERSION>) | 發布版本與維護紀錄 |
