# 中英文服務圖片更新

本目錄的 `update.mjs` 使用使用者在 2026-10-31 提供的八張 PNG，原樣複製至網站 `assets/service-{development,scratch,translation,office}-{zh,en}.png`，不修改來源圖片。英文來源為 Pictures 中四張 ChatGPT Image，中文來源為 Downloads 中 download.png、download (1).png、download (2).png、download (3).png；程式內記錄精確對應。

於網站根目錄執行 `node .\service-images\update.mjs`。執行前會列出所有來源與輸出的絕對路徑，依四階段驗證 PNG 與尺寸、原樣複製八份素材並核對 SHA-256、更新中英文首頁、確認語言及預覽入口。已有新版版面的首頁會略過結構轉換，因此可重跑複製原圖。

四項圖卡服務依序為程式開發、Scratch 教學、中英翻譯、文書處理。2026-10-31 依使用者要求移除文章寫作服務；更新器會移除舊的獨立寫作區塊，同步調整兩頁 SEO 描述、服務引言與服務介紹，重跑不會恢復寫作服務。作品區的文章與筆記連結保留。首頁圖片完整顯示原比例，使用相同語言圖片；每張可透過既有 script.js 對話框放大、關閉及下載。舊的合併服務小卡不再出現在首頁，原始舊素材留存。新樣式獨立放在根目錄 service-cards.css，預覽白名單位於 serve.mjs。

手機寬度 720px 以下，只顯示四張服務圖片與標籤，隱藏圖片下方的分類、標題、說明、交期與詢問連結；桌面維持完整文字。文書圖卡補上 Word／Excel／OCR 與公式計算／批次處理標籤。

執行後使用 `node .\check-site.mjs` 檢查兩頁語言、圖片路徑、PNG、錨點、替代文字、預覽對話框及英文內容，再執行 `node .\sync-google-tag.mjs --check`。執行 `node .\serve.mjs` 預覽 `/MyPortfolio/#services` 與 `/MyPortfolio/en/#services`，確認桌面及手機無裁切、水平溢出，並操作放大、Escape、下載與語言切換。這些程式同樣先列出絕對輸入／輸出位置及各階段進度。

`node .\service-images\verify.mjs 'http://127.0.0.1:4184/MyPortfolio/'` 先列出本機檔案絕對路徑與網站絕對 URL，再以三階段、每批四個 HTTP 請求，核對兩頁 HTML、樣式及八張 PNG 的 HTTP 200、內容與圖片 SHA-256；不寫入檔案。發布後將 URL 換成 `https://nicoathesix.github.io/MyPortfolio/`。文字比對容許 Git 的 CRLF／LF 換行差異，PNG 必須位元相同。

2026-10-31 驗證：兩頁結構、語言與連結檢查通過，原有 72 頁 GTM 檢查通過。瀏覽器檢查 1440px 桌面、390px 與 320px 手機，無水平溢出；四項服務放大入口、關閉／Escape 及保留 #services 的語言切換正常。手機兩語言僅顯示圖與標籤，桌面四張標題與說明仍可見。11 個本機 HTTP 檔案內容一致；下載連結與原圖已核對，瀏覽器下載事件等待未能返回完成訊號，未將其列為成功的實際下載測試。截圖保存在不發布的 `.preview/`。
