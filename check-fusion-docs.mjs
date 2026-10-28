import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const root = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(root,'fusion-studio');
const reportFile = path.join(site,'validation-report.json');
const urlArgument=process.argv.indexOf('--url');
const previewUrl=urlArgument>=0?new URL(process.argv[urlArgument+1]):null;
console.log(`[0/5] 輸入網站／來源清單（絕對路徑）：${site}、${path.join(site,'source-manifest.json')}`);
console.log(`[0/5] 輸出驗證報告（絕對路徑）：${reportFile}`);
if(previewUrl)console.log('[0/5] 額外 HTTP 輸入（絕對 URL）：',previewUrl.href);
const documents = new Map(), external = new Set();
let localReferences = 0, downloads = 0;
const hash = data => createHash('sha256').update(data).digest('hex');
try {
  const manifest = JSON.parse(await readFile(path.join(site,'source-manifest.json'),'utf8'));
  const guides = manifest.pages.filter(p=>/^manual\/[^/]+(_en|\+_zh)\.md$/.test(p.source));
  assert.equal(guides.length,manifest.manualPairs * 2,'雙語指南收錄數量不符');
  for(const page of manifest.pages) {
    assert(manifest.pages.some(p=>p.key===page.key&&p.lang!==page.lang),`缺少語言對應：${page.path}`);
    assert(manifest.files.some(file=>file.path===page.source),`缺少來源雜湊：${page.source}`);
  }
  for(const file of manifest.generatedHtml) {
    const html = await readFile(path.join(site,file),'utf8');
    const {document} = parseHTML(html);
    assert(document.querySelector('main'),'缺少可閱讀的主要內容');
    assert(document.querySelector('h1'),`缺少頁面標題：${file}`);
    const ids=[...document.querySelectorAll('[id]')].map(element=>element.id);
    assert.equal(new Set(ids).size,ids.length,`重複 HTML id：${file}`);
    assert(html.includes(manifest.baseCommit.slice(0,12)),`缺少來源版本：${file}`);
    assert(document.querySelector('link[rel="alternate"][hreflang]'),`缺少語言切換標示：${file}`);
    documents.set(`fusion-studio/${file}`,{document,ids:new Set(ids)});
  }
  console.log(`[1/5] ${manifest.manualPairs} 組雙語指南、${documents.size} 個 HTML 頁面與語言對應通過。`);
  async function checkLink(from,href) {
    assert(!/^(?:file:|studio:|[A-Za-z]:[\\/])/i.test(href),`不允許的本機／程式協定：${from} → ${href}`);
    if(/^(https?:|mailto:)/i.test(href)){external.add(href);return;}
    const url = new URL(href,`https://local.test/MyPortfolio/${from}`);
    assert.equal(url.origin,'https://local.test',`不允許的協定或網址：${href}`);
    assert(url.pathname.startsWith('/MyPortfolio/'),`連結逸出 MyPortfolio：${from} → ${href}`);
    let target=decodeURIComponent(url.pathname.slice('/MyPortfolio/'.length));
    if(target.endsWith('/'))target+='index.html';
    const resolved=path.resolve(root,target);
    assert(resolved.startsWith(root+path.sep),'參照超出工作區');
    assert((await stat(resolved)).isFile(),`目標不存在：${from} → ${href}`);
    if(url.hash&&target.endsWith('.html')) {
      if(!documents.has(target)) {
        const {document}=parseHTML(await readFile(resolved,'utf8'));
        documents.set(target,{document,ids:new Set([...document.querySelectorAll('[id]')].map(e=>e.id))});
      }
      assert(documents.get(target).ids.has(decodeURIComponent(url.hash.slice(1))),`錨點不存在：${from} → ${href}`);
    }
    localReferences++;
  }
  for(const file of manifest.generatedHtml) {
    const p=`fusion-studio/${file}`, {document}=documents.get(p);
    for(const element of document.querySelectorAll('[href],[src]')) {
      const href=element.getAttribute('href')??element.getAttribute('src');
      if(href)await checkLink(p,href);
      if(element.hasAttribute('download'))downloads++;
    }
    for(const image of document.querySelectorAll('img'))assert(image.hasAttribute('alt'),`圖片缺少 alt：${p}`);
    for(const link of document.querySelectorAll('a[target="_blank"]'))assert(link.rel.includes('noopener'),`外連缺少 noopener：${p}`);
    if(file!=='index.html'&&file!=='en/index.html') {
      assert(document.querySelector('.prose'),`文件不是閱讀頁：${file}`);
      assert.equal(document.querySelectorAll('.docs-sidebar [aria-current="page"]').length,1,`目前頁面標示不唯一：${file}`);
      const page=manifest.pages.find(p=>p.path===file);
      const opposite=manifest.pages.find(p=>p.key===page.key&&p.lang!==page.lang);
      const switchUrl=new URL(document.querySelector('.language-switch').getAttribute('href'),`https://local.test/MyPortfolio/fusion-studio/${file}`);
      assert.equal(decodeURIComponent(switchUrl.pathname),`/MyPortfolio/fusion-studio/${opposite.path}`,'語言切換未維持主題');
    }
  }
  console.log(`[2/5] ${localReferences} 個頁面、章節、圖片與下載參照通過；沒有 file:// 或 studio:// 網頁入口。`);
  for(const asset of manifest.assets) {
    assert(!/\/(?:audit|report|verification|acceptance)\.json$/.test(asset.source),'不可發布測試日誌');
    const record=manifest.files.find(file=>file.path===asset.source);
    const bytes=await readFile(path.join(site,asset.path));
    assert.equal(hash(bytes),record.sha256,`素材雜湊不符：${asset.path}`);
  }
  console.log(`[3/5] ${manifest.assets.length} 份發布素材與來源 SHA-256 相符。`);
  const search=JSON.parse(await readFile(path.join(site,'search-index.json'),'utf8'));
  for(const entry of search) {
    assert(entry.text.length>0&&entry.title.length>0,'搜尋索引有空內容');
    assert(['zh','en'].includes(entry.lang),'搜尋語言無效');
    await checkLink('fusion-studio/index.html',entry.url);
    assert(manifest.pages.some(p=>p.path===entry.url.split('#')[0]&&p.lang===entry.lang),'搜尋結果語言不符');
  }
  for(const language of ['zh','en']) {
    assert(search.some(entry=>entry.lang===language&&/fusionstudio/i.test(entry.text)),'缺少新啟動命令搜尋結果');
    assert(search.some(entry=>entry.lang===language&&/CAR/.test(entry.text)),'缺少 CAR 搜尋內容');
  }
  console.log(`[4/5] ${search.length} 筆全文搜尋章節與實際頁面／錨點通過。`);
  let httpValidation=null;
  if(previewUrl) {
    assert(previewUrl.pathname.endsWith('/MyPortfolio/fusion-studio/'),'HTTP 檢查需使用 /MyPortfolio/fusion-studio/ 子路徑');
    assert(!previewUrl.username&&!previewUrl.password,'驗證 URL 不可包含帳密');
    const paths=[...manifest.generatedHtml,'docs.css','docs.js','search-index.json',...manifest.assets.map(asset=>asset.path)];
    for(let offset=0;offset<paths.length;offset+=8) {
      await Promise.all(paths.slice(offset,offset+8).map(async file=>{
        const response=await fetch(new URL(file,previewUrl));
        assert.equal(response.status,200,`HTTP 無法取得：${file}`);
        const bytes=Buffer.from(await response.arrayBuffer());
        assert.equal(hash(bytes),hash(await readFile(path.join(site,file))),`HTTP 內容與本次產物不符：${file}`);
      }));
      console.log(`[HTTP] 已驗證 ${Math.min(offset+8,paths.length)}/${paths.length} 個頁面與素材。`);
    }
    const video=manifest.assets.find(asset=>asset.path.endsWith('.mp4'));
    const partial=await fetch(new URL(video.path,previewUrl),{headers:{Range:'bytes=0-1023'}});
    assert.equal(partial.status,206,'影片不支援 HTTP Range');
    assert(partial.headers.get('content-type').startsWith('video/mp4'),'影片 MIME 錯誤');
    assert.equal((await partial.arrayBuffer()).byteLength,1024,'影片區段長度錯誤');
    for(const file of ['../../.git/config','../build-fusion-docs.mjs']) {
      const denied=await fetch(new URL(file,previewUrl));
      assert.equal(denied.status,404,'本機預覽不可暴露開發工具或 Git 設定');
    }
    httpValidation={baseUrl:previewUrl.href,exactContentMatches:paths.length,videoRange:'passed',privatePaths:'blocked'};
  }
  const report={status:'passed',checkedAt:new Date().toISOString(),baseCommit:manifest.baseCommit,includesUncommittedChanges:manifest.includesUncommittedChanges,manualPairs:manifest.manualPairs,htmlPages:manifest.generatedHtml.length,localReferences,assets:manifest.assets.length,downloads,searchSections:search.length,externalUrls:external.size,externalValidation:'URL syntax and local source tracking only; external network availability and access permissions are not asserted.',httpValidation,browserValidation:'See README.md for separately recorded browser checks.'};
  await writeFile(reportFile,JSON.stringify(report,null,2)+'\n');
  console.log(`[5/5] 全部靜態檢查通過，報告：${reportFile}`);
} catch(error) {
  console.error('文件驗證失敗：',error.stack);
  await writeFile(reportFile,JSON.stringify({status:'failed',error:error.message,checkedAt:new Date().toISOString()},null,2)+'\n').catch(()=>{});
  process.exitCode=1;
}
