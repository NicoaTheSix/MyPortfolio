import { copyFile, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const names = ['services-poster-en.png', 'business-card-en.png', 'office-services-poster.png', 'office-services-poster-en.png'];
const sources = process.argv.slice(2).map(file => path.resolve(file));
const destinations = names.map(name => path.join(root,'assets',name));
const manifestFile = path.join(root,'fusion-studio','source-manifest.json');
console.log('[0/4] 圖片輸入（絕對路徑）：',sources);
console.log('[0/4] 文件頁面清單輸入（絕對路徑）：',manifestFile);
console.log('[0/4] 圖片輸出（絕對路徑）：',destinations);
console.log('[0/4] 英文文件返回連結輸出目錄（絕對路徑）：',path.join(root,'fusion-studio','en'));
try {
  if(sources.length!==4)throw new Error('依序提供英文服務圖卡、英文名片、中文文書服務圖卡、英文文書服務圖卡四個 PNG 路徑。');
  const manifest=JSON.parse(await readFile(manifestFile,'utf8'));
  const englishPages=manifest.generatedHtml.filter(file=>file.startsWith('en/'));
  for(const file of englishPages) {
    if(!/^en\/[a-z0-9-]+\.html$/.test(file))throw new Error(`文件路徑不符：${file}`);
    console.log('[0/4] 文件輸入／輸出（絕對路徑）：',path.join(root,'fusion-studio',file));
  }
  for(const [index,file] of sources.entries()) {
    if(!(await stat(file)).isFile())throw new Error(`不是檔案：${file}`);
    const bytes=await readFile(file);
    if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error(`不是 PNG：${file}`);
    const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
    if(index===1?width/height<2:width!==height)throw new Error(`圖片比例不符：${file}`);
    console.log(`[1/4] 已確認 ${names[index]}：${width} × ${height}`);
  }
  for(const [index,file] of sources.entries()) {
    await copyFile(file,destinations[index]);
    console.log(`[2/4] 圖片已複製 ${index+1}/${sources.length}：${destinations[index]}`);
  }
  let count=0;
  for(const file of englishPages) {
    const absolute=path.join(root,'fusion-studio',file);
    const html=await readFile(absolute,'utf8');
    const href=path.posix.relative(path.posix.dirname('fusion-studio/'+file),'en/index.html')+'#works';
    const updated=html.replace(/(<a class="portfolio-link" href=")[^"]+("[^>]*>)/,`$1${href}$2`);
    if(!html.includes('class="portfolio-link"'))throw new Error(`缺少 Portfolio 入口：${file}`);
    if(updated!==html)await writeFile(absolute,updated);
    count++;
  }
  console.log(`[3/4] ${count} 個英文文件頁的返回入口已接至英文作品集。`);
  console.log('[4/4] 雙語素材與入口準備完成；請執行 node check-site.mjs。');
} catch(error) {console.error('語系素材準備失敗：',error.message);process.exitCode=1;}
