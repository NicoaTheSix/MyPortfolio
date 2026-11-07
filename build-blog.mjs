import {readFile,writeFile,mkdir,readdir,stat,unlink} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Marked} from 'marked';
import sanitizeHtml from 'sanitize-html';
import {parseHTML} from 'linkedom';
import {googleTag,googleTagBody} from './google-tag.mjs';
import {brandHead,brandLogo} from './brand.mjs';

const siteRoot=path.dirname(fileURLToPath(import.meta.url));
export const siteUrl='https://nicoathesix.github.io/MyPortfolio/';
const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const parser=new Marked({gfm:true});
const relative=(file,to)=>(path.posix.relative(path.posix.dirname(file),to)||'./').replace(/index\.html$/,'')||'./';
const isDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
const contained=(base,target)=>target.startsWith(path.resolve(base)+path.sep);
const text={
  'zh-Hant':{name:'文章',label:'ARTICLES / FIELD NOTES',intro:'關於資安、程式與實作的筆記。',home:'回作品集',read:'閱讀文章',published:'發布',updated:'更新',minutes:'分鐘閱讀',original:'Medium 刊載版本',notice:'本文以本站為原文與主要更新版本。',all:'所有文章',empty:'文章整理中，敬請期待。',rss:'訂閱 RSS',toc:'本文內容'},
  en:{name:'Articles',label:'ARTICLES / FIELD NOTES',intro:'Notes on cybersecurity, code and things I build.',home:'Portfolio',read:'Read article',published:'Published',updated:'Updated',minutes:'min read',original:'Also on Medium',notice:'This website hosts the original article and its ongoing updates.',all:'All articles',empty:'New articles are on the way.',rss:'RSS feed',toc:'On this page'}
};

function shell({file,title,description,lang,body,structured,alternate}) {
  const t=text[lang],canonical=new URL(file.replace(/index\.html$/,''),siteUrl).href;
  const index=lang==='en'?'blog/en/index.html':'blog/index.html';
  const opposite=lang==='en'?'blog/index.html':'blog/en/index.html';
  const home=lang==='en'?'en/index.html':'index.html';
  return `<!DOCTYPE html>\n<html lang="${lang}">\n<head>\n${googleTag}\n<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff"><meta name="description" content="${escape(description)}"><title>${escape(title)} | Nicoa The Six</title><link rel="canonical" href="${canonical}"><meta property="og:type" content="${structured?'article':'website'}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="${canonical}">${brandHead(asset=>relative(file,asset))}<link rel="stylesheet" href="${relative(file,'blog/blog.css')}?v=20261106"><link rel="alternate" type="application/rss+xml" title="Nicoa The Six" href="${relative(file,'blog/feed.xml')}">${alternate?`<link rel="alternate" hreflang="zh-Hant" href="${new URL('blog/',siteUrl)}"><link rel="alternate" hreflang="en" href="${new URL('blog/en/',siteUrl)}">`:''}${structured?`<script type="application/ld+json">${json(structured)}</script>`:''}</head>\n<body>\n${googleTagBody}\n<a class="skip-link" href="#main">${lang==='en'?'Skip to content':'跳至主要內容'}</a><header class="blog-header"><div class="blog-header-inner"><a class="blog-brand" href="${relative(file,home)}">${brandLogo(asset=>relative(file,asset))}</a><nav aria-label="${lang==='en'?'Main navigation':'主要導覽'}"><a href="${relative(file,index)}"${file===index?' aria-current="page"':''}>${t.name}</a><a href="${relative(file,home)}">${t.home} ↗</a><a class="blog-language" href="${relative(file,opposite)}" lang="${lang==='en'?'zh-Hant':'en'}">${lang==='en'?'繁體中文':'English'}</a></nav></div></header><main id="main">${body}</main><footer class="blog-footer"><a class="footer-brand" href="${relative(file,home)}" aria-label="Nicoa'Lab">${brandLogo(asset=>relative(file,asset),false)}</a><a href="${relative(file,index)}">Nicoa The Six / ${t.name}</a><a href="${relative(file,'blog/feed.xml')}">${t.rss} ↗</a></footer></body></html>\n`;
}

