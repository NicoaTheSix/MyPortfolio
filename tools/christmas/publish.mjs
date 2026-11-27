import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseHTML } from 'linkedom';

const [inputArg, targetArg] = process.argv.slice(2);
assert(inputArg && targetArg, 'Usage: node publish.mjs <accepted-preview-site> <release-worktree>');
const input = path.resolve(inputArg);
const target = path.resolve(targetArg);
const output = path.join(target, 'christmas');
const sourceCode = fileURLToPath(import.meta.url);
console.log(`輸入已驗收頁面：${input}\n輸入／輸出正式站：${target}\n輸出聖誕卡片頁：${output}`);
const files = JSON.parse(await readFile(path.join(input,'public-files.json'),'utf8'));
assert.equal(files.filter(f=>f.endsWith('.html')).length,7);
const manifest = {acceptedSnapshot:'6edae19fec1ea13667a8c7dfe7e00ad6d7739c66',generatedHtml:[],publicFiles:[...files,'fonts/OFL-Cubic-11.txt'],assets:[]};
const escaped = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for (let index=0;index<manifest.publicFiles.length;index++) {
  const relative = manifest.publicFiles[index];
  assert(!relative.startsWith('/') && !relative.split('/').includes('..'));
  const dest = path.join(output,relative);
  await mkdir(path.dirname(dest),{recursive:true});
  if (relative.endsWith('.html')) {
    const original = await readFile(path.join(input,relative),'utf8');
    const {document} = parseHTML(original);
    const title = document.querySelector('title').textContent;
    const canonical = new URL('christmas/'+relative.replace(/index\.html$/,''),'https://nicoathesix.github.io/MyPortfolio/').href;
    const description = document.querySelector('meta[name="description"]').content;
    const meta = `  <link rel="canonical" href="${canonical}">\n  <meta property="og:type" content="website">\n  <meta property="og:title" content="${escaped(title)}">\n  <meta property="og:description" content="${escaped(description)}">\n  <meta property="og:url" content="${canonical}">\n  <meta property="og:image" content="https://nicoathesix.github.io/MyPortfolio/christmas/images/2026-04.webp">\n`;
    const stripPreview = html => html.replace(/<span class="preview-label"><i><\/i> 本機預覽<\/span>/,'');
    const published = stripPreview(original).replace(/\s*<meta name="robots" content="noindex,nofollow">\s*/,'\n  ').replace('</head>',meta+'</head>');
    assert.equal(published.split('<body>')[1],stripPreview(original).split('<body>')[1],'正文必須與已驗收版本一致');
    await writeFile(dest,published);
    manifest.generatedHtml.push(relative);
  } else await copyFile(path.join(input,relative),dest);
  const bytes = await readFile(dest);
  manifest.assets.push({path:relative,sha256:createHash('sha256').update(bytes).digest('hex'),sizeBytes:bytes.length});
  console.log(`[1/4] 發布檔案 ${index+1}/${manifest.publicFiles.length}：${relative}`);
}
await writeFile(path.join(output,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
for (const [file,placeholder,link] of [
  ['index.html','<p class="work-description">活動內容將陸續補上。</p>','<a class="text-link" href="./christmas/">歷年紀錄 ↗</a>'],
  ['en/index.html','<p class="work-description">More details to come.</p>','<a class="text-link" href="../christmas/">View archive ↗</a>'],
]) {
  const location = path.join(target,file);
  const before = await readFile(location,'utf8');
  assert(before.includes(placeholder)||before.includes(link),`找不到聖誕卡片入口：${file}`);
  await writeFile(location,before.replace(placeholder,link));
}
console.log('[2/4] 中英文首頁聖誕卡片入口已接上。');
const seoPath = path.join(target,'sync-seo.mjs');
const seo = await readFile(seoPath,'utf8');
await writeFile(seoPath,seo.replace("['blog', 'desktiles', 'fusion-studio']","['blog', 'desktiles', 'fusion-studio', 'christmas']"));
const servePath = path.join(target,'serve.mjs');
const server = await readFile(servePath,'utf8');
const marker = '// Christmas archive public files';
if (!server.includes(marker)) {
  const addition = `\n${marker}\ntry {\n  const manifest=JSON.parse(await readFile(path.join(root,'christmas/source-manifest.json'),'utf8'));\n  for(const relative of manifest.publicFiles) {\n    const absolute=path.resolve(root,'christmas',relative);\n    if(!absolute.startsWith(path.join(root,'christmas')+path.sep))throw new Error('Christmas manifest path invalid');\n    publicFiles.add('christmas/'+relative);\n  }\n} catch(error) { if(error.code!=='ENOENT')throw error; }\n`;
  assert(server.includes("console.log('[1/3]"));
  await writeFile(servePath,server.replace("console.log('[1/3]",addition+"console.log('[1/3]"));
}
console.log('[3/4] sitemap 輸入與本機預覽白名單已更新。');
await mkdir(path.join(target,'tools/christmas'),{recursive:true});
await copyFile(sourceCode,path.join(target,'tools/christmas/publish.mjs'));
await writeFile(path.join(target,'tools/christmas/README.md'),`# 聖誕卡片頁發布\n\n本批採用已驗收快照 6edae19 的首頁、六份年度原文與19張圖片。正文與本機版一致，只移除本機標示及 noindex，加入 canonical／分享標籤。未加入代寫敘事。\n\n執行：\n\n\`node tools/christmas/publish.mjs <已驗收網站絕對目錄> <隔離發布工作目錄絕對路徑>\`\n\n程式開始先列出輸入／輸出絕對路徑，依四階段顯示進度：複製白名單檔案並核對正文、中英文首頁入口、SEO與預覽白名單、保存公開來源清單。之後執行 \`node sync-seo.mjs\`、\`node sync-seo.mjs --check\`，並檢查站內連結及正式站 HTTP 與檔案雜湊。程式不會自行推送 Git 或部署。\n\n公開來源清單為 \`christmas/source-manifest.json\`，含公開檔案、雜湊及驗收快照；不包含私人原始 JSON、寄件者回覆、圖片暫時網址或私人素材目錄。原始資料依專案規範保存於個人資料分類。\n`);
for (const item of manifest.assets) assert((await stat(path.join(output,item.path))).size===item.sizeBytes);
console.log('[4/4] 發布內容準備完成；尚未推送或部署。');
