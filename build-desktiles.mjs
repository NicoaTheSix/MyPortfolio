import {readFile, writeFile, copyFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {Marked} from 'marked';
import sanitizeHtml from 'sanitize-html';
import {parseHTML} from 'linkedom';
import {googleTag,googleTagBody} from './google-tag.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const sourcePosition=process.argv.indexOf('--source');
const source=sourcePosition>=0&&process.argv[sourcePosition+1]?path.resolve(process.argv[sourcePosition+1]):null;
const output=path.join(root,'desktiles');
const date='2026-10-31';
const hash=data=>createHash('sha256').update(data).digest('hex');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const relative=(from,to)=>path.posix.relative(path.posix.dirname(from),to)||'./';
const copies=[
  ['README.md','downloads/README.md'],['docs/使用說明.md','downloads/guide-zh.md'],
  ...['shapes','control','border','background','typography'].map(name=>['docs/'+name+'.png','assets/'+name+'.png']),
  ['assets/DeskTiles.svg','assets/DeskTiles.svg'],['assets/DeskTiles-logo.png','assets/DeskTiles-logo.png'],
  ['release/DeskTiles-Windows-x64.zip','downloads/DeskTiles-Windows-x64.zip'],
  ['release/SHA256SUMS.txt','downloads/SHA256SUMS.txt'],['docs/mixed-shapes.json','downloads/mixed-shapes.json'],
  ['docs/驗證摘要.txt','downloads/validation.txt']
];
const generatedHtml=['index.html','guide.html','readme.html','en/index.html','en/guide.html','en/readme.html'];
const titles={zh:{index:'桌面拼格 DeskTiles',guide:'使用說明',readme:'專案 README'},en:{index:'DeskTiles',guide:'User guide',readme:'Project README'}};
const fileFor=(lang,key)=>(lang==='en'?'en/':'')+(key==='index'?'index':key)+'.html';
const pages=generatedHtml.map(file=>({file,lang:file.startsWith('en/')?'en':'zh',key:path.posix.basename(file,'.html')}));
const zipFile='downloads/DeskTiles-Windows-x64.zip';
const texts={zh:{docs:'專案與文件',search:'搜尋文件',language:'English',back:'回作品集',menu:'專案導覽',toc:'本頁內容',skip:'跳至內容',copy:'複製',download:'下載 Windows x64 ZIP',guide:'閱讀使用說明',markdown:'下載 Markdown',original:'原始文件',note:'Windows 10 / 11 x64 · 免安裝 ZIP',footer:'Nicoa The Six · DeskTiles 文件',searchHint:'輸入文字搜尋目前語言的文件。'},en:{docs:'PROJECT & DOCS',search:'Search docs',language:'繁體中文',back:'Portfolio',menu:'Project navigation',toc:'On this page',skip:'Skip to content',copy:'Copy',download:'Download Windows x64 ZIP',guide:'Read the user guide',markdown:'Download Markdown',original:'Source document',note:'Windows 10 / 11 x64 · Portable ZIP',footer:'Nicoa The Six · DeskTiles documentation',searchHint:'Search the documentation in the current language.'}};
console.log('[0/5] 來源目錄（絕對路徑）：',source||'缺少 --source');
console.log('[0/5] 網站輸出目錄（絕對路徑）：',output);
for(const [from,to] of copies)console.log('[0/5] 複製輸入／輸出（絕對路徑）：',source&&path.join(source,from),'→',path.join(output,to));
for(const lang of ['guide','readme'])console.log('[0/5] 英文翻譯輸入／下載輸出（絕對路徑）：',path.join(output,'content',lang+'-en.md'),'→',path.join(output,'downloads',lang+'-en.md'));
for(const file of [...generatedHtml,'search-index.json','source-manifest.json'])console.log('[0/5] 輸出（絕對路徑）：',path.join(output,file));
for(const file of ['index.html','en/index.html'])console.log('[0/5] 首頁輸入／輸出（絕對路徑）：',path.join(root,file));

let zipSha,zipSize;
const parser=new Marked({gfm:true});
function gallery(lang) {
  const captions=lang==='zh'?['控制視窗：選取格子、編輯文字、圖片與計時器','邊框與風格：實色、像素、RGB 與呼吸燈','背景與透明度：分別套用背景色與透明度','大小與文字：尺寸、字體、字級與文字顏色']:['Controller: select tiles and edit text, images or timers','Borders: solid, pixel, RGB and breathing styles','Background: separate color and transparency settings','Size and text: tile size, font and text color'];
  return '<h2 id="ui-screenshots">'+(lang==='zh'?'操作畫面':'Application screenshots')+'</h2><p>'+(lang==='zh'?'以下為實際 Windows 版本畫面。':'Screenshots show the actual Windows build with its original Chinese UI.')+'</p><div class="screenshot-grid">'+['control','border','background','typography'].map((name,i)=>'<figure><a href="'+(lang==='en'?'../':'')+'assets/'+name+'.png" target="_blank" rel="noopener noreferrer"><img src="'+(lang==='en'?'../':'')+'assets/'+name+'.png" alt="'+captions[i]+'" loading="lazy"></a><figcaption>'+captions[i]+'</figcaption></figure>').join('')+'</div>';
}
function overview(page) {
  const zh=page.lang==='zh',r=to=>relative(page.file,to),t=texts[page.lang];
  const features=zh?[
    ['形狀自由拼排','六角形、朝上正三角形與 3:2 矩形。Shift 多選後一起拖曳，靠近其他格自動吸附。'],
    ['放入當下需要的內容','顯示文字、PNG／JPEG／BMP 圖片，或正向與倒數計時器。'],
    ['外觀各有自己的節奏','調整大小、字體、背景透明度，選擇實色、像素、RGB 或單色呼吸邊框。'],
    ['版面可以一起帶走','匯出含圖片的 JSON；匯入時可覆蓋或合併，搬移時不用逐一找回圖片。']
  ]:[
    ['Arrange your own shapes','Hexagons, upward triangles and 3:2 rectangles. Shift-select a group, drag it together and snap near other tiles.'],
    ['Keep useful content nearby','Display text, PNG / JPEG / BMP images, elapsed-time timers or countdowns.'],
    ['Give each tile its own style','Adjust size, font and background transparency. Choose solid, pixel, RGB or single-color breathing borders.'],
    ['Take the whole layout with you','Export JSON with embedded images. Replace or merge on import without finding every image again.']
  ];
  return `<section class="docs-hero product-hero"><p class="eyebrow">NICOA THE SIX / WINDOWS DESKTOP TOOL</p><h1>${zh?'桌面拼格':'DeskTiles'}<span>${zh?'DeskTiles':'Make room for what matters.'}</span></h1><p class="hero-subtitle">${zh?'桌面上的一小格，留給重要的事。':'Text, images and timers. Your desktop, arranged your way.'}</p><p>${zh?'把想記住的文字、圖片與時間，放進可以自由拼排的小格子。選一個形狀，為桌面留一點自己的空間。':'Keep a note, a picture or a timer within reach. Pick a shape and make a small space of your own on the desktop.'}</p><div class="hero-buttons"><a class="primary-button" href="${r(zipFile)}" download>${t.download} ↓</a><a class="secondary-button" href="${r(fileFor(page.lang,'guide'))}">${t.guide} ↗</a></div><p class="platform-note">${t.note}</p><figure class="product-cover"><img src="${r('assets/shapes.png')}" alt="${zh?'桌面拼格的六角形文字格、三角形圖片格與矩形計時器':'A hexagonal note, triangular image and rectangular timer in DeskTiles'}" width="597" height="448" fetchpriority="high"><figcaption>${zh?'三種形狀，可以是提醒、圖片，也可以是時間。':'Three shapes. A reminder, a picture, a moment in time.'}</figcaption></figure></section>
  <section class="home-section" id="features"><div class="section-title"><h2>${zh?'一張桌面，幾種可能。':'A desktop with room for possibilities.'}</h2><span>01 / FEATURES</span></div><div class="desk-feature-grid">${features.map(([title,description],i)=>`<article><span class="eyebrow">0${i+1}</span><h3>${title}</h3><p>${description}</p></article>`).join('')}</div></section>
  <section class="home-section prose" id="quick-start"><h2>${zh?'解壓縮，就能開始。':'Extract it. Open it. Make it yours.'}</h2><ol><li>${zh?'下載 Windows x64 ZIP，完整解壓縮。':'Download the Windows x64 ZIP and extract the entire archive.'}</li><li>${zh?'開啟 DeskTiles 資料夾，雙擊 DeskTiles.exe。':'Open the DeskTiles folder and double-click DeskTiles.exe.'}</li><li>${zh?'選形狀並新增格子；編輯內容後按「套用至所有選取格」。':'Choose a shape and add a tile. Edit content and apply it to your selection.'}</li></ol><p>${zh?'適用 Windows 10／11 x64，不需要 Visual Studio、Python、.NET 或額外執行套件，也不需要管理員權限。關閉控制面板只會隱藏視窗；要結束程式，請從右鍵或系統匣選「儲存並結束桌面拼格」。':'For Windows 10 / 11 x64. No Visual Studio, Python, .NET, extra runtime packages or administrator permissions required. Closing the controller only hides it; choose Save and exit DeskTiles from a context menu or the tray to quit.'}</p></section>
  <section class="home-section prose" id="downloads"><h2>${zh?'下載與文件':'Downloads and documentation'}</h2><div class="download-list"><a href="${r(zipFile)}" download><strong>DeskTiles-Windows-x64.zip</strong><span>${zh?'免安裝使用版':'Portable Windows build'} · ${(zipSize/1024).toFixed(1)} KiB ↓</span></a><a href="${r(fileFor(page.lang,'guide'))}"><strong>${t.guide}</strong><span>${zh?'新增、拖曳、外觀、備份與疑難排解':'Add, move, style, back up and troubleshoot'} ↗</span></a><a href="${r(fileFor(page.lang,'readme'))}"><strong>${titles[page.lang].readme}</strong><span>${zh?'功能範圍、資料格式與開發資訊':'Scope, data formats and development notes'} ↗</span></a><a href="${r('downloads/mixed-shapes.json')}" download><strong>${zh?'範例配置 JSON':'Example configuration JSON'}</strong><span>${zh?'三種形狀與內嵌圖片；可用合併匯入':'Three shapes and an embedded image; try merge import'} ↓</span></a></div><p class="markdown-downloads"><a href="${r('downloads/guide-zh.md')}" download>${zh?'中文使用說明 Markdown':'Original Chinese guide Markdown'}</a> · <a href="${r('downloads/README.md')}" download>${zh?'專案 README Markdown':'Original project README Markdown'}</a>${zh?'':` · <a href="${r('downloads/guide-en.md')}" download>English guide Markdown</a> · <a href="${r('downloads/readme-en.md')}" download>English README Markdown</a>`}</p><details class="release-details"><summary>${zh?'下載完整性與授權資訊':'Download integrity and license notices'}</summary><p>SHA-256</p><code class="checksum">${zipSha}</code><p><a href="${r('downloads/SHA256SUMS.txt')}" download>SHA256SUMS.txt ↓</a></p><p>${zh?'ZIP 保留完整第三方 MIT 授權聲明。下載內容為 Windows 使用版與文件。':'The original ZIP retains its third-party MIT license notices and includes the Windows build and documentation.'}</p></details></section>
  <section class="home-section prose" id="validation"><h2>${zh?'已驗證的範圍與後續工作':'Validation scope and next steps'}</h2><p>${zh?'依專案提供的驗證摘要：170 項核心檢查、123 項 Windows 整合檢查通過，並已從 ZIP 解壓後直接執行。':'The project-provided validation summary reports 170 core checks and 123 Windows integration checks passed, including running the extracted ZIP build.'}</p><p>${zh?'不同 Windows 版本、DPI、多螢幕、Explorer 重啟、大量格子與長時間資源壓力仍需持續驗收。效能數字是本機短時間樣本，不是所有電腦的保證。Linux 版尚未開發。':'Testing continues across Windows versions, DPI, multiple displays, Explorer restarts, large layouts and sustained workloads. Performance samples are short local observations, not guarantees for every computer. A Linux version has not been developed.'}</p><p><a href="${r('downloads/validation.txt')}" download>${zh?'下載原始驗證摘要':'Download the original validation summary'} ↓</a></p><p class="technology-note">C++17 / Win32 / GDI+ · ${zh?'使用版免建置；原始碼專案需自行建置。':'The portable build is ready to run; source projects require a separate build.'}</p></section>`;
}
function renderMarkdown(markdown,page) {
  const safe=sanitizeHtml(parser.parse(markdown),{allowedTags:[...sanitizeHtml.defaults.allowedTags,'img','h1','h2','h3'],allowedAttributes:{a:['href','title'],img:['src','alt','title'],code:['class']},allowedSchemes:['https','http','mailto']});
  const {document}=parseHTML('<html><body><article class="prose">'+safe+'</article></body></html>');
  const article=document.querySelector('article');
  for(const paragraph of article.querySelectorAll('p'))if(paragraph.textContent.startsWith('專案已整理至'))paragraph.remove();
  const mapping={'release/DeskTiles-Windows-x64.zip':zipFile,'docs/使用說明.md':fileFor(page.lang,'guide'),'docs/control.png':'assets/control.png','docs/驗證摘要.txt':'downloads/validation.txt'};
  for(const link of [...article.querySelectorAll('a[href]')]) {
    const href=decodeURI(link.getAttribute('href'));
    if(href==='docs/網站上架交接.md') {link.closest('p').remove();continue;}
    if(/^https?:/.test(href)) {link.setAttribute('target','_blank');link.setAttribute('rel','noopener noreferrer');}
    else {assert(mapping[href],'未定義的文件入口：'+href);link.setAttribute('href',relative(page.file,mapping[href]));}
  }
  for(const img of article.querySelectorAll('img')) {const src=decodeURI(img.getAttribute('src'));assert(mapping[src],'未定義圖片：'+src);img.setAttribute('src',relative(page.file,mapping[src]));img.setAttribute('loading','lazy');}
  for(const table of [...article.querySelectorAll('table')]) {const wrap=document.createElement('div');wrap.className='table-scroll';table.replaceWith(wrap);wrap.append(table);}
  for(const pre of [...article.querySelectorAll('pre')]) {
    const wrap=document.createElement('div');wrap.className='code-block';
    const bar=document.createElement('div');bar.className='desk-code-label';bar.innerHTML='<span>POWERSHELL</span><button class="copy-code" type="button">'+texts[page.lang].copy+'</button>';
    pre.replaceWith(wrap);wrap.append(bar,pre);
  }
  return article.outerHTML+(page.key==='guide'?'<section class="prose">'+gallery(page.lang)+'</section>':'');
}
function decorate(content) {
  const {document}=parseHTML('<html><body><main>'+content+'</main></body></html>');
  const ids=new Set(),headings=[];
  for(const heading of document.querySelectorAll('main h2,main h3')) {
    const title=heading.textContent;
    let id=heading.id||title.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-');
    const base=id||'section';let count=2;while(ids.has(id))id=base+'-'+count++;
    heading.id=id;ids.add(id);headings.push({id,title,level:heading.localName});
  }
  return {content:document.querySelector('main').innerHTML,headings};
}
function template(page,body,headings) {
  const t=texts[page.lang],r=to=>relative(page.file,to),opposite=page.lang==='zh'?'en':'zh';
  const toc=headings.map(h=>`<a class="toc-level-${h.level.slice(1)}" href="#${encodeURIComponent(h.id)}">${escape(h.title)}</a>`).join('');
  const navigation=['index','guide','readme'].map(key=>`<a href="${r(fileFor(page.lang,key))}"${page.key===key?' class="current" aria-current="page"':''}>${titles[page.lang][key]}</a>`).join('');
  const markdown=page.key==='guide'?(page.lang==='zh'?'downloads/guide-zh.md':'downloads/guide-en.md'):(page.lang==='zh'?'downloads/README.md':'downloads/readme-en.md');
  const portfolio=relative('desktiles/'+page.file,page.lang==='zh'?'index.html':'en/index.html')+'#project-desktiles';
  return `<!doctype html><html lang="${page.lang==='zh'?'zh-Hant':'en'}"><head>\n${googleTag}\n<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f5f0"><meta name="description" content="${page.lang==='zh'?'桌面拼格 DeskTiles：Windows 桌面文字、圖片與計時器小工具。三種形狀、自由拼排、JSON 備份。免安裝 ZIP、完整使用說明與專案 README。':'DeskTiles for Windows: arrange text, images and timers in three shapes. Download the portable ZIP, read the user guide and browse the project README.'}"><title>${titles[page.lang][page.key]} | DeskTiles · Nicoa The Six</title><link rel="icon" href="${r('assets/DeskTiles.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${r('desktiles.css')}"><link rel="alternate" hreflang="${opposite==='zh'?'zh-Hant':'en'}" href="${r(fileFor(opposite,page.key))}"><script defer src="${relative('desktiles/'+page.file,'fusion-studio/docs.js')}" data-search-index="${r('search-index.json')}"></script></head><body data-project="DeskTiles Docs" data-language="${page.lang}" data-page="${page.key}">\n${googleTagBody}\n<a class="skip-link" href="#content">${t.skip}</a><header class="docs-header"><a class="docs-brand" href="${r(fileFor(page.lang,'index'))}"><img src="${r('assets/DeskTiles-logo.png')}" width="34" height="34" alt=""><span>DeskTiles<small>${t.docs}</small></span></a><div class="header-actions"><button id="open-search" type="button" aria-haspopup="dialog"><span aria-hidden="true">⌕</span> ${t.search} <kbd>Ctrl K</kbd></button><a class="language-switch" href="${r(fileFor(opposite,page.key))}" hreflang="${opposite==='zh'?'zh-Hant':'en'}" lang="${opposite==='zh'?'zh-Hant':'en'}">${t.language}</a><a class="portfolio-link" href="${portfolio}">Nicoa The Six ↗</a></div></header><div class="mobile-toolbar"><button id="menu-button" type="button" aria-controls="docs-sidebar" aria-expanded="false">☰ ${t.menu}</button><span>${titles[page.lang][page.key]}</span></div><div class="docs-layout"><aside id="docs-sidebar" class="docs-sidebar" aria-label="${t.menu}"><div class="sidebar-label">NICOA THE SIX / DESKTOP TOOLS</div><nav><section class="nav-group"><h2>DeskTiles</h2>${navigation}</section><section class="nav-group"><h2>${page.lang==='zh'?'取得使用版':'Get the app'}</h2><a href="${r(zipFile)}" download>Windows x64 ZIP ↓</a><a href="${r('downloads/mixed-shapes.json')}" download>${page.lang==='zh'?'範例配置 JSON':'Example JSON'} ↓</a><a href="${r('downloads/SHA256SUMS.txt')}" download>SHA256SUMS.txt ↓</a></section></nav><div class="sidebar-bottom"><a href="${portfolio}">${t.back} ↗</a></div></aside><main id="content" class="docs-main" tabindex="-1"><div class="breadcrumb"><a href="${r(fileFor(page.lang,'index'))}">DeskTiles</a><span>/</span><span>${titles[page.lang][page.key]}</span></div>${page.key==='index'?'':`<div class="page-actions"><a href="${r(markdown)}" download>${t.markdown} ↓</a><a href="${r(zipFile)}" download>Windows x64 ZIP ↓</a></div>`}<details class="mobile-toc"><summary>${t.toc}</summary><nav>${toc}</nav></details>${body}<nav class="page-pagination" aria-label="${page.lang==='zh'?'文件導覽':'Document navigation'}"><a href="${r(fileFor(page.lang,'guide'))}"><small>01 / GUIDE</small>${titles[page.lang].guide} ↗</a><a href="${r(fileFor(page.lang,'readme'))}"><small>02 / PROJECT</small>${titles[page.lang].readme} ↗</a></nav><footer class="page-footer"><p>${t.footer} · ${date}</p><p>${page.lang==='zh'?'下載檔與原始中文文件由專案提供；英文為網站翻譯。':'Downloads and original Chinese documents are supplied by the project; English documents are website translations.'}</p><a href="${portfolio}">${t.back} ↗</a></footer></main><aside class="page-toc" aria-label="${t.toc}"><p>${t.toc}</p><nav>${toc}</nav></aside></div><dialog id="search-dialog" aria-labelledby="search-heading"><div class="search-heading"><h2 id="search-heading">${t.search}</h2><button id="close-search" type="button" aria-label="${page.lang==='zh'?'關閉搜尋':'Close search'}">×</button></div><label class="sr-only" for="docs-search">${t.search}</label><input id="docs-search" type="search" placeholder="${page.lang==='zh'?'搜尋拖曳、透明度、JSON…':'Search dragging, transparency, JSON…'}" autocomplete="off"><p id="search-status" role="status">${t.searchHint}</p><div id="search-results"></div></dialog><div id="toast" role="status" aria-live="polite"></div></body></html>\n`;
}

try {
  assert(source,'必須提供 --source 專案目錄');
  const checksums=await readFile(path.join(source,'release/SHA256SUMS.txt'),'utf8');
  const expected=/^([a-f0-9]{64})\s+DeskTiles-Windows-x64\.zip\s*$/im.exec(checksums)?.[1];
  assert(expected,'SHA256SUMS 中找不到 ZIP 雜湊');
  const zip=await readFile(path.join(source,'release/DeskTiles-Windows-x64.zip'));
  zipSha=hash(zip);zipSize=zip.length;assert.equal(zipSha,expected.toLowerCase(),'來源 ZIP 雜湊不符');
  console.log('[1/5] ZIP 與 SHA256SUMS 核對通過；僅讀取交接清單列明的公開素材。');
  await mkdir(output,{recursive:true});
  const assets=[];
  for(const [index,[from,to]] of copies.entries()) {
    const input=path.join(source,from),destination=path.join(output,to);
    const bytes=await readFile(input);await mkdir(path.dirname(destination),{recursive:true});await copyFile(input,destination);
    assets.push({path:to,source:from,sha256:hash(bytes),bytes:bytes.length});
    console.log(`[2/5] 已複製 ${index+1}/${copies.length}：${to}`);
  }
  for(const key of ['guide','readme']) {
    const input=path.join(output,'content',key+'-en.md'),to='downloads/'+key+'-en.md',bytes=await readFile(input);
    await copyFile(input,path.join(output,to));assets.push({path:to,source:'website:content/'+key+'-en.md',sha256:hash(bytes),bytes:bytes.length});
  }
  const search=[];
  for(const page of pages) {
    const input=page.key==='index'?null:path.join(output,'downloads',page.key==='guide'?(page.lang==='zh'?'guide-zh.md':'guide-en.md'):(page.lang==='zh'?'README.md':'readme-en.md'));
    const content=page.key==='index'?overview(page):renderMarkdown(await readFile(input,'utf8'),page);
    const decorated=decorate(content),html=template(page,decorated.content,decorated.headings);
    const destination=path.join(output,page.file);await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,html);
    const {document}=parseHTML(html),main=document.querySelector('main');
    search.push({lang:page.lang,title:titles[page.lang][page.key],pageTitle:titles[page.lang][page.key],url:page.file,text:main.textContent.replace(/\s+/g,' ').slice(0,1500)});
    for(const heading of main.querySelectorAll('h2[id],h3[id]')) {
      let text='',next=heading.nextElementSibling;while(next&&!/^h[123]$/.test(next.localName)){text+=' '+next.textContent;next=next.nextElementSibling;}
      search.push({lang:page.lang,title:heading.textContent,pageTitle:titles[page.lang][page.key],url:page.file+'#'+encodeURIComponent(heading.id),text:text.replace(/\s+/g,' ').trim().slice(0,3000)});
    }
    console.log('[3/5] 已產生線上文件：',destination);
  }
  const publicFiles=[...generatedHtml,...assets.map(asset=>asset.path),'desktiles.css','search-index.json','source-manifest.json'];
  await writeFile(path.join(output,'search-index.json'),JSON.stringify(search,null,2)+'\n');
  await writeFile(path.join(output,'source-manifest.json'),JSON.stringify({schemaVersion:1,project:'DeskTiles',publishedDate:date,sourceRepository:null,platform:'Windows 10 / 11 x64',zipSha256:zipSha,zipBytes:zipSize,generatedHtml,publicFiles,assets,sourceValidation:{coreChecks:170,windowsChecks:123,note:'Project-provided local validation; not rerun by the website publisher. Performance samples are not universal guarantees.'}},null,2)+'\n');
  console.log(`[4/5] 六頁文件、${search.length} 筆雙語搜尋索引與來源雜湊清單完成。`);
  for(const lang of ['zh','en']) {
    const page=lang==='zh'?'index.html':'en/index.html',prefix=lang==='zh'?'./':'../';
    const input=path.join(root,page);let html=await readFile(input,'utf8');
    const card=`<article class="work-card desktiles-project" id="project-desktiles"><a class="desktiles-cover" href="${prefix}desktiles/${lang==='en'?'en/':''}"><img src="${prefix}desktiles/assets/shapes.png" alt="${lang==='zh'?'桌面拼格：六角形文字、三角形圖片與矩形計時器':'DeskTiles: a hexagonal note, triangular image and rectangular timer'}" width="597" height="448" loading="lazy"></a><div class="work-body"><p class="eyebrow">WINDOWS 10 / 11 x64 · C++17 / WIN32 / GDI+</p><h3>${lang==='zh'?'桌面拼格 DeskTiles':'DeskTiles'}</h3><p class="work-description">${lang==='zh'?'在桌面拼放文字、圖片與計時器。三種形狀，支援多選拖曳、自動吸附、透明背景與動態邊框；含圖片的 JSON 配置可以備份與搬移。':'Arrange text, images and timers on your desktop. Three shapes, group dragging, snapping, transparent backgrounds and animated borders, with portable JSON layouts that include images.'}</p><p class="desktiles-platform">${lang==='zh'?'免安裝 ZIP，解壓後直接執行。Linux 版尚未提供。':'Portable ZIP: extract and run. Linux is not yet available.'}</p><div class="work-links"><a class="text-link" href="${prefix}desktiles/${lang==='en'?'en/':''}">${lang==='zh'?'專案介紹':'Explore the project'} ↗</a><a class="text-link" href="${prefix}desktiles/${lang==='en'?'en/':''}guide.html">${lang==='zh'?'使用說明':'User guide'} ↗</a><a class="text-link" href="${prefix}desktiles/${zipFile}" download>${lang==='zh'?'下載 Windows ZIP':'Download Windows ZIP'} ↓</a></div></div></article>`;
    html=html.replace(/\s*<article class="work-card desktiles-project" id="project-desktiles">[\s\S]*?<\/article>/,'');
    assert(html.includes('<div class="work-grid">'),'找不到首頁作品區');
    html=html.replace('<div class="work-grid">','<div class="work-grid">\n        '+card);
    html=html.replace(/<a class="nav-desktiles"[^>]*>DeskTiles<\/a>/,'');
    const fusionLink=`<a href="${prefix}fusion-studio/${lang==='en'?'en/':''}">Fusion Studio</a>`;
    assert(html.includes(fusionLink),'找不到既有文件導覽入口');
    html=html.replace(fusionLink,`<a class="nav-desktiles" href="${prefix}desktiles/${lang==='en'?'en/':''}">DeskTiles</a>`+fusionLink);
    await writeFile(input,html);
  }
  console.log('[5/5] 中英文首頁 DeskTiles 專案卡已更新；請執行 node check-desktiles.mjs。');
} catch(error) {console.error('DeskTiles 建置失敗：',error.stack);process.exitCode=1;}
