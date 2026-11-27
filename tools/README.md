# 聖誕卡片發布工具

已驗收快照：6edae19fec1ea13667a8c7dfe7e00ad6d7739c66。來源為本機生成的首頁、六個年度內頁和19張內文圖片，保留原始標題、文字與圖說。

所有程式在運作前列出絕對輸入與輸出路徑，逐階段印出進度。

1. `node tools/christmas/publish.mjs <已驗收網站絕對目錄> <隔離發布工作目錄絕對路徑>`：只依來源白名單複製頁面、WebP、字型，移除本機 noindex 與預覽標示，加入 canonical／分享標籤；接上中英文首頁既有聖誕卡片區，將新頁納入 sitemap 與本機預覽白名單。
2. `node sync-seo.mjs`：更新 sitemap，再執行 `node sync-seo.mjs --check`。
3. `node tools/verify-christmas-release.mjs <隔離發布工作目錄絕對路徑> <已驗收網站絕對目錄>`：核對正文、素材雜湊、連結與 sitemap；報告輸出在已驗收網站目錄的上一層。
4. 完成既有發布流程後加上 `--live`：以四條並行連線讀取正式站全部發布資源與中英文首頁、sitemap，逐一核對HTTP狀態及完整檔案雜湊。僅讀取公開網址，不傳送私人來源。

`christmas/source-manifest.json` 僅列公開檔案與驗收快照。不發布私人 content.json、下載來源網址、瀏覽器素材清單或填答者資料。字型授權隨網站保存。
