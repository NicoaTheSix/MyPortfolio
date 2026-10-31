/* Original fixed-grid artwork; all bitmap frames come from build-pixel-automation.py. */
(() => {
  'use strict';
  console.info('[像素動畫 0/3] 輸入頁面（絕對 URL）：', location.href);
  for (const file of ['pixel-automation.js', 'pixel-automation.css', 'assets/automation-pixel-sprite.png', 'assets/automation-pixel-still.png']) console.info('[像素動畫 0/3] 輸入檔案（絕對 URL）：', new URL(file, location.href).href);
  console.info('[像素動畫 0/3] 輸出：', new URL('#pixel-lab', location.href).href, '的 256×160 Canvas 與影格狀態；只更新畫面，不寫入檔案。');
  const canvas = document.querySelector('#pixel-canvas');
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) return;
  context.imageSmoothingEnabled = false;
  const fallback = document.querySelector('#pixel-fallback');
  const play = document.querySelector('#pixel-play');
  const step = document.querySelector('#pixel-step');
  const seek = document.querySelector('#pixel-seek');
  const counter = document.querySelector('#pixel-frame');
  const prefers = matchMedia('(prefers-reduced-motion: reduce)');
  const sprite = new Image();
  let frame = prefers.matches ? 18 : 0;
  let paused = false;
  let visible = true;
  const globallyPaused = () => document.body.classList.contains('motion-paused') || prefers.matches;
  const updateButton = () => {
    const stopped = paused || globallyPaused();
    play.textContent = stopped ? '▶ 播放' : 'Ⅱ 暫停';
    play.setAttribute('aria-pressed', String(!stopped));
    if (globallyPaused()) play.textContent = '全站已暫停';
    play.disabled = globallyPaused();
  };
  const draw = () => {
    context.drawImage(sprite, frame*256, 0, 256, 160, 0, 0, 256, 160);
    seek.value = String(frame);
    counter.textContent = `${String(frame+1).padStart(2,'0')} / 24`;
  };
  const fit = () => {
    const scale = Math.max(1, Math.min(3, Math.floor(canvas.parentElement.clientWidth/256)));
    canvas.style.width = `${256*scale}px`;
    canvas.style.height = `${160*scale}px`;
    document.querySelector('#pixel-scale').textContent = `${scale} 倍 / 每格 ${scale} px`;
  };
  console.info('[像素動畫 1/3] 固定畫布與整數倍顯示準備完成。');
  sprite.addEventListener('load', () => {
    canvas.hidden = false;
    fallback.hidden = true;
    play.disabled = step.disabled = seek.disabled = false;
    fit(); draw(); updateButton();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(canvas.parentElement);
    else window.addEventListener('resize', fit);
    const preferenceObserver = new MutationObserver(updateButton);
    preferenceObserver.observe(document.body, { attributes:true, attributeFilter:['class'] });
    prefers.addEventListener('change', updateButton);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(canvas);
    play.addEventListener('click', () => { paused = !paused; updateButton(); console.info('[像素動畫 狀態]', paused ? '暫停' : '播放', '影格', frame+1); });
    step.addEventListener('click', () => { paused = true; frame = (frame+1)%24; draw(); updateButton(); });
    seek.addEventListener('input', () => { paused = true; frame = Number(seek.value); draw(); updateButton(); });
    console.info('[像素動畫 2/3] 24 格素材載入、暫停、逐格與影格滑桿完成。');
    setInterval(() => {
      if (!paused && !globallyPaused() && visible && !document.hidden) { frame = (frame+1)%24; draw(); }
    },125);
    console.info('[像素動畫 3/3] 每秒 8 格播放就緒；離開畫面或背景分頁時暫停。');
  });
  sprite.addEventListener('error', () => { play.textContent = '靜態預覽'; console.warn('[像素動畫] 素材載入失敗，保留靜態預覽。'); });
  sprite.src = new URL('assets/automation-pixel-sprite.png', location.href).href;
})();
