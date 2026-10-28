import { copyFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const names = ['social-linkedin.png', 'social-github.png', 'social-medium.png', 'social-youtube.png'];
const sources = process.argv.slice(2).map(source => path.resolve(source));
const destinations = names.map(name => path.join(root, 'assets', name));
console.log('[0/5] 輸入檔案（絕對路徑）：', sources);
console.log('[0/5] 輸出檔案（絕對路徑）：', destinations);
try {
  if (sources.length !== 4) throw new Error('請依序提供 LinkedIn、GitHub、Medium、YouTube 四個 PNG 路徑。');
  for (const source of sources) {
    if (!(await stat(source)).isFile()) throw new Error(`不是檔案：${source}`);
  }
  await mkdir(path.join(root, 'assets'), { recursive: true });
  console.log('[1/5] 四份輸入檔案已確認。');
  for (let index = 0; index < sources.length; index++) {
    await copyFile(sources[index], destinations[index]);
    console.log(`[${index + 2}/5] 已複製 ${names[index]}，保留原始圖片內容。`);
  }
} catch (error) {
  console.error('社群素材準備失敗：', error.message);
  process.exitCode = 1;
}
