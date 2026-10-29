import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {googleTag, measurementId} from './google-tag.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const checkOnly=process.argv.includes('--check');
const urlPosition=process.argv.indexOf('--url');
const manifestFile=path.join(root,'fusion-studio/source-manifest.json');
console.log('[0/4] 輸入設定（絕對路徑）：',path.join(root,'google-tag.mjs'));
console.log('[0/4] 輸入頁面清單（絕對路徑）：',manifestFile);
console.log('[0/4] 輸入文件產生器（絕對路徑）：',path.join(root,'build-fusion-docs.mjs'));
console.log('[0/4] 輸出：',checkOnly||urlPosition>=0?'終端驗證結果，不修改檔案':'以下每頁的原路徑（插入 Google tag）');
const normal=text=>text.replaceAll('\r\n','\n');
function validate(html,label) {
  const text=normal(html);
  assert(text.includes('<head>\n'+googleTag),`${label}：Google tag 必須緊接在 <head> 後方`);
  assert.equal((text.match(/googletagmanager\.com\/gtag\/js\?/g)||[]).length,1,`${label}：Google tag 載入數不等於一`);
  assert.equal((text.match(/gtag\(['"]config['"]/g)||[]).length,1,`${label}：config 數不等於一`);
  assert.equal((text.match(/gtag\(['"]event['"],\s*['"]page_view['"]/g)||[]).length,0,`${label}：重複手動 page_view`);
  assert(text.includes(`gtag('config', '${measurementId}');`),`${label}：GA4 ID 不符`);
}
try {
  let base=null;
  if(urlPosition>=0) {
    assert(process.argv[urlPosition+1],'--url 缺少網站網址');
    base=new URL(process.argv[urlPosition+1]);
    assert(['https:','http:'].includes(base.protocol)&&!base.username&&!base.password,'不接受此驗證網址');
    assert(base.pathname.endsWith('/'),'--url 網站網址必須以 / 結尾');
    console.log('[0/4] 額外公開輸入 URL：',base.href);
  }
  const manifest=JSON.parse(await readFile(manifestFile,'utf8'));
  const files=['index.html','en/index.html',...manifest.generatedHtml.map(file=>'fusion-studio/'+file)];
  const documents=[];
  for(const file of files) {
    assert(/^(?:index\.html|en\/index\.html|fusion-studio\/(?:en\/|zh\/)?[a-z0-9-]+\.html)$/.test(file),'頁面路徑不符');
    console.log('[0/4] 頁面輸入'+(checkOnly||base?'':'／輸出')+'（絕對路徑）：',path.join(root,file));
    documents.push({file,html:await readFile(path.join(root,file),'utf8')});
  }
  console.log(`[1/4] 已盤點 ${files.length} 頁；Google 驗證檔不屬於追蹤頁面。`);
  const loader=normal(googleTag).match(/<script>\n([\s\S]*?)\n<\/script>/)[1];
  new Script(loader,{filename:'google-tag-inline.js'});
  const builder=await readFile(path.join(root,'build-fusion-docs.mjs'),'utf8');
  assert(builder.includes("import { googleTag } from './google-tag.mjs';"),'文件產生器缺少共用代碼設定');
  assert(builder.includes('<head>\n${googleTag}\n<meta'),'文件模板缺少 Google tag');
  let changed=0;
  for(const document of documents) {
    if(!checkOnly&&!base&&!normal(document.html).includes(googleTag)) {
      assert(!/googletagmanager\.com|gtag\(/.test(document.html),`${document.file} 已有其他追蹤設定，停止以免重複`);
      assert.equal((document.html.match(/<head>/g)||[]).length,1,'頁面 head 數不等於一');
      document.updated=document.html.replace(/<head>\r?\n?/,'<head>\n'+googleTag+'\n');
    }
    validate(document.updated??document.html,document.file);
  }
  console.log('[2/4] 全部頁面的代碼位置、唯一性、GA4 ID 及 JavaScript 語法通過。');
  if(!checkOnly&&!base)for(const document of documents) {
    if(document.updated) {await writeFile(path.join(root,document.file),document.updated);changed++;}
  }
  console.log(`[3/4] ${checkOnly||base?'僅檢查，無檔案變更':'已更新 '+changed+' 頁'}。`);
  if(base)for(let offset=0;offset<files.length;offset+=8) {
    await Promise.all(files.slice(offset,offset+8).map(async file=>{
      const url=new URL(file,base),response=await fetch(url,{signal:AbortSignal.timeout(20000)});
      assert.equal(response.status,200,`${url.href} HTTP 狀態`);
      validate(await response.text(),url.href);
    }));
    console.log(`[HTTP] 已確認 ${Math.min(offset+8,files.length)}/${files.length} 頁的公開 Google tag。`);
  }
  console.log(`[4/4] ${files.length} 頁 Google tag ${measurementId} ${base?'發布':'設定'}驗證完成。`);
} catch(error) {console.error('Google tag 處理失敗：',error.message);process.exitCode=1;}
