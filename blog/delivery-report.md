# Blog 主要文章版本交付紀錄

批次：portfolio-blog-20261106；來源對話：01a180bd-dd2d-7dd0-980d-2a516ebfb8b8。
來源指令：建立 /blog/ 作為文章主要版本；第一篇採用使用者指定 Medium 文章 8968e5dd7e76。
起點 commit：c58845548a822125af51950953fc1a8bb3dfba8f；交付快照 c5af03495f852647073a127bac6bf3d1ed8c116f 已由使用者於 2026-11-06 以「驗收完畢 開始部署」確認，正式升至 v1.03 並沿用 GitHub Pages 流程發布。以下檢查與素材清單為交付快照的紀錄；實際部署結果以中央事件及公開內容比對為準。

## 已完成與驗證

- 三個靜態頁面：繁中索引、英文索引、繁中原文。原文措辭與 11 段文字、四張原圖經雜湊核對；沒有自動翻譯正文。
- 固定網址、self-canonical、BlogPosting、RSS 摘要及 blog 範圍 sitemap；首頁導覽與入口卡片。
- node check-blog.mjs --url http://127.0.0.1:4197/MyPortfolio/blog/ 通過：11 個 HTTP 產物、來源阻擋、發布／重建／撤稿及危險 HTML 清理。
- node check-site.mjs、node check-pixel-homepages.mjs、node sync-google-tag.mjs --check 通過：雙語錨點、38 個首頁資源、十六張動畫影格表、81 頁 GTM。此為程式碼檢查，不代表 GA4 實際收數已驗證。
- 桌面 1280 px、手機 390／320 px 無水平溢出；中英文首頁文章導覽在手機可見。四張文章圖片載入，白色標誌可見；未發現瀏覽器 warning／error。
- 交付快照的 git diff --check 通過；驗收後只增加 VERSION 與驗收／發布紀錄，建立 v1.03 正式標籤，部署設定保持既有值。

## 本機預覽及主要版本

- 索引：http://127.0.0.1:4197/MyPortfolio/blog/
- 文章：http://127.0.0.1:4197/MyPortfolio/blog/mitre-att-ck-introduction/
- 部署後 canonical：https://nicoathesix.github.io/MyPortfolio/blog/mitre-att-ck-introduction/
- Medium 原文：https://medium.com/@nick5901879/8968e5dd7e76；本站 self-canonical 不會修改 Medium 的 canonical，也不保證搜尋引擎立刻選本站。
- 公開 GitHub repo 的 Markdown 來源不屬於私密資料；草稿只會退出公開索引、RSS、sitemap 和生成頁。

## 產出檔案

| 檔名 | 變更 | 用途 | 最終絕對路徑 |
| --- | --- | --- | --- |
| .gitattributes | modified | 保留文章來源位元組與雜湊 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.gitattributes |
| blog/assets/images/mitre-att-ck-introduction/attack-logo.png | created | 保留原檔的文章附圖；來源 URL 與 SHA-256 見 source.json | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\assets\images\mitre-att-ck-introduction\attack-logo.png |
| blog/assets/images/mitre-att-ck-introduction/cover.png | created | 保留原檔的文章附圖；來源 URL 與 SHA-256 見 source.json | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\assets\images\mitre-att-ck-introduction\cover.png |
| blog/assets/images/mitre-att-ck-introduction/enterprise-matrix.png | created | 保留原檔的文章附圖；來源 URL 與 SHA-256 見 source.json | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\assets\images\mitre-att-ck-introduction\enterprise-matrix.png |
| blog/assets/images/mitre-att-ck-introduction/mitre-attack-white-logo.png | created | 保留原檔的文章附圖；來源 URL 與 SHA-256 見 source.json | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\assets\images\mitre-att-ck-introduction\mitre-attack-white-logo.png |
| blog/blog.css | created | 文章頁與索引的響應式樣式 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\blog.css |
| blog/en/index.html | created | 英文介面的文章索引 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\en\index.html |
| blog/feed.xml | created | RSS 訂閱摘要 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\feed.xml |
| blog/import-medium.mjs | created | 指定 Medium 文章一次性匯入 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\import-medium.mjs |
| blog/index.html | created | 繁體中文文章索引 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\index.html |
| blog/mitre-att-ck-introduction/index.html | created | 第一篇文章公開閱讀頁 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\mitre-att-ck-introduction\index.html |
| blog/posts/mitre-att-ck-introduction/article.md | created | 本站後續編輯主要來源 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\posts\mitre-att-ck-introduction\article.md |
| blog/posts/mitre-att-ck-introduction/meta.json | created | 文章標題、摘要、日期與發布資訊 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\posts\mitre-att-ck-introduction\meta.json |
| blog/posts/mitre-att-ck-introduction/source.json | created | Medium 來源、原圖及初始內容雜湊 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\posts\mitre-att-ck-introduction\source.json |
| blog/README.md | created | 文章編輯、匯入及建置流程 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\README.md |
| blog/sitemap.xml | created | 僅限 blog 的 sitemap | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\sitemap.xml |
| blog/source-manifest.json | created | 公開產物、文章網址與 Markdown 雜湊 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\source-manifest.json |
| build-blog.mjs | created | Markdown 靜態文章產生器 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\build-blog.mjs |
| check-blog.mjs | created | 文章、草稿、來源與 HTTP 驗證 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\check-blog.mjs |
| en/index.html | modified | 英文首頁文章導覽與入口卡片 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\en\index.html |
| home-pixel.css | modified | 手機版文章導覽與間距 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\home-pixel.css |
| index.html | modified | 中文首頁文章導覽與入口卡片 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\index.html |
| package.json | modified | 文章建置與檢查指令 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\package.json |
| README.md | modified | 根目錄程式流程與待驗收紀錄 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\README.md |
| serve.mjs | modified | 本機公開頁白名單與 XML MIME | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\serve.mjs |
| sync-google-tag.mjs | modified | 將 blog 頁面納入共用 GTM 檢查 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\sync-google-tag.mjs |
| blog/delivery-report.md | created | 本批交付與溯源清單 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\delivery-report.md |

## 本機預覽素材

- C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\blog-index-desktop.png （created，瀏覽器預覽截圖，SHA-256：424663335e1c04077e1a9de6efa0086c9b5ca7264af7223f4c787a8b21dbecd2）
- C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\blog-article-desktop.png （created，瀏覽器預覽截圖，SHA-256：c89cfbf22d88deb7ddfc4e02deaf9caaa0f4e1cc3ce032597adcc3a0cf1f3f52）
- C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\blog-article-mobile.png （created，瀏覽器預覽截圖，SHA-256：0ba823f9703667ac2280c09f3d3b225497c8b67af5cb8ba4702993a71393aaf2）

截圖保留於 .preview，依既有 Git 忽略規則不加入網站儲存庫。中央事件附本批指令、來源與快照；寫入事件不等於儀表板 UI 或雙向確認已接通。

## 驗收後正式發布修改

| 檔名 | 變更 | 用途 | 最終絕對路徑 |
| --- | --- | --- | --- |
| VERSION | modified | 正式版本 v1.03 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\VERSION |
| README.md | modified | 驗收與正式發布流程 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\README.md |
| blog/delivery-report.md | modified | 驗收與發布交付紀錄 | C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog\delivery-report.md |
