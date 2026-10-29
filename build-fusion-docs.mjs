import { readFile, writeFile, mkdir, readdir, copyFile, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { parseHTML } from 'linkedom';
import { googleTag, googleTagBody } from './google-tag.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const sourceArg = process.argv.indexOf('--source');
const source = sourceArg >= 0 && process.argv[sourceArg + 1] ? path.resolve(process.argv[sourceArg + 1]) : null;
const output = path.join(root, 'fusion-studio');
console.log('[0/6] 輸入專案（絕對路徑）：', source || '缺少 --source');
console.log('[0/6] 輸入手冊（絕對路徑）：', source && path.join(source, 'manual'));
console.log('[0/6] 輸出網站／清單（絕對路徑）：', output, path.join(output, 'source-manifest.json'));
const repo = 'https://github.com/NicoaTheSix/MITREATTACK_SIMULATOR';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash = data => createHash('sha256').update(data).digest('hex');
const slug = text => text.normalize('NFKC').toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
const relative = (from, to) => path.posix.relative(path.posix.dirname(from), to) || './';
const encodePath = p => p.split('/').map(encodeURIComponent).join('/');
const groups = [
  ['start', '開始使用', 'Getting started', ['quick-start','first-research','installation','in-app-manual','in-app-index','guide-index']],
  ['workspace', '工作區與選取', 'Workspace & selection', ['workspace-layout','selection-and-search','detection-interaction','source-relationship-selection','source-hover-preview','visibility-expansion-presets']],
  ['notes', '註記、保存與復原', 'Annotations & persistence', ['batch-operations','studio-files']],
  ['matrix', '矩陣與 Navigator', 'Matrix & Navigator', ['matrix-display','navigator-parity-controls','navigator-bundle-import','advanced-navigator','layer-score-formulas']],
  ['exports', '匯出與交換', 'Export & exchange', ['json-annotation-export','aggregation-and-exports','svg-paper','svg-themes']],
  ['frameworks', 'ATLAS 與 CAR 參考', 'ATLAS & CAR references', ['car-integration']],
  ['migration', '版本遷移', 'Version migration', ['upgrade-review','upgrade-content','upgrade-mapping','upgrade-summary']],
  ['advanced', '自訂來源與範例', 'Custom sources & examples', ['custom-domains','custom-data-url-import','examples','project-readme','positioning','car-provenance']]
];
const labels = {
  'quick-start':['快速開始','Quick start'], 'first-research':['第一份研究文件','Your first research'],
  'installation':['安裝與啟動','Installation'], 'in-app-manual':['操作總覽','Operating manual'],
  'in-app-index':['程式內指南索引','In-app guide index'], 'guide-index':['全部指南對照表','All guide pairs'],
  'workspace-layout':['工作區、頁籤與側欄','Workspace layout'], 'selection-and-search':['選取與搜尋','Selection & search'],
  'detection-interaction':['偵測搜尋與來源複製','Detection & source JSON'], 'source-relationship-selection':['來源關聯與批次選取','Source relationships'],
  'source-hover-preview':['來源懸停預覽','Source hover preview'], 'visibility-expansion-presets':['可見選取與展開','Visibility & expansion'],
  'batch-operations':['獨立狀態與批次註記','States & batch editing'], 'studio-files':['儲存與工作階段復原','Save & session recovery'],
  'matrix-display':['矩陣顯示與註記提示','Matrix display'], 'navigator-parity-controls':['Navigator 顯示與操作','Navigator controls'],
  'navigator-bundle-import':['多圖層 JSON 匯入','Multi-layer JSON import'], 'advanced-navigator':['Navigator 進階操作','Advanced Navigator'],
  'layer-score-formulas':['圖層分數公式','Layer score formulas'], 'json-annotation-export':['JSON 註記匯出','JSON annotation export'],
  'aggregation-and-exports':['分數彙總與矩陣匯出','Aggregation & exports'], 'svg-paper':['SVG 紙張與方向','SVG paper & orientation'],
  'svg-themes':['SVG 淺色與深色主題','SVG light & dark themes'], 'car-integration':['CAR、資料模型與感測器','CAR, Data Model & Sensors'],
  'upgrade-review':['升級逐項審核','Upgrade review'], 'upgrade-content':['升級內容並排比較','Upgrade content comparison'],
  'upgrade-mapping':['Tactic 搬移與衝突','Tactic mapping & conflicts'], 'upgrade-summary':['升級摘要與略過理由','Upgrade summary'],
  'custom-domains':['自訂 Domain 與 ID','Custom domains & IDs'], 'custom-data-url-import':['解析 customDataURL','Resolve customDataURL'],
  'examples':['可載入範例','Loadable examples'], 'project-readme':['產品 README 與完整安裝','Product README & setup'],
  'positioning':['產品定位與能力邊界','Positioning & boundaries'], 'car-provenance':['CAR 出處與授權','CAR provenance & licensing']
};
const actions = {
  'open-file':'File → Open Studio JSON…', versions:'Version (vX.Y)', search:'TTP sidebar → Search', selected:'Workplace → Selected TTPs',
  matrix:'Open ATT&CK Matrix', 'layer-settings':'Navigator → Layer settings…', 'batch-edit':'Navigator → Batch edit selected TTPs…',
  formula:'Navigator → Layer score formula', compare:'Navigator → Compare documents', 'compare-versions':'Compare ATT&CK versions',
  'import-layer':'Import Navigator Layer… / Ctrl+Alt+O', sources:'File → Load layer URL / custom STIX…',
  upgrade:'Navigator → Review and upgrade layer…', 'export-svg':'Navigator → Export matrix SVG…', 'export-excel':'Navigator → Export matrix Excel…'
};
const pages = [], inputs = new Map(), copied = new Map(), notes = [], externalReferences = new Set();
let sourceCommit, tracked, dirtyFiles, date;
const sourceFile = p => {
  const resolved = path.resolve(source, p);
  if (!resolved.startsWith(source + path.sep)) throw new Error(`來源路徑超出專案：${p}`);
  return resolved;
};
async function readSource(p) {
  const bytes = await readFile(sourceFile(p));
  inputs.set(p, {path:p, sha256:hash(bytes), bytes:bytes.length});
  return bytes.toString('utf8').replace(/^\uFEFF/, '');
}
function addPage(key, lang, sourcePath, markdown, sourceLanguage = lang) {
  const pair = labels[key];
  const title = pair ? pair[lang === 'zh' ? 0 : 1] : markdown.match(/^#\s+(.+)$/m)?.[1] || key;
  pages.push({key, lang, sourcePath, markdown, sourceLanguage, title, file:`${lang}/${key}.html`, headings:[]});
}
function section(markdown, heading, level = 2) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex(line => line === '#'.repeat(level) + ' ' + heading);
  if (start < 0) throw new Error(`README 章節不存在：${heading}`);
  let end = start + 1;
  while (end < lines.length && !new RegExp(`^#{1,${level}} `).test(lines[end])) end++;
  return lines.slice(start, end).join('\n');
}
function targetPage(sourcePath, language) {
  const options = pages.filter(p => p.sourcePath === sourcePath && !['quick-start','first-research'].includes(p.key));
  return options.find(p => p.lang === language) || options[0];
}
function assetAllowed(p, from) {
  if (/\/(?:audit|report|verification|acceptance)\.json$/i.test(p)) return false;
  if (p.startsWith('manual/examples/') && /\.(json|csv|svg|png|xlsx)$/.test(p)) return true;
  if (from.startsWith('manual/') && /^artifacts\//.test(p) && /\.(svg|png|xlsx)$/.test(p)) return true;
  if (p === 'assets/fusion-studio-icon-monochrome-v3.png' || p === 'LICENSE') return true;
  return /^artifacts\/(intro-video|demo-video)\/(fusion-studio-(intro|demo)-zh-TW\.mp4|storyboard\.png|captions\.zh-TW\.srt|demo-research\.(json|csv))$/.test(p);
}
async function collectAsset(p) {
  if (copied.has(p)) return copied.get(p);
  const bytes = await readFile(sourceFile(p));
  if (bytes.length > 20 * 1024 * 1024) throw new Error(`素材超過 20 MiB，需另行規劃：${p}`);
  const destination = `assets/source/${p}`;
  await mkdir(path.dirname(path.join(output, destination)), {recursive:true});
  await copyFile(sourceFile(p), path.join(output, destination));
  inputs.set(p, {path:p, sha256:hash(bytes), bytes:bytes.length});
  copied.set(p, destination);
  return destination;
}
function upstreamLink(p, fragment = '') {
  externalReferences.add(p);
  return `${repo}/blob/${sourceCommit}/${encodePath(p)}${fragment ? '#' + encodeURIComponent(fragment) : ''}`;
}
async function rewrite(page) {
  const {document} = parseHTML(`<html><body><article>${page.html}</article></body></html>`);
  const article = document.querySelector('article');
  for (const element of article.querySelectorAll('a[href],img[src]')) {
    const attribute = element.localName === 'img' ? 'src' : 'href';
    const href = element.getAttribute(attribute);
    if (href.startsWith('studio://')) {
      const feature = href.slice(9);
      if (!actions[feature]) throw new Error(`未知桌面功能：${href}`);
      const hint = document.createElement('span');
      hint.className = 'desktop-action';
      hint.textContent = `${element.textContent} — ${page.lang === 'zh' ? '請在 Fusion Studio 桌面程式操作' : 'In the Fusion Studio desktop app'}: ${actions[feature]}`;
      element.replaceWith(hint);
      continue;
    }
    if (/^(https?:|mailto:)/i.test(href)) {
      if (element.localName === 'a') { element.setAttribute('rel','noopener noreferrer'); element.setAttribute('target','_blank'); }
      continue;
    }
    if (/^(?:[a-z]+:|\/\/|[A-Za-z]:\\)/i.test(href)) throw new Error(`不允許的網站協定：${href}`);
    const [pathname, encodedFragment] = href.split('#');
    const fragment = encodedFragment ? decodeURIComponent(encodedFragment) : '';
    const p = pathname ? path.posix.normalize(path.posix.join(path.posix.dirname(page.sourcePath), decodeURIComponent(pathname))) : page.sourcePath;
    await stat(sourceFile(p));
    let target = pathname ? targetPage(p, page.lang) : page;
    if (p === 'docs/README.md') target = pages.find(p => p.key === 'guide-index' && p.lang === page.lang);
    if (target && element.localName === 'a') {
      let anchor = fragment;
      if (anchor === '_2' && target.key === 'studio-files' && target.lang === 'zh') {
        anchor = '資料集與舊版本';
        notes.push({source:page.sourcePath,from:fragment,to:anchor,kind:'legacy-anchor'});
      }
      if (anchor && !target.headings.some(h => h.id === anchor) && !target.extraIds.includes(anchor)) {
        if (p === 'README.md') { element.setAttribute('href',upstreamLink(p,anchor)); element.setAttribute('target','_blank'); element.setAttribute('rel','noopener noreferrer'); continue; }
        throw new Error(`章節不存在：${page.sourcePath} → ${p}#${anchor}`);
      }
      element.setAttribute('href', relative(page.file, target.file) + (anchor ? '#' + encodeURIComponent(anchor) : ''));
    } else if (assetAllowed(p, page.sourcePath)) {
      element.setAttribute(attribute,relative(page.file,await collectAsset(p)));
      if (element.localName === 'a' && /\.(json|csv|xlsx|srt)$/.test(p)) element.setAttribute('download','');
    } else if (tracked.has(p)) {
      element.setAttribute(attribute,upstreamLink(p,fragment));
      if (element.localName === 'a') {element.setAttribute('target','_blank'); element.setAttribute('rel','noopener noreferrer');}
    } else {
      if (element.localName === 'img') throw new Error(`未收錄的本機圖片：${p}`);
      const note = document.createElement('span');
      note.className = 'source-only';
      note.textContent = `${element.textContent} (${page.lang === 'zh' ? '本機來源附件，未於本站發布' : 'local source reference, not published here'})`;
      element.replaceWith(note);
      notes.push({source:page.sourcePath,path:p,kind:'unpublished-source-reference'});
    }
    if (element.localName === 'img') {element.setAttribute('loading','lazy'); if(!element.getAttribute('alt'))element.setAttribute('alt','Fusion Studio illustration');}
  }
  for (const [index, pre] of [...article.querySelectorAll('pre')].entries()) {
    const wrapper = document.createElement('div'); wrapper.className = 'code-block';
    const bar = document.createElement('div'); bar.className = 'code-bar';
    const language = document.createElement('span'); language.textContent = pre.querySelector('code')?.className.replace('language-','') || 'text';
    const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'copy-code'; copy.textContent = page.lang === 'zh' ? '複製' : 'Copy';
    copy.setAttribute('aria-label',`${page.lang === 'zh' ? '複製程式碼區塊' : 'Copy code block'} ${index + 1}`);
    bar.append(language,copy); pre.replaceWith(wrapper); wrapper.append(bar,pre);
  }
  for (const table of [...article.querySelectorAll('table')]) {
    const wrap = document.createElement('div'); wrap.className = 'table-scroll'; wrap.setAttribute('tabindex','0'); wrap.setAttribute('role','region'); wrap.setAttribute('aria-label',page.lang === 'zh' ? '資料表格，可水平捲動' : 'Scrollable data table');
    table.replaceWith(wrap); wrap.append(table);
  }
  page.html = article.innerHTML;
}
function homeFile(lang) { return lang === 'zh' ? 'index.html' : 'en/index.html'; }
function navigation(page) {
  const zh = page.lang === 'zh';
  return `<a class="sidebar-home ${page.key === 'home' ? 'current' : ''}" href="${relative(page.file,homeFile(page.lang))}" ${page.key === 'home' ? 'aria-current="page"' : ''}>${zh?'文件首頁':'Documentation home'}</a>` + groups.map(group => {
    const list = group[3].map(key => pages.find(p=>p.key===key&&p.lang===page.lang)).filter(Boolean);
    if(!list.length)return '';
    return `<section class="nav-group"><h2>${escape(group[zh?1:2])}</h2>${list.map(item=>`<a href="${relative(page.file,item.file)}" ${page.key===item.key?'aria-current="page" class="current"':''}>${escape(item.title)}</a>`).join('')}</section>`;
  }).join('');
}
function pageLink(page, key) {const target=pages.find(p=>p.key===key&&p.lang===page.lang);return relative(page.file,target.file);}
function toc(page) {return page.headings.filter(h=>h.depth===2||h.depth===3).map(h=>`<a class="toc-level-${h.depth}" href="#${encodeURIComponent(h.id)}">${escape(h.text)}</a>`).join('');}
function shell(page, body, pairCount) {
  const zh=page.lang==='zh', opposite=zh?'en':'zh';
  const oppositeFile=page.key==='home'?homeFile(opposite):pages.find(p=>p.key===page.key&&p.lang===opposite).file;
  const sourceInfo=page.key==='home' ? (zh?'原始操作手冊由 Fusion Studio 專案維護。':'Operating guides are maintained in the Fusion Studio repository.') : `${escape(page.sourcePath)}${page.sourceLanguage!==page.lang?` · ${zh?'此頁保留來源原文':'Original source language retained'}`:''}`;
  return `<!doctype html><html lang="${zh?'zh-Hant':'en'}"><head>
${googleTag}
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f6f5f0"><meta name="description" content="${escape(page.title)} — Fusion Studio documentation. A free, open-source workspace for TTP-driven threat research."><title>${escape(page.title)} | Fusion Studio Docs</title><link rel="icon" href="${relative(page.file,'assets/source/assets/fusion-studio-icon-monochrome-v3.png')}"><link rel="stylesheet" href="${relative(page.file,'docs.css')}"><link rel="alternate" hreflang="${zh?'en':'zh-Hant'}" href="${relative(page.file,oppositeFile)}"><script defer src="${relative(page.file,'docs.js')}" data-search-index="${relative(page.file,'search-index.json')}"></script></head><body data-language="${page.lang}" data-page="${page.key}">
${googleTagBody}
  <a class="skip-link" href="#content">${zh?'跳至文件內容':'Skip to content'}</a><header class="docs-header"><a class="docs-brand" href="${relative(page.file,homeFile(page.lang))}"><img src="${relative(page.file,'assets/source/assets/fusion-studio-icon-monochrome-v3.png')}" alt="" width="34" height="34"><span>Fusion Studio <small>DOCUMENTATION</small></span></a><div class="header-actions"><button id="open-search" type="button" aria-haspopup="dialog"><span aria-hidden="true">⌕</span> ${zh?'搜尋文件':'Search docs'} <kbd>Ctrl K</kbd></button><a class="language-switch" href="${relative(page.file,oppositeFile)}" hreflang="${zh?'en':'zh-Hant'}" lang="${zh?'en':'zh-Hant'}">${zh?'English':'繁體中文'}</a><a class="portfolio-link" href="${relative(page.file,zh?'../index.html':'../en/index.html')}#works">Nicoa ↗</a></div></header>
  <div class="mobile-toolbar"><button id="menu-button" type="button" aria-controls="docs-sidebar" aria-expanded="false">☰ ${zh?'文件目錄':'Documentation menu'}</button><span>${escape(page.title)}</span></div>
  <div class="docs-layout"><aside id="docs-sidebar" class="docs-sidebar" aria-label="${zh?'文件導覽':'Documentation navigation'}"><div class="sidebar-label">NICOA / OPEN SOURCE</div><nav>${navigation(page)}</nav><div class="sidebar-bottom"><span>${pairCount} ${zh?'組雙語指南':'bilingual guide pairs'}</span><a href="${repo}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></aside>
  <main id="content" class="docs-main" tabindex="-1"><div class="breadcrumb"><a href="${relative(page.file,homeFile(page.lang))}">Docs</a><span>/</span><span>${escape(page.title)}</span></div>${page.key!=='home'?`<details class="mobile-toc"><summary>${zh?'本頁章節':'On this page'}</summary><nav>${toc(page)}</nav></details>`:''}${body}
  <footer class="page-footer"><div class="source-caption"><strong>${zh?'來源與發布版本':'Source & publication'}</strong><p>${sourceInfo}</p><p>commit <code>${sourceCommit.slice(0,12)}</code> · ${dirtyFiles.length ? (zh?'含本機未提交更新':'Includes uncommitted local changes') : (zh?'來源乾淨':'Clean source')} · ${date}</p><a href="${relative(page.file,'source-manifest.json')}" download>${zh?'檢視來源與 SHA-256 清單':'Source & SHA-256 manifest'} ↓</a></div><p>${zh?'免費、開源的 TTP 威脅研究工作區。獨立社群專案，未獲 MITRE 背書。':'A free, open-source workspace for TTP-driven threat research. Independent community project; no MITRE endorsement.'} <a href="${relative(page.file,'assets/source/LICENSE')}">MIT License</a></p></footer></main>
  <aside class="page-toc" aria-label="${zh?'本頁章節':'On this page'}"><p>${zh?'本頁章節':'ON THIS PAGE'}</p><nav>${toc(page)}</nav><a class="toc-source" href="${repo}" target="_blank" rel="noopener noreferrer">${zh?'原始專案':'Source repository'} ↗</a></aside></div>
  <dialog id="search-dialog" aria-labelledby="search-title"><div class="search-heading"><h2 id="search-title">${zh?'搜尋 Fusion Studio 文件':'Search Fusion Studio docs'}</h2><button id="close-search" type="button" aria-label="${zh?'關閉搜尋':'Close search'}">×</button></div><label class="search-input-label" for="docs-search">${zh?'輸入主題、選單或關鍵字':'Enter a topic, menu or keyword'}</label><input id="docs-search" type="search" autocomplete="off" placeholder="${zh?'試試：儲存、CAR、SVG、fusionstudio':'Try: save, CAR, SVG, fusionstudio'}"><p id="search-status" role="status" aria-live="polite">${zh?'輸入文字搜尋目前語言的完整文件。':'Search full documentation in the current language.'}</p><div id="search-results"></div></dialog><div id="toast" role="status" aria-live="polite"></div></body></html>`;
}
function homepage(lang, pairCount) {
  const page={key:'home',lang,title:lang==='zh'?'文件首頁':'Documentation home',file:homeFile(lang),headings:[{id:'get-started',depth:2,text:lang==='zh'?'從第一份研究開始':'Get started'},{id:'workflows',depth:2,text:lang==='zh'?'找到工作流程':'Find a workflow'},{id:'videos',depth:2,text:lang==='zh'?'影片與範例':'Videos & examples'}]};
  const zh=lang==='zh';
  const card=(key,desc)=>`<a class="start-card" href="${pageLink(page,key)}"><span>${escape(labels[key][zh?0:1])} ↗</span><p>${desc}</p></a>`;
  const intro=copied.get('artifacts/intro-video/fusion-studio-intro-zh-TW.mp4'), demo=copied.get('artifacts/demo-video/fusion-studio-demo-zh-TW.mp4');
  const body=`<section class="docs-hero"><p class="eyebrow">FUSION STUDIO / USER DOCUMENTATION</p><h1>${zh?'研究有脈絡，<br>成果能接續。':'Connect the knowledge.<br>Continue the research.'}</h1><p class="hero-subtitle">A free, open-source workspace for TTP-driven threat research.</p><p>${zh?'整合 ATT&CK、ATLAS 與 CAR 參考內容，查閱技術、界定研究範圍、留下註記，並保存與匯出你的研究成果。':'Explore ATT&CK, ATLAS and CAR references. Define your research scope, keep analytical notes, and save or export work you can return to.'}</p><div class="hero-buttons"><a class="primary-button" href="${pageLink(page,'quick-start')}">${zh?'快速開始':'Quick start'} →</a><a class="secondary-button" href="${pageLink(page,'in-app-manual')}">${zh?'閱讀操作總覽':'Operating manual'} ↗</a></div><div class="workflow-line"><span>EXPLORE</span> → <span>SELECT</span> → <span>ANNOTATE</span> → <span>SAVE & EXPORT</span></div></section>
  <section class="home-section"><div class="section-title"><h2>${zh?'從第一份研究開始':'Start with your first research document'}</h2><span>01 / GET STARTED</span></div><div class="start-grid">${card('installation',zh?'Windows、Linux / WSL2 環境與 fusionstudio 啟動指令。':'Windows, Linux / WSL2 setup and the fusionstudio launcher.')}${card('first-research',zh?'建立獨立文件、選取 TTP、保存，再重新開啟。':'Create a document, select TTPs, save and reopen your work.')}${card('studio-files',zh?'理解 Studio JSON、資料版本與工作階段復原。':'Understand Studio JSON, dataset versions and recovery.')}</div></section>
  <section class="home-section"><div class="section-title"><h2>${zh?'找到你正在做的事':'Find your next workflow'}</h2><span>02 / GUIDES</span></div><div class="topic-grid">${card('selection-and-search',zh?'搜尋名稱、ID 與來源內容；了解技術選取。':'Search names, IDs and source content; understand selection.')}${card('batch-operations',zh?'註記、分數、顏色、Links 與 Metadata。':'Annotations, scores, colors, links and metadata.')}${card('workspace-layout',zh?'ATLAS 參考頁、工作區、頁籤與側邊欄。':'ATLAS reference pages, tabs and library sidebars.')}${card('car-integration',zh?'閱讀 CAR Analytics、Data Model 與 Sensors。':'Read CAR Analytics, Data Model and Sensors.')}${card('aggregation-and-exports',zh?'矩陣彙總與 SVG、Excel 報告素材。':'Matrix aggregation and SVG / Excel report material.')}${card('upgrade-review',zh?'資料版本更新時，逐項審閱技術與註記。':'Review techniques and annotations during dataset migration.')}</div><a class="all-guides" href="${pageLink(page,'guide-index')}">${zh?`瀏覽全部 ${pairCount} 組雙語指南`:`Browse all ${pairCount} bilingual guide pairs`} →</a></section>
  <section class="home-section" id="videos"><div class="section-title"><h2>${zh?'先看一次實際操作':'See the actual workflow'}</h2><span>03 / WATCH & TRY</span></div><div class="video-grid"><figure><video controls playsinline preload="none" aria-label="${zh?'60 秒產品介紹，繁體中文字幕，無聲音':'60-second introduction, Chinese captions, no audio'}"><source src="${relative(page.file,intro)}" type="video/mp4"></video><figcaption>${zh?'60 秒產品介紹':'60-second introduction'} <small>${zh?'繁體中文字幕・無聲音':'Chinese captions · no audio'}</small></figcaption></figure><figure><video controls playsinline preload="none" aria-label="${zh?'78 秒操作示範，繁體中文字幕，無聲音':'78-second walkthrough, Chinese captions, no audio'}"><source src="${relative(page.file,demo)}" type="video/mp4"></video><figcaption>${zh?'78 秒操作示範':'78-second walkthrough'} <small>${zh?'繁體中文字幕・無聲音':'Chinese captions · no audio'}</small></figcaption></figure></div><div class="download-row"><a href="${relative(page.file,copied.get('artifacts/demo-video/demo-research.json'))}" download>Studio JSON ↓</a><a href="${relative(page.file,copied.get('artifacts/demo-video/demo-research.csv'))}" download>CSV ↓</a><a href="${pageLink(page,'examples')}">${zh?'範例操作說明':'Example instructions'} →</a></div></section>
  <aside class="research-note"><strong>${zh?'研究與執行的界線':'Research and execution'}</strong><p>${zh?'技術選取、評分與 CAR 參考內容用於研究整理，不代表攻擊已執行、偵測已部署或覆蓋率已驗證。Canvas、CWE 目前為規劃，未列入可操作指南。':'Selections, scores and CAR references organize research; they do not execute attacks, deploy detections or prove coverage. Canvas and CWE remain planned, not operational guides.'}</p></aside>`;
  return {page,body:body.replace('<section class="home-section">','<section class="home-section" id="get-started">').replace('<section class="home-section">','<section class="home-section" id="workflows">')};
}

try {
  if (!source) throw new Error('用法：node build-fusion-docs.mjs --source <Fusion Studio 專案絕對路徑>');
  const gitOptions={encoding:'utf8',env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}};
  sourceCommit=execFileSync('git',['-C',source,'rev-parse','HEAD'],gitOptions).trim();
  tracked=new Set(execFileSync('git',['-C',source,'ls-files'],gitOptions).split(/\r?\n/));
  const files=(await readdir(path.join(source,'manual'))).filter(f=>/(_en|\+_zh)\.md$/.test(f)).sort();
  const stems=[...new Set(files.map(f=>f.replace(/(_en|\+_zh)\.md$/,'')))];
  for(const stem of stems) {
    for(const [suffix,lang] of [['+_zh','zh'],['_en','en']]) {
      const p=`manual/${stem}${suffix}.md`;
      addPage(stem.replaceAll('_','-'),lang,p,await readSource(p));
    }
    const key=stem.replaceAll('_','-');
    if(!groups.some(g=>g[3].includes(key)))groups.at(-1)[3].push(key);
  }
  console.log(`[1/6] 已盤點 ${stems.length} 組完整雙語指南。`);
  const rootReadme=await readSource('README.md');
  const publicReadme=rootReadme.split(/^## Development and verification\s*$/m)[0];
  const definitions=[['guide-index','manual/README.md','en'],['project-readme','README.md','en'],['positioning','PRODUCT_POSITIONING.md','zh'],['examples','manual/examples/README.md','en'],['car-provenance','data/car/PROVENANCE.md','en']];
  for(const [key,p,sourceLanguage] of definitions) {
    const markdown=p==='README.md'?publicReadme:await readSource(p);
    for(const lang of ['zh','en'])addPage(key,lang,p,markdown,sourceLanguage);
  }
  for(const lang of ['zh','en']) {
    const context=lang==='zh'?'> 以下操作保留最新版根 README 的英文原文；繁體中文詳細安裝請見 [安裝與啟動](manual/installation+_zh.md)。\n\n':'';
    addPage('quick-start',lang,'README.md',`# ${labels['quick-start'][lang==='zh'?0:1]}\n\n${context}${section(rootReadme,'Quick start')}`,'en');
    addPage('first-research',lang,'README.md',`# ${labels['first-research'][lang==='zh'?0:1]}\n\n${context}${section(rootReadme,'Your first research document',3)}\n\n${section(rootReadme,'Example files')}`,'en');
  }
  date=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Taipei'});
  dirtyFiles=execFileSync('git',['-C',source,'status','--porcelain','--untracked-files=all','--',...inputs.keys()],gitOptions).trimEnd().split(/\r?\n/).filter(Boolean).map(line=>line.slice(3));
  console.log(`[2/6] 基準 ${sourceCommit.slice(0,12)}，目前收錄來源中 ${dirtyFiles.length} 份有未提交更新。`);
  await mkdir(output,{recursive:true});
  for(const asset of ['assets/fusion-studio-icon-monochrome-v3.png','LICENSE','artifacts/intro-video/fusion-studio-intro-zh-TW.mp4','artifacts/demo-video/fusion-studio-demo-zh-TW.mp4','artifacts/demo-video/demo-research.json','artifacts/demo-video/demo-research.csv','manual/examples/custom_domain_bundle.json'])await collectAsset(asset);
  console.log('[3/6] 產品圖示、兩支影片與可載入範例已收集；未收集完整資料集或日誌。');
  for(const page of pages) {
    const counts=new Map();
    const marked=new Marked({gfm:true,renderer:{heading({tokens,depth}) {
      const inline=this.parser.parseInline(tokens);
      const text=inline.replace(/<[^>]+>/g,'').replaceAll('&amp;','&');
      const base=slug(text), count=counts.get(base)||0; counts.set(base,count+1);
      const id=base+(count?`-${count}`:'');
      page.headings.push({id,text,depth});
      return `<h${depth} id="${escape(id)}">${inline}<a class="heading-anchor" href="#${encodeURIComponent(id)}" aria-label="${page.lang==='zh'?'本節連結':'Link to section'}">#</a></h${depth}>`;
    }}});
    page.html=sanitizeHtml(marked.parse(page.markdown),{
      allowedTags:[...sanitizeHtml.defaults.allowedTags,'img','details','summary','h1','h2'],
      allowedAttributes:{'*':['id','class'],'a':['href','title','aria-label'],'img':['src','alt','width','height'],'code':['class'],'th':['align'],'td':['align'],'p':['align']},
      allowedSchemes:['http','https','mailto','studio'],allowProtocolRelative:false
    });
    const {document}=parseHTML(`<html><body>${page.html}</body></html>`);
    page.extraIds=[...document.querySelectorAll('[id]')].map(el=>el.id);
  }
  for(const page of pages)await rewrite(page);
  const ordered=groups.flatMap(g=>g[3]);
  const outputs=[];
  for(const page of pages) {
    const peers=pages.filter(p=>p.lang===page.lang).sort((a,b)=>ordered.indexOf(a.key)-ordered.indexOf(b.key));
    const current=peers.indexOf(page), previous=peers[current-1], next=peers[current+1];
    const pager=`<nav class="page-pagination" aria-label="${page.lang==='zh'?'文件翻頁':'Page navigation'}">${previous?`<a href="${relative(page.file,previous.file)}"><small>← ${page.lang==='zh'?'上一篇':'Previous'}</small>${escape(previous.title)}</a>`:'<span></span>'}${next?`<a href="${relative(page.file,next.file)}"><small>${page.lang==='zh'?'下一篇':'Next'} →</small>${escape(next.title)}</a>`:''}</nav>`;
    await mkdir(path.dirname(path.join(output,page.file)),{recursive:true});
    await writeFile(path.join(output,page.file),shell(page,`<article class="prose">${page.html}</article>${pager}`,stems.length));
    outputs.push(page.file);
  }
  for(const lang of ['zh','en']) {const {page,body}=homepage(lang,stems.length);await writeFile(path.join(output,page.file),shell(page,body,stems.length));outputs.push(page.file);}
  console.log(`[4/6] 已轉換 ${pages.length+2} 頁，保留中英對應、章節、範例及桌面操作提示。`);
  const search=[];
  for(const page of pages.filter(p=>!['project-readme','positioning','guide-index','in-app-index','car-provenance'].includes(p.key))) {
    const {document}=parseHTML(`<html><body>${page.html}</body></html>`);
    let title=page.title, anchor='', chunks=[];
    const flush=()=>{const text=chunks.join(' ').replace(/\s+/g,' ').trim();if(text)search.push({lang:page.lang,title,pageTitle:page.title,url:page.file+(anchor?'#'+encodeURIComponent(anchor):''),text});};
    for(const node of document.body.children) {
      if(/^H[23]$/.test(node.tagName)){flush();chunks=[];title=node.textContent.replace(/#$/,'').trim();anchor=node.id;}
      chunks.push(node.textContent);
    }
    flush();
  }
  await writeFile(path.join(output,'search-index.json'),JSON.stringify(search));
  const sourceState=execFileSync('git',['-C',source,'status','--porcelain','--untracked-files=all','--',...inputs.keys()],gitOptions).trimEnd().split(/\r?\n/).filter(Boolean).map(line=>line.slice(3));
  dirtyFiles=sourceState;
  const manifest={schemaVersion:1,repository:repo,baseCommit:sourceCommit,generatedDate:date,timeZone:'Asia/Taipei',includesUncommittedChanges:dirtyFiles.length>0,changedPublishedSources:dirtyFiles,manualPairs:stems.length,pages:pages.map(p=>({path:p.file,key:p.key,lang:p.lang,source:p.sourcePath,sourceLanguage:p.sourceLanguage})),generatedHtml:outputs,files:[...inputs.values()],assets:[...copied].map(([source,path])=>({source,path}))};
  await writeFile(path.join(output,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  await writeFile(path.join(output,'build-report.json'),JSON.stringify({generatedDate:date,pageCount:outputs.length,searchEntries:search.length,assetCount:copied.size,linkTransformations:notes,upstreamReferences:[...externalReferences].sort()},null,2)+'\n');
  console.log(`[5/6] 搜尋索引 ${search.length} 筆、來源雜湊 ${inputs.size} 份、素材 ${copied.size} 份完成。`);
  // Remove only obsolete HTML files previously generated by this builder; never remove directories.
  for(const language of ['zh','en'])for(const file of await readdir(path.join(output,language))) {
    const p=`${language}/${file}`;
    if(/^[a-z0-9-]+\.html$/.test(file)&&!outputs.includes(p))await unlink(path.join(output,p));
  }
  for(const input of inputs.values())if(hash(await readFile(sourceFile(input.path)))!==input.sha256)throw new Error(`來源於建置中變更，請重新建置：${input.path}`);
  console.log(`[6/6] 建置完成：${path.join(output,'index.html')}。原始 Fusion Studio 專案沒有寫入。`);
} catch(error) {console.error('文件建置失敗：',error.stack);process.exitCode=1;}
