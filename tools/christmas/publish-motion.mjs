import assert from 'node:assert/strict';
import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

assert(process.argv[2],'Provide the source repository absolute path.');
const input=path.resolve(process.argv[2]);
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const snapshot='11979d8012edb3c969896dce6c7f670f29475965';
const output=path.join(root,'christmas/cards');
const manifestPath=path.join(root,'christmas/source-manifest.json');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
console.log(`輸入卡片程式：${path.join(input,'christmas/cards')}\n輸入已檢查快照：${snapshot}\n輸出正式卡片程式：${output}\n輸入／輸出素材清單：${manifestPath}\n輸出回歸檢查：${path.join(root,'tools/christmas/check-motion.mjs')}`);
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
for(const file of ['cards.js','cards.css']){
  const source=path.join(input,'christmas/cards',file);
  const actual=await readFile(source);
  const accepted=execFileSync('git',['show',`${snapshot}:christmas/cards/${file}`],{cwd:input});
  assert.equal(actual.toString().replaceAll('\r\n','\n'),accepted.toString().replaceAll('\r\n','\n'));
  await copyFile(source,path.join(output,file));
  const record=manifest.assets.find(a=>a.path===`cards/${file}`);
  record.sha256=hash(actual);record.sizeBytes=actual.length;
}
manifest.motionAcceptedSnapshot=snapshot;
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('[1/3] 已核對來源快照，更新卡片 CSS／JS 與素材雜湊。');
const test=(await readFile(path.join(input,'christmas/check-motion.mjs'),'utf8')).replace("path.join(here,'cards/cards.js')","path.resolve(here,'../../christmas/cards/cards.js')").replace("console.log('[2/2] 卡片完全抽離後才改層級，並垂直回到原位。');",'');
await writeFile(path.join(root,'tools/christmas/check-motion.mjs'),test);
console.log('[2/3] 實際抽卡回呼與切層時機的回歸檢查已複製。');
console.log('[3/3] 發布內容已備妥，接著執行檢查並升版部署。');
