import assert from 'node:assert/strict';
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { applySeoHead, canonicalUrl, languagePairs, seoImages, seoPages } from './seo-head.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const checkOnly = process.argv.includes('--check');
const manifests = ['blog', 'desktiles', 'fusion-studio'].map(directory => `${directory}/source-manifest.json`);
const demos = ['lin-da', 'pixel-pets', 'reptile-cafe', 'town-memory'];
const demoPages = ['demos/lin-da/motion.html', ...demos.flatMap(demo =>
  ['index.html', 'advanced/index.html', 'advanced/en/index.html'].map(file => `demos/${demo}/${file}`))];
const sitemap = 'sitemap.xml';
const absolute = file => path.join(root, file);
const xml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

console.log('[0/3] Input configuration and manifests:', ...['seo-head.mjs', ...manifests].map(absolute));
console.log('[0/3] Input/output HTML:', ...seoPages.map(absolute));
console.log('[0/3] Sitemap output:', absolute(sitemap));

const sections = await Promise.all(manifests.map(async file => {
  const section = path.posix.dirname(file);
  const manifest = JSON.parse(await readFile(absolute(file), 'utf8'));
  return manifest.generatedHtml.map(page => path.posix.join(section, page));
}));
const files = [...new Set([...seoPages, ...sections.flat(), ...demoPages])].sort();
console.log('[0/3] Sitemap HTML inputs:', ...files.map(absolute));
console.log('[0/3] Social image inputs:', ...seoImages.map(absolute));
for (const file of seoImages) assert((await stat(absolute(file))).isFile(), `Missing social image ${file}`);

const updatedPages = [];
const urls = new Map();
for (const file of files) {
  const original = await readFile(absolute(file), 'utf8');
  const html = applySeoHead(original, file);
  if (html !== original) updatedPages.push({ file, html });
  const { document } = parseHTML(html);
  assert(document.querySelector('main'), `Missing public page content ${file}`);
  const preferred = canonicalUrl(file);
  const canonical = document.head.querySelector('link[rel="canonical"]')?.getAttribute('href');
  if (seoPages.includes(file)) {
    assert.equal(document.head.querySelectorAll('link[rel="canonical"]').length, 1, file);
    assert.equal(canonical, preferred, file);
  }
  const excluded = [...document.head.querySelectorAll('meta[name]')].some(meta =>
    /^(?:robots|googlebot)$/i.test(meta.getAttribute('name')) && /\b(?:noindex|none)\b/i.test(meta.getAttribute('content') ?? ''));
  if (!excluded && (!canonical || new URL(canonical, preferred).href === preferred)) {
    assert(!urls.has(preferred), `Duplicate sitemap URL ${preferred}`);
    urls.set(preferred, []);
  }
}
console.log(`[1/3] Checked ${files.length} pages and selected ${urls.size} sitemap URLs.`);

for (const [zh, en] of languagePairs) {
  const chinese = canonicalUrl(zh);
  const english = canonicalUrl(en);
  if (!urls.has(chinese) || !urls.has(english)) continue;
  const variants = [['zh-Hant', chinese], ['en', english], ['x-default', chinese]];
  urls.set(chinese, variants);
  urls.set(english, variants);
}
const nodes = [...urls].map(([url, variants]) => [
  '  <url>', `    <loc>${xml(url)}</loc>`,
  ...variants.map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${xml(href)}" />`),
  '  </url>',
].join('\n'));
const output = ['<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...nodes, '</urlset>', ''].join('\n');
console.log('[2/3] Prepared sitemap and reciprocal language links.');

if (checkOnly) {
  assert.deepEqual(updatedPages.map(({ file }) => file), [], 'SEO head is out of sync. Run npm run seo.');
  assert.equal((await readFile(absolute(sitemap), 'utf8')).replaceAll('\r\n', '\n'), output, 'Sitemap is out of sync. Run npm run seo.');
} else {
  for (const { file, html } of updatedPages) await writeFile(absolute(file), html);
  await writeFile(absolute(sitemap), output);
}
console.log(checkOnly ? '[3/3] SEO files are current.' : `[3/3] Updated ${updatedPages.length} HTML pages and ${absolute(sitemap)}.`);
