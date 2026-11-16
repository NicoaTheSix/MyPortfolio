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
    const poster = panel.querySelector('.poster-frame');
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
      if (panel.classList.contains('is-window-small') !== small) {
        panel.classList.toggle('is-window-small', small);
        poster?.dispatchEvent(new Event('poster-compact-change'));
      }
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

  const rowControls = document.querySelectorAll('[data-row-controls]');
  console.info('[橫列導覽 0/2] 輸入絕對 URL：',location.href,document.currentScript.src);
  for (const controls of rowControls) {
    const previous = controls.querySelector('[data-row-step="previous"]');
    const next = controls.querySelector('[data-row-step="next"]');
    const row = document.getElementById(previous.getAttribute('aria-controls'));
    const maxScroll = () => row.scrollWidth - row.clientWidth;
    const atStart = () => row.scrollLeft <= 1;
    const atEnd = () => row.scrollLeft >= maxScroll() - 1;
    console.info('[橫列導覽 0/2] 輸出絕對 URL：',new URL('#'+row.id,location.href).href,'的按鈕狀態與捲動位置。');

    const sync = () => {
      controls.hidden = maxScroll() <= 1;
      previous.setAttribute('aria-disabled',String(atStart()));
      next.setAttribute('aria-disabled',String(atEnd()));
    };
    const step = forward => {
      if (forward ? atEnd() : atStart()) return;
      const scrollLeft = row.scrollLeft;
      const padding = Number.parseFloat(getComputedStyle(row).scrollPaddingLeft) || 0;
      const start = row.getBoundingClientRect().left + row.clientLeft + padding;
      const limit = maxScroll();
      const stops = Array.from(row.children, card =>
        Math.min(limit, Math.max(0, card.getBoundingClientRect().left + scrollLeft - start))
      );
      stops.push(limit);
      if (!forward) stops.reverse();
      const destination = stops.find(stop => forward ? stop > scrollLeft + 1 : stop < scrollLeft - 1);
      row.scrollTo({left:destination ?? (forward ? limit : 0),behavior:'instant'});
      sync();
    };
    previous.addEventListener('click',()=>step(false));
    next.addEventListener('click',()=>step(true));
    row.addEventListener('scroll',sync,{passive:true});
    if ('ResizeObserver' in window) new ResizeObserver(sync).observe(row);
    else window.addEventListener('resize',sync);
    sync();
  }
  console.info('[橫列導覽 1/2] 控制按鈕、卡片位置與首尾狀態已接上。');
  console.info('[橫列導覽 2/2] 桌面箭頭與原生捲動已就緒。');

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
  const desktop=document.querySelector('.interactive-desk');
  const studioPage=desktop?.closest('.studio-page');
  let queued=false;
  const draw=()=>{
    const range=document.documentElement.scrollHeight-innerHeight;
    progress.style.width=(range>0?Math.min(100,Math.max(0,100*scrollY/range)):0)+'%';
    studioPage?.classList.toggle('desktop-in-view', desktop.getBoundingClientRect().bottom > innerHeight * .3);
    queued=false;
  };
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(draw);}};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('load',schedule);
  if('ResizeObserver'in window)new ResizeObserver(schedule).observe(document.body);
  draw();console.info('[正式像素 3/3] 閱讀進度與正式首頁動畫就緒。');
})();
