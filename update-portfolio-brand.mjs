import {readFile, writeFile, copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root=path.dirname(fileURLToPath(import.meta.url));
const sources=process.argv.slice(2).map(file=>path.resolve(file));
const cards=['assets/business-card.png','assets/business-card-en.png'];
const brand='Nicoa The Six';
const formerName=/chung[ -]+lun\s+wu/gi;
console.log('[0/4] 圖片輸入（絕對路徑）：',sources);
console.log('[0/4] 圖片輸出（絕對路徑）：',cards.map(file=>path.join(root,file)));
console.log('[0/4] 清單輸入（絕對路徑）：',path.join(root,'fusion-studio/source-manifest.json'));
try {
  assert.equal(sources.length,2,'依序提供中、英文新名片 PNG 的絕對路徑');
  const images=await Promise.all(sources.map(file=>readFile(file)));
  for(const bytes of images) {
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','名片須為 PNG');
    assert(bytes.readUInt32BE(16)/bytes.readUInt32BE(20)>2,'名片須維持橫幅');
  }
  const manifest=JSON.parse(await readFile(path.join(root,'fusion-studio/source-manifest.json'),'utf8'));
  const pages=['index.html','en/index.html',...manifest.generatedHtml.map(file=>'fusion-studio/'+file)];
  const files=[...pages,'build-fusion-docs.mjs','README.md','portfolio-image-prompts.md'];
  for(const file of files)console.log('[0/4] 文字輸入／輸出（絕對路徑）：',path.join(root,file));
  console.log('[1/4] 兩張名片與文字檔案清單已確認。');
  for(let index=0;index<cards.length;index++)await copyFile(sources[index],path.join(root,cards[index]));
  console.log('[2/4] 中英文名片已替換；原始生成檔保留原位。');
  const display=text=>text.replace(/Nicoa(?:（chung[ -]+lun\s+wu）| \(chung[ -]+lun\s+wu\))/gi,brand)
    .replace(/Nicoa, chung[ -]+lun\s+wu/gi,brand).replace(formerName,brand)
    .replace(/\bnicoa\b(?! The Six)/gi,brand);
  for(const file of files) {
    const before=await readFile(path.join(root,file),'utf8');
    let after=before;
    if(file==='index.html'||file==='en/index.html') {
      // Change display copy and accessible labels while preserving URLs and asset paths.
      after=after.replace(/(<[^>]+>)|([^<]+)/g,(whole,tag,text)=>tag?
        tag.replace(/\b(alt|aria-label|content)="([^"]*)"/g,(_,attribute,value)=>`${attribute}="${display(value)}"`):display(text));
      after=after.replace(/<p class="english-name">[\s\S]*?<\/p>/,'<p class="english-name">THE SIX</p>');
      after=after.replace(/<p class="mono">Nicoa The Six<\/p>/,'<p class="mono">WORDS &amp; CODE</p>');
      after=after.replace(/(business-card(?:-en)?\.png)(?:\?v=[^" ]*)?/g,'$1?v=20261029-brand');
      after=after.replace(/(download="[^"]*business-card(?:-en)?\.png)\?v=20261029-brand/g,'$1');
      if(file.startsWith('en/'))after=after.replace(/(business-card-en\.png\?v=20261029-brand"[^>]*width=")\d+(" height=")\d+/,`$1${images[1].readUInt32BE(16)}$2${images[1].readUInt32BE(20)}`);
    } else if(file==='README.md'||file==='portfolio-image-prompts.md') {
      after=after.replace(/Nicoa（chung[ -]+lun\s+wu）/gi,brand).replace(formerName,brand);
    } else {
      after=after.replaceAll('>Nicoa ↗</a>','>Nicoa The Six ↗</a>').replaceAll('NICOA / OPEN SOURCE','Nicoa The Six / OPEN SOURCE');
    }
    if(after!==before)await writeFile(path.join(root,file),after);
  }
  console.log(`[3/4] ${pages.length} 個內容頁面與維護文件的個人名稱已更新。`);
  for(const file of pages)assert(!new RegExp(formerName.source,'i').test(await readFile(path.join(root,file),'utf8')),`${file} 仍有原姓名`);
  console.log('[4/4] 網站 HTML 已無原姓名；圖片文字另經目視核對。');
} catch(error) {console.error('名稱更新失敗：',error.message);process.exitCode=1;}
