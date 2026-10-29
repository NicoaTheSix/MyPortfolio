# 完成 GTM 與 GA4 的連接

網站容器：`GTM-N43HBCRC`。GA4 評估 ID：`G-YN3DEJ0WBH`。網站：<https://nicoathesix.github.io/MyPortfolio/>。

網站的中英文首頁與 Fusion Studio 文件頁已準備 GTM head 初始化碼及 body noscript，並移除直接載入 GA4 的代碼。GTM 公開容器在 2026-10-29 導入時為版本 1，沒有標籤或觸發規則；網站安裝完成後仍需以下設定，才會繼續收集 GA4 資料。

1. 開啟 [Google Tag Manager](https://tagmanager.google.com/)，選取 `GTM-N43HBCRC`。
2. 進入「代碼／Tags」→「新增／New」，名稱填 `GA4 - Nicoa Portfolio`。
3. 「代碼設定／Tag Configuration」選擇「Google 代碼／Google Tag」。
4. 「代碼 ID／Tag ID」填入 `G-YN3DEJ0WBH`，這裡使用 GA4 的 G- ID。
5. 「觸發條件／Triggering」選擇 `Initialization - All Pages`（初始化－所有網頁）。
6. 按「儲存／Save」，再使用「預覽／Preview」連線至網站。確認 Google 代碼已觸發，且沒有第二份送往同一 GA4 資源的設定。
7. 按「提交／Submit」，填寫版本名稱，例如 `Connect portfolio to GA4`，再按「發布／Publish」。只有儲存而沒有發布，公開網站仍使用舊版本。
8. 瀏覽網站數個頁面，再到 GA4「即時」報表檢查資料接收。資料顯示可能需要時間；也可用 Tag Assistant 檢查是否送出事件。

未在容器內另行設定自訂資料；若未來新增第三方代碼，請先確認用途及要傳送的資料。不要再把先前的 gtag.js 或重複的 GA4 Google 代碼貼回網站頁面。

本次網站修改與發布不包含登入或編輯 GTM 帳戶；容器中的私人工作區與實際報表接收狀態尚未驗證。

來源：[安裝 GTM 容器](https://support.google.com/tagmanager/answer/14847097)、[在 GTM 新增 Google 代碼](https://support.google.com/tagmanager/answer/14842872)、[檢查及發布](https://support.google.com/tagmanager/answer/14842769)、[避免 GA4 重複安裝](https://support.google.com/analytics/answer/9311124)。
