/* Shared production homepage motion; visitor preferences remain in memory. */
(() => {
  'use strict';
  const base=new URL('.',document.currentScript.src),en=document.documentElement.lang==='en';
  console.info('[正式像素 0/3] 輸入頁面絕對 URL：',location.href);
  for(const file of ['home-pixel.js','home-pixel.css','pixel-scenes.css'])console.info('[正式像素 0/3] 輸入檔案絕對 URL：',new URL(file,base).href);
  console.info('[正式像素 0/3] 輸出絕對 URL：',location.href,'頁面 DOM；不寫入檔案。');
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
  const progress=document.querySelector('#reading-progress');let queued=false;
  const draw=()=>{const range=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${range>0?Math.min(100,Math.max(0,100*scrollY/range)):0}%`;queued=false;};
  const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(draw);}};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('load',schedule);
  if('ResizeObserver'in window)new ResizeObserver(schedule).observe(document.body);
  draw();console.info('[正式像素 3/3] 閱讀進度與正式首頁動畫就緒。');
})();
