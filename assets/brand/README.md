# 現行品牌來源：v1.02 外圍透明版

標準來源位於 `D:\VIDEOS\designs\nicoa-lab-brand-icon\standards`。已核對使用者核准 `nicoa-lab-logo-outside-alpha-confirmation-20261108-01`。目前工作區使用兩張 `nicoa-lab-{symbol,wordmark}-transparent.png` 的原圖副本及等比衍生檔；`source-manifest.json` 記錄 SHA、路徑與尺寸。使用獨立透明版檔名，讓瀏覽器直接請求新檔。

`build-brand-assets.py` 不移除或重建底圖，只對既有 RGBA 圖進行等比 LANCZOS 縮小。重新解碼後驗證四角 alpha 為 0，中心 alpha 至少 250（核准原圖中央為 254），保留框內底色。所有當前尺寸與用途沿用歷史版下方表格，檔名加入 `-transparent-`。流程與命令見根目錄 README。

以下為 v1.01 白底版歷史說明；不再用作現行品牌引用。

# Nicoa'Lab 網站品牌素材

使用者在通用廣告部門對話 01a16809-bb0c-7363-8d90-79bd1aa35481 明確核准單字母與橫式字標，並指示 Portfolio 換用此組。品牌素材版本 v1.01；來源確認 nicoa-lab-logo-standard-confirmation-20261107-01。此核准不代表網站排版已驗收或已部署。

標準來源：`D:\VIDEOS\designs\nicoa-lab-brand-icon\standards`。原始 PNG 無損副本放在 `source/`，SHA-256 分別為：

- symbol：79a19ca983aa4a02462b271d17a96dd0371809761f2ee3a098b7f43ce5ea1c90，1254×1254。
- wordmark：66b9272baf203eaf1e35a07d5fd3010b05714dbc3049c6e5f6bf32c4d49505b0，2172×724。

僅做全畫布等比縮小，沒有裁掉留白、改色、透明化或重畫字形。Pillow LANCZOS 下採樣後保存 lossless WebP；favicon 為 PNG。來源為不透明、含輕微色差的核准原圖；保持雙黑框與淺底。品牌參考色為 #111111 / #F6F4F4，沒有將來源強制二值化或調色。

| 網站用途 | 檔案 |
|---|---|
| 桌面／平板頁首、頁尾 | wordmark-360.webp / wordmark-720.webp |
| 首頁主視覺 | wordmark-720.webp / wordmark-1440.webp |
| 720px 以下頁首 | symbol-128.webp / symbol-256.webp |
| favicon / Apple touch icon | symbol-32.png / symbol-64.png / symbol-180.png |

以上檔名均以前綴 nicoa-lab-開頭。`source-manifest.json` 記錄每份來源、尺寸、大小、SHA-256 與核准確認 ID。`brand.css` 保持原比例；標誌圖片 alt 一律 Nicoa'Lab。個人公開名稱及介紹保留 Nicoa The Six；產品 Logo、服務海報、名片及既有影片沒有改動。

## 重建流程

在網站根目錄執行 `build-brand-assets.py`（Python 3 與 Pillow）。先輸出每份輸入／輸出的絕對路徑，再依四階段：驗證固定來源 SHA 與尺寸、原樣複製 PNG、等比產生八份縮小圖、寫入來源清單。來源不符即停止，不生成替代圖。完整執行方式見根目錄 README。

接著 `node sync-brand.mjs`：先列出絕對輸入／輸出，更新兩份首頁，再呼叫文章建置器更新三頁文章外框。`brand.mjs` 共用頁首、頁尾與 favicon 標記；`script.js` 已移除舊 SVG 字形繪製。`serve.mjs` 從本清單讀取預覽白名單並提供 image/webp。這些指令不推送 Git、不更改 VERSION。

驗證使用既有 check-site.mjs、check-pixel-homepages.mjs、check-blog.mjs 與 GTM 檢查，另核對原圖及 HTTP 檔案雜湊、桌面／768px／390px／320px 的雙語圖片來源、比例、頁尾與溢出。網站狀態與檔案交付見根目錄 brand-logo-delivery.md。
