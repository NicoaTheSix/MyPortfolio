import {date,release} from './release.mjs';

export function releaseNotes(page,r){
  const zh=page.lang==='zh';
  const features=zh?[
    '雙擊文字磁磚直接編輯；拖放圖片或在文字欄位之外按 Ctrl+V，新增文字與圖片磁磚。',
    'Ctrl+Z／Ctrl+Y 復原與重做，並可從回收桶找回誤刪磁磚。',
    '位置鎖定、滑鼠穿透及自訂全域快捷鍵；可從系統匣恢復滑鼠操作。',
    '多螢幕排列位置記憶、手動專注模式，以及黑白、鼠尾草綠、讀書與工作四款樣板。',
    '分享包先預覽再匯出；離線資料夾同步提供上傳、下載及衝突備份。',
  ]:[
    'Double-click a text tile to edit it. Drop images or press Ctrl+V outside a text field to create text and picture tiles.',
    'Undo and redo with Ctrl+Z / Ctrl+Y, and recover deleted tiles from the recycle bin.',
    'Lock positions, enable click-through and customize global shortcuts. Restore mouse input from the tray.',
    'Remember monitor arrangements, enter manual focus mode, and choose Monochrome, Sage, Study or Work presets.',
    'Preview a share package before exporting. Offline folder sync supports upload, download and conflict backups.',
  ];
  return `<section class="home-section prose release-note" id="release-update"><h2>${date} · Windows v${release.version}</h2>
    <p>${zh?'從磁磚或系統匣右鍵選「桌面工具」，開始使用這次的便利功能。':'Right-click a tile or the tray icon and open Desktop tools to use the new convenience features.'}</p>
    <ul>${features.map(text=>'<li>'+text+'</li>').join('')}</ul>
    <figure class="product-cover"><img src="${r('assets/desktop-tools-presets.png')}" alt="${zh?'DeskTiles Windows v1.07 配置樣板庫實際畫面，提供四款樣板預覽':'Actual DeskTiles Windows v1.07 preset library with four layout previews'}" loading="lazy"><figcaption>${zh?'Windows v1.07 實際畫面':'Actual Windows v1.07 interface'}</figcaption></figure>
    <p>${zh?'此為離線建置。Steam Cloud／Workshop 尚待取得 App ID／SDK、完成 SDK 編譯與實際連線驗證；離線同步與分享包可用，不代表已連上 Steam。':'This is an offline build. Steam Cloud and Workshop still require an App ID, the SDK, SDK-enabled compilation and live connection testing. Offline sync and share packages do not establish a Steam connection.'}</p>
    <p><strong>${zh?'更新前，先儲存並結束舊版，再完整解壓縮新版。Windows 系統匣選「儲存並結束桌面拼格」；只按控制視窗 X 不會退出。既有配置不必刪除。':'Before updating, save and exit the old app, then extract the complete new archive. On Windows, choose Save and exit DeskTiles from the tray; X only hides the controller. Keep your existing layout.'}</strong></p>
    <p><a href="https://github.com/NicoaTheSix/DeskTile/commit/${release.commit}" target="_blank" rel="noopener noreferrer">${zh?'對應來源提交':'Source release commit'} ↗</a></p></section>
    <section class="home-section prose" id="demo"><h2>${zh?'Windows 操作示範':'Windows demonstration'}</h2><video class="desk-demo" controls playsinline preload="metadata" poster="${r('assets/product-tile-preview.webp')}" aria-label="${zh?'Windows 版既有操作示範影片':'Existing Windows demonstration video'}"><source src="${r('assets/DeskTiles-fixes-demo.mp4')}" type="video/mp4"><a href="${r('assets/DeskTiles-fixes-demo.mp4')}">${zh?'開啟示範影片':'Open the demonstration video'}</a></video><p>${zh?'此為既有 Windows 版的 30 秒示範，使用虛構配置。影片與舊截圖為先前的操作畫面。':'This 30-second Windows demo uses a fictional layout. The video and older screenshots show an earlier interface.'}</p></section>`;
}
