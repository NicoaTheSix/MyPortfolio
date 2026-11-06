# 文章專區：站內主要版本

中文入口 `/MyPortfolio/blog/`，英文索引 `/MyPortfolio/blog/en/`。文章使用固定的 `/MyPortfolio/blog/<slug>/`，每篇只維護一個原語言版本，沒有冒充人工翻譯的重複文章。中英文索引都可閱讀原語言文章；英文索引會標示繁體中文。

## 來源與日常編輯

第一篇為使用者指定的 Medium 文章 `8968e5dd7e76`，完整來源與四張圖片的 URL、大小、SHA-256 記錄於 `posts/mitre-att-ck-introduction/source.json`。來源是作者的公開 RSS，不繞過付費牆或讀取登入資料。正文保留原措辭與引用；移除 Medium 的閱讀追蹤像素，圖片在本站保存原檔並補替代文字。白色 MITRE ATT&CK 標誌使用深色底以保持可見。

`import-medium.mjs` 為這篇指定文章的一次性匯入工具，**遇到既有文章目錄會停止**，不會同步覆蓋本站後續編輯。直接執行 `node blog/import-medium.mjs` 時，先列 RSS／文章輸入 URL、Markdown／meta／source JSON 及每張圖片的最終絕對輸出路徑；階段一取得指定文章，階段二核對及取得原圖，階段三寫入 Markdown／資訊／來源雜湊，階段四回報完成。輸入 URL 為 `https://medium.com/feed/@nick5901879` 及指定文章，輸出基準目錄 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\blog`。無人工重新匯入的需求時不重跑。

日常主檔是 `posts/<slug>/article.md` 和同目錄 `meta.json`：

`source.json` 保留首次匯入的 Markdown、正文及原圖雜湊。檢查器在 Markdown 仍等於匯入基準時核對原文完整性；本站後續編輯重建後可獨立通過檢查，不強制還原 Medium 內容。原始圖檔保留，新增／替換圖片使用新檔名。Git 的 `blog/posts/** -text` 規則維持來源位元組，避免換行轉換破壞來源雜湊。

```json
{
  "title": "文章標題",
  "description": "簡短摘要",
  "lang": "zh-Hant",
  "published": "2026-11-06",
  "updated": "2026-11-06",
  "tags": ["資安"],
  "draft": true
}
```

資料夾 slug 使用小寫英文、數字與連字號，發布後保持不變。`en`、`assets`、`posts` 為保留名稱。設定 `draft:false` 才產生文章網頁；草稿不進索引、RSS 或 sitemap。公開 repo 的來源檔案本來可被讀取，draft 不代表私密保存。

圖片按內容放在 `assets/images/<slug>/`，Markdown 相對來源目錄引用，例如 `../../assets/images/<slug>/cover.png`。產生器會換算文章網頁所需的正確相對路徑。中繼資訊 `cover` 亦使用同一方式；保留外部引用的來源與授權資訊。未提供文章就不生成假文章。

## 主要版本與外站

本站文章 head 中有絕對 HTTPS 的 self-canonical，分享網址、索引、RSS、僅限 blog 的 `sitemap.xml` 都使用同一個文章網址。原 Medium 連結保留在文末；後續內容以本站 Markdown 為主。

這不會自動修改 Medium 的 canonical 或讓搜尋引擎立刻選本站；若保留全文同步刊載，Medium 端的 canonical 仍需由作者另行設定。Google 說明：https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls 。此清單只包含 blog，沒有擅自接續先前尚未授權的全站 sitemap 工作。

## 建置與檢查

從專案根目錄執行 `npm run build:blog`。同目錄腳本 `build-blog.mjs` 先列所有來源與輸出絕對路徑，再分五階段：驗證文章資訊與草稿、清理 HTML 及重算引用、產生文章／雙語索引／RSS／sitemap、更新首頁入口、回報完成。正文會清理 script、事件屬性和危險連結。舊文章轉草稿或撤除時，只刪除前次來源清單記錄的過期生成 HTML，不遞迴刪資料夾或素材。

不直接編輯生成的 `index.html`、`en/index.html` 或 `<slug>/index.html`。重建不修改既有服務海報／動畫與外站筆記，首頁固定更新同一張文章入口卡片；重跑不重複新增。桌面與窄螢幕沿用俐方體，一般文章不需 JavaScript 才能閱讀。`blog.css` 是本目錄介面原始樣式，瀏覽器讀取 Markdown 產製的 HTML，不寫入檔案或顯示開發進度。

`npm run check:blog` 顯示絕對輸入與測試暫存路徑，再檢查主版本網址、GTM、頁面引用、圖片、來源文字、RSS／sitemap，以及發布／轉草稿／危險 HTML 測試。測試以系統暫存目錄中的具名子目錄隔離，檢查結束只清除此測試目錄。`node sync-google-tag.mjs --check` 同時納入 blog，總頁數會隨公開文章增加。

本機預覽使用根目錄 `node serve.mjs`，只提供來源清單中的公開 blog 產物及圖片，阻擋 `blog/posts` 的 Markdown／meta／source 檔案；既有 GitHub Pages 公開來源 repo 仍可被查看。來源編輯檔不作為讀者入口。
