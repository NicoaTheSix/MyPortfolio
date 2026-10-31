import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseHTML} from 'linkedom';
const root=path.dirname(fileURLToPath(import.meta.url));
const english=process.argv.includes('--english'),lang=english?'en':'zh';
const delayAt=process.argv.indexOf('--delay'),delay=delayAt>=0?Number(process.argv[delayAt+1]):15000;
if(!Number.isFinite(delay)||delay<0||delay>60000)throw new Error('--delay 必須介於 0 與 60000 毫秒');
const page=english?'en/index.html':'index.html';
let failOnce=process.argv.includes('--fail-once');
console.log('[0/3] 輸入絕對路徑：',path.join(root,page),path.join(root,`assets/service-office-${lang}.png`));
console.log('[0/3] 程式輸入絕對路徑：',fileURLToPath(import.meta.url));
console.log('[0/3] 素材代理輸入絕對 URL：http://127.0.0.1:4173/MyPortfolio/（只代理既有預覽白名單）。');
console.log('[0/3] 輸出：http://127.0.0.1:4174/；僅供可控制底圖延遲的回歸檢查，不寫入素材。');
const doc=parseHTML(await readFile(path.join(root,page),'utf8')).document;
doc.head.insertAdjacentHTML('afterbegin',`<base href="http://127.0.0.1:4174/MyPortfolio/${english?'en/':''}">`);
doc.querySelector('#service-office .poster-base').setAttribute('src','http://127.0.0.1:4174/delayed-office.png');
const html=doc.toString(),png=await readFile(path.join(root,`assets/service-office-${lang}.png`));
console.log(`[1/3] 使用正式首頁與正式前端；文書海報底圖延遲 ${delay}ms，首次失敗：${failOnce}。`);
http.createServer(async(req,res)=>{
 if(req.url.startsWith('/delayed-office.png')){
  if(failOnce){failOnce=false;res.writeHead(503,{'Cache-Control':'no-store'});res.end('Fixture: first image request fails');console.log('[2/3] 已重現第一次載入失敗，等待使用者按重試。');return;}
  console.log('[2/3] 底圖請求開始等待；其餘動畫素材可先載入。');
  setTimeout(()=>{res.writeHead(200,{'Content-Type':'image/png','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'});res.end(png);console.log('[3/3] 延遲底圖已送出。');},delay);
 }else if(req.url.startsWith('/MyPortfolio/')){
  const response=await fetch('http://127.0.0.1:4173'+req.url);res.writeHead(response.status,{'Content-Type':response.headers.get('content-type'),'Cache-Control':'no-store'});res.end(Buffer.from(await response.arrayBuffer()));
 }else{res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);}
}).listen(4174,'127.0.0.1',()=>console.log('[1/3] 延遲重現頁面已啟動。'));
