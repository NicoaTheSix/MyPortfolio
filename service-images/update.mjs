import { readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pictures = 'C:/Users/nick5/OneDrive/Pictures';
const downloads = 'C:/Users/nick5/Downloads';
const files = [
  ['development', 'zh', path.join(downloads, 'download.png')],
  ['office', 'zh', path.join(downloads, 'download (1).png')],
  ['translation', 'zh', path.join(downloads, 'download (2).png')],
  ['scratch', 'zh', path.join(downloads, 'download (3).png')],
  ['development', 'en', path.join(pictures, 'ChatGPT Image Oct 31, 2026, 11_08_43 AM.png')],
  ['office', 'en', path.join(pictures, 'ChatGPT Image Oct 31, 2026, 11_20_22 AM.png')],
  ['translation', 'en', path.join(pictures, 'ChatGPT Image Oct 31, 2026, 11_32_51 AM.png')],
  ['scratch', 'en', path.join(pictures, 'ChatGPT Image Oct 31, 2026, 11_58_50 AM.png')]
].map(([service, lang, source]) => ({ service, lang, source: path.resolve(source), destination: path.join(root, 'assets', `service-${service}-${lang}.png`) }));
const pages = ['index.html', 'en/index.html'].map(file => path.join(root, file));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
console.log('[0/4] 輸入檔案（絕對路徑）：', [...files.map(file => file.source), ...pages]);
console.log('[0/4] 輸出檔案（絕對路徑）：', [...files.map(file => file.destination), ...pages]);
try {
  for (const file of files) {
    const bytes = await readFile(file.source);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `不是 PNG：${file.source}`);
    file.width = bytes.readUInt32BE(16);
    file.height = bytes.readUInt32BE(20);
    assert(file.width > file.height && file.width >= 1000, `圖片應為橫式原圖：${file.source}`);
    file.hash = sha(bytes);
  }
  const originals = await Promise.all(pages.map(file => readFile(file, 'utf8')));
  console.log('[1/4] 八張 PNG、尺寸與兩份首頁已確認。');
  for (const [i, file] of files.entries()) {
    await copyFile(file.source, file.destination);
    assert.equal(sha(await readFile(file.destination)), file.hash);
    console.log(`[2/4] 素材 ${i + 1}/8：${path.basename(file.destination)} (${file.width} × ${file.height})，SHA-256 一致。`);
  }
  for (const [index, filename] of pages.entries()) {
    const en = index === 1;
    const lang = en ? 'en' : 'zh';
    const prefix = en ? '../' : './';
    let html = originals[index];
    if (!html.includes('class="service-card-content"')) {
      const grid = html.match(/<div class="service-grid">\s*([\s\S]*?)\s*<\/div>\s*(<article class="office-service"[\s\S]*?<\/article>)/);
      assert(grid, `找不到原服務區塊：${filename}`);
      const cards = [...grid[1].matchAll(/<article class="service-card">[\s\S]*?<\/article>/g)].map(match => match[0]);
      assert.equal(cards.length, 4);
      const titles = en ? ['Software development', 'Scratch tutoring &amp; games', 'English–Chinese translation', 'Office automation &amp; documents'] : ['程式開發', 'Scratch 教學與遊戲製作', '中英文翻譯', '文書自動化與資料整理'];
      const descriptions = en ? [
        'Software development: C++, Java, Python, GUI applications, automation, API integration and technical documentation',
        'Scratch tutoring and games: online one-to-one lessons, game projects, animation, logic and debugging',
        'English–Chinese translation: software UI, technical documents, articles and Traditional Chinese localization',
        'Office automation scripts: Word and Excel table conversion, formulas, image-to-text OCR and batch processing'
      ] : [
        '程式開發：C++、Java、Python、圖形化介面、自動化工具、API 串接與技術文件',
        'Scratch 教學與遊戲動畫製作：線上一對一教學、遊戲製作、動畫實作、邏輯與除錯',
        '中英文翻譯與繁體中文在地化：軟體介面、技術文件、文章翻譯、用詞與語氣',
        '文書自動化腳本製作：Word、Excel、OCR、表格轉換、公式計算、圖片轉文字與批次處理'
      ];
      const services = ['development', 'scratch', 'translation', 'office'];
      const bodies = [cards[0], cards[1], cards[3], grid[2]];
      const newCards = bodies.map((card, i) => {
        let body = card.replace(/^<article\b[^>]*>/, '').replace(/<\/article>$/, '');
        body = body.replace(/<div class="card-top">[\s\S]*?<\/div>/, '');
        if (i === 3) {
          body = body.replace(/<button\b[^>]*class="office-service-image"[\s\S]*?<\/button>/, '');
          body = body.replace(/^<div>/, '').replace(/<\/div>$/, '');
          body = body.replace(/<button\b[^>]*data-open-dialog="office-poster"[\s\S]*?<\/button>/, '');
          body = body.replace('05 / DOCUMENTS', '04 / DOCUMENTS');
        }
        const file = files.find(file => file.service === services[i] && file.lang === lang);
        const src = `${prefix}assets/${path.basename(file.destination)}`;
        const dialog = `${services[i]}-poster`;
        return `<article class="service-card"><button type="button" class="service-card-image" data-open-dialog="${dialog}" aria-label="${en ? 'Enlarge: ' : '放大：'}${titles[i]}"><img src="${src}" alt="${descriptions[i]}" width="${file.width}" height="${file.height}" loading="lazy"></button><div class="service-card-content">${body}</div></article>`;
      }).join('\n        ');
      const writing = cards[2].replace('class="service-card"', 'class="writing-service"').replace(/<div class="card-top">[\s\S]*?<\/div>/, '').replace('WORDS &amp; IDEAS', '05 / WORDS &amp; IDEAS').replace('WORDS & IDEAS', '05 / WORDS &amp; IDEAS');
      html = html.replace(grid[0], `<div class="service-grid">\n        ${newCards}\n      </div>\n      ${writing}`);
      html = html.replace(/<button\b[^>]*data-open-dialog="service-poster"[\s\S]*?<\/button>/, '');
      html = html.replace(/\s*<dialog id="(?:service|office)-poster"[\s\S]*?<\/dialog>/g, '');
      const dialogs = services.map((service, i) => {
        const file = files.find(file => file.service === service && file.lang === lang);
        const src = `${prefix}assets/${path.basename(file.destination)}`;
        const id = `${service}-poster`;
        return `  <dialog class="service-image-dialog" id="${id}" aria-labelledby="${id}-heading"><div class="dialog-header"><h2 id="${id}-heading">${titles[i]}</h2><button type="button" data-close-dialog aria-label="${en ? 'Close service image' : '關閉服務圖片'}">×</button></div><img src="${src}" alt="${descriptions[i]}" width="${file.width}" height="${file.height}" loading="lazy"><a class="button button-dark" href="${src}" download="Nicoa-${service}-${lang}.png">${en ? 'Download service image' : '下載服務圖片'} ↓</a></dialog>`;
      }).join('\n');
      html = html.replace('</body>', `${dialogs}\n</body>`);
    }
    if (!html.includes('class="tags office-tags"')) {
      const tags = en
        ? '<div class="tags office-tags"><span>Word / Excel / OCR</span><span>Formulas / Batch processing</span></div>'
        : '<div class="tags office-tags"><span>Word / Excel / OCR</span><span>公式計算 / 批次處理</span></div>';
      html = html.replace('<p class="office-delivery-note">', `${tags}<p class="office-delivery-note">`);
    }
    if (!html.includes('service-cards.css')) html = html.replace(`href="${prefix}styles.css">`, `href="${prefix}styles.css">\n  <link rel="stylesheet" href="${prefix}service-cards.css">`);
    await writeFile(filename, html);
    console.log(`[3/4] 首頁 ${index + 1}/2 已更新：${filename}`);
  }
  for (const [index, filename] of pages.entries()) {
    const html = await readFile(filename, 'utf8');
    const lang = index ? 'en' : 'zh';
    for (const service of ['development', 'scratch', 'translation', 'office']) {
      assert(html.includes(`service-${service}-${lang}.png`));
      assert(html.includes(`id="${service}-poster"`));
    }
    assert(html.includes('class="writing-service"'));
    assert(!html.includes('data-open-dialog="service-poster"'));
  }
  console.log('[4/4] 四項服務的中英文圖片、放大及下載入口完成，文章寫作服務保留。');
} catch (error) {
  console.error('服務圖片更新失敗：', error.message);
  process.exitCode = 1;
}
