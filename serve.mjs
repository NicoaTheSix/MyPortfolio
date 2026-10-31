import http from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
console.log(`[0/3] 輸入目錄（絕對路徑）：${root}`);
console.log(`[0/3] 輸出：本機預覽 http://127.0.0.1:${port}/MyPortfolio/，不寫入檔案。`);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.json':'application/json; charset=utf-8', '.mp4':'video/mp4', '.csv':'text/csv; charset=utf-8', '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.srt':'text/plain; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.md':'text/markdown; charset=utf-8', '.zip':'application/zip' };
const publicFiles = new Set(['index.html', 'styles.css', 'script.js', 'assets/portrait.png', 'assets/business-card.png', 'assets/services-poster.png', 'assets/favicon.svg', 'assets/social-linkedin.png', 'assets/social-github.png', 'assets/social-medium.png', 'assets/social-youtube.png']);
for(const file of ['en/index.html','assets/services-poster-en.png','assets/business-card-en.png','assets/office-services-poster.png','assets/office-services-poster-en.png'])publicFiles.add(file);
publicFiles.add('service-cards.css');
for(const language of ['zh','en'])for(const service of ['development','scratch','translation','office'])publicFiles.add(`assets/service-${service}-${language}.png`);
try {
  const manifest=JSON.parse(await readFile(path.join(root,'fusion-studio','source-manifest.json'),'utf8'));
  for(const relative of [...manifest.generatedHtml,...manifest.assets.map(asset=>asset.path),'docs.css','docs.js','search-index.json','source-manifest.json','build-report.json','validation-report.json']) {
    const absolute=path.resolve(root,'fusion-studio',relative);
    if(!absolute.startsWith(path.join(root,'fusion-studio')+path.sep))throw new Error('文件發布清單路徑無效');
    publicFiles.add('fusion-studio/'+relative);
  }
} catch(error) { if(error.code!=='ENOENT')throw error; }
try {
  const manifest=JSON.parse(await readFile(path.join(root,'desktiles/source-manifest.json'),'utf8'));
  for(const relative of manifest.publicFiles) {
    const absolute=path.resolve(root,'desktiles',relative);
    if(!absolute.startsWith(path.join(root,'desktiles')+path.sep))throw new Error('DeskTiles 發布清單路徑無效');
    publicFiles.add('desktiles/'+relative);
  }
} catch(error) { if(error.code!=='ENOENT')throw error; }
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
    let relative = route === '/' ? 'index.html' : route.slice(1);
    if(relative.endsWith('/'))relative+='index.html';
    if(publicFiles.has(relative+'/index.html')) {
      response.writeHead(302,{Location:url.pathname+'/'});
      response.end();
      return;
    }
    if (!publicFiles.has(relative)) {
      response.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' });
      response.end('找不到頁面');
      return;
    }
    const file = path.join(root, relative);
    const info=await stat(file);
    if(path.extname(file)==='.mp4'&&request.headers.range) {
      const range=/^bytes=(\d+)-(\d*)$/.exec(request.headers.range);
      const start=range?Number(range[1]):-1;
      const end=range&&range[2]?Math.min(Number(range[2]),info.size-1):info.size-1;
      if(start<0||start>=info.size||end<start) {
        response.writeHead(416,{'Content-Range':`bytes */${info.size}`}); response.end(); return;
      }
      response.writeHead(206,{'Content-Type':'video/mp4','Content-Range':`bytes ${start}-${end}/${info.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});
      if(request.method==='HEAD')response.end();else createReadStream(file,{start,end}).pipe(response);
      console.log(`[預覽] ${request.method} ${url.pathname} → 206`);
      return;
    }
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type':types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store', 'Content-Length':data.length, ...(['.zip','.md'].includes(path.extname(file))?{'Content-Disposition':'attachment; filename="'+path.basename(file)+'"'}:{}), ...(path.extname(file)==='.mp4'?{'Accept-Ranges':'bytes'}:{}) });
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