async function render(markdown,source,file,sourceMap) {
  const html=sanitizeHtml(parser.parse(markdown),{
    allowedTags:[...sanitizeHtml.defaults.allowedTags,'img','figure','figcaption'],
    allowedAttributes:{a:['href','title'],img:['src','alt','title','width','height'],code:['class']},
    allowedSchemes:['http','https','mailto'],allowProtocolRelative:false
  });
  const document=parseHTML('<html><body><article>'+html+'</article></body></html>').document;
  const article=document.querySelector('article');
  const headings=[],usedIds=new Set(['main']);
  for(const heading of article.querySelectorAll('h1,h2,h3,h4,h5,h6')) {
    // The article title is already the page's h1.
    if(heading.localName==='h1'){const h=document.createElement('h2');h.innerHTML=heading.innerHTML;heading.replaceWith(h);}
  }
  for(const heading of article.querySelectorAll('h2,h3')) {
    const base=heading.textContent.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||'section';
    let id=base,n=2;while(usedIds.has(id))id=base+'-'+n++;
    usedIds.add(id);heading.id=id;headings.push({id,title:heading.textContent});
  }
  const assets=new Set();
  for(const element of article.querySelectorAll('a[href],img[src]')) {
    const attribute=element.localName==='img'?'src':'href',value=element.getAttribute(attribute);
    if(/^https?:\/\//.test(value)){
      if(element.localName==='a'){element.setAttribute('target','_blank');element.setAttribute('rel','noopener noreferrer');}
      continue;
    }
    if(value.startsWith('#')||value.startsWith('mailto:'))continue;
    const url=new URL(value,'https://local.invalid/'+source.replaceAll(path.sep,'/'));
    assert.equal(url.origin,'https://local.invalid','不支援的文章路徑');
    let target=decodeURIComponent(url.pathname.slice(1));
    assert(!target.includes('\\')&&contained(siteRoot,path.resolve(siteRoot,target)),'文章引用離開網站範圍');
    const publishedArticle=sourceMap.has(target);
    if(publishedArticle)target=sourceMap.get(target);
    assert(!target.startsWith('blog/posts/'),'不得連結未發布的文章來源或草稿');
    const actual=path.resolve(siteRoot,target);
    if(!publishedArticle)assert((await stat(actual)).isFile(),'文章引用不存在：'+actual);
    if(target.startsWith('blog/assets/'))assets.add(target.slice(5));
    element.setAttribute(attribute,relative(file,target)+url.hash);
    if(element.localName==='img'){
      assert(element.hasAttribute('alt'),'文章圖片缺少替代文字');
      element.setAttribute('loading','lazy');element.setAttribute('decoding','async');
    }
  }
  for(const table of article.querySelectorAll('table')){const wrap=document.createElement('div');wrap.className='table-scroll';table.replaceWith(wrap);wrap.append(table);}
  return {html:article.innerHTML,headings,assets:[...assets],plain:article.textContent.replace(/\s+/g,' ').trim()};
}

