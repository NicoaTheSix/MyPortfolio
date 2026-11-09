/* Shared production homepage motion; visitor preferences remain in memory. */
(() => {
  'use strict';
  const base=new URL('.',document.currentScript.src),en=document.documentElement.lang==='en';
  console.info('[正式像素 0/3] 輸入頁面絕對 URL：',location.href);
  for(const file of ['home-pixel.js','home-pixel.css','pixel-scenes.css'])console.info('[正式像素 0/3] 輸入檔案絕對 URL：',new URL(file,base).href);
  console.info('[正式像素 0/3] 輸出絕對 URL：',location.href,'頁面 DOM；不寫入檔案。');
  const labels = en ? {
    minimize: 'Minimize', expand: 'Expand', shrink: 'Shrink', restore: 'Restore size',
    close: 'Close', reopen: 'Reopen',
  } : {
    minimize: '最小化', expand: '展開', shrink: '縮小', restore: '還原大小',
    close: '關閉', reopen: '重開',
  };
  const panels = [...document.querySelectorAll('[data-window-title]')];
  console.info('[復古視窗 0/3] 輸入絕對 URL：', location.href, new URL('home-pixel.js', base).href, new URL('pixel-studio.css', base).href);
  console.info('[復古視窗 0/3] 輸出絕對 URL：', ...panels.map(panel => new URL('#' + panel.id, location.href).href));
  console.info('[復古視窗 1/3] 已找到視窗：', panels.length);
  for (const panel of panels) {
    const name = panel.dataset.windowTitle;
    const caption = panel.querySelector(':scope > .retro-caption') || document.createElement('span');
    caption.className = 'retro-caption';
    caption.textContent = panel.id === 'portrait-window' ? 'about_nicoa.png' : name;

    const body = document.createElement('div');
    body.className = 'retro-body';
    body.id = panel.id + '-body';
    for (const child of [...panel.childNodes]) {
      if (child !== caption) body.append(child);
    }

    const titlebar = document.createElement('div');
    titlebar.className = 'retro-titlebar';
    const controls = document.createElement('div');
    controls.className = 'retro-controls';
    const makeButton = (action, symbol, target = body.id) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.windowAction = action;
      button.textContent = symbol;
      button.setAttribute('aria-controls', target);
      return button;
    };
    const minimize = makeButton('minimize', '−');
    const zoom = makeButton('zoom', '□');
    const close = makeButton('close', '×');
    const reopen = makeButton('reopen', labels.reopen + ' ' + name);
    reopen.className = 'retro-reopen';
    reopen.hidden = true;
    controls.append(minimize, zoom, close);
    titlebar.append(caption, controls);
    panel.append(titlebar, body, reopen);

    let minimized = false;
    let small = false;
    const label = (button, action) => {
      const text = labels[action] + ' ' + name;
      button.title = text;
      button.setAttribute('aria-label', text);
    };
    const updateWindow = () => {
      body.hidden = minimized || !reopen.hidden;
      panel.classList.toggle('is-window-minimized', minimized);
      panel.classList.toggle('is-window-small', small);
      minimize.setAttribute('aria-expanded', String(!minimized));
      minimize.textContent = minimized ? '+' : '−';
      zoom.setAttribute('aria-pressed', String(small));
      zoom.textContent = small ? '❐' : '□';
      label(minimize, minimized ? 'expand' : 'minimize');
      label(zoom, small ? 'restore' : 'shrink');
    };
    minimize.addEventListener('click', () => {
      minimized = !minimized;
      updateWindow();
    });
    zoom.addEventListener('click', () => {
      small = !small;
      minimized = false;
      updateWindow();
    });
    close.addEventListener('click', () => {
      titlebar.hidden = true;
      reopen.hidden = false;
      panel.classList.add('is-window-closed');
      updateWindow();
      reopen.focus({ preventScroll: true });
    });
    reopen.addEventListener('click', () => {
      minimized = false;
      small = false;
      titlebar.hidden = false;
      reopen.hidden = true;
      panel.classList.remove('is-window-closed');
      updateWindow();
      close.focus({ preventScroll: true });
    });
    label(close, 'close');
    updateWindow();
  }
  console.info('[復古視窗 2/3] 已接上個別最小化、縮放、關閉與重開。');
  console.info('[復古視窗 3/3] 鍵盤焦點與雙語控制就緒。');
  const preference=matchMedia('(prefers-reduced-motion: reduce)'),toggle=document.querySelector('#motion-toggle');
  let paused=preference.matches;
  const update=()=>{document.body.classList.toggle('motion-paused',paused);toggle.setAttribute('aria-pressed',String(paused));toggle.textContent=en?(paused?'Resume animations':'Pause animations'):(paused?'啟用動畫':'暫停動畫');};
  update();toggle.addEventListener('click',()=>{paused=!paused;update();});preference.addEventListener('change',event=>{paused=event.matches;update();});
  console.info('[正式像素 1/3] 中英文控制與減少動態偏好完成。');
  const reveals=[...document.querySelectorAll('.pixel-reveal')];
  let observer;
  if('IntersectionObserver'in window){
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.05});
    document.body.classList.add('pixel-motion-ready');reveals.forEach(el=>observer.observe(el));
  }
  document.querySelector('#replay').addEventListener('click',()=>{
    history.replaceState(null,'','#home');window.scrollTo({top:0,behavior:'instant'});
    reveals.forEach(el=>{if(observer){el.classList.remove('visible');observer.observe(el);}});
    const logo=document.querySelector('.hero h1');logo.style.animation='none';void logo.offsetWidth;logo.style.animation='';
  });
  console.info('[正式像素 2/3] 像素階梯進場與重播完成。');
  const progress=document.querySelector('#reading-progress');
  const studio=document.querySelector('.studio-stage');
  const studioWide=matchMedia('(min-width: 721px)');
  if(studio){
    console.info('[像素工作室 0/2] 輸入絕對 URL：',location.href,
      ...['home-pixel.js','pixel-studio.css','assets/pixel-studio-desk.svg'].map(file=>new URL(file,base).href));
    console.info('[像素工作室 0/2] 輸出絕對 URL：',new URL('#studio',location.href).href,'場景 CSS 變數與視窗 DOM。');
    console.info('[像素工作室 1/2] 背景終端機與前景視窗就緒。');
  }
  let queued=false, lastStudioDepth;
  const draw=()=>{
    const range=document.documentElement.scrollHeight-innerHeight;
    if(studio&&studioWide.matches&&!paused&&!preference.matches){
      const top=studio.getBoundingClientRect().top;
      const depth=Math.min(1,Math.max(0,(.9-top/innerHeight)/1.12));
      if(depth!==lastStudioDepth){
        studio.style.setProperty('--studio-sky-offset',Math.round(52*depth)+'px');
        lastStudioDepth=depth;
      }
    }
    progress.style.width=(range>0?Math.min(100,Math.max(0,100*scrollY/range)):0)+'%';
    queued=false;
  };
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(draw);}};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('load',schedule);
  toggle.addEventListener('click',schedule);preference.addEventListener('change',schedule);
  if('ResizeObserver'in window)new ResizeObserver(schedule).observe(document.body);
  draw();console.info('[正式像素 3/3] 閱讀進度與正式首頁動畫就緒。');
  if(studio)console.info('[像素工作室 2/2] 捲動轉場、手機靜態場景與減少動態設定就緒。');
})();
