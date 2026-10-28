import { copyFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const names = ['services-poster.png', 'portrait.png', 'business-card.png'];
const sources = process.argv.slice(2).map(source => path.resolve(source));
const destinations = names.map(name => path.join(root, 'assets', name));
console.log('[0/4] 輸入檔案（絕對路徑）：', sources);
console.log('[0/4] 輸出檔案（絕對路徑）：', destinations);
try {
  if (sources.length !== 3) throw new Error('請依序提供服務小卡、肖像、名片三個 PNG 檔案路徑。');
  for (const source of sources) {
    if (!(await stat(source)).isFile()) throw new Error(`不是檔案：${source}`);
  }
  await mkdir(path.join(root, 'assets'), { recursive: true });
  console.log('[1/4] 三份輸入檔案已確認。');
  for (let index = 0; index < sources.length; index++) {
    await copyFile(sources[index], destinations[index]);
    console.log(`[${index + 2}/4] 已複製 ${names[index]}，保留原始圖片內容。`);
  }
} catch (error) {
  console.error('素材準備失敗：', error.message);
  process.exitCode = 1;
}
