# 網站字型

一般中英文介面文字使用俐方體 11 號（Cubic 11），以本站 WOFF2 提供。程式碼仍使用系統等寬字型；海報與 SVG 圖形文字不因 CSS 改變。

## 來源與授權

- 官方：https://github.com/ACh-K/Cubic-11
- 固定來源 commit：`4c566f7d6cc5c05ee360fe9cff56b5da1fcafd4d`。
- 字型來源：`fonts/web/Cubic_11.woff2`，未修改、未轉檔或裁切。
- 原授權 `OFL.txt` 原樣保存為 `OFL-Cubic-11.txt`，包含完整 SIL Open Font License 1.1。
- `cubic-11.woff2`：400228 bytes；SHA-256 `d28e92846e00c3696b30d950d4eddf445dd90b2a970e67cdb629796c1997ef67`；官方 Git blob SHA-1 `fa0ab5370dd0058b22acbf77dfc2afef8d0d8543`。
- `OFL-Cubic-11.txt`：5364 bytes；SHA-256 `2b6e5938e5cffa0b9e183bd05f8c363e174e7ebed1a0556e2855fd1707fa2188`。
- 根目錄 `.gitattributes` 保留字型與授權原始位元組，避免 Windows Git 的換行轉換改寫授權檔。官方原授權含行尾空白，不重新排版；本批 Git whitespace 檢查排除此單一原始授權檔，其餘修改照常檢查。

## 運作流程

1. `styles.css` 與 `fusion-studio/docs.css` 匯入同目錄 `fonts.css`；DeskTiles 沿用文件樣式，所有語言共用同一份字型。
2. 瀏覽器請求 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\fonts\fonts.css` 對應的網站 URL，再讀取 `C:\Users\nick5\Documents\ChatGPT\Portfolio 網站設置\assets\fonts\cubic-11.woff2`。`font-display: swap` 在下載期間使用原系統字型；載入成功後顯示俐方體。此為瀏覽器 CSS 載入，無檔案輸出或背景運算階段。
3. 本機 `serve.mjs` 明列字型與授權白名單，WOFF2 回應 `font/woff2`。GitHub Pages 使用相對路徑，支援 `/MyPortfolio/` 子目錄。
4. 更新字型前先列出官方固定 commit 的輸入 URL、上述最終輸出絕對路徑；階段一下載並檢查 WOFF2 magic／大小／Git blob 雜湊，階段二保存原授權，階段三記錄 SHA-256 與大小。不可覆蓋成其他來源或無授權副本。
5. 以本機預覽實際核對字型載入、雙語首頁與文件頁、手機版溢出及程式碼等寬字型；既有頁面結構檢查另外執行。不必重新生成文件正文或圖片。
