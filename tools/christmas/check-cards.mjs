import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseHTML} from 'linkedom';

assert(process.argv[2],'Provide the absolute accepted preview site path.');
const input=path.resolve(process.argv[2]);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const live=process.argv.includes('--live');
const report=path.resolve(input,'../'+(live?'cards-live-report.json':'cards-release-check-report.json'));
const section=path.join(root,'christmas');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
console.log(`輸入已驗收卡片：${path.join(input,'cards')}\n輸入發布卡片：${path.join(section,'cards')}\n輸出檢查報告：${report}`);
const published=await readFile(path.join(section,'cards/index.html'),'utf8');
const accepted=await readFile(path.join(input,'cards/index.html'),'utf8');
assert.equal(published.split('<body>')[1],accepted.replace('<span class="view-label">卡片預覽</span>','').split('<body>')[1]);
const {document}=parseHTML(published);
assert.equal(document.querySelector('link[rel="canonical"]').href,'https://nicoathesix.github.io/MyPortfolio/christmas/cards/');
assert(!document.querySelector('meta[name="robots"]'));
assert.equal(document.querySelectorAll('.fan-card').length,6);
let checkedLinks=0;
for(const doc of [document,...[...document.querySelectorAll('template')].map(t=>parseHTML(t.innerHTML).document)]){
  for(const node of doc.querySelectorAll('a[href],img[src],link[href],script[src]')){
    const value=node.getAttribute('href')||node.getAttribute('src');
    if(!value||/^(https?:|#)/.test(value))continue;
    const dest=path.resolve(section,'cards',value);
    assert(dest===section||dest.startsWith(section+path.sep));
    await access(value.endsWith('/')?path.join(dest,'index.html'):dest);
    checkedLinks++;
  }
}
for(const p of document.querySelectorAll('.cover-symbol path')){
  assert(p.getAttribute('d').split(/(?=M)/).filter(Boolean).every(part=>/Z\s*$/i.test(part)));
}
for(const file of ['cards.css','cards.js'])assert.equal(hash(await readFile(path.join(section,'cards',file))),hash(await readFile(path.join(input,'cards',file))));
assert((await readFile(path.join(root,'index.html'),'utf8')).includes('href="./christmas/cards/">歷年紀錄'));
assert((await readFile(path.join(root,'en/index.html'),'utf8')).includes('href="../christmas/cards/">View archive'));
assert((await readFile(path.join(section,'index.html'),'utf8')).includes('href="cards/">卡片展示'));
assert((await readFile(path.join(root,'sitemap.xml'),'utf8')).includes('https://nicoathesix.github.io/MyPortfolio/christmas/cards/'));
console.log(`[1/2] 原文模板與驗收版一致，六個閉合圖案、${checkedLinks}個連結及雙語入口通過。`);
const result={acceptedSnapshot:'0b485d89d12392144bd4d18d7b039999c473e34a',checkedLinks,live:[]};
if(live){
  const files=['christmas/cards/index.html','christmas/cards/cards.css','christmas/cards/cards.js','index.html','en/index.html','christmas/index.html','sitemap.xml','christmas/source-manifest.json'];
  for(const file of files){
    const url=new URL(file.replace(/index\.html$/,''),'https://nicoathesix.github.io/MyPortfolio/');
    url.searchParams.set('release','v1.36');
    const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
    assert.equal(response.status,200,`${url} HTTP ${response.status}`);
    const actual=await response.text();
    const expected=await readFile(path.join(root,file),'utf8');
    assert.equal(actual.replaceAll('\r\n','\n'),expected.replaceAll('\r\n','\n'),`${file} live content differs`);
    result.live.push({url:url.href,file,status:response.status,sha256:hash(actual)});
    console.log(`[2/2] 正式站驗證 ${result.live.length}/${files.length}：${file}`);
  }
}
await writeFile(report,JSON.stringify(result,null,2)+'\n');
console.log(`[2/2] 完成：${report}`);
