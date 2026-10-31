import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseHTML} from 'linkedom';
import {googleTag,googleTagBody} from './google-tag.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const version='20261031-poster-ready';
const pages=['index.html','en/index.html'];
for(const file of ['build-pixel-homepages.mjs','google-tag.mjs','pixel-prototype.html',...pages])console.log('[0/4] 輸入絕對路徑：',path.join(root,file));
for(const file of pages)console.log('[0/4] 輸出絕對路徑：',path.join(root,file));
const prototype=parseHTML(await readFile(path.join(root,'pixel-prototype.html'),'utf8')).document;
console.log('[1/4] 讀取已驗收的四格程式開發版面，保留正式頁原有內容。');
for(const [position,file] of pages.entries()){
  const english=position===1,prefix=english?'../':'./';
  const document=parseHTML(await readFile(path.join(root,file),'utf8')).document;
  const add=(tag,attributes,parent=document.head)=>{const el=document.createElement(tag);for(const [key,value]of Object.entries(attributes))el.setAttribute(key,value);parent.append(el);return el;};
  document.querySelector('meta[name="theme-color"]').setAttribute('content','#ffffff');
  for(const name of ['pixel-scenes.css','home-pixel.css']){
    const existing=document.querySelector(`link[href*="${name}"]`);
    if(existing)existing.setAttribute('href',`${prefix}${name}?v=${version}`);
    else add('link',{rel:'stylesheet',href:`${prefix}${name}?v=${version}`});
  }
  for(const name of ['home-pixel.js','pixel-scenes.js','pixel-service-posters.js']){
    const existing=document.querySelector(`script[src*="${name}"]`);
    if(existing)existing.setAttribute('src',`${prefix}${name}?v=${version}`);
    else add('script',{src:`${prefix}${name}?v=${version}`,defer:''});
  }
  const cards=[...document.querySelectorAll('#services .service-card')];
  if(cards.length!==4)throw new Error(`預期四項服務：${file}`);
  for(const [index,id]of ['development','scratch','translation','office'].entries()){
    const card=cards[index];card.id=`service-${id}`;
    if(card.querySelector('.poster-frame'))continue;
    const original=card.querySelector('.service-card-image'),image=original.querySelector('img').cloneNode(true);
    let poster;
    if(index===0){
      poster=prototype.querySelector('#development-poster-frame').cloneNode(true);
      for(const el of poster.querySelectorAll('[src],[href]'))for(const attr of ['src','href']){
        const value=el.getAttribute(attr);if(value?.startsWith('./'))el.setAttribute(attr,prefix+value.slice(2));
      }
      if(english){
        const source=`${prefix}assets/service-development-en.png`;
        poster.querySelector('#scenes-fallback').setAttribute('src',source);
        poster.querySelector('#scenes-fallback').setAttribute('alt',image.getAttribute('alt'));
        poster.querySelector('mask image').setAttribute('href',source);
        const title=poster.querySelector('#poster-title');
        title.setAttribute('aria-label','Software development: toggle pink-to-yellow title');
        title.querySelector('span').textContent='Software development';
        title.setAttribute('style','left:13.09%;top:9.77%;width:74.22%;height:21%;');
        const rect=poster.querySelector('svg>rect');rect.setAttribute('x','201');rect.setAttribute('width','1140');
        poster.querySelector('.poster-switch').setAttribute('aria-label','Software development poster display');
        poster.querySelector('#poster-original').textContent='Original';poster.querySelector('#poster-animated').textContent='Animated';
        poster.querySelector('#poster-view-status').textContent='Showing original poster';
        const names=['GUI applications','Automation','API integration','Technical documentation'];
        const descriptions=['Interactive pixel GUI: hover, focus or tap the fields to highlight them.','Three pixel gears turn and a checklist completes.','Pixel arrows exchange data between two terminals.','README code appears line by line, followed by a completion check.'];
        [...poster.querySelectorAll('.scene-card')].forEach((scene,i)=>{
          scene.querySelector('h3').textContent=names[i];scene.querySelector('canvas').setAttribute('aria-label',descriptions[i]);
          scene.querySelector('.scene-mode').textContent=i===0?'Interactive':'Looping animation';
          scene.querySelector('.scene-description').textContent=descriptions[i];
          scene.querySelector('.scene-status').textContent=i===0?'Choose a field.':names[i];
        });
        poster.querySelector('.gui-hotspots').setAttribute('aria-label','GUI highlight demo');
      }
    }else{
      card.setAttribute('data-service-poster',id);
      poster=document.createElement('div');poster.className='poster-frame';poster.setAttribute('data-view','original');poster.append(image);
      image.className='poster-base';
    }
    original.replaceWith(poster);
    const utility=document.createElement('div');utility.className='poster-utility';
    utility.innerHTML=`<button type="button" data-open-dialog="${id}-poster">${english?'Enlarge original':'放大原圖'} ↗</button><details class="poster-tools" hidden data-animation-tools><summary>${english?'Playback controls':'播放控制'} ＋</summary><div data-animation-controls></div></details>`;
    poster.after(utility);
    if(index===0){
      const controls=prototype.querySelector('#scene-controls').cloneNode(true);
      for(const link of controls.querySelectorAll('a'))link.setAttribute('href',prefix+link.getAttribute('href').slice(2));
      controls.classList.add('is-original');controls.setAttribute('inert','');
      if(english){
        controls.setAttribute('aria-label','Software development playback controls');
        controls.querySelector('#pixel-play').textContent='Loading';controls.querySelector('#pixel-step').textContent='Next frame →';
        controls.querySelector('label').firstChild.textContent='Frame ';
        controls.querySelector('input').setAttribute('aria-label','Choose animation frame');
        controls.querySelector('a').textContent='Download GIF ↓';
      }
      utility.querySelector('[data-animation-controls]').append(controls);
    }
  }
  if(!document.querySelector('#motion-toggle')){
    const aside=add('aside',{class:'site-motion-tools','aria-label':english?'Animation controls':'動畫控制'},document.body);
    aside.innerHTML=`<a href="#services">${english?'Services':'服務動畫'} ↑</a><button id="motion-toggle" type="button" aria-pressed="false">${english?'Pause animations':'暫停動畫'}</button><button id="replay" type="button">${english?'Replay intro':'重播進場'} ↺</button>`;
  }
  if(!document.querySelector('#reading-progress')){
    const track=add('div',{class:'home-reading-track','aria-hidden':'true'},document.querySelector('.site-header'));
    track.innerHTML='<span id="reading-progress"></span>';
  }
  for(const el of document.querySelectorAll('.service-card,.work-card,.about-layout,.process-list li'))el.classList.add('pixel-reveal');
  document.querySelectorAll('.service-card-image').forEach(el=>{if(el.tagName==='BUTTON')throw new Error('海報互動區不得巢狀按鈕');});
  const html=document.toString().replace(/<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->/,googleTag).replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/,googleTagBody);
  await writeFile(path.join(root,file),html.trimEnd()+'\n');
  console.log(`[${position+2}/4] ${file}：四項服務、獨立控制、像素外觀及原有內容整合完成。`);
}
console.log('[4/4] 中英文正式首頁已產生；尚需執行驗證與發布。');
