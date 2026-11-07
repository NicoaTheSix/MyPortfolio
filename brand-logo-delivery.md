# Nicoa'Lab 網站 Logo 替換交付

狀態：實作及本機驗證完成，待使用者確認網站版面；尚未推送或部署。正式網站版本維持 v1.06。工作快照標記：snapshot/portfolio-nicoa-lab-logo-20261107/r02，實際 SHA 以中央結果事件與聊天交付為準。

來源：通用廣告部門對話 01a16809-bb0c-7363-8d90-79bd1aa35481，原始使用者訊息 01a1b647-4125-7a53-92df-43a0ec69c18a 已核對，指示將兩款 Logo 作為標準並交給 Portfolio 替換。品牌素材核准 nicoa-lab-logo-standard-confirmation-20261107-01；這不是網站成品驗收。原圖來自 D:\VIDEOS\designs\nicoa-lab-brand-icon\standards，版本 v1.01。

## 完成內容

- 中英文首頁：桌面頁首、主視覺、頁尾使用橫式 Nicoa'Lab 字標，720px 以下頁首使用單字母標誌。
- 三頁文章區：共用頁首、頁尾與 PNG favicon；既有文章內容、canonical 及原始圖片不變。
- 原始 PNG 保留位元組及 SHA；等比縮小產生五份 lossless WebP 與三份 PNG favicon／Apple touch icon。保留雙框、原色、完整畫布與留白；沒有裁切或重繪。
- 移除舊首頁 JavaScript SVG 字形生成。更新預覽 WebP MIME 與白名單；共用 brand.mjs 及 brand.css 防止雙語頁面不同步。
- 個人公開名稱、介紹、服務海報、名片、產品圖示與影片保持原內容。

## 實際檢查

- 固定來源 SHA：symbol 79a19ca983aa4a02462b271d17a96dd0371809761f2ee3a098b7f43ce5ea1c90；wordmark 66b9272baf203eaf1e35a07d5fd3010b05714dbc3049c6e5f6bf32c4d49505b0。
- 十份原圖／縮圖的 HTTP SHA、尺寸比例及 PNG／WebP MIME，以及六份品牌頁面／樣式內容比對通過。
- 既有首頁雙語、42 個資源與跨頁錨點、服務動畫、文章隔離發布／安全 HTML、83 主要頁 GTM 檢查通過。
- 瀏覽器確認預設桌面、768px 英文、320px 中英文首頁與文章區、390px 首頁無水平溢出；手機載入 symbol，桌面載入 wordmark，主視覺及頁尾維持 3:1。文章頁尾已目視確認。
- 肖像關閉及重開仍正常，瀏覽器 warning/error 為零。替代文字為 Nicoa'Lab。

## 開啟預覽

中文：http://127.0.0.1:4199/MyPortfolio/

英文：http://127.0.0.1:4199/MyPortfolio/en/

文章：http://127.0.0.1:4199/MyPortfolio/blog/

截圖：.preview/nicoa-lab-logo-desktop.png、.preview/nicoa-lab-logo-mobile.png、.preview/nicoa-lab-logo-blog.png（絕對路徑列於下表）。

## 逐檔交付

| 變更 | 最終絕對路徑 | 用途 |
|---|---|---|
| 新增 | [.preview/nicoa-lab-logo-blog.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\nicoa-lab-logo-blog.png>) | 本機驗收畫面 |
| 新增 | [.preview/nicoa-lab-logo-desktop.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\nicoa-lab-logo-desktop.png>) | 本機驗收畫面 |
| 新增 | [.preview/nicoa-lab-logo-mobile.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\nicoa-lab-logo-mobile.png>) | 本機驗收畫面 |
| 新增 | [assets/brand/nicoa-lab-symbol-128.webp](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\nicoa-lab-symbol-128.webp>) | 核准Logo等比網站尺寸 |
| 新增 | [assets/brand/nicoa-lab-symbol-180.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\nicoa-lab-symbol-180.png>) | 核准Logo等比網站尺寸 |
| 新增 | [assets/brand/nicoa-lab-symbol-256.webp](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\nicoa-lab-symbol-256.webp>) | 核准Logo等比網站尺寸 |
| 新增 | [assets/brand/nicoa-lab-symbol-32.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\nicoa-lab-symbol-32.png>) | 核准Logo等比網站尺寸 |
| 新增 | [assets/brand/nicoa-lab-symbol-64.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\nicoa-lab-symbol-64.png>) | 核准Logo等比網站尺寸 |
| 新增 | [assets/brand/nicoa-lab-wordmark-1440.webp](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\nicoa-lab-wordmark-1440.webp>) | 核准Logo等比網站尺寸 |
| 新增 | [assets/brand/nicoa-lab-wordmark-360.webp](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\nicoa-lab-wordmark-360.webp>) | 核准Logo等比網站尺寸 |
| 新增 | [assets/brand/nicoa-lab-wordmark-720.webp](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\nicoa-lab-wordmark-720.webp>) | 核准Logo等比網站尺寸 |
| 新增 | [assets/brand/README.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\README.md>) | 品牌建置、版型、溯源與維護流程 |
| 新增 | [assets/brand/source-manifest.json](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\source-manifest.json>) | 品牌建置、版型、溯源與維護流程 |
| 新增 | [assets/brand/source/nicoa-lab-symbol.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\source\nicoa-lab-symbol.png>) | 核准原圖無損副本 |
| 新增 | [assets/brand/source/nicoa-lab-wordmark.png](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\brand\source\nicoa-lab-wordmark.png>) | 核准原圖無損副本 |
| 修改 | [blog/en/index.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\en\index.html>) | 品牌頁首、主視覺或頁尾 |
| 修改 | [blog/index.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\index.html>) | 品牌頁首、主視覺或頁尾 |
| 修改 | [blog/mitre-att-ck-introduction/index.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\mitre-att-ck-introduction\index.html>) | 品牌頁首、主視覺或頁尾 |
| 新增 | [brand-logo-delivery.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\brand-logo-delivery.md>) | 品牌建置、版型、溯源與維護流程 |
| 新增 | [brand.css](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\brand.css>) | 品牌建置、版型、溯源與維護流程 |
| 新增 | [brand.mjs](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\brand.mjs>) | 品牌建置、版型、溯源與維護流程 |
| 修改 | [build-blog.mjs](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\build-blog.mjs>) | 品牌建置、版型、溯源與維護流程 |
| 新增 | [build-brand-assets.py](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\build-brand-assets.py>) | 品牌建置、版型、溯源與維護流程 |
| 修改 | [en/index.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\en\index.html>) | 品牌頁首、主視覺或頁尾 |
| 修改 | [index.html](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\index.html>) | 品牌頁首、主視覺或頁尾 |
| 修改 | [README.md](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\README.md>) | 品牌建置、版型、溯源與維護流程 |
| 修改 | [script.js](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\script.js>) | 品牌建置、版型、溯源與維護流程 |
| 修改 | [serve.mjs](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\serve.mjs>) | 品牌建置、版型、溯源與維護流程 |
| 新增 | [sync-brand.mjs](<C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\sync-brand.mjs>) | 品牌建置、版型、溯源與維護流程 |
