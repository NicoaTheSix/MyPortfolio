import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {brandHead,brandLogo} from './brand.mjs';
import {buildBlog} from './build-blog.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
for(const file of ['brand.mjs','brand.css','assets/brand/source-manifest.json','index.html','en/index.html'])console.log('[0/3] 絕對輸入路徑：',path.join(root,file));
for(const file of ['index.html','en/index.html'])console.log('[0/3] 絕對輸出路徑：',path.join(root,file));
console.log('[1/3] 使用已核准的圖片標誌更新首頁，不修改個人介紹、產品或服務內容。');
for(const file of ['index.html','en/index.html']){
  const target=path.join(root,file),prefix=file.startsWith('en/')?'../':'./',href=asset=>prefix+asset;
  let html=await readFile(target,'utf8');
  html=html.replace(/<link\b[^>]*rel="(?:icon|apple-touch-icon)"[^>]*>/g,'').replace(/<link\b[^>]*href="[^"]*brand\.css[^\"]*"[^>]*>/g,'');
  html=html.replace('</head>',brandHead(href)+'</head>');
  assert(/<a class="brand"[^>]*>[\s\S]*?<\/a>/.test(html),'缺少品牌入口');
  html=html.replace(/<a class="brand"[^>]*>[\s\S]*?<\/a>/,`<a class="brand" href="#home" aria-label="Nicoa'Lab ${file.startsWith('en/')?'home':'首頁'}">${brandLogo(href)}</a>`);
  const hero=`<h1 id="hero-heading"><img id="wordmark" src="${href('assets/brand/nicoa-lab-wordmark-720.webp')}" srcset="${href('assets/brand/nicoa-lab-wordmark-720.webp')} 720w, ${href('assets/brand/nicoa-lab-wordmark-1440.webp')} 1440w" sizes="(max-width:720px) 100vw, 50vw" alt="Nicoa'Lab" width="1440" height="480" fetchpriority="high"></h1>`;
  html=html.replace(/<h1 id="hero-heading">[\s\S]*?<\/h1>/,hero);
  html=html.replace(/<a class="footer-brand"[\s\S]*?<\/a>/g,'');
  html=html.replace('<div class="container footer-inner">',`<div class="container footer-inner"><a class="footer-brand" href="#home" aria-label="Nicoa'Lab">${brandLogo(href,false)}</a>`);
  html=html.replace(/script\.js(?:\?v=[^"]*)?"/g,'script.js?v=20261107-brand"');
  await writeFile(target,html.replace(/^[ \t]+$/gm,''));
  console.log('[2/3] 首頁更新完成：',target);
}
await buildBlog({updateHome:false});
console.log('[3/3] 首頁及文章區品牌替換完成；正式版本與部署狀態維持不變。');
