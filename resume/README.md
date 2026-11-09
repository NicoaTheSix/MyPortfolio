# 網站履歷頁

從使用者提供的三頁 PDF 摘錄專業內容，依網站的品牌和字體重新排成 HTML。頁面使用公開名稱 Nicoa The Six，收錄學歷、CICS 2025 發表、TTP Selection Studio、技術專長、英文能力及求職方向。聯絡按鈕連到網站原有聯絡區。原始 PDF、證件附件、私人電話、住址、年齡及健康資訊沒有放進網站或 Git。

- 中文：`/MyPortfolio/resume/`。
- 英文：`/MyPortfolio/resume/en/`。
- 桌面使用橫式品牌字標；窄版使用單字母標誌。兩頁共用 `resume.css`，並保留雙向語言切換與頁內導覽。

在網站根目錄編輯 `build-resume.mjs` 的中英文內容後執行 `node build-resume.mjs`。程式先列出絕對輸入與輸出，接著讀取同目錄的共用品牌和 Google 標記設定、渲染兩個語系，再寫入 `resume/index.html` 和 `resume/en/index.html`。重建不讀取或修改原始 PDF。首頁導覽與共用版型由根目錄首頁和 `home-pixel.css` 維護。

預覽用 `$env:PORT='4202'; node serve.mjs`，開啟 `http://127.0.0.1:4202/MyPortfolio/resume/`。執行 `node check-site.mjs`、`node check-pixel-homepages.mjs` 和 `node sync-google-tag.mjs --check`。本批也比對本機 HTTP 內容與站內錨點，並以桌面及 320px 手機視窗檢查語言切換與首頁入口。

目前為本機驗收版本；未推送正式網站。交付檔案及預覽見根目錄 `resume-delivery.md`。
