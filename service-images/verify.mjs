import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = new URL(process.argv[2] || 'http://127.0.0.1:4184/MyPortfolio/');
const files = ['index.html','en/index.html','service-cards.css'];
for (const lang of ['zh','en']) for (const service of ['development','scratch','translation','office']) files.push(`assets/service-${service}-${lang}.png`);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
console.log('[0/3] 輸入檔案（絕對路徑）：', files.map(file => path.join(root,file)));
console.log('[0/3] 輸入網站（絕對 URL）：', base.href);
console.log('[0/3] 輸出：終端 HTTP 與內容驗證，不寫入檔案。');
try {
  assert(['http:','https:'].includes(base.protocol) && base.pathname.endsWith('/'));
  console.log('[1/3] 開始核對中英文首頁、樣式與八張服務圖片。');
  for (let start = 0; start < files.length; start += 4) {
    const results = await Promise.allSettled(files.slice(start,start + 4).map(async file => {
      const response = await fetch(new URL(file,base), {signal:AbortSignal.timeout(20000), cache:'no-store'});
      assert.equal(response.status,200,`${file} HTTP 狀態`);
      const actual = Buffer.from(await response.arrayBuffer());
      const expected = await readFile(path.join(root,file));
      if (file.endsWith('.png')) {
        assert(response.headers.get('content-type')?.includes('image/png'),`${file} MIME`);
        assert.equal(hash(actual),hash(expected),`${file} 圖片雜湊不一致`);
      } else assert.equal(actual.toString().replaceAll('\r\n','\n'),expected.toString().replaceAll('\r\n','\n'),`${file} 內容不一致`);
      return file;
    }));
    for (const result of results) { if (result.status === 'rejected') throw result.reason; }
    console.log(`[2/3] HTTP 與內容比對完成 ${Math.min(start + 4,files.length)}/${files.length}。`);
  }
  console.log('[3/3] 11 個公開檔案驗證成功；八張圖片與本機原檔 SHA-256 一致。');
} catch (error) { console.error('發布驗證失敗：',error.message); process.exitCode = 1; }
