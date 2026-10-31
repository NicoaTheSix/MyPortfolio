import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { googleTag, googleTagBody } from './google-tag.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const site=path.join(root,'desktiles');
const manifestFile=path.join(site,'source-manifest.json');
const reportFile=path.join(site,'validation-report.json');
const urlPosition=process.argv.indexOf('--url');
const base=urlPosition>=0?new URL(process.argv[urlPosition+1]):null;
const origin='https://portfolio.test/MyPortfolio/';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const normalize=text=>text.replaceAll('\r\n','\n');
console.log('[0/5] 輸入網站／來源清單（絕對路徑）：',site,manifestFile);
console.log('[0/5] 輸入首頁／GTM（絕對路徑）：',path.join(root,'index.html'),path.join(root,'en/index.html'),path.join(root,'google-tag.mjs'));
console.log('[0/5] 輸出驗證報告（絕對路徑）：',reportFile);
if(base)console.log('[0/5] HTTP 輸入（絕對 URL）：',base.href);
try {
  const manifest=JSON.parse(await readFile(manifestFile,'utf8'));
  assert.equal(manifest.generatedHtml.length,6);
  const documents=new Map();
  for(const file of [...manifest.generatedHtml.map(file=>'desktiles/'+file),'index.html','en/index.html']) {
    const html=await readFile(path.join(root,file),'utf8');
    const {document}=parseHTML(html);
    const ids=[...document.querySelectorAll('[id]')].map(element=>element.id);
    assert.equal(new Set(ids).size,ids.length,`${file} 重複 id`);
    assert(document.querySelector('h1')&&document.querySelector('main'),`${file} 缺少標題或主要內容`);
    documents.set(file,{html,document,ids:new Set(ids)});
  }
  console.log('[1/5] 六個專案頁與兩種語言首頁的標題、主要內容及唯一 id 通過。');
  let references=0;
  async function checkReference(from,reference) {
    if(/^(?:https?:|mailto:)/i.test(reference))return;
    const url=new URL(reference,new URL(from,origin));
    assert.equal(url.origin,'https://portfolio.test',`不允許的協定：${reference}`);
    assert(url.pathname.startsWith('/MyPortfolio/'),`路徑離開網站：${reference}`);
    let relative=decodeURIComponent(url.pathname.slice('/MyPortfolio/'.length));
    if(!relative||relative.endsWith('/'))relative+='index.html';
    const absolute=path.resolve(root,relative);
    assert(absolute.startsWith(root+path.sep),`路徑離開網站：${reference}`);
    assert((await stat(absolute)).isFile(),`${from} 缺少檔案：${relative}`);
    if(url.hash&&relative.endsWith('.html')) {
      let target=documents.get(relative);
      if(!target){const {document}=parseHTML(await readFile(absolute,'utf8'));target={ids:new Set([...document.querySelectorAll('[id]')].map(x=>x.id))};}
      assert(target.ids.has(decodeURIComponent(url.hash.slice(1))),`${from} 缺少錨點：${reference}`);
    }
    references++;
  }
  for(const [file,{document}] of documents) {
    for(const element of document.querySelectorAll('[href],[src]')) {
      for(const attribute of ['href','src'])if(element.hasAttribute(attribute))await checkReference(file,element.getAttribute(attribute));
    }
  }
  for(const asset of manifest.assets) {
    const bytes=await readFile(path.join(site,asset.path));
    assert.equal(bytes.length,asset.bytes,`${asset.path} 大小不同`);
    assert.equal(hash(bytes),asset.sha256,`${asset.path} 雜湊不同`);
    if(asset.path.endsWith('.png'))assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  }
  const zip=await readFile(path.join(site,'downloads/DeskTiles-Windows-x64.zip'));
  assert.equal(hash(zip).toUpperCase(),manifest.zipSha256.toUpperCase());
  const sums=await readFile(path.join(site,'downloads/SHA256SUMS.txt'),'utf8');
  assert.equal(sums.match(/([a-f0-9]{64})\s+DeskTiles-Windows-x64\.zip/i)?.[1].toLowerCase(),hash(zip));
  console.log(`[2/5] ${references} 個站內引用與錨點、${manifest.assets.length} 個素材／下載雜湊及 ZIP 校驗通過。`);
  const index=JSON.parse(await readFile(path.join(site,'search-index.json'),'utf8'));
  for(const entry of index) {
    assert(['zh','en'].includes(entry.lang)&&entry.title&&typeof entry.text==='string','搜尋項目格式錯誤');
    assert.equal(entry.lang,entry.url.startsWith('en/')?'en':'zh','搜尋語言不同');
    await checkReference('desktiles/search-index.json',entry.url);
  }
  for(const file of manifest.generatedHtml) {
    const from='desktiles/'+file,{html,document}=documents.get(from);
    const en=file.startsWith('en/'),opposite=en?file.slice(3):'en/'+file;
    assert.equal(document.documentElement.lang,en?'en':'zh-Hant');
    const switcher=document.querySelector('.language-switch');
    assert.equal(new URL(switcher.getAttribute('href'),new URL(from,origin)).href,new URL('desktiles/'+opposite,origin).href,'語言切換未對應同頁');
    assert.equal(document.querySelectorAll('.docs-sidebar [aria-current="page"]').length,1,'側欄目前頁面標記錯誤');
    assert(index.some(entry=>entry.url===file),`${file} 不在搜尋索引`);
    assert(normalize(html).includes(googleTag)&&normalize(html).includes(googleTagBody),`${file} 缺少完整 GTM`);
    assert.equal((html.match(/<!-- Google Tag Manager -->/g)||[]).length,1);
    assert.equal((html.match(/<!-- Google Tag Manager \(noscript\) -->/g)||[]).length,1);
    assert(!html.includes('gtag/js?id='),'不應重複直接載入 GA4');
    for(const image of document.querySelectorAll('img'))assert(image.hasAttribute('alt'),'缺少圖片替代文字');
    for(const link of document.querySelectorAll('a[target="_blank"]'))assert(link.getAttribute('rel')?.includes('noopener'),'外部連結缺少 noopener');
  }
  for(const lang of ['zh','en']) {
    const file=lang==='zh'?'index.html':'en/index.html';
    const card=documents.get(file).document.querySelector('#project-desktiles');
    assert(card,`${file} 缺少作品卡`);
    assert.equal(card.querySelectorAll('a[download]').length,1,'作品卡缺少 Windows ZIP 下載');
    assert(card.textContent.includes('Linux'),'作品卡缺少平台限制');
    assert(index.some(entry=>entry.lang===lang&&entry.text.includes(lang==='zh'?'透明':'timer')),'搜尋未包含實際文件內容');
  }
  console.log(`[3/5] 雙語導覽、${index.length} 筆搜尋、首頁作品入口、圖片替代文字與六頁 GTM 通過。`);
  let httpFiles=0;
  if(base) {
    assert(['http:','https:'].includes(base.protocol)&&base.pathname.endsWith('/'));
    for(let start=0;start<manifest.publicFiles.length;start+=8) {
      const results=await Promise.allSettled(manifest.publicFiles.slice(start,start+8).map(async file=>{
        const response=await fetch(new URL(file,base),{signal:AbortSignal.timeout(20000),cache:'no-store'});
        assert.equal(response.status,200,`${file} HTTP`);
        const actual=Buffer.from(await response.arrayBuffer()),expected=await readFile(path.join(site,file));
        if(/\.(?:html|css|json)$/.test(file))assert.equal(normalize(actual.toString()),normalize(expected.toString()),`${file} HTTP 內容不同`);
        else assert.equal(hash(actual),hash(expected),`${file} HTTP 原始檔不同`);
        if(file.endsWith('.zip'))assert(/zip|octet-stream/.test(response.headers.get('content-type')||''),'ZIP MIME 不正確');
      }));
      for(const result of results)if(result.status==='rejected')throw result.reason;
      httpFiles+=results.length;
      console.log(`[4/5] HTTP 內容與下載核對 ${httpFiles}/${manifest.publicFiles.length}。`);
    }
  } else console.log('[4/5] 未指定 --url，略過 HTTP 發布比對。');
  await writeFile(reportFile,JSON.stringify({project:'DeskTiles',passed:true,pages:manifest.generatedHtml.length,assets:manifest.assets.length,localReferences:references,searchEntries:index.length,zipBytes:zip.length,zipSha256:hash(zip),httpFiles,httpVerified:Boolean(base),applicationTests:'Not rerun; project-provided validation only.'},null,2)+'\n');
  console.log('[5/5] DeskTiles 發布檢查成功：',reportFile);
} catch(error) {console.error('DeskTiles 檢查失敗：',error.message);process.exitCode=1;}
