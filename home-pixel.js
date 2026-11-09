/* Shared production homepage motion; visitor preferences remain in memory. */
(() => {
  'use strict';
  const base=new URL('.',document.currentScript.src),en=document.documentElement.lang==='en';
  console.info('[正式像素 0/3] 輸入頁面絕對 URL：',location.href);
  for(const file of ['home-pixel.js','home-pixel.css','pixel-scenes.css'])console.info('[正式像素 0/3] 輸入檔案絕對 URL：',new URL(file,base).href);
  console.info('[正式像素 0/3] 輸出絕對 URL：',location.href,'頁面 DOM；不寫入檔案。');
  const portrait=document.querySelector('#portrait-window'),content=document.querySelector('#portrait-content');
  const controls=portrait?.querySelector('.portrait-controls'),reopen=document.querySelector('.portrait-reopen');
  if(portrait&&content&&controls&&reopen){
    console.info('[肖像視窗 0/3] 輸入絕對 URL：',new URL('assets/portrait.png',base).href,new URL('home-pixel.js',base).href,new URL('home-pixel.css',base).href);
    console.info('[肖像視窗 0/3] 輸出絕對 URL：',new URL('#portrait-window',location.href).href,'視窗 DOM；狀態只保留於本頁。');
    const art=portrait.closest('.hero-art'),message=art.querySelector('[data-portrait-message]');
    const collapse=controls.querySelector('[data-portrait-action="collapse"]'),resize=controls.querySelector('[data-portrait-action="resize"]'),close=controls.querySelector('[data-portrait-action="close"]');
    let expanded=true,small=false;
    const label=(button,value)=>{button.setAttribute('aria-label',value);button.title=value;};
    const render=()=>{
      content.hidden=!expanded;portrait.classList.toggle('is-small',small);
      collapse.setAttribute('aria-expanded',String(expanded));collapse.querySelector('span').textContent=expanded?'−':'＋';
      label(collapse,en?(expanded?'Collapse portrait':'Expand portrait'):(expanded?'收合照片':'展開照片'));
      resize.setAttribute('aria-pressed',String(small));label(resize,en?(small?'Restore portrait size':'Shrink portrait'):(small?'還原照片大小':'縮小照片'));
    };
    collapse.addEventListener('click',()=>{expanded=!expanded;render();message.textContent=en?(expanded?'Portrait expanded.':'Portrait collapsed.'):(expanded?'照片已展開。':'照片已收合。');});
    resize.addEventListener('click',()=>{small=!small;expanded=true;render();message.textContent=en?(small?'Portrait size reduced.':'Portrait size restored.'):(small?'照片已縮小。':'照片已還原大小。');});
    console.info('[肖像視窗 1/3] 收合／展開與縮小／還原完成。');
    close.addEventListener('click',()=>{portrait.hidden=true;art.classList.add('is-portrait-closed');reopen.hidden=false;message.textContent=en?'Portrait closed. Use Reopen portrait to show it again.':'照片已關閉，可按重新開啟照片恢復。';reopen.focus({preventScroll:true});});
    reopen.addEventListener('click',()=>{expanded=true;small=false;render();portrait.hidden=false;art.classList.remove('is-portrait-closed');reopen.hidden=true;message.textContent=en?'Portrait reopened.':'照片已重新開啟。';close.focus({preventScroll:true});});
    console.info('[肖像視窗 2/3] 關閉、重新開啟與鍵盤焦點完成。');
    render();controls.hidden=false;
    console.info('[肖像視窗 3/3] 中英文肖像視窗控制就緒。');
  }
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
    console.info('[像素工作室 1/2] 桌面場景與原生收合視窗就緒。');
  }
  let queued=false, lastStudioDepth;
  const draw=()=>{
    const range=document.documentElement.scrollHeight-innerHeight;
    if(studio&&studioWide.matches&&!paused&&!preference.matches){
      const top=studio.getBoundingClientRect().top;
      const depth=Math.min(1,Math.max(0,(.9-top/innerHeight)/1.12));
      if(depth!==lastStudioDepth){
        studio.style.setProperty('--studio-sky-offset',Math.round(52*depth)+'px');
        studio.style.setProperty('--studio-desk-offset',Math.round(44-56*depth)+'px');
        studio.style.setProperty('--studio-desk-scale',(.82+.27*depth).toFixed(3));
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
