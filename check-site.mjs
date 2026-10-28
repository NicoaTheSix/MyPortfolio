import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.dirname(fileURLToPath(import.meta.url));
console.log(`[0/3] 輸入（絕對路徑）：${path.join(root, 'index.html')}、${path.join(root, 'assets')}、${path.join(root, 'styles.css')}、${path.join(root, 'script.js')}`);
console.log('[0/3] 輸出：終端檢查結果，不產生檔案。');
try {
  const html = await readFile(path.join(root, 'index.html'), 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'HTML 中不應出現重複 id');
  for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(anchor), `頁面錨點不存在：${anchor}`);
  console.log('[1/3] 頁面錨點及唯一 id 通過。');
  const files = new Set([...html.matchAll(/(?:src|href)="\.\/([^"#?]+)"/g)].map(match => match[1]));
  for (const relative of files) {
    const file = path.join(root, relative);
    assert((await stat(file)).isFile(), `引用檔案不存在：${file}`);
    if (relative.endsWith('.png')) {
      const data = await readFile(file);
      assert.equal(data.subarray(0,8).toString('hex'), '89504e470d0a1a0a', `不是有效 PNG：${file}`);
    }
  }
  console.log(`[2/3] ${files.size} 個相對路徑與 PNG 素材通過，適用 /MyPortfolio/ 子路徑。`);
  assert(html.includes('lang="zh-Hant"'), '缺少繁體中文語言設定');
  assert(html.includes('name="viewport"'), '缺少行動裝置設定');
  for (const image of html.matchAll(/<img\b[^>]*>/g)) assert(/\balt="[^"]+"/.test(image[0]), '圖片缺少替代文字');
  for (const [, attrs] of html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/g)) assert(attrs.includes('noopener'), '外部連結缺少 noopener');
  console.log('[3/3] 語言、行動裝置設定、圖片替代文字與外連檢查通過。');
} catch (error) {
  console.error('檢查失敗：', error.message);
  process.exitCode = 1;
}
