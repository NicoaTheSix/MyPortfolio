# 聖誕卡片頁發布

## v1.38 夜色寶石與年度Logo

已驗收快照 `bb9325edbfd57bea5b09eeaf8edc2f6211080483`：C 夜色寶石配色，2021信封、2022第二版學士帽、2023第二版紙鳥、2024第二版雙辮肖像、2025守宮書本及2026桌面工具。年度原文與抽卡翻面互動保持一致。

輸入來源根為 `C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/`，輸入驗收網站為該根下 `.preview/christmas-card-archive/site/`，驗收明細為網站上層的 `logo-revision-delivery.json`。輸出根為 `.preview/christmas-jewel-release/`，公開輸出位於 `christmas/cards/`。

執行 `node tools/christmas/publish-logos.mjs <來源根絕對路徑> <驗收網站絕對路徑>`：開始列出絕對輸入／輸出，三階段核對已驗收HTML、保留正式SEO頭、核對六年度原文及互動程式，複製快照一致的六份單色SVG，最後更新 `christmas/source-manifest.json` 的公開檔案與來源雜湊。只發布選定方案，不發布配色比較頁。

`node tools/christmas/check-cards.mjs <驗收網站絕對路徑>` 核對正文、六組配色及站內連結；加 `--live` 檢查十四個正式資源的 HTTP 與實際內容。報告位於驗收網站上層 `cards-jewel-check-report.json` 或 `cards-jewel-live-report.json`。程式執行前列出絕對路徑並逐階段顯示進度。檢查後保存發布快照、升版為v1.38並推送main與標籤，最後核對GitHub Pages及手機閱讀。

## v1.37 完整抽卡與翻面

已測試來源快照為 `11979d8012edb3c969896dce6c7f670f29475965`，來源根目錄為 `C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/`，隔離輸出根目錄為 `C:/Users/nick5/Documents/ChatGPT/Portfolio 網站設置/.preview/christmas-motion-release/`。本批包含上一批待部署的依年份初始疊放順序。

執行 `node tools/christmas/publish-motion.mjs <來源根目錄絕對路徑>`：先列出輸入／輸出，再以三階段核對來源快照並複製 CSS／JS、更新公開素材雜湊、複製抽卡回歸檢查。`node tools/christmas/check-motion.mjs` 直接測試發布版回呼，以旋轉外框尺寸檢查六張卡片切層時已完全離開牌堆；僅輸出終端機並分兩階段顯示結果。原本按高度比例抽取距離的版本會在此檢查失敗。

滑鼠移入或鍵盤聚焦先垂直抽出：卡片下緣高於整個牌堆上緣至少 32px 才移到前層，再垂直下放。點選則完整抽出並移至中央，封面旋轉至側面後接續閱讀背面的翻轉，完成後才淡入原文；手機、Escape、重播和減少動態偏好維持可用。年度文字及圖片未修改。

另執行 `node tools/christmas/check-cards.mjs <原驗收網站絕對目錄>` 核對正文與連結；`--live` 版本輸出 `cards-motion-live-report.json`，記錄 v1.37 正式資源內容。保存發布快照後升版、推送 GitHub Pages，再核對正式站互動。

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
