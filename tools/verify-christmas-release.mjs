import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parseHTML } from 'linkedom';

const [targetArg,inputArg,mode] = process.argv.slice(2);
assert(targetArg && inputArg, 'Usage: node verify-release.mjs <release-worktree> <accepted-preview-site> [--live]');
const target = path.resolve(targetArg);
const input = path.resolve(inputArg);
const report = path.resolve(input,'../'+(mode==='--live'?'live-release-report.json':'release-check-report.json'));
const section = path.join(target,'christmas');
console.log(`輸入正式檔案：${target}\n輸入已驗收版本：${input}\n輸出檢查報告：${report}`);
const manifest = JSON.parse(await readFile(path.join(section,'source-manifest.json'),'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
let checks=0;
for (const file of manifest.publicFiles) {
  const published = await readFile(path.join(section,file));
  const approved = await readFile(path.join(input,file));
  if (file.endsWith('.html')) {
    const html = published.toString();
    const {document} = parseHTML(html);
    const canonical = new URL('christmas/'+file.replace(/index\.html$/,''),'https://nicoathesix.github.io/MyPortfolio/').href;
    assert.equal(document.querySelector('link[rel="canonical"]').href,canonical);
    assert(!document.querySelector('meta[name="robots"]'));
    assert(!document.querySelector('.preview-label'));
    assert.equal(html.split('<body>')[1],approved.toString().replace(/<span class="preview-label"><i><\/i> 本機預覽<\/span>/,'').split('<body>')[1],`正文與驗收內容不同：${file}`);
    for (const el of document.querySelectorAll('a[href],img[src],link[href],script[src]')) {
      const href = el.getAttribute('href')||el.getAttribute('src');
      if (!href || href.startsWith('http')) continue;
      const url = new URL(href,canonical);
      let relative = decodeURIComponent(url.pathname.replace('/MyPortfolio/christmas/',''));
      if (!relative || relative.endsWith('/')) relative+='index.html';
      assert(manifest.publicFiles.includes(relative),`${file} 無效連結 ${href}`);
      checks++;
    }
  } else assert.equal(sha(published),sha(approved),`素材雜湊不同：${file}`);
  checks++;
}
assert((await readFile(path.join(target,'index.html'),'utf8')).includes('href="./christmas/"'));
assert((await readFile(path.join(target,'en/index.html'),'utf8')).includes('href="../christmas/"'));
const sitemap = await readFile(path.join(target,'sitemap.xml'),'utf8');
for (const file of manifest.generatedHtml) assert(sitemap.includes(new URL('christmas/'+file.replace(/index\.html$/,''),'https://nicoathesix.github.io/MyPortfolio/').href));
console.log(`[1/2] ${checks} 項正文、素材、連結、canonical及sitemap檢查通過。`);
const result = {acceptedSnapshot:manifest.acceptedSnapshot,checks,files:manifest.publicFiles.length,live:[]};
if (mode==='--live') {
  const queue = [...manifest.publicFiles.map(file=>'christmas/'+file),'index.html','en/index.html','sitemap.xml'];
  let done=0;
  await Promise.all(Array.from({length:4},async()=>{
    while(queue.length) {
      const file = queue.shift();
      const url = new URL(file.replace(/index\.html$/,''),'https://nicoathesix.github.io/MyPortfolio/');
      url.searchParams.set('release','v1.35');
      const response = await fetch(url,{signal:AbortSignal.timeout(20000)});
      assert.equal(response.status,200,`${url} HTTP ${response.status}`);
      const expected = await readFile(path.join(target,file));
      const actual = Buffer.from(await response.arrayBuffer());
      assert.equal(sha(actual),sha(expected),`${file} 正式站雜湊不符`);
      result.live.push({file,url:url.href,status:response.status,sha256:sha(actual)});
      done++;console.log(`[2/2] 正式站驗證 ${done}/${manifest.publicFiles.length+3}：${file}`);
    }
  }));
}
await writeFile(report,JSON.stringify(result,null,2)+'\n');
console.log(`[2/2] 完成，報告：${report}`);
