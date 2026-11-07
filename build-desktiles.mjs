import {readFile, writeFile, copyFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {Marked} from 'marked';
import sanitizeHtml from 'sanitize-html';
import {parseHTML} from 'linkedom';
import {googleTag,googleTagBody} from './google-tag.mjs';
import {date,release,macZip} from './desktiles/release.mjs';
import {overview as renderOverview,platformNotice,homepageCard} from './desktiles/publish-content.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const sourcePosition=process.argv.indexOf('--source');
const source=sourcePosition>=0&&process.argv[sourcePosition+1]?path.resolve(process.argv[sourcePosition+1]):null;
const output=path.join(root,'desktiles');
const repository='https://github.com/NicoaTheSix/DeskTile';
const hash=data=>createHash('sha256').update(data).digest('hex');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const relative=(from,to)=>(path.posix.relative(path.posix.dirname(from),to)||'./')+(/\.(?:zip|png|svg|ico|css|mp4|md|txt|json)$/.test(to)?'?v='+date:'');
const copies=[
  ['README.md','downloads/README.md'],['docs/使用說明.md','downloads/guide-zh.md'],
  ['docs/UserGuide.en.md','downloads/guide-en.md'],['docs/control-en.png','assets/control-en.png'],
  ['docs/DeskTiles-fixes-demo.mp4','assets/DeskTiles-fixes-demo.mp4'],
  ...['shapes','control','border','background','typography'].map(name=>['docs/'+name+'.png','assets/'+name+'.png']),
  ['assets/DeskTiles.svg','assets/DeskTiles.svg'],['assets/DeskTiles-logo.png','assets/DeskTiles-logo.png'],
  ['release/DeskTiles-Windows-x64.zip','downloads/DeskTiles-Windows-x64.zip'],
  ['release/SHA256SUMS.txt','downloads/SHA256SUMS.txt'],['docs/mixed-shapes.json','downloads/mixed-shapes.json'],
  ['docs/驗證摘要.txt','downloads/validation.txt'],['docs/icon-update-delivery.md','downloads/icon-update-delivery.md'],
  ['DeskTile_mac/README.md','downloads/README-macOS.md'],['DeskTile_mac/README.md','downloads/guide-macos-zh.md'],['DeskTile_mac/release/THIRD-PARTY-NOTICES.txt','downloads/THIRD-PARTY-NOTICES-macOS.txt'],['DeskTile_mac/release/範例配置.json','downloads/example-macos.json'],['DeskTile_mac/release/DeskTiles-macOS-universal.zip',macZip],['DeskTile_mac/release/SHA256SUMS.txt','downloads/SHA256SUMS-macOS.txt'],
  ...['alarm','alarm-en','startup-consent','reminder'].map(name=>['docs/'+name+'.png','assets/'+name+'.png'])
];
const generatedHtml=['index.html','guide.html','readme.html','en/index.html','en/guide.html','en/readme.html','mac.html','en/mac.html'];
const titles={zh:{index:'桌面拼格 DeskTiles',guide:'使用說明',readme:'專案 README',mac:'macOS 使用說明'},en:{index:'DeskTiles',guide:'User guide',readme:'Project README',mac:'macOS guide'}};
const fileFor=(lang,key)=>(lang==='en'?'en/':'')+(key==='index'?'index':key)+'.html';
const pages=generatedHtml.map(file=>({file,lang:file.startsWith('en/')?'en':'zh',key:path.posix.basename(file,'.html')}));
const zipFile='downloads/DeskTiles-Windows-x64.zip';
const texts={zh:{docs:'專案與文件',search:'搜尋文件',language:'English',back:'回作品集',menu:'專案導覽',toc:'本頁內容',skip:'跳至內容',copy:'複製',download:'下載 Windows x64 ZIP',guide:'閱讀使用說明',markdown:'下載 Markdown',original:'原始文件',note:'Windows 10 / 11 x64 · 免安裝 ZIP',footer:'Nicoa The Six · DeskTiles 文件',searchHint:'輸入文字搜尋目前語言的文件。'},en:{docs:'PROJECT & DOCS',search:'Search docs',language:'繁體中文',back:'Portfolio',menu:'Project navigation',toc:'On this page',skip:'Skip to content',copy:'Copy',download:'Download Windows x64 ZIP',guide:'Read the user guide',markdown:'Download Markdown',original:'Source document',note:'Windows 10 / 11 x64 · Portable ZIP',footer:'Nicoa The Six · DeskTiles documentation',searchHint:'Search the documentation in the current language.'}};
console.log('[0/5] 來源目錄（絕對路徑）：',source||'缺少 --source');
console.log('[0/5] 網站輸出目錄（絕對路徑）：',output);
for(const [from,to] of copies)console.log('[0/5] 複製輸入／輸出（絕對路徑）：',source&&path.join(source,from),'→',path.join(output,to));
for(const file of ['release.mjs','publish-content.mjs','content/mac-en.md'])console.log('[0/5] 輸入（絕對路徑）：',path.join(output,file));
console.log('[0/5] 輸出（絕對路徑）：',path.join(output,'downloads/mac-en.md'));
console.log('[0/5] 英文 README 翻譯輸入／下載輸出（絕對路徑）：',path.join(output,'content/readme-en.md'),'→',path.join(output,'downloads/readme-en.md'));
console.log('[0/5] EXE 校驗輸入（絕對路徑，不執行、不另行發布）：',source&&path.join(source,'release/DeskTiles/DeskTiles.exe'));
for(const file of [...generatedHtml,'macos.html','search-index.json','source-manifest.json'])console.log('[0/5] 輸出（絕對路徑）：',path.join(output,file));
for(const file of ['index.html','en/index.html'])console.log('[0/5] 首頁輸入／輸出（絕對路徑）：',path.join(root,file));

let zipSha,zipSize;
const parser=new Marked({gfm:true});
function githubSupport(lang) {
  return `<p class="desktiles-support"><a class="text-link" href="${repository}" target="_blank" rel="noopener noreferrer">${lang==='zh'?'GitHub 專案':'View on GitHub'} ↗</a><br>${lang==='zh'?'覺得 DeskTiles 好用，歡迎到 GitHub 幫我按顆星星（Star）！':'Enjoying DeskTiles? Please consider giving the project a star on GitHub!'}</p>`;
}
function gallery(lang) {
  const captions=lang==='zh'?['控制視窗：選取格子、編輯文字、圖片與計時器','邊框與風格：實色、像素、RGB 與呼吸燈','背景與透明度：分別套用背景色與透明度','大小與文字：尺寸、字體、字級與文字顏色']:['Controller: select tiles and edit text, images or timers','Borders: solid, pixel, RGB and breathing styles','Background: separate color and transparency settings','Size and text: tile size, font and text color'];
  return '<h2 id="ui-screenshots">'+(lang==='zh'?'操作畫面':'Application screenshots')+'</h2><p>'+(lang==='zh'?'以下為實際 Windows 版本畫面，可在程式中切換繁體中文與 English。':'The controller below uses the English UI. Additional settings screenshots show the original Chinese labels; the app supports both languages.')+'</p><div class="screenshot-grid">'+[lang==='en'?'control-en':'control','border','background','typography'].map((name,i)=>{const src=relative(fileFor(lang,'guide'),'assets/'+name+'.png');return '<figure><a href="'+src+'" target="_blank" rel="noopener noreferrer"><img src="'+src+'" alt="'+captions[i]+'" loading="lazy"></a><figcaption>'+captions[i]+'</figcaption></figure>';}).join('')+'</div>';
}
function overview(page){return renderOverview(page,to=>relative(page.file,to),fileFor(page.lang,'guide'));}
function renderMarkdown(markdown,page) {
  const safe=sanitizeHtml(parser.parse(markdown),{allowedTags:[...sanitizeHtml.defaults.allowedTags,'img','h1','h2','h3'],allowedAttributes:{a:['href','title'],img:['src','alt','title'],code:['class']},allowedSchemes:['https','http','mailto']});
  const {document}=parseHTML('<html><body><article class="prose">'+safe+'</article></body></html>');
  const article=document.querySelector('article');
  for(const paragraph of article.querySelectorAll('p'))if(paragraph.textContent.startsWith('專案已整理至')||paragraph.textContent.startsWith('專案倉庫：'))paragraph.remove();
  const mapping={'DeskTile_mac/README.md':fileFor(page.lang,'mac'),'DeskTile_mac/release/DeskTiles-macOS-universal.zip':macZip,'release/DeskTiles-Windows-x64.zip':zipFile,'docs/使用說明.md':fileFor(page.lang,'guide'),'docs/UserGuide.en.md':fileFor('en','guide'),'UserGuide.en.md':fileFor('en','guide'),'docs/control.png':'assets/control.png','docs/control-en.png':'assets/control-en.png','docs/驗證摘要.txt':'downloads/validation.txt','docs/DeskTiles-fixes-demo.mp4':'assets/DeskTiles-fixes-demo.mp4'};
  for(const name of ['alarm','alarm-en','startup-consent','reminder'])mapping['docs/'+name+'.png']='assets/'+name+'.png';
  for(const link of [...article.querySelectorAll('a[href]')]) {
    const href=decodeURI(link.getAttribute('href'));
    if(href==='docs/網站上架交接.md') {link.closest('p').remove();continue;}
    if(/^https?:/.test(href)) {link.setAttribute('target','_blank');link.setAttribute('rel','noopener noreferrer');}
    else {if(href==='docs/驗證摘要.txt')link.textContent=page.lang==='zh'?'歷史驗證摘要（2026-11-03）':'Historical validation summary (2026-11-03)';assert(mapping[href],'未定義的文件入口：'+href);link.setAttribute('href',relative(page.file,mapping[href]));}
  }
  for(const img of article.querySelectorAll('img')) {const src=decodeURI(img.getAttribute('src'));assert(mapping[src],'未定義圖片：'+src);img.setAttribute('src',relative(page.file,mapping[src]));img.setAttribute('loading','lazy');}
  for(const table of [...article.querySelectorAll('table')]) {const wrap=document.createElement('div');wrap.className='table-scroll';table.replaceWith(wrap);wrap.append(table);}
  for(const pre of [...article.querySelectorAll('pre')]) {
    const wrap=document.createElement('div');wrap.className='code-block';
    const bar=document.createElement('div');bar.className='desk-code-label';bar.innerHTML='<span>'+(page.key==='mac'?'SHELL':'POWERSHELL')+'</span><button class="copy-code" type="button">'+texts[page.lang].copy+'</button>';
    pre.replaceWith(wrap);wrap.append(bar,pre);
  }
  return article.outerHTML+(page.key==='mac'?'':platformNotice(page.lang))+(page.key==='guide'?'<section class="prose">'+gallery(page.lang)+'</section>':'');
}
function decorate(content) {
  const {document}=parseHTML('<html><body><main>'+content+'</main></body></html>');
  const ids=new Set(['content','docs-sidebar','menu-button','open-search','search-dialog','search-heading','close-search','docs-search','search-status','search-results','toast',...[...document.querySelectorAll('[id]')].filter(element=>!/^h[23]$/.test(element.localName)).map(element=>element.id)]),headings=[];
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
  const navigation=['index','guide','readme','mac'].map(key=>`<a href="${r(fileFor(page.lang,key))}"${page.key===key?' class="current" aria-current="page"':''}>${titles[page.lang][key]}</a>`).join('');
  const markdown=page.key==='mac'?(page.lang==='zh'?'downloads/README-macOS.md':'downloads/mac-en.md'):page.key==='guide'?(page.lang==='zh'?'downloads/guide-zh.md':'downloads/guide-en.md'):(page.lang==='zh'?'downloads/README.md':'downloads/readme-en.md');
  const portfolio=relative('desktiles/'+page.file,page.lang==='zh'?'index.html':'en/index.html')+'#project-desktiles';
  return `<!doctype html><html lang="${page.lang==='zh'?'zh-Hant':'en'}"><head>\n${googleTag}\n<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f5f0"><meta name="description" content="${page.lang==='zh'?'DeskTiles：Windows 與 macOS 原生桌面小工具，提供兩平台下載、使用說明、功能差異與SHA-256。':'DeskTiles for Windows and macOS: native desktop tiles, downloads, guides, platform differences and SHA-256 checksums.'}"><title>${titles[page.lang][page.key]} | DeskTiles · Nicoa The Six</title><link rel="icon" href="${r('assets/DeskTiles.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${r('desktiles.css')}"><link rel="alternate" hreflang="${opposite==='zh'?'zh-Hant':'en'}" href="${r(fileFor(opposite,page.key))}"><script defer src="${relative('desktiles/'+page.file,'fusion-studio/docs.js')}" data-search-index="${r('search-index.json')}"></script></head><body data-project="DeskTiles Docs" data-language="${page.lang}" data-page="${page.key}">\n${googleTagBody}\n<a class="skip-link" href="#content">${t.skip}</a><header class="docs-header"><a class="docs-brand" href="${r(fileFor(page.lang,'index'))}"><img src="${r('assets/DeskTiles-logo.png')}" width="34" height="34" alt=""><span>DeskTiles<small>${t.docs}</small></span></a><div class="header-actions"><button id="open-search" type="button" aria-haspopup="dialog"><span aria-hidden="true">⌕</span> ${t.search} <kbd>Ctrl K</kbd></button><a class="language-switch" href="${r(fileFor(opposite,page.key))}" hreflang="${opposite==='zh'?'zh-Hant':'en'}" lang="${opposite==='zh'?'zh-Hant':'en'}">${t.language}</a><a class="portfolio-link" href="${portfolio}">Nicoa The Six ↗</a></div></header><div class="mobile-toolbar"><button id="menu-button" type="button" aria-controls="docs-sidebar" aria-expanded="false">☰ ${t.menu}</button><span>${titles[page.lang][page.key]}</span></div><div class="docs-layout"><aside id="docs-sidebar" class="docs-sidebar" aria-label="${t.menu}"><div class="sidebar-label">NICOA THE SIX / DESKTOP TOOLS</div><nav><section class="nav-group"><h2>DeskTiles</h2>${navigation}</section><section class="nav-group"><h2>${page.lang==='zh'?'取得使用版':'Get the app'}</h2><a href="${r(zipFile)}" download>Windows x64 ZIP ↓</a><a href="${r(macZip)}" download>macOS Universal 2 ZIP ↓</a><a href="${r('downloads/SHA256SUMS-macOS.txt')}" download>macOS SHA256 ↓</a><a href="${r('downloads/mixed-shapes.json')}" download>${page.lang==='zh'?'範例配置 JSON':'Example JSON'} ↓</a><a href="${r('downloads/SHA256SUMS.txt')}" download>SHA256SUMS.txt ↓</a></section></nav><div class="sidebar-bottom"><a href="${portfolio}">${t.back} ↗</a></div></aside><main id="content" class="docs-main" tabindex="-1"><div class="breadcrumb"><a href="${r(fileFor(page.lang,'index'))}">DeskTiles</a><span>/</span><span>${titles[page.lang][page.key]}</span></div>${page.key==='index'?'':`<div class="page-actions"><a href="${r(markdown)}" download>${t.markdown} ↓</a><a href="${r(page.key==='mac'?macZip:zipFile)}" download>${page.key==='mac'?'macOS Universal 2':'Windows x64'} ZIP ↓</a></div>`}<details class="mobile-toc"><summary>${t.toc}</summary><nav>${toc}</nav></details>${body}<nav class="page-pagination" aria-label="${page.lang==='zh'?'文件導覽':'Document navigation'}"><a href="${r(fileFor(page.lang,'guide'))}"><small>01 / GUIDE</small>${titles[page.lang].guide} ↗</a><a href="${r(fileFor(page.lang,'readme'))}"><small>02 / PROJECT</small>${titles[page.lang].readme} ↗</a></nav><footer class="page-footer"><p>${t.footer} · ${date}</p><p>${page.lang==='zh'?'下載檔與原始中文文件由專案提供；英文為網站翻譯。':'Downloads and original Chinese documents are supplied by the project; English documents are website translations.'}</p><a href="${portfolio}">${t.back} ↗</a></footer></main><aside class="page-toc" aria-label="${t.toc}"><p>${t.toc}</p><nav>${toc}</nav></aside></div><dialog id="search-dialog" aria-labelledby="search-heading"><div class="search-heading"><h2 id="search-heading">${t.search}</h2><button id="close-search" type="button" aria-label="${page.lang==='zh'?'關閉搜尋':'Close search'}">×</button></div><label class="sr-only" for="docs-search">${t.search}</label><input id="docs-search" type="search" placeholder="${page.lang==='zh'?'搜尋拖曳、透明度、JSON…':'Search dragging, transparency, JSON…'}" autocomplete="off"><p id="search-status" role="status">${t.searchHint}</p><div id="search-results"></div></dialog><div id="toast" role="status" aria-live="polite"></div></body></html>\n`;
}

try {
  assert(source,'必須提供 --source 專案目錄');
  const checksums=await readFile(path.join(source,'release/SHA256SUMS.txt'),'utf8');
  const expected=/^([a-f0-9]{64})\s+DeskTiles-Windows-x64\.zip\s*$/im.exec(checksums)?.[1];
  assert(expected,'SHA256SUMS 中找不到 ZIP 雜湊');
  const zip=await readFile(path.join(source,'release/DeskTiles-Windows-x64.zip'));
  zipSha=hash(zip);zipSize=zip.length;assert.equal(zipSha,expected.toLowerCase(),'來源 ZIP 雜湊不符');
  assert.equal(zipSha.toUpperCase(),release.zipSha256,'不是本次指定的最新 ZIP');
  assert.equal(zipSize,release.zipBytes,'最新版 ZIP 大小不符');
  const exe=await readFile(path.join(source,'release/DeskTiles/DeskTiles.exe'));
  assert.equal(hash(exe).toUpperCase(),release.exeSha256,'EXE 與指定修正版不符');
  assert.equal(exe.length,release.exeBytes,'EXE 大小不符');
  const macBytes=await readFile(path.join(source,'DeskTile_mac/release/DeskTiles-macOS-universal.zip'));
  const macSums=await readFile(path.join(source,'DeskTile_mac/release/SHA256SUMS.txt'),'utf8');
  assert.equal(hash(macBytes).toUpperCase(),release.macSha256,'Mac ZIP不符');assert.equal(macBytes.length,release.macBytes,'Mac ZIP大小不符');
  assert(macSums.toLowerCase().includes(hash(macBytes)+'  DeskTiles-macOS-universal.zip'.toLowerCase()),'Mac SHA256SUMS不符');
  console.log('[1/5] ZIP 與 SHA256SUMS 核對通過；僅讀取交接清單列明的公開素材。');
  await mkdir(output,{recursive:true});
  const assets=[];
  for(const [index,[from,to]] of copies.entries()) {
    const input=path.join(source,from),destination=path.join(output,to);
    const bytes=await readFile(input);await mkdir(path.dirname(destination),{recursive:true});await copyFile(input,destination);
    assets.push({path:to,source:from,sha256:hash(bytes),bytes:bytes.length});
    console.log(`[2/5] 已複製 ${index+1}/${copies.length}：${to}`);
  }
  for(const key of ['readme','mac']) {
    const input=path.join(output,'content',key+'-en.md'),to='downloads/'+key+'-en.md',bytes=await readFile(input);
    await copyFile(input,path.join(output,to));assets.push({path:to,source:'website:content/'+key+'-en.md',sha256:hash(bytes),bytes:bytes.length});
  }
  const search=[];
  for(const page of pages) {
    const input=page.key==='mac'?path.join(output,'downloads',page.lang==='zh'?'README-macOS.md':'mac-en.md'):page.key==='index'?null:path.join(output,'downloads',page.key==='guide'?(page.lang==='zh'?'guide-zh.md':'guide-en.md'):(page.lang==='zh'?'README.md':'readme-en.md'));
    const content=page.key==='index'?overview(page).replace('<p class="platform-note">',githubSupport(page.lang)+'<p class="platform-note">'):renderMarkdown(await readFile(input,'utf8'),page);
    const updated=content;
    const decorated=decorate(updated),html=template(page,decorated.content,decorated.headings).replace('下載檔與原始中文文件由專案提供；英文為網站翻譯。','下載檔、中英文指南與截圖由專案提供；英文 README 為網站翻譯。').replace('Downloads and original Chinese documents are supplied by the project; English documents are website translations.','Downloads, bilingual user guides and screenshots are supplied by the project; the English README is a website translation.');
    const destination=path.join(output,page.file);await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,html);
    const {document}=parseHTML(html),main=document.querySelector('main');
    search.push({lang:page.lang,title:titles[page.lang][page.key],pageTitle:titles[page.lang][page.key],url:page.file,text:main.textContent.replace(/\s+/g,' ').slice(0,1500)});
    for(const heading of main.querySelectorAll('h2[id],h3[id]')) {
      let text='',next=heading.nextElementSibling;while(next&&!/^h[123]$/.test(next.localName)){text+=' '+next.textContent;next=next.nextElementSibling;}
      search.push({lang:page.lang,title:heading.textContent,pageTitle:titles[page.lang][page.key],url:page.file+'#'+encodeURIComponent(heading.id),text:text.replace(/\s+/g,' ').trim().slice(0,3000)});
    }
    console.log('[3/5] 已產生線上文件：',destination);
  }
  await copyFile(path.join(output,'mac.html'),path.join(output,'macos.html'));
  const publicFiles=[...generatedHtml,'macos.html',...assets.map(asset=>asset.path),'desktiles.css','search-index.json','source-manifest.json'];
  await writeFile(path.join(output,'search-index.json'),JSON.stringify(search,null,2)+'\n');
  await writeFile(path.join(output,'source-manifest.json'),JSON.stringify({schemaVersion:1,project:'DeskTiles',publishedDate:date,sourceRepository:repository,platform:'Windows 10 / 11 x64; macOS 12+ Universal 2',macZipSha256:release.macSha256.toLowerCase(),macZipBytes:release.macBytes,sourceCommit:release.sourceCommit,releaseCommit:release.commit,zipSha256:zipSha,zipBytes:zipSize,releaseExeSha256:release.exeSha256.toLowerCase(),releaseExeBytes:release.exeBytes,generatedHtml,publicFiles,assets,sourceValidation:{coreChecks:release.coreChecks,windowsChecks:release.windowsChecks,macCoreChecks:release.macCoreChecks,macWorkflow:release.macWorkflow,languages:['zh-Hant','en'],note:'Project-provided local validation; not rerun by the website publisher. Performance samples are not universal guarantees.'}},null,2)+'\n');
  console.log(`[4/5] 八頁文件、${search.length} 筆雙語搜尋索引與來源雜湊清單完成。`);
  for(const lang of ['zh','en']) {
    const page=lang==='zh'?'index.html':'en/index.html',prefix=lang==='zh'?'./':'../';
    const input=path.join(root,page);let html=await readFile(input,'utf8');
    const cardClasses=parseHTML(html).document.querySelector('#project-desktiles')?.className||'work-card desktiles-project';
    const supportedCard=homepageCard(lang,prefix,escape(cardClasses));
    html=html.replace(/\s*<article\b[^>]*\bid="project-desktiles"[^>]*>[\s\S]*?<\/article>/,'');
    assert(html.includes('<div class="work-grid">'),'找不到首頁作品區');
    html=html.replace('<div class="work-grid">','<div class="work-grid">\n        '+supportedCard);
    html=html.replace(/<a class="nav-desktiles"[^>]*>DeskTiles<\/a>/,'');
    const fusionLink=`<a href="${prefix}fusion-studio/${lang==='en'?'en/':''}">Fusion Studio</a>`;
    assert(html.includes(fusionLink),'找不到既有文件導覽入口');
    html=html.replace(fusionLink,`<a class="nav-desktiles" href="${prefix}desktiles/${lang==='en'?'en/':''}">DeskTiles</a>`+fusionLink);
    await writeFile(input,html);
  }
  console.log('[5/5] 中英文首頁 DeskTiles 專案卡已更新；請執行 node check-desktiles.mjs。');
} catch(error) {console.error('DeskTiles 建置失敗：',error.stack);process.exitCode=1;}
