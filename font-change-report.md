# 網站俐方體調整交付清單

來源指令：「可以把網頁字體改成俐方體嗎」。批次 `portfolio-cubic-font-20261106`；日期 2026-11-06。此批是待驗收工作快照，正式版本維持 v1.01，尚未推送或部署。

## 結果與核對

中英文首頁及 Fusion Studio／DeskTiles 文件的一般介面文字改為官方 Cubic 11。共用自託管 WOFF2，保留原授權與備援字型；程式碼、圖片內文字及圖形 Logo 不改。手機 420px 以下隱藏「作品與文章」導覽，避免中文導覽溢出；作品內容仍可正常閱讀。

- `check-site.mjs`、`check-pixel-homepages.mjs`、`node --check serve.mjs` 通過。
- 官方字型大小、WOFF2 格式、來源 Git blob SHA-1 核對通過；來源 commit 與 SHA-256 見字型 README。
- 七個本機字型／樣式／授權 HTTP 檔案與原檔一致，WOFF2 MIME 為 `font/woff2`。
- 瀏覽器目視與 computed style 確認俐方體；1280px 桌面、390／320px 雙語首頁、Fusion 中文頁與 DeskTiles 英文指南沒有頁面水平溢出。文件程式碼 computed style 為 Cascadia Code／Consolas 等寬備援，無 Cubic 11；最終頁面無警告／錯誤日誌。
- 初次瀏覽器連線錯誤已排除；最終已完成畫面驗證。

## 本次檔案

| 變更 | 用途 | 最終絕對路徑 |
|---|---|---|
| 新增 | 官方原字型，未改檔 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\fonts\cubic-11.woff2` |
| 新增 | 官方完整授權原文 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\fonts\OFL-Cubic-11.txt` |
| 新增 | 共用 @font-face 與 swap 設定 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\fonts\fonts.css` |
| 新增 | 禁止 Git 改寫官方字型／授權原始位元組 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.gitattributes` |
| 新增 | 字型來源、雜湊與載入流程 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\fonts\README.md` |
| 修改 | 首頁共用字型匯入與文字字型堆疊 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\styles.css` |
| 修改 | 移除 Silkscreen、統一首頁字型與手機導覽 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\home-pixel.css` |
| 修改 | 文件共用字型與程式碼字型分開 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\fusion-studio\docs.css` |
| 修改 | 字型 MIME 與本機公開白名單 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\serve.mjs` |
| 修改 | 本批流程與檢查紀錄 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\README.md` |
| 修改 | 文件共用字型運作說明 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\fusion-studio\README.md` |
| 新增 | 本交付清單 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\font-change-report.md` |
| 新增，預覽證據 | 桌面字型效果 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\cubic-11-home-desktop.png` |
| 新增，預覽證據 | 修正後 390px 手機效果 | `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\.preview\cubic-11-home-mobile.png` |
| 追加，中央回報 | 本輪開始與待驗收結果 | `D:\Dashboard_personalData\activity\projects\nicoa-myportfolio\events.jsonl` |
| 修改，中央狀態 | 登記待確認批次與快照，版本維持不變 | `D:\Dashboard_personalData\activity\projects\nicoa-myportfolio\project.json` |

字型與授權由官方固定 commit 的檔案取得。其餘樣式及說明依本輪指令修改；截圖來自 `http://127.0.0.1:4196/MyPortfolio/`。預覽證據保留在現有 `.preview` 分類，依既有 Git ignore 不納入網站程式碼提交；沒有移動舊素材，也不修改既有未追蹤的 AGENTS.md。

中央事件寫入只證明檔案已保存，不代表儀表板畫面或雙向確認橋接已接通。
