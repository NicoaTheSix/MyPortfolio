/* Three additional service posters share one renderer; each has independent state. */
(() => {
  'use strict';
  const base=new URL('.',document.currentScript.src);
  const en=document.documentElement.lang==='en';
  const t=(zh,english)=>en?english:zh;
  const manifestURL = new URL('assets/service-animation-manifest.json',base);
  console.info('[服務動畫 0/3] 輸入頁面（絕對 URL）：',location.href);
  for (const path of ['pixel-service-posters.js','pixel-scenes.css','assets/service-animation-manifest.json']) console.info('[服務動畫 0/3] 輸入檔案（絕對 URL）：',new URL(path,base).href);
  for (const id of ['scratch','translation','office']) console.info('[服務動畫 0/3] 輸出：',new URL(`#${document.querySelector(`[data-service-poster="${id}"]`).id}`,location.href).href,'的四個 Canvas、標題漸層與顯示模式；不寫入檔案。');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const globalPause=() => preference.matches || document.body.classList.contains('motion-paused');
  const models=[];
  const imageFrom=url => new Promise((resolve,reject) => {
    const image=new Image();
    image.addEventListener('load',()=>resolve(image),{once:true});
    image.addEventListener('error',()=>reject(new Error(`素材無法載入：${url}`)),{once:true});
    image.src=url;
  });
  const mount=async config => {
    const root=document.querySelector(`[data-service-poster="${config.id}"]`);
    const poster=root.querySelector('.poster-frame');
    const imageURL=new URL(config.source,manifestURL).href;
    console.info(`[${config.title} 0/4] 輸入原圖：`,imageURL);
    config.scenes.forEach(scene=>console.info(`[${config.title} 0/4] 輸入影格表：`,new URL(scene.sprite,manifestURL).href));
    const prefix=`service-${config.id}`;
    const [tx,ty,tw,th]=config.titleRect;
    const title=document.createElement('button');
    title.type='button';title.className='poster-title';
    title.setAttribute('aria-label',`${config.title}${t('：切換標題漸層',': toggle title gradient')}`);title.setAttribute('aria-pressed','false');
    Object.assign(title.style,{left:`${100*tx/1536}%`,top:`${100*ty/1024}%`,width:`${100*tw/1536}%`,height:`${100*th/1024}%`});
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('poster-title-colour');svg.setAttribute('viewBox','0 0 1536 1024');svg.setAttribute('aria-hidden','true');
    svg.innerHTML=`<defs><linearGradient id="${prefix}-gradient" x1="0" y1="${ty}" x2="0" y2="${ty+th}" gradientUnits="userSpaceOnUse"><stop stop-color="${config.gradient[0]}"/><stop offset="1" stop-color="${config.gradient[1]}"/></linearGradient><filter id="${prefix}-invert" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0"/></filter><mask id="${prefix}-mask" x="0" y="0" width="1536" height="1024" maskUnits="userSpaceOnUse" style="mask-type:luminance"><image href="${imageURL}" width="1536" height="1024" filter="url(#${prefix}-invert)"/></mask></defs><rect x="${tx}" y="${ty}" width="${tw}" height="${th}" fill="url(#${prefix}-gradient)" mask="url(#${prefix}-mask)"/>`;
    poster.append(title,svg);
    title.addEventListener('click',()=>title.setAttribute('aria-pressed',String(title.getAttribute('aria-pressed')!=='true')));
    const mode=document.createElement('div');mode.className='poster-switch';mode.setAttribute('role','group');mode.setAttribute('aria-label',`${config.title}${t('海報顯示模式',' poster display')}`);
    const original=document.createElement('button');original.type='button';original.textContent=t('原圖','Original');original.setAttribute('aria-pressed','true');
    const animated=document.createElement('button');animated.type='button';animated.textContent=t('動畫','Animated');animated.setAttribute('aria-pressed','false');animated.disabled=true;
    mode.append(original,animated);poster.append(mode);
    const status=document.createElement('span');status.className='sr-only';status.setAttribute('role','status');status.setAttribute('aria-live','polite');poster.append(status);
    const gallery=document.createElement('div');gallery.className='scene-grid';gallery.hidden=true;gallery.id=`${prefix}-gallery`;poster.append(gallery);
    for (const button of [original,animated])button.setAttribute('aria-controls',gallery.id);
    const controls=document.createElement('div');controls.className='scene-controls is-original';controls.setAttribute('role','group');controls.setAttribute('aria-label',`${config.title}${t('動畫控制',' playback controls')}`);
    const play=document.createElement('button');play.type='button';play.textContent=t('載入中','Loading');play.disabled=true;
    const step=document.createElement('button');step.type='button';step.textContent=t('下一格 →','Next frame →');step.disabled=true;
    const label=document.createElement('label');label.append(t('影格 ','Frame '));
    const seek=document.createElement('input');seek.type='range';seek.min='0';seek.max='23';seek.step='1';seek.value='0';seek.disabled=true;seek.setAttribute('aria-label',`${config.title}${t('動畫影格',' animation frame')}`);label.append(seek);
    const counter=document.createElement('output');counter.className='pixel-type';counter.textContent='01 / 24';
    const download=document.createElement('a');download.textContent=t('下載動畫示意 GIF ↓','Download GIF ↓');download.href=new URL(config.gif,manifestURL).href;download.download=`Nicoa-${config.id}-animation.gif`;
    const outlet=root.querySelector('[data-animation-controls]')||root;
    controls.append(play,step,label,counter,download);outlet.append(controls);
    const note=document.createElement('p');note.className='scene-footnote';note.textContent=t('每一格都有獨立動畫。標題可懸停或點選變色；原圖／動畫切換與播放控制各自獨立。','Each panel is animated. Hover or tap the title for color. Display and playback controls are independent for each poster.');outlet.append(note);
    const model={root,poster,gallery,controls,view:'original',frame:preference.matches?20:0,paused:false,visible:!('IntersectionObserver' in window),scenes:[],play,seek,counter};
    const updatePlay=()=>{
      play.disabled=globalPause();play.textContent=play.disabled?t('全站已暫停','Motion paused'):model.paused?t('▶ 播放','▶ Play'):t('Ⅱ 暫停','Ⅱ Pause');
      play.setAttribute('aria-pressed',String(!model.paused&&!globalPause()));
    };
    const setView=view=>{
      model.view=view;poster.dataset.view=view;const isOriginal=view==='original';gallery.hidden=isOriginal;
      original.setAttribute('aria-pressed',String(isOriginal));animated.setAttribute('aria-pressed',String(!isOriginal));
      controls.classList.toggle('is-original',isOriginal);controls.inert=isOriginal;
      status.textContent=en?`${config.title}: showing ${isOriginal?'original':'animated'} poster`:`${config.title}：目前顯示${isOriginal?'原圖':'動畫'}`;
      console.info(`[${config.title} 狀態]`,isOriginal?'原圖':'動畫');
    };
    original.addEventListener('click',()=>setView('original'));setView('original');
    console.info(`[${config.title} 1/4] 專屬漸層、原圖／動畫切換與原位版面完成。`);
    model.scenes=await Promise.all(config.scenes.map(async scene=>{
      const sprite=await imageFrom(new URL(scene.sprite,manifestURL).href);
      const card=document.createElement('article');card.className='scene-card';card.dataset.serviceScene=scene.id;
      const [x,y,w,h]=scene.rect;Object.assign(card.style,{left:`${100*x/1536}%`,top:`${100*y/1024}%`,width:`${100*w/1536}%`,height:`${100*h/1024}%`});
      const surface=document.createElement('div');surface.className='scene-surface';
      const wrap=document.createElement('div');wrap.className='scene-canvas-wrap';
      const canvas=document.createElement('canvas');canvas.width=config.width;canvas.height=config.height;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${config.title}: ${scene.title}${t('像素動畫',' pixel animation')}`);
      const context=canvas.getContext('2d',{alpha:false});if(!context)throw new Error('此瀏覽器未提供 Canvas');context.imageSmoothingEnabled=false;
      wrap.append(canvas);surface.append(wrap);card.append(surface);gallery.append(card);
      return {...scene,sprite,card,surface,wrap,canvas,context};
    }));
    model.scenes.forEach(scene=>gallery.append(scene.card));
    console.info(`[${config.title} 2/4] 四格、共 96 影格載入完成。`);
    const fit=()=>model.scenes.forEach(scene=>{
      if(!scene.surface.clientWidth||!scene.surface.clientHeight)return;
      const factor=Math.min(scene.surface.clientWidth/config.width,scene.surface.clientHeight/config.height);
      scene.wrap.style.width=`${factor*config.width}px`;scene.wrap.style.height=`${factor*config.height}px`;
    });
    const draw=()=>{
      model.scenes.forEach((scene,index)=>{
        const frame=(model.frame+index*3)%24;
        scene.context.drawImage(scene.sprite,frame*config.width,0,config.width,config.height,0,0,config.width,config.height);
        scene.canvas.dataset.frame=String(frame);
      });
      seek.value=String(model.frame);counter.textContent=`${String(model.frame+1).padStart(2,'0')} / 24`;
    };
    model.draw=draw;
    animated.disabled=play.disabled=step.disabled=seek.disabled=false;
    animated.addEventListener('click',()=>{setView('animated');fit();draw();});
    play.addEventListener('click',()=>{model.paused=!model.paused;updatePlay();});
    step.addEventListener('click',()=>{model.paused=true;model.frame=(model.frame+1)%24;draw();updatePlay();});
    seek.addEventListener('input',()=>{model.paused=true;model.frame=Number(seek.value);draw();updatePlay();});
    setView('animated');fit();draw();updatePlay();
    controls.closest('[data-animation-tools]')?.removeAttribute('hidden');
    if('ResizeObserver' in window){const observer=new ResizeObserver(fit);model.scenes.forEach(scene=>observer.observe(scene.surface));}else window.addEventListener('resize',fit);
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{model.visible=entries[0].isIntersecting;}).observe(poster);
    new MutationObserver(updatePlay).observe(document.body,{attributes:true,attributeFilter:['class']});preference.addEventListener('change',updatePlay);
    console.info(`[${config.title} 3/4] 縮放、逐格、獨立暫停與全站減少動態設定完成。`);
    models.push(model);
    console.info(`[${config.title} 4/4] 四格動畫就緒。`);
  };
  const start=async()=>{
    const response=await fetch(manifestURL);if(!response.ok)throw new Error(`規格載入失敗：${response.status}`);
    const manifest=await response.json();
    if(en){
      const localized={
        scratch:{title:'Scratch tutoring',titleRect:[237,90,1074,177],names:['One-to-one lessons','Game projects','Animation','Logic and debugging']},
        translation:{title:'English–Chinese translation',titleRect:[128,108,1280,196],names:['Software UI','Technical documents','Articles','Localization'],rects:[[76,450,648,200],[817,449,629,203],[76,752,652,203],[809,756,642,199]]},
        office:{title:'Office automation',titleRect:[96,80,1340,232],names:['Table conversion','Formulas and calculations','Image to text','Batch processing'],rects:[[62,410,672,204],[804,410,673,204],[56,720,680,190],[793,718,680,190]]}
      };
      manifest.services.forEach(config=>{const local=localized[config.id];config.title=local.title;config.titleRect=local.titleRect;config.source=`service-${config.id}-en.png`;config.scenes.forEach((scene,index)=>{scene.title=local.names[index];if(local.rects)scene.rect=local.rects[index];});});
    }
    console.info('[服務動畫 1/3] 三項服務、十二個場景規格完成。');
    const results=await Promise.allSettled(manifest.services.map(config=>mount(config)));
    results.forEach((result,index)=>{if(result.status==='rejected'){
      const root=document.querySelector(`[data-service-poster="${manifest.services[index].id}"]`);
      root.querySelector('.scene-grid')?.setAttribute('hidden','');root.querySelector('.poster-frame').dataset.view='original';
      root.querySelector('.scene-controls')?.classList.add('is-original');
      console.warn('[服務動畫] 保留原圖：',manifest.services[index].title,result.reason.message);
    }});
    console.info(`[服務動畫 2/3] ${models.length}/3 海報載入完成。`);
    setInterval(()=>{if(document.hidden||globalPause())return;models.forEach(model=>{
      if(model.view==='animated'&&!model.paused&&model.visible){model.frame=(model.frame+1)%24;model.draw();}
    });},125);
    console.info('[服務動畫 3/3] 播放時鐘就緒；離開畫面、原圖模式及背景分頁不前進影格。');
  };
  start().catch(error=>console.warn('[服務動畫] 保留三張原圖：',error.message));
})();
