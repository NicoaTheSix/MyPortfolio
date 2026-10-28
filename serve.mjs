import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
console.log(`[0/3] 輸入目錄（絕對路徑）：${root}`);
console.log(`[0/3] 輸出：本機預覽 http://127.0.0.1:${port}/MyPortfolio/，不寫入檔案。`);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml' };
const publicFiles = new Set(['index.html', 'styles.css', 'script.js', 'assets/portrait.png', 'assets/business-card.png', 'assets/services-poster.png', 'assets/favicon.svg', 'assets/social-linkedin.png', 'assets/social-github.png', 'assets/social-medium.png', 'assets/social-youtube.png']);
console.log('[1/3] 靜態檔案白名單完成。');
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    let route = decodeURIComponent(url.pathname);
    if (route === '/MyPortfolio') {
      response.writeHead(302, { Location:'/MyPortfolio/' });
      response.end();
      return;
    }
    if (route.startsWith('/MyPortfolio/')) route = route.slice('/MyPortfolio'.length);
    const relative = route === '/' ? 'index.html' : route.slice(1);
    if (!publicFiles.has(relative)) {
      response.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' });
      response.end('找不到頁面');
      return;
    }
    const file = path.join(root, relative);
    await stat(file);
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type':types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    response.end(request.method === 'HEAD' ? undefined : data);
    console.log(`[預覽] ${request.method} ${url.pathname} → 200`);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
});
console.log('[2/3] /MyPortfolio/ 子路徑預覽已設定。');
server.on('error', error => {
  console.error('預覽失敗：', error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`[3/3] 預覽已啟動：http://127.0.0.1:${port}/MyPortfolio/（Ctrl+C 結束）`));
