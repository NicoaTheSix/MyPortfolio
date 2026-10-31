/* Four original bitmap scenes; GUI hover states are drawn from the same 1-bit grid. */
(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const en = document.documentElement.lang === 'en';
  const t = (zh, english) => en ? english : zh;
  const manifestURL = new URL('assets/development-pixel-manifest.json', base);
  console.info('[四格像素 0/5] 輸入頁面（絕對 URL）：', location.href);
  for (const file of ['pixel-scenes.js','pixel-scenes.css','assets/development-pixel-manifest.json',`assets/service-development-${en?'en':'zh'}.png`,'assets/gui-pixel-states.png','assets/automation-pixel-sprite.png','assets/api-pixel-sprite.png','assets/docs-pixel-sprite.png']) console.info('[四格像素 0/5] 輸入檔案（絕對 URL）：', new URL(file,base).href);
  console.info('[四格像素 0/5] 輸出：',new URL('#development-poster-frame',location.href).href,'的四個 Canvas 與七個互動區域；不寫入檔案，不連線至真實 API。');
  const gallery = document.querySelector('#pixel-gallery');
  const play = document.querySelector('#pixel-play');
  const step = document.querySelector('#pixel-step');
  const seek = document.querySelector('#pixel-seek');
  const counter = document.querySelector('#pixel-frame');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const poster = document.querySelector('#development-poster-frame');
  const original = document.querySelector('#poster-original');
  const animated = document.querySelector('#poster-animated');
  const controls = document.querySelector('#scene-controls');
  const title = document.querySelector('#poster-title');
  title.addEventListener('click',() => title.setAttribute('aria-pressed',String(title.getAttribute('aria-pressed')!=='true')));
  const CROP = {x:8,y:28,width:240,height:122};
  let view = 'original';
  let frame = preference.matches ? 20 : 0;
  let paused = false;
  let visible = true;
  const stoppedGlobally = () => document.body.classList.contains('motion-paused') || preference.matches;
  const updatePlay = () => {
    play.disabled = stoppedGlobally();
    play.textContent = play.disabled ? t('全站已暫停','Motion paused') : paused ? t('▶ 播放','▶ Play') : t('Ⅱ 暫停','Ⅱ Pause');
    play.setAttribute('aria-pressed',String(!paused && !stoppedGlobally()));
  };
  const setView = next => {
    view = next;
    const isOriginal = view === 'original';
    poster.dataset.view = view;
    gallery.hidden = isOriginal;
    original.setAttribute('aria-pressed',String(isOriginal));
    animated.setAttribute('aria-pressed',String(!isOriginal));
    controls.classList.toggle('is-original',isOriginal);
    controls.inert = isOriginal;
    document.querySelector('#poster-view-status').textContent = isOriginal ? t('目前顯示原圖','Showing original poster') : t('目前顯示動畫','Showing animated poster');
    console.info('[四格像素 狀態] 海報模式：',isOriginal ? '原圖' : '動畫');
  };
  original.addEventListener('click',() => setView('original'));
  setView('original');
  const loadImage = source => new Promise((resolve,reject) => {
    const image = new Image();
    image.addEventListener('load',() => resolve(image),{once:true});
    image.addEventListener('error',() => reject(new Error(`素材無法載入：${source}`)),{once:true});
    image.src = source;
  });
  const start = async () => {
    const response = await fetch(manifestURL);
    if (!response.ok) throw new Error(`素材規格載入失敗：${response.status}`);
    const manifest = await response.json();
    if(en){
      const labels=['Name field','Tool menu','Run button','Reset button','First sidebar item','Second sidebar item','Third sidebar item'];
      manifest.fields.forEach((field,index)=>field.label=labels[index]);
    }
    console.info('[四格像素 1/5] 四格規格與七個欄位位置載入完成。');
    const scenes = await Promise.all(manifest.scenes.map(async config => {
      const source = new URL(config.sprite,manifestURL);
      const sprite = await loadImage(source.href);
      const card = document.querySelector(`[data-scene="${config.id}"]`);
      const canvas = card.querySelector('canvas');
      canvas.width = CROP.width;
      canvas.height = CROP.height;
      const context = canvas.getContext('2d',{alpha:false});
      if (!context) throw new Error('此瀏覽器未提供 Canvas');
      context.imageSmoothingEnabled = false;
      return { ...config, sprite, card, canvas, context, state:0 };
    }));
    console.info('[四格像素 2/5] GUI 八種狀態、齒輪、API 與文件影格表載入完成。');
    const drawScene = scene => {
      const index = scene.interactive ? scene.state : frame;
      scene.context.drawImage(scene.sprite,index*256+CROP.x,CROP.y,CROP.width,CROP.height,0,0,CROP.width,CROP.height);
      scene.canvas.dataset.frame = String(index);
    };
    const gui = scenes.find(scene => scene.id==='gui');
    const overlay = gui.card.querySelector('.gui-hotspots');
    const status = document.querySelector('#gui-status');
    let hovered = 0;
    let focused = 0;
    let inputMode = 'pointer';
    const highlight = () => {
      gui.state = inputMode === 'keyboard' ? focused || hovered : hovered || focused;
      overlay.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.state)===gui.state)));
      status.textContent = gui.state ? `${manifest.fields[gui.state-1].label}${t('：反白中',': highlighted')}` : t('等你選一個欄位。','Choose a field.');
      drawScene(gui);
    };
    manifest.fields.forEach((field,index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.state = String(index+1);
      button.setAttribute('aria-label',`${field.label}${t('（反白示範）',' (highlight demo)')}`);
      button.setAttribute('aria-pressed','false');
      const [x1,y1,x2,y2] = field.rect;
      Object.assign(button.style,{left:`${100*(x1-CROP.x)/CROP.width}%`,top:`${100*(y1-CROP.y)/CROP.height}%`,width:`${100*(x2-x1+1)/CROP.width}%`,height:`${100*(y2-y1+1)/CROP.height}%`});
      button.addEventListener('pointerenter',event => { if (event.pointerType==='mouse' || event.pointerType==='pen') { inputMode='pointer'; hovered=index+1; highlight(); } });
      button.addEventListener('pointerleave',() => { hovered=0; highlight(); });
      button.addEventListener('focus',() => { inputMode='keyboard'; focused=index+1; highlight(); });
      button.addEventListener('blur',() => { focused=0; highlight(); });
      button.addEventListener('click',() => { focused=index+1; button.focus({preventScroll:true}); highlight(); });
      overlay.append(button);
    });
    console.info('[四格像素 3/5] 滑鼠懸停、鍵盤焦點與手機點選反白完成。');
    const draw = () => {
      scenes.forEach(drawScene);
      seek.value = String(frame);
      counter.textContent = `${String(frame+1).padStart(2,'0')} / 24`;
    };
    const fit = () => scenes.forEach(scene => {
      const surface = scene.card.querySelector('.scene-surface');
      if (!surface.clientWidth || !surface.clientHeight) return;
      const scale = Math.min(surface.clientWidth/CROP.width,surface.clientHeight/CROP.height);
      const wrap = scene.card.querySelector('.scene-canvas-wrap');
      wrap.style.width = `${scale*CROP.width}px`;
      wrap.style.height = `${scale*CROP.height}px`;
    });
    animated.disabled = false;
    animated.addEventListener('click',() => {setView('animated');fit();draw();});
    setView('animated');
    play.disabled = step.disabled = seek.disabled = false;
    fit(); draw(); updatePlay();
    controls.closest('[data-animation-tools]')?.removeAttribute('hidden');
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(fit);
      scenes.forEach(scene => observer.observe(scene.card.querySelector('.scene-surface')));
    } else window.addEventListener('resize',fit);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {visible=entries[0].isIntersecting;}).observe(gallery);
    new MutationObserver(updatePlay).observe(document.body,{attributes:true,attributeFilter:['class']});
    preference.addEventListener('change',updatePlay);
    play.addEventListener('click',() => {paused=!paused;updatePlay();});
    step.addEventListener('click',() => {paused=true;frame=(frame+1)%24;draw();updatePlay();});
    seek.addEventListener('input',() => {paused=true;frame=Number(seek.value);draw();updatePlay();});
    console.info('[四格像素 4/5] 原圖構圖、粉黃標題、模式切換、暫停及全站偏好連動完成。');
    setInterval(() => {
      if (view==='animated' && !paused && !stoppedGlobally() && visible && !document.hidden) {frame=(frame+1)%24;draw();}
    },125);
    console.info('[四格像素 5/5] 每秒八格循環就緒；GUI 反白獨立回應操作。');
  };
  start().catch(error => {
    setView('original');
    play.textContent=t('靜態預覽','Static preview');
    console.warn('[四格像素] 保留靜態圖：',error.message);
  });
})();
