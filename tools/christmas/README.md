# 聖誕卡片頁發布

## 圓弧卡片正式版 v1.36

已驗收來源快照為 `0b485d89d12392144bd4d18d7b039999c473e34a`。輸入網站絕對路徑為 `C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/christmas-card-archive/site/`，驗收清單位於上層 `card-refinement-delivery.json`。隔離發布工作目錄為 `C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/christmas-cards-release/`。

在本工作目錄執行 `node tools/christmas/publish-cards.mjs <輸入網站絕對路徑>`：先顯示輸入／輸出的絕對位置，再分三階段核對卡片的驗收雜湊並複製 HTML／CSS／JS、接上雙語首頁與原文列表入口、更新公開資源及來源清單。輸出為本目錄根下的 `christmas/cards/`，只移除本機預覽標示及 noindex 並加入分享標籤，不改寫年度原文。保留原文列表及六個年度網址。

接著執行 `node sync-seo.mjs` 與 `node sync-seo.mjs --check`，確認變更範圍與站內連結；保存發布快照，更新 VERSION 為 v1.36，再推送 main 與版本標籤。GitHub Pages 成功後核對正式站卡片檔案、首頁入口、手機排版及開啟閱讀操作。

`node tools/christmas/check-cards.mjs <輸入網站絕對路徑>` 核對驗收正文、六個閉合圖案、連結與公開入口；加上 `--live` 比較正式站八個頁面／資源的 HTTP 與實際內容。開始列出絕對輸入／輸出，依兩階段顯示進度。報告位於輸入網站上層的 `cards-release-check-report.json` 或 `cards-live-report.json`。

本批採用已驗收快照 6edae19 的首頁、六份年度原文與19張圖片。正文與本機版一致，只移除本機標示及 noindex，加入 canonical／分享標籤。未加入代寫敘事。

執行：

`node tools/christmas/publish.mjs <已驗收網站絕對目錄> <隔離發布工作目錄絕對路徑>`

程式開始先列出輸入／輸出絕對路徑，依四階段顯示進度：複製白名單檔案並核對正文、中英文首頁入口、SEO與預覽白名單、保存公開來源清單。之後執行 `node sync-seo.mjs`、`node sync-seo.mjs --check`，並檢查站內連結及正式站 HTTP 與檔案雜湊。程式不會自行推送 Git 或部署。

公開來源清單為 `christmas/source-manifest.json`，含公開檔案、雜湊及驗收快照；不包含私人原始 JSON、寄件者回覆、圖片暫時網址或私人素材目錄。原始資料依專案規範保存於個人資料分類。
