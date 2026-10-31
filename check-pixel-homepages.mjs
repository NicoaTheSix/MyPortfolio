import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {parseHTML} from 'linkedom';

const root=path.dirname(fileURLToPath(import.meta.url));
const pages=['index.html','en/index.html'];
const scripts=['home-pixel.js','pixel-scenes.js','pixel-service-posters.js'];
const sources=[...pages,...scripts,'poster-image-ready.js','home-pixel.css','pixel-scenes.css','assets/development-pixel-manifest.json','assets/service-animation-manifest.json'];
for(const file of sources)console.log('[0/4] 輸入絕對路徑：',path.join(root,file));
console.log('[0/4] 輸出：終端驗證結果，不寫入檔案。');
const at=process.argv.indexOf('--url'),url=at>=0?new URL(process.argv[at+1]):null;
if(url)console.log('[0/4] HTTP 輸入絕對 URL：',url.href);
try{
  const references=new Set(sources.filter(x=>!x.endsWith('.mjs')));
  for(const [i,file]of pages.entries()){
    const doc=parseHTML(await readFile(path.join(root,file),'utf8')).document;
    assert.equal(doc.querySelectorAll('#services .poster-frame').length,4);
    assert.equal(doc.querySelectorAll('#services [data-service-poster]').length,3);
    assert.equal(doc.querySelectorAll('#services canvas').length,4);
    assert.equal(doc.querySelectorAll('#services [data-animation-tools]').length,4);
    assert.equal(doc.querySelectorAll('#services .gui-hotspots').length,1);
    assert.equal(doc.querySelectorAll('button button').length,0);
    assert.equal(doc.querySelectorAll('#motion-toggle').length,1);
    assert(!doc.querySelector('meta[name="robots"][content*="noindex"]'));
    for(const script of scripts)assert(doc.querySelector(`script[src*="${script}?v="]`),`${file} 缺少帶版本的 ${script}`);
    const lang=i?'en':'zh';
    for(const [index,service]of ['development','scratch','translation','office'].entries()){
      const card=doc.querySelector(`#service-${service}`),image=card.querySelector('.poster-base');
      assert(image.getAttribute('src').endsWith(`service-${service}-${lang}.png`));
      references.add(`assets/service-${service}-${lang}.png`);
      assert(card.querySelector(`[data-open-dialog="${service}-poster"]`));
      if(!index)assert.equal(card.querySelectorAll('canvas').length,4);
    }
  }
  console.log('[1/4] 雙語四項服務、原圖來源、互動區及正式索引設定通過。');
  for(const script of scripts)new Script(await readFile(path.join(root,script),'utf8'),{filename:script});
  const services=JSON.parse(await readFile(path.join(root,'assets/service-animation-manifest.json'),'utf8')).services;
  assert.equal(services.length,3);
  const dev=JSON.parse(await readFile(path.join(root,'assets/development-pixel-manifest.json'),'utf8'));
  assert.equal(dev.fields.length,7);assert.equal(dev.scenes.length,4);
  for(const config of [dev,...services]){
    assert.equal(config.scenes.length,4);
    for(const scene of config.scenes){
      const file=`assets/${scene.sprite}`;references.add(file);
      const bytes=await readFile(path.join(root,file));assert.equal(bytes[24],1,`${file} 非 1-bit PNG`);
      assert((await stat(path.join(root,file))).size>0);
    }
    references.add(`assets/${config.gif}`);
  }
  console.log('[2/4] 三支前端語法、十六張 1-bit 影格表及七個 GUI 互動區規格通過。');
  for(const file of references)assert((await stat(path.join(root,file))).isFile());
  console.log(`[3/4] ${references.size} 個首頁與動態載入資源檔案存在。`);
  if(url){
    let count=0;
    for(const file of references){
      const response=await fetch(new URL(file,url));assert(response.ok,`${file}: HTTP ${response.status}`);
      const remote=Buffer.from(await response.arrayBuffer()),local=await readFile(path.join(root,file));
      const isText=/\.(?:html|css|js|json)$/.test(file);
      const same=isText?remote.toString('utf8').replaceAll('\r\n','\n')===local.toString('utf8').replaceAll('\r\n','\n'):remote.equals(local);
      assert(same,`${file}: HTTP 內容與本機不同${isText?'（已忽略 CRLF／LF 差異）':''}`);
      count++;if(count%10===0||count===references.size)console.log(`[4/4] HTTP 比對進度：${count}/${references.size}`);
    }
  }else console.log('[4/4] 本機檢查完成；可加 --url 比對預覽或正式網址。');
}catch(error){console.error('像素首頁驗證失敗：',error.message);process.exitCode=1;}
