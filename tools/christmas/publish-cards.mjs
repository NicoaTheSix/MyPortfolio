import assert from 'node:assert/strict';
import {readFile, writeFile, mkdir, copyFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const input=path.resolve(process.argv[2]||'');
assert(process.argv[2], 'Provide the absolute accepted preview site path.');
const target=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const output=path.join(target,'christmas/cards');
const manifestPath=path.join(target,'christmas/source-manifest.json');
const acceptedPath=path.join(input,'../card-refinement-delivery.json');
const snapshot='0b485d89d12392144bd4d18d7b039999c473e34a';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
console.log(`輸入已驗收卡片：${path.join(input,'cards')}\n輸入驗收清單：${acceptedPath}\n輸出卡片：${output}\n輸入／輸出公開清單：${manifestPath}\n輸入／輸出首頁：${path.join(target,'index.html')}\n輸入／輸出英文首頁：${path.join(target,'en/index.html')}\n輸入／輸出原文列表：${path.join(target,'christmas/index.html')}`);
const accepted=JSON.parse(await readFile(acceptedPath,'utf8'));
assert.equal(accepted.snapshot_commit,snapshot);
await mkdir(output,{recursive:true});
for(const file of ['index.html','cards.css','cards.js']){
  const source=path.join(input,'cards',file);
  const bytes=await readFile(source);
  const entry=accepted.artifacts.find(a=>path.resolve(a.path)===source);
  assert(entry,`Missing accepted file ${source}`);
  assert.equal(hash(bytes),entry.sha256,`Accepted content changed: ${file}`);
  if(file.endsWith('.html')){
    const original=bytes.toString('utf8');
    const removeBadge=html=>html.replace('<span class="view-label">卡片預覽</span>','');
    const canonical='https://nicoathesix.github.io/MyPortfolio/christmas/cards/';
    const meta=`<meta name="description" content="Nicoa’Lab 聖誕節卡片，2021—2026。"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:title" content="聖誕節卡片｜Nicoa’Lab"><meta property="og:description" content="Nicoa’Lab 聖誕節卡片，2021—2026。"><meta property="og:url" content="${canonical}"><meta property="og:image" content="https://nicoathesix.github.io/MyPortfolio/christmas/images/2026-04.webp">`;
    const html=removeBadge(original).replace('<meta name="robots" content="noindex,nofollow">','').replace('聖誕節卡片｜圓弧卡片預覽','聖誕節卡片｜Nicoa’Lab').replace('</head>',meta+'</head>');
    assert.equal(html.split('<body>')[1],removeBadge(original).split('<body>')[1]);
    await writeFile(path.join(output,file),html);
  }else await copyFile(source,path.join(output,file));
}
console.log('[1/3] 已核對驗收雜湊並發布卡片檔案，原文與動畫保持一致。');
for(const [file,before,after] of [
  ['index.html','href="./christmas/">歷年紀錄','href="./christmas/cards/">歷年紀錄'],
  ['en/index.html','href="../christmas/">View archive','href="../christmas/cards/">View archive'],
  ['christmas/index.html','<div class="hero-actions">','<div class="hero-actions"><a class="button" href="cards/">卡片展示 ↗</a>'],
]){
  const dest=path.join(target,file);
  const html=await readFile(dest,'utf8');
  assert(html.includes(before)||html.includes(after),`Missing entry ${file}`);
  await writeFile(dest,html.includes(after)?html:html.replace(before,after));
}
console.log('[2/3] 中英文首頁及原文列表已接上卡片入口。');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
manifest.cardAcceptedSnapshot=snapshot;
manifest.publicFiles=[...new Set([...manifest.publicFiles,'cards/index.html','cards/cards.css','cards/cards.js'])];
manifest.generatedHtml=[...new Set([...manifest.generatedHtml,'cards/index.html'])];
for(const file of ['index.html','cards/index.html','cards/cards.css','cards/cards.js']){
  const bytes=await readFile(path.join(target,'christmas',file));
  manifest.assets=manifest.assets.filter(a=>a.path!==file);
  manifest.assets.push({path:file,sha256:hash(bytes),sizeBytes:bytes.length});
}
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('[3/3] 公開資源清單已更新；接著執行 SEO 檢查與正式站驗證。');
