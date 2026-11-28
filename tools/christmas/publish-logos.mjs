import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {parseHTML} from 'linkedom';

assert(process.argv[2]&&process.argv[3],'Provide the source repository and accepted preview absolute paths.');
const source=path.resolve(process.argv[2]);
const input=path.resolve(process.argv[3]);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const output=path.join(root,'christmas/cards');
const delivery=path.join(input,'../logo-revision-delivery.json');
const manifestPath=path.join(root,'christmas/source-manifest.json');
const snapshot='bb9325edbfd57bea5b09eeaf8edc2f6211080483';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const normalized=value=>value.toString().replaceAll('\r\n','\n');
console.log(`輸入來源快照：${snapshot}\n輸入原稿：${path.join(source,'christmas/design')}\n輸入驗收網站：${input}\n輸入驗收明細：${delivery}\n輸出正式卡片：${output}\n輸入／輸出素材清單：${manifestPath}`);
const accepted=JSON.parse(await readFile(delivery,'utf8'));
assert.equal(accepted.snapshot,snapshot);
const preview=await readFile(path.join(input,'cards/index.html'));
const entry=accepted.artifacts.find(a=>path.resolve(a.path)===path.join(input,'cards/index.html'));
assert(entry);assert.equal(hash(preview),entry.sha256);
const original=await readFile(path.join(output,'index.html'),'utf8');
const body=preview.toString().split('<body>')[1].replace('<span class="view-label">卡片預覽</span>','');
const before=parseHTML(original).document;
const after=parseHTML(preview.toString()).document;
for(let year=2021;year<=2026;year++)assert.equal(normalized(before.getElementById(`content-${year}`).innerHTML),normalized(after.getElementById(`content-${year}`).innerHTML));
for(const file of ['cards.js','cards.css'])assert.equal(normalized(await readFile(path.join(output,file))),normalized(await readFile(path.join(input,'cards',file))));
await writeFile(path.join(output,'index.html'),original.split('<body>')[0]+'<body>'+body);
console.log('[1/3] 卡片正文與圖案已核對驗收快照；六年度原文及互動程式未變。');
const configPath=path.join(source,'christmas/design/logos.mjs');
assert.equal(normalized(await readFile(configPath)),normalized(execFileSync('git',['show',snapshot+':christmas/design/logos.mjs'],{cwd:source})));
const {logos}=await import(pathToFileURL(configPath).href);
await mkdir(path.join(output,'logos'),{recursive:true});
const added=[];
for(const logo of logos){
  const relative=`christmas/design/assets/${logo.file}.svg`;
  const bytes=await readFile(path.join(source,relative));
  assert.equal(normalized(bytes),normalized(execFileSync('git',['show',snapshot+':'+relative],{cwd:source})));
  await copyFile(path.join(source,relative),path.join(output,'logos',logo.file+'.svg'));
  added.push(`cards/logos/${logo.file}.svg`);
}
console.log('[2/3] 六份單色SVG原稿與已驗收快照一致並保存到正式資源。');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
manifest.yearLogosAcceptedSnapshot=snapshot;manifest.selectedCardPalette='c';
manifest.publicFiles=[...new Set([...manifest.publicFiles,...added])];
for(const file of ['cards/index.html',...added]){
  const bytes=await readFile(path.join(root,'christmas',file));
  manifest.assets=manifest.assets.filter(a=>a.path!==file);
  manifest.assets.push({path:file,sha256:hash(bytes),sizeBytes:bytes.length});
}
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('[3/3] 正式素材清單及C配色來源記錄完成，接著檢查與部署。');
