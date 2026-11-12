import http from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
console.log(`[0/3] 輸入目錄（絕對路徑）：${root}`);
console.log(`[0/3] 輸出：本機預覽 http://127.0.0.1:${port}/MyPortfolio/，不寫入檔案。`);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.gif':'image/gif', '.svg':'image/svg+xml', '.json':'application/json; charset=utf-8', '.mp4':'video/mp4', '.csv':'text/csv; charset=utf-8', '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.srt':'text/plain; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.md':'text/markdown; charset=utf-8', '.zip':'application/zip' };
types['.webp']='image/webp';
const publicFiles = new Set(['brand.css','index.html', 'styles.css', 'script.js', 'assets/portrait.png', 'assets/business-card.png', 'assets/services-poster.png', 'assets/favicon.svg', 'assets/social-linkedin.png', 'assets/social-github.png', 'assets/social-medium.png', 'assets/social-youtube.png']);
types['.woff2']='font/woff2';
for(const file of ['fonts.css','cubic-11.woff2','OFL-Cubic-11.txt'])publicFiles.add('assets/fonts/'+file);
types['.xml']='application/xml; charset=utf-8';
publicFiles.add('sitemap.xml');
for(const file of ['en/index.html','assets/services-poster-en.png','assets/business-card-en.png','assets/office-services-poster.png','assets/office-services-poster-en.png'])publicFiles.add(file);
publicFiles.add('service-cards.css');
for(const file of ['home-pixel.css','home-pixel.js','pixel-studio.css','studio-space.js','assets/pixel-studio-desk.svg','assets/3d/studio-desk/nicoa-pixel-desk.png'])publicFiles.add(file);
for(const file of ['resume/index.html','resume/en/index.html','resume/resume.css'])publicFiles.add(file);
for (const file of ['index.html', 'styles.css', 'site.js', 'motion.html', 'motion.css', 'motion.js', ...['lin-da-full-body', 'hero-residence', 'taiwan-street-hero', 'taiwan-entry-color', 'taiwan-living-room-color', 'woodland-home', 'daylight-flat', 'courtyard-house'].map(name => `assets/images/${name}.png`)]) {
  publicFiles.add('demos/lin-da/' + file);
}
for (const file of ['index.html', 'styles.css', 'site.js', ...['town-valley', 'koji-ceramics', 'forest-trail', 'daylight-creek', 'firefly-creek', 'ceramic-festival'].map(name => `assets/images/${name}.png`)]) {
  publicFiles.add('demos/town-memory/' + file);
}
for (const file of ['index.html', 'styles.css', 'pets.js', 'site.js']) {
  publicFiles.add('demos/pixel-pets/' + file);
}
for (const file of ['index.html', 'styles.css', 'site.js', ...['cafe-interior', 'vivarium', 'gargoyle-gecko', 'crested-gecko', 'leopard-gecko', 'giant-gecko', 'ball-python', 'red-tail-boa'].map(name => `assets/images/${name}.webp`)]) {
  publicFiles.add('demos/reptile-cafe/' + file);
}
for (const demo of ['lin-da', 'town-memory', 'pixel-pets', 'reptile-cafe']) {
  for (const file of ['index.html', 'en/index.html', 'logo.png', 'logo-transparent.png']) {
    publicFiles.add(`demos/${demo}/advanced/${file}`);
  }
}
for (const file of ['advanced.css', 'advanced.js']) {
  publicFiles.add(`demos/advanced/${file}`);
}
for (const file of ['pixel-prototype.html', 'pixel-prototype.css', 'pixel-prototype.js']) publicFiles.add(file);
for (const file of ['pixel-automation.css', 'pixel-automation.js', ...['sprite.png','still.png','manifest.json'].map(suffix => `assets/automation-pixel-${suffix}`), 'assets/automation-pixel.gif']) publicFiles.add(file);
for (const file of ['pixel-scenes.css','pixel-scenes.js','assets/gui-pixel-states.png','assets/api-pixel-sprite.png','assets/docs-pixel-sprite.png','assets/development-pixel.gif','assets/development-pixel-still.png','assets/development-pixel-manifest.json']) publicFiles.add(file);
publicFiles.add('pixel-service-posters.js');
publicFiles.add('poster-image-ready.js');
publicFiles.add('poster-animation-data.js');
publicFiles.add('assets/service-animation-manifest.json');
for (const [service,scenes] of Object.entries({scratch:['teaching','game','animation','debug'],translation:['software','technical','articles','terminology'],office:['convert','formula','ocr','batch']})) {
  for(const scene of scenes) publicFiles.add(`assets/${service}-${scene}-pixel.png`);
  for(const ext of ['gif','png']) publicFiles.add(`assets/${service}-animation-preview.${ext}`);
}
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
try {
  const brand=JSON.parse(await readFile(path.join(root,'assets/brand/source-manifest.json'),'utf8'));
  for(const file of brand.publicFiles){const absolute=path.resolve(root,file);if(!absolute.startsWith(path.join(root,'assets/brand')+path.sep))throw new Error('Brand manifest path invalid');publicFiles.add(file);}
} catch(error){if(error.code!=='ENOENT')throw error;}
try {
  const manifest=JSON.parse(await readFile(path.join(root,'blog/source-manifest.json'),'utf8'));
  for(const relative of manifest.publicFiles) {
    const absolute=path.resolve(root,'blog',relative);
    if(!absolute.startsWith(path.join(root,'blog')+path.sep)||relative.startsWith('posts/'))throw new Error('Blog 發布清單路徑無效');
    publicFiles.add('blog/'+relative);
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
