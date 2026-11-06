import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,stat,mkdtemp,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {parseHTML,DOMParser} from 'linkedom';
import {buildBlog,siteUrl} from './build-blog.mjs';
import {googleTag,googleTagBody} from './google-tag.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const normalize=text=>text.replace(/\r\n/g,'\n');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const manifestFile=path.join(root,'blog/source-manifest.json');
const at=process.argv.indexOf('--url');
const base=at>=0?new URL(process.argv[at+1]):null;
let sandbox;
try {
  console.log('[0/5] 輸入絕對路徑：',manifestFile,path.join(root,'blog/posts'),path.join(root,'google-tag.mjs'));
  console.log('[0/5] 輸出：終端檢查結果與系統暫存中的隔離測試；不修改網站產物。');
  if(base)console.log('[0/5] HTTP 輸入：',base.href);
  const manifest=JSON.parse(await readFile(manifestFile,'utf8'));
  assert.equal(manifest.siteUrl,siteUrl);
  const pages=new Map();
  for(const file of manifest.generatedHtml) {
    assert(/^(?:en\/|[a-z0-9-]+\/)?index\.html$/.test(file),'生成頁路徑不正確');
    const absolute=path.join(root,'blog',file),html=await readFile(absolute,'utf8');
    const document=parseHTML(html).document;pages.set(file,document);
    assert.equal(document.querySelectorAll('h1').length,1,file+' h1');
    assert.equal(document.querySelectorAll('main').length,1);
    const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);assert.equal(ids.length,new Set(ids).size,'重複 id');
    const canonical=document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    assert.equal(canonical,new URL('blog/'+file.replace(/index\.html$/,''),siteUrl).href,'主要版本網址不正確');
    assert.equal(document.querySelectorAll('link[rel="canonical"]').length,1);
    assert(normalize(html).includes('<head>\n'+googleTag)&&normalize(html).includes(googleTagBody),'GTM 缺少');
    assert.equal((html.match(/googletagmanager\.com\/gtm\.js\?/g)||[]).length,1);
    for(const image of document.querySelectorAll('img'))assert(image.hasAttribute('alt'),'缺少圖片替代文字');
    for(const link of document.querySelectorAll('a[target="_blank"]'))assert(link.getAttribute('rel')?.includes('noopener'));
    for(const el of document.querySelectorAll('a[href],img[src],link[href]')) {
      const ref=el.getAttribute(el.localName==='img'?'src':'href');
      if(/^(?:https?:|mailto:)/.test(ref))continue;
      const url=new URL(ref,new URL('blog/'+file,siteUrl));
      assert(url.pathname.startsWith('/MyPortfolio/'),'引用離開網站子目錄');
      let local=decodeURIComponent(url.pathname.slice('/MyPortfolio/'.length));if(!local||local.endsWith('/'))local+='index.html';
      assert(!local.startsWith('blog/posts/'),'來源／草稿出現在公開頁面');
      assert((await stat(path.join(root,local))).isFile(),'不存在的引用：'+local);
      if(url.hash){const target=parseHTML(await readFile(path.join(root,local),'utf8')).document;assert(target.getElementById(decodeURIComponent(url.hash.slice(1))),'無效章節錨點');}
    }
  }
  console.log(`[1/5] ${pages.size} 頁、固定 canonical、GTM、資源引用與可及性通過。`);
  for(const post of manifest.posts) {
    const document=pages.get(post.slug+'/index.html');
    const data=JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
    assert.equal(data['@type'],'BlogPosting');assert.equal(data.url,post.url);assert.equal(data.mainEntityOfPage['@id'],post.url);
    assert.equal(hash(await readFile(path.join(root,post.source))),post.sha256,'Markdown 來源變更後未重建');
    const sourceFile=path.join(root,path.dirname(post.source),'source.json');
    let source;try{source=JSON.parse(await readFile(sourceFile,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
    if(source) {
      for(const asset of source.images){const bytes=await readFile(path.join(root,'blog',asset.path));assert.equal(bytes.length,asset.bytes);assert.equal(hash(bytes),asset.sha256,'圖片與來源不符');}
      const article=document.querySelector('.article-body');
      // Compare the initial import with Medium; later site edits remain the primary version.
      if(post.sha256===source.importedMarkdownSha256) {
        assert.equal(article.querySelectorAll('img').length,source.images.length,'圖片數與來源不同');
        assert.equal([...article.querySelectorAll('p')].filter(p=>p.textContent.trim()).length,source.paragraphs,'正文段落遺漏');
        assert.equal(hash(Buffer.from(article.textContent.replace(/\s+/g,''))),source.bodyTextSha256,'原文文字被改寫或遺漏');
      } else console.log('[2/5] 本站已編輯版本，保留來源基準而不要求恢復 Medium 原文：',post.slug);
      assert(!article.innerHTML.includes('medium.com/_/stat'),'保留了 Medium 追蹤像素');
    }
  }
  for(const file of ['feed.xml','sitemap.xml']) {
    const xml=new DOMParser().parseFromString(await readFile(path.join(root,'blog',file),'utf8'),'text/xml');
    if(file==='sitemap.xml'){const urls=[...xml.querySelectorAll('loc')].map(el=>el.textContent);for(const post of manifest.posts)assert(urls.includes(post.url));assert.equal(urls.length,manifest.posts.length+2);}
    else {assert.equal(xml.querySelectorAll('item').length,manifest.posts.length);for(const item of xml.querySelectorAll('item'))assert(manifest.posts.some(post=>post.url===item.querySelector('guid').textContent));}
  }
  for(const [i,file]of ['index.html','en/index.html'].entries()) {
    const document=parseHTML(await readFile(path.join(root,file),'utf8')).document;
    assert.equal(document.querySelectorAll('.nav-blog').length,1);assert.equal(document.querySelectorAll('.blog-home-card').length,1);
    assert.equal(document.querySelector('.nav-blog').getAttribute('href'),i?'../blog/en/':'blog/');
  }
  console.log('[2/5] 文章原文／四圖雜湊、結構化資料、RSS、blog sitemap 與首頁入口通過。');
  sandbox=await mkdtemp(path.join(tmpdir(),'nicoa-blog-check-'));
  console.log('[0/5] 隔離測試輸入／輸出絕對目錄：',sandbox);
  const contentDir=path.join(sandbox,'posts'),outputDir=path.join(sandbox,'output'),fixture=path.join(contentDir,'safety-check');
  await mkdir(fixture,{recursive:true});
  const meta={title:'A < B & C',description:'Safety fixture',lang:'en',published:'2026-11-06',updated:'2026-11-06',tags:['test'],draft:false};
  await writeFile(path.join(fixture,'meta.json'),JSON.stringify(meta));
  await writeFile(path.join(fixture,'article.md'),'## Main\n\n## Main\n\n<script>alert(1)</script>\n\n<a href="javascript:alert(1)" onclick="alert(2)">unsafe</a>\n\n[link](javascript:alert(3))\n');
  await buildBlog({contentDir,outputDir,updateHome:false});
  const built=parseHTML(await readFile(path.join(outputDir,'safety-check/index.html'),'utf8')).document;
  const body=built.querySelector('.article-body');assert.equal(body.querySelectorAll('script,[onclick],a[href^="javascript:"]').length,0);
  const fixtureIds=[...built.querySelectorAll('[id]')].map(el=>el.id);assert.equal(fixtureIds.length,new Set(fixtureIds).size);
  const first=await readFile(path.join(outputDir,'safety-check/index.html'),'utf8');
  await buildBlog({contentDir,outputDir,updateHome:false});
  assert.equal(await readFile(path.join(outputDir,'safety-check/index.html'),'utf8'),first,'同樣輸入建置不穩定');
  await writeFile(path.join(fixture,'meta.json'),JSON.stringify({...meta,draft:true}));
  const withdrawn=await buildBlog({contentDir,outputDir,updateHome:false});assert.equal(withdrawn.posts.length,0);
  await assert.rejects(access(path.join(outputDir,'safety-check/index.html')));
  for(const file of ['index.html','en/index.html','feed.xml','sitemap.xml'])assert(!(await readFile(path.join(outputDir,file),'utf8')).includes('safety-check'),'草稿仍出現在公開資料');
  console.log('[3/5] 隔離發布／重建／撤稿、標題跳脫與危險 HTML 清理通過。');
  if(base){
    assert(['http:','https:'].includes(base.protocol)&&base.pathname.endsWith('/'));
    for(const file of manifest.publicFiles){const response=await fetch(new URL(file,base),{signal:AbortSignal.timeout(20000)});assert.equal(response.status,200,file);const actual=Buffer.from(await response.arrayBuffer()),expected=await readFile(path.join(root,'blog',file));if(/\.(?:html|css|json|xml)$/.test(file))assert.equal(normalize(actual.toString()),normalize(expected.toString()),file);else assert.equal(hash(actual),hash(expected),file);}
    const privateResponse=await fetch(new URL('posts/mitre-att-ck-introduction/article.md',base));assert.equal(privateResponse.status,404,'預覽不應提供來源檔');
    console.log(`[4/5] ${manifest.publicFiles.length} 份 HTTP 公開產物與預覽來源阻擋通過。`);
  }else console.log('[4/5] 未指定 --url，略過 HTTP 比對。');
  console.log('[5/5] Blog 檢查完成；未修改網站產物。');
}catch(error){console.error('Blog 檢查失敗：',error.stack);process.exitCode=1;}
finally {
  if(sandbox){const resolved=path.resolve(sandbox),parent=path.resolve(tmpdir());assert(path.dirname(resolved)===parent&&path.basename(resolved).startsWith('nicoa-blog-check-'),'拒絕清除非本輪測試目錄');await rm(resolved,{recursive:true,force:true});}
}
