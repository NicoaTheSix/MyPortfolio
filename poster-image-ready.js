/* Keep the original poster visible as one unit with its animation overlays. */
const posterImageReadyURL = document.currentScript.src;
function waitForPosterImage(poster,english=false){
  console.info('[海報底圖 0/2] 程式輸入絕對 URL：',posterImageReadyURL);
  const image=poster.querySelector('.poster-base');
  const source=image.src;
  console.info('[海報底圖 0/2] 輸入絕對 URL：',source);
  console.info('[海報底圖 0/2] 輸出絕對 URL：',location.href,'的海報載入狀態與重試按鈕；不寫入檔案。');
  poster.dataset.imageState='loading';
  const notice=document.createElement('div');notice.className='poster-image-notice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');
  const label=document.createElement('span');
  const retry=document.createElement('button');retry.type='button';retry.hidden=true;retry.textContent=english?'Retry image':'重新載入圖片';
  const loading=()=>{poster.dataset.imageState='loading';label.textContent=english?'Loading poster…':'海報載入中…';retry.hidden=true;};
  loading();notice.append(label,retry);poster.append(notice);
  return new Promise(resolve=>{
    let settled=false;
    const failed=()=>{if(settled)return;poster.dataset.imageState='error';label.textContent=english?'The poster could not be loaded. Please retry.':'海報圖片載入失敗，請重新載入。';retry.hidden=false;console.info('[海報底圖 1/2] 圖片尚未就緒，隱藏動畫並保留重試。');};
    const ready=async()=>{
      try{
        if(!image.naturalWidth){failed();return;}
        if(image.decode)await image.decode();
        if(settled)return;
        settled=true;image.removeEventListener('load',ready);image.removeEventListener('error',failed);retry.removeEventListener('click',again);
        poster.dataset.imageState='ready';notice.remove();
        console.info('[海報底圖 2/2] 原圖已載入並解碼，可顯示完整海報與動畫。');resolve(image);
      }catch{failed();}
    };
    const again=()=>{loading();const url=new URL(source);url.searchParams.set('poster-retry',String(Date.now()));image.src=url.href;};
    image.addEventListener('load',ready);image.addEventListener('error',failed);retry.addEventListener('click',again);
    // Request the real <img> immediately rather than relying on a hidden SVG mask
    // or an offscreen lazy-load request to warm the browser cache.
    image.loading='eager';
    if(image.complete){if(image.naturalWidth)ready();else failed();}
    console.info('[海報底圖 1/2] 等待原圖載入與解碼。');
  });
}