export async function buildBlog({contentDir=path.join(siteRoot,'blog/posts'),outputDir=path.join(siteRoot,'blog'),updateHome=true}={}) {
  console.log('[0/5] 文章輸入絕對目錄：',contentDir);
  console.log('[0/5] 產出絕對目錄：',outputDir);
  console.log('[0/5] 共用 GTM 輸入：',path.join(siteRoot,'google-tag.mjs'));
  const posts=[];
  for(const entry of (await readdir(contentDir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
    if(!entry.isDirectory())continue;
    const slug=entry.name;
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)&&!['en','assets','posts'].includes(slug),'無效或保留的文章 slug：'+slug);
    const metaFile=path.join(contentDir,slug,'meta.json'),bodyFile=path.join(contentDir,slug,'article.md');
    console.log('[0/5] 輸入絕對路徑：',metaFile,bodyFile);
    const meta=JSON.parse(await readFile(metaFile,'utf8'));
    assert(typeof meta.draft==='boolean','必須明確指定 draft');
    if(meta.draft)continue;
    assert(typeof meta.title==='string'&&meta.title.trim()&&typeof meta.description==='string'&&meta.description.trim(),'文章標題／摘要必填');
    assert(['zh-Hant','en'].includes(meta.lang),'文章語言須為 zh-Hant 或 en');
    assert(isDate(meta.published)&&isDate(meta.updated)&&meta.updated>=meta.published,'文章日期不正確');
    assert(Array.isArray(meta.tags)&&meta.tags.length<=10&&meta.tags.every(tag=>typeof tag==='string'&&tag.length<=40),'文章標籤不正確');
    if(meta.sourceUrl)assert(new URL(meta.sourceUrl).protocol==='https:','原文連結必須為 HTTPS');
    const markdown=await readFile(bodyFile,'utf8');assert(markdown.trim(),'發布文章不能是空白');
    posts.push({...meta,slug,markdown,source:'blog/posts/'+slug+'/article.md',file:'blog/'+slug+'/index.html'});
  }
  posts.sort((a,b)=>b.published.localeCompare(a.published)||a.slug.localeCompare(b.slug));
  const sourceMap=new Map(posts.map(post=>[post.source,post.file]));
  console.log(`[1/5] 已驗證 ${posts.length} 篇公開文章；草稿不產生網頁。`);
  const outputs=new Map(),assets=new Set();
  for(const post of posts) {
    const rendered=await render(post.markdown,post.source,post.file,sourceMap);
    rendered.assets.forEach(asset=>assets.add(asset));
    post.minutes=Math.max(1,Math.ceil((rendered.plain.match(/\p{Script=Han}/gu)||[]).length/420+(rendered.plain.match(/[a-z0-9]+/gi)||[]).length/220));
    if(post.cover){const target=path.posix.normalize(path.posix.join(path.posix.dirname(post.source),post.cover));assert(target.startsWith('blog/assets/'),'封面必須位於 blog/assets');assert((await stat(path.join(siteRoot,target))).isFile(),'封面檔案不存在');post.coverPath=target;assets.add(target.slice(5));}
    const t=text[post.lang];
    const toc=rendered.headings.length?`<details class="post-toc"><summary>${t.toc}</summary><nav>${rendered.headings.map(h=>`<a href="#${encodeURIComponent(h.id)}">${escape(h.title)}</a>`).join('')}</nav></details>`:'';
    const body=`<div class="article-shell"><a class="back-link" href="${relative(post.file,post.lang==='en'?'blog/en/index.html':'blog/index.html')}">← ${t.all}</a><header class="article-heading"><p class="eyebrow">${post.tags.map(escape).join(' / ')}</p><h1>${escape(post.title)}</h1><p class="post-description">${escape(post.description)}</p><div class="post-meta"><span>Nicoa The Six</span><span>${t.published} <time datetime="${post.published}">${post.published}</time></span>${post.updated!==post.published?`<span>${t.updated} <time datetime="${post.updated}">${post.updated}</time></span>`:''}<span>${post.minutes} ${t.minutes}</span></div></header>${toc}<article class="article-body">${rendered.html}</article>${post.sourceUrl?`<aside class="source-note"><p>${t.notice}</p><a href="${escape(post.sourceUrl)}" target="_blank" rel="noopener noreferrer">${t.original} ↗</a></aside>`:''}<a class="back-link article-back" href="${relative(post.file,'blog/index.html')}">← ${t.all}</a></div>`;
    const url=new URL(post.file.replace(/index\.html$/,''),siteUrl).href;
    const structured={'@context':'https://schema.org','@type':'BlogPosting',headline:post.title,description:post.description,inLanguage:post.lang,datePublished:post.published,dateModified:post.updated,author:{'@type':'Person',name:'Nicoa The Six',url:siteUrl},mainEntityOfPage:{'@type':'WebPage','@id':url},url,...(post.coverPath?{image:new URL(post.coverPath,siteUrl).href}:{})};
    outputs.set(post.file.slice(5),shell({file:post.file,title:post.title,description:post.description,lang:post.lang,body,structured}));
  }
  console.log('[2/5] Markdown、引用與圖片路徑已整理，文章設定本站 canonical。');
  for(const lang of ['zh-Hant','en']) {
    const t=text[lang],file=lang==='en'?'blog/en/index.html':'blog/index.html';
    const cards=posts.map((post,i)=>`<article class="post-card"><a class="post-cover" href="${relative(file,post.file)}" aria-label="${escape(post.title)}">${post.coverPath?`<img src="${relative(file,post.coverPath)}" alt="" width="1024" height="578" loading="${i?'lazy':'eager'}">`:`<span aria-hidden="true">${String(i+1).padStart(2,'0')} / NOTES</span>`}</a><div class="post-card-body"><p class="eyebrow">${post.tags.map(escape).join(' / ')}</p><h2><a href="${relative(file,post.file)}" lang="${post.lang}">${escape(post.title)}</a></h2><p lang="${post.lang}">${escape(post.description)}</p><div class="post-meta"><time datetime="${post.published}">${post.published}</time><span>${post.minutes} ${t.minutes}</span><span>${post.lang==='en'?'English':'繁體中文'}</span></div><a class="read-link" href="${relative(file,post.file)}">${t.read} ↗</a></div></article>`).join('');
    const body=`<div class="blog-container"><section class="blog-hero"><p class="eyebrow">${t.label}</p><h1>${t.name}<span aria-hidden="true">.</span></h1><p>${t.intro}</p><div class="blog-hero-bottom"><span>${String(posts.length).padStart(2,'0')} ${lang==='en'?'ARTICLES':'篇文章'}</span><a href="${relative(file,'blog/feed.xml')}">${t.rss} ↗</a></div></section><section class="post-list" aria-label="${t.all}">${cards||`<p class="empty-state">${t.empty}</p>`}</section></div>`;
    outputs.set(file.slice(5),shell({file,title:t.name,description:t.intro,lang,body,alternate:true}));
  }
  const canonicalFiles=['blog/','blog/en/',...posts.map(post=>'blog/'+post.slug+'/')];
  outputs.set('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${canonicalFiles.map(file=>`<url><loc>${escape(new URL(file,siteUrl).href)}</loc></url>`).join('')}</urlset>\n`);
  outputs.set('feed.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Nicoa The Six / Articles</title><link>${siteUrl}blog/</link><description>Notes on cybersecurity, code and things I build.</description>${posts.map(post=>`<item><title>${escape(post.title)}</title><link>${siteUrl}blog/${post.slug}/</link><guid isPermaLink="true">${siteUrl}blog/${post.slug}/</guid><pubDate>${new Date(post.published+'T00:00:00+08:00').toUTCString()}</pubDate><description>${escape(post.description)}</description></item>`).join('')}</channel></rss>\n`);
  const generatedHtml=[...outputs.keys()].filter(file=>file.endsWith('.html'));
  const manifest={schemaVersion:1,siteUrl,generatedHtml,publicFiles:[...outputs.keys(),'blog.css','source-manifest.json',...assets],posts:posts.map(({slug,title,lang,published,updated,source,markdown})=>({slug,title,lang,published,updated,source,sha256:createHash('sha256').update(markdown).digest('hex'),url:new URL('blog/'+slug+'/',siteUrl).href}))};
  outputs.set('source-manifest.json',JSON.stringify(manifest,null,2)+'\n');
  for(const file of outputs.keys())console.log('[0/5] 輸出絕對路徑：',path.join(outputDir,file));
  let previous=null;try{previous=JSON.parse(await readFile(path.join(outputDir,'source-manifest.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  for(const file of previous?.generatedHtml||[])assert(/^(?:en\/|[a-z0-9-]+\/)?index\.html$/.test(file),'前次生成清單路徑無效');
  for(const [file,content]of outputs){const target=path.join(outputDir,file);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,content);}
  // Delete only obsolete generated article HTML recorded by our own manifest.
  for(const file of previous?.generatedHtml||[]){assert(/^(?:en\/|[a-z0-9-]+\/)?index\.html$/.test(file),'前次生成清單路徑無效');if(!generatedHtml.includes(file))await unlink(path.join(outputDir,file)).catch(error=>{if(error.code!=='ENOENT')throw error;});}
  console.log(`[3/5] 已建立 ${generatedHtml.length} 頁、RSS 與僅限 blog 的 sitemap。`);
  if(updateHome)for(const [lang,home]of [['zh-Hant','index.html'],['en','en/index.html']]) {
    const absolute=path.join(siteRoot,home);console.log('[0/5] 首頁輸入／輸出絕對路徑：',absolute);
    const document=parseHTML(await readFile(absolute,'utf8')).document;
    const nav=document.querySelector('.site-header nav');assert(nav,'缺少首頁導覽');
    for(const link of nav.querySelectorAll('.nav-blog'))link.remove();
    const link=document.createElement('a');link.className='nav-blog';link.href=relative(home,lang==='en'?'blog/en/index.html':'blog/index.html');link.textContent=lang==='en'?'Articles':'文章';nav.insertBefore(link,nav.querySelector('.nav-desktiles'));
    for(const old of document.querySelectorAll('.blog-home-card'))old.remove();
    const notes=document.querySelector('.notes-stack');assert(notes,'缺少作品筆記區');
    const card=document.createElement('article');card.className='work-card note-card blog-home-card pixel-reveal';
    card.innerHTML=`<p class="eyebrow">${text[lang].label}</p><h3>${text[lang].name}</h3><p class="work-description">${text[lang].intro}</p><a class="text-link" href="${relative(home,lang==='en'?'blog/en/index.html':'blog/index.html')}">${lang==='en'?'Browse articles':'閱讀站內文章'} ↗</a>`;
    notes.prepend(card);
    const homeHtml=('<!DOCTYPE html>\n'+document.documentElement.outerHTML+'\n').replace(/<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->/,googleTagBody);
    await writeFile(absolute,homeHtml);
  }
  console.log('[4/5] 首頁文章入口完成；其他作品與既有外站筆記連結保留。');
  console.log('[5/5] blog 建置完成，正式版本與部署設定不變。');
  return manifest;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try{await buildBlog();}catch(error){console.error('Blog 建置失敗：',error.stack);process.exitCode=1;}
}
