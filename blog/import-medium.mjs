import {readFile, writeFile, mkdir, access} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {DOMParser, parseHTML} from 'linkedom';

const root=path.dirname(fileURLToPath(import.meta.url));
const slug='mitre-att-ck-introduction';
const postId='8968e5dd7e76';
const feed='https://medium.com/feed/@nick5901879';
const sourceUrl='https://medium.com/@nick5901879/'+postId;
const postDir=path.join(root,'posts',slug);
const assetDir=path.join(root,'assets/images',slug);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const escape=text=>text.replace(/[\\`*_[\]<>]/g,'\\$&');

async function get(url) {
  const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
  assert.equal(response.status,200,url+' HTTP');
  return Buffer.from(await response.arrayBuffer());
}

try {
  console.log('[0/4] 公開輸入 URL：',feed,sourceUrl);
  for(const name of ['article.md','meta.json','source.json'])console.log('[0/4] 輸出絕對路徑：',path.join(postDir,name));
  console.log('[0/4] 圖片輸出絕對目錄：',assetDir);
  // This is a one-time import. Never overwrite the author's later edits.
  let exists=false;
  try {await access(postDir);exists=true;}catch(error){if(error.code!=='ENOENT')throw error;}
  assert(!exists,'文章來源目錄已存在；為保留編輯，不再次匯入覆寫。');
  const xml=await get(feed);
  const document=new DOMParser().parseFromString(xml.toString('utf8'),'text/xml');
  const item=[...document.querySelectorAll('item')].find(node=>node.querySelector('guid')?.textContent.includes(postId)||node.querySelector('link')?.textContent.includes(postId));
  assert(item,'公開 RSS 沒有指定文章；停止，不自行補全文。');
  const title=item.querySelector('title')?.textContent.trim();
  const published=item.querySelector('pubDate')?.textContent;
  const original=item.getElementsByTagName('content:encoded')[0]?.textContent;
  assert(title&&original&&Number.isFinite(Date.parse(published)),'來源標題、日期或全文缺少');
  const article=parseHTML('<html><body><article>'+original+'</article></body></html>').document.querySelector('article');
  for(const image of article.querySelectorAll('img'))if(image.getAttribute('src')?.startsWith('https://medium.com/_/stat'))image.remove();
  assert(article.querySelectorAll('p').length>=5,'來源可能不是完整文章，停止匯入。');
  console.log('[1/4] 已取得指定文章全文：',title);
  const images=[];
  const names=['cover','mitre-attack-white-logo','attack-logo','enterprise-matrix'];
  const alts=['認識 MITRE ATT&CK、戰術、技術與程序的黑白像素插畫','MITRE ATT&CK 白色標誌','ATT&CK 紅色標誌','ATT&CK Enterprise 矩陣：上方為戰術，各欄排列對應技術'];
  const imageData=[];
  for(const [index,image]of [...article.querySelectorAll('img')].entries()) {
    const url=new URL(image.getAttribute('src'));
    assert(url.protocol==='https:'&&/^cdn-images-\d+\.medium\.com$/.test(url.hostname),'圖片不屬於指定文章的 Medium CDN');
    const filename=(names[index]||'figure-'+(index+1))+'.png';
    const destination=path.join(assetDir,filename);
    console.log('[0/4] 圖片輸入／輸出：',url.href,'→',destination);
    const bytes=await get(url.href);
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','原圖不是預期的 PNG');
    imageData.push({destination,bytes});
    images.push({path:'assets/images/'+slug+'/'+filename,sourceUrl:url.href,bytes:bytes.length,sha256:hash(bytes)});
    image.setAttribute('src','../../assets/images/'+slug+'/'+filename);
    if(!image.getAttribute('alt'))image.setAttribute('alt',alts[index]||'原文附圖 '+(index+1));
    console.log(`[2/4] 圖片 ${index+1} 取得並核對完成。`);
  }
  function markdown(node) {
    if(node.nodeType===3)return escape(node.textContent);
    if(node.nodeType!==1)return '';
    const inner=()=>[...node.childNodes].map(markdown).join('');
    switch(node.localName) {
      case 'script':case 'style':case 'iframe':return '';
      case 'p':return inner()+'\n\n';
      case 'h1':case 'h2':case 'h3':case 'h4':return '#'.repeat(Number(node.localName[1]))+' '+inner()+'\n\n';
      case 'strong':case 'b':return '**'+inner()+'**';
      case 'em':case 'i':return '*'+inner()+'*';
      case 'a':return '['+inner()+']('+node.getAttribute('href')+')';
      case 'img':return '!['+escape(node.getAttribute('alt')||'原文附圖')+']('+node.getAttribute('src')+')\n\n';
      case 'br':return '  \n';
      case 'figure':return inner()+'\n';
      case 'figcaption':return '*'+inner()+'*\n\n';
      case 'code':return '`'+node.textContent+'`';
      case 'blockquote':return inner().trim().split('\n').map(line=>'> '+line).join('\n')+'\n\n';
      case 'ul':case 'ol':return [...node.children].map((child,i)=>(node.localName==='ol'?(i+1)+'. ':'- ')+markdown(child).trim()).join('\n')+'\n\n';
      case 'li':return inner();
      default:return inner();
    }
  }
  const body=[...article.childNodes].map(markdown).join('').replace(/\n{3,}/g,'\n\n').trim()+'\n';
  const date=new Date(published).toISOString().slice(0,10);
  const meta={title,description:'從日常生活中的資安攻擊談起，認識 MITRE ATT&CK、戰術、技術與程序，並以權限提升與 AppleSeed 為例說明。',lang:'zh-Hant',published:date,updated:date,tags:['資安','MITRE ATT&CK','TTP'],draft:false,cover:'../../assets/images/'+slug+'/cover.png',sourceUrl};
  const source={sourceUrl,feedUrl:feed,postId,title,publishedAt:new Date(published).toISOString(),importedAt:new Date().toISOString(),sourceHtmlSha256:hash(Buffer.from(original)),bodyTextSha256:hash(Buffer.from(article.textContent.replace(/\s+/g,''))),paragraphs:article.querySelectorAll('p').length,images,notes:'作者指定的公開 RSS 全文匯入；不讀取付費牆、登入資料或其他文章。正文措辭與引用保留，追蹤像素移除，缺少 alt 的圖片補上替代文字。'};
  await mkdir(postDir,{recursive:true});await mkdir(assetDir,{recursive:true});
  for(const {destination,bytes}of imageData)await writeFile(destination,bytes);
  await writeFile(path.join(postDir,'article.md'),body);
  await writeFile(path.join(postDir,'meta.json'),JSON.stringify(meta,null,2)+'\n');
  source.importedMarkdownSha256=hash(Buffer.from(body));
  await writeFile(path.join(postDir,'source.json'),JSON.stringify(source,null,2)+'\n');
  console.log('[3/4] Markdown、文章資訊、來源與圖片雜湊已保存。');
  console.log('[4/4] 一次性匯入完成；後續以本站 Markdown 為主要維護版本。');
}catch(error){console.error('Medium 匯入失敗：',error.stack);process.exitCode=1;}
