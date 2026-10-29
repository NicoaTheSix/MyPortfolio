import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.dirname(fileURLToPath(import.meta.url));
const pages = [{file:'index.html', lang:'zh-Hant'}, {file:'en/index.html', lang:'en'}];
const origin = 'https://portfolio.test/MyPortfolio/';
console.log('[0/4] 輸入（絕對路徑）：',pages.map(page=>path.join(root,page.file)),path.join(root,'assets'));
console.log('[0/4] 輸出：終端檢查結果，不產生檔案。');
try {
  for(const page of pages) {
    page.html=await readFile(path.join(root,page.file),'utf8');
    page.ids=[...page.html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
    assert.equal(page.ids.length,new Set(page.ids).size,`${page.file}：重複 id`);
    for(const [,anchor] of page.html.matchAll(/href="#([^"]+)"/g))assert(page.ids.includes(anchor),`${page.file}：錨點不存在 ${anchor}`);
  }
  assert.deepEqual([...pages[0].ids].sort(),[...pages[1].ids].sort(),'兩種語言的區塊與對話框 id 應一致');
  console.log('[1/4] 中英文頁面 id、錨點及切換目的區塊一致。');
  const references=new Set();
  for(const page of pages) {
    for(const [,reference] of page.html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      if(/^(?:https?:|mailto:|data:)/.test(reference))continue;
      const url=new URL(reference,new URL(page.file,origin));
      assert(url.pathname.startsWith('/MyPortfolio/'),`路徑離開專案子目錄：${reference}`);
      let relative=decodeURIComponent(url.pathname.slice('/MyPortfolio/'.length));
      if(!relative||relative.endsWith('/'))relative+='index.html';
      const absolute=path.resolve(root,relative);
      assert(absolute.startsWith(root+path.sep),`路徑離開網站目錄：${absolute}`);
      assert((await stat(absolute)).isFile(),`引用檔案不存在：${absolute}`);
      references.add(relative);
      if(relative.endsWith('.png')) {
        const bytes=await readFile(absolute);
        assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`無效 PNG：${absolute}`);
      }
      if(url.hash&&relative.endsWith('.html')) {
        const target=await readFile(absolute,'utf8');
        assert(target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),`目標錨點不存在：${reference}`);
      }
    }
  }
  console.log(`[2/4] ${references.size} 個站內資源、跨頁錨點與 PNG 通過 /MyPortfolio/ 子路徑檢查。`);
  for(const page of pages) {
    assert(page.html.includes(`<html lang="${page.lang}">`),'缺少語言設定');
    assert(page.html.includes('<title>Nicoa The Six'),'頁面標題應使用公開名稱');
    assert(!/\bchung[-\s]+lun\s+wu\b/i.test(page.html),'頁面仍有已移除的姓名');
    assert(page.html.includes('name="viewport"'),'缺少行動裝置設定');
    assert.equal((page.html.match(/aria-current="page"/g)||[]).length,1,'語言列應只有一個目前頁面');
    assert.equal((page.html.match(/data-language-switch/g)||[]).length,1,'缺少語言切換入口');
    for(const lang of ['en','zh-Hant'])assert(page.html.includes(`rel="alternate" hreflang="${lang}"`),`缺少 ${lang} 語系對應`);
    for(const image of page.html.matchAll(/<img\b[^>]*>/g))assert(/\balt="[^"]+"/.test(image[0]),'圖片缺少替代文字');
    for(const [,attrs] of page.html.matchAll(/<a\b([^>]*target="_blank"[^>]*)>/g))assert(attrs.includes('noopener'),'外部連結缺少 noopener');
    for(const [,id] of page.html.matchAll(/data-open-dialog="([^"]+)"/g))assert(page.html.includes(`<dialog id="${id}"`),`找不到對話框：${id}`);
  }
  console.log('[3/4] 語言列、替代文字、預覽入口與外部連結通過。');
  for(const name of ['services-poster','business-card','office-services-poster']) {
    assert(pages[1].html.includes(`../assets/${name}-en.png`),`英文頁缺少英文圖片：${name}`);
    assert(!pages[1].html.includes(`../assets/${name}.png`),`英文頁誤用中文圖片：${name}`);
  }
  const englishText=pages[1].html.replaceAll('繁體中文','').replaceAll('中','');
  assert(!/\p{Script=Han}/u.test(englishText),'英文頁存在尚未翻譯的中文');
  assert(pages[1].html.includes('../fusion-studio/en/'),'英文頁應連至英文文件');
  const manifest=JSON.parse(await readFile(path.join(root,'fusion-studio/source-manifest.json'),'utf8'));
  for(const file of manifest.generatedHtml.filter(file=>file.startsWith('en/'))) {
    const html=await readFile(path.join(root,'fusion-studio',file),'utf8');
    const href=html.match(/class="portfolio-link" href="([^"]+)"/)?.[1];
    assert.equal(new URL(href,new URL('fusion-studio/'+file,origin)).href,new URL('en/index.html#works',origin).href,`${file} 未返回英文作品集`);
  }
  console.log('[4/4] 三組語系圖片、英文內容及 35 個英文文件返回入口通過。');
} catch (error) {
  console.error('檢查失敗：', error.message);
  process.exitCode = 1;
}
