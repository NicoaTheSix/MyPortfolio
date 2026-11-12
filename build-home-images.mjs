import { execFile } from 'node:child_process';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = 'assets/home-images';
const pages = ['index.html', 'en/index.html'];
const run = promisify(execFile);
const absolute = file => path.join(root, file);
const assets = [
  ['assets/3d/studio-desk/nicoa-pixel-desk.png', [425, 680, 850]],
  ['assets/portrait.png', [416, 832, 1254]],
  ...['', '-en'].map(suffix => [`assets/business-card${suffix}.png`, [560, 1120, 2060]]),
  ...['development', 'scratch', 'translation', 'office'].flatMap(service =>
    ['zh', 'en'].map(language => [`assets/service-${service}-${language}.png`, [480, 768, 1152, 1536]])),
  ...['linkedin', 'github', 'medium', 'youtube'].map(platform =>
    [`assets/social-${platform}.png`, [96, 192]]),
  ['demos/lin-da/assets/images/taiwan-street-hero.png', [480, 960, 1440], true],
  ['demos/town-memory/assets/images/town-valley.png', [480, 960, 1440], true],
  ['demos/reptile-cafe/assets/images/cafe-interior.webp', [480, 960, 1440], true],
];

const variant = (source, width) => `${output}/${path.posix.parse(source).name}-${width}.webp`;
const files = assets.flatMap(([source, widths, photo]) =>
  widths.map(width => ({ source, width, photo, destination: variant(source, width) })));
const sizes = {
  desk: '(max-width: 720px) min(94vw, 520px), min(62vw, 850px)',
  portrait: '(max-width: 720px) calc(100vw - 40px), (min-width: 1440px) min(35vw, 750px), 450px',
  poster: '(max-width: 720px) calc(100vw - 40px), (max-width: 1100px) 44vw, min(22vw, 680px)',
  dialog: 'min(calc(100vw - 48px), 1080px)',
  business: 'min(calc(100vw - 48px), 900px)',
  showcase: '(max-width: 720px) calc(100vw - 40px), (min-width: 1440px) min(42vw, 1440px), min(48vw, 584px)',
};

function imageSizes(source, tag, inDialog) {
  if (source.includes('nicoa-pixel-desk')) return tag.includes('desktop-render')
    ? '(max-width: 720px) min(calc(100vw - 40px), 345px), min(46vw, 850px)'
    : sizes.desk;
  if (source.includes('portrait')) return sizes.portrait;
  if (source.includes('service-')) return inDialog ? sizes.dialog : sizes.poster;
  if (source.includes('business-card')) return sizes.business;
  if (source.includes('social-')) return '90px';
  return sizes.showcase;
}

console.log('[0/3] HTML 輸入與輸出', ...pages.map(absolute));
for (const { source, destination } of files) console.log('[0/3] 圖片輸入與輸出', absolute(source), '→', absolute(destination));
await run('magick', ['-version']);
await mkdir(absolute(output), { recursive: true });
console.log('[1/3] 尺寸與編碼設定完成');
for (let start = 0; start < files.length; start += 4) {
  await Promise.all(files.slice(start, start + 4).map(async ({ source, width, photo, destination }) => {
    const filter = source.includes('nicoa-pixel-desk') ? 'point' : 'Mitchell';
    await run('magick', [
      absolute(source), '-colorspace', 'sRGB', '-filter', filter, '-resize', `${width}x>`,
      '-strip', '-define', 'webp:method=6', '-define', `webp:lossless=${!photo}`,
      '-quality', photo ? '83' : '100', absolute(destination),
    ]);
    const { size } = await stat(absolute(destination));
    console.log('[2/3] WebP', destination, size, 'bytes');
  }));
}

for (const page of pages) {
  const prefix = page.startsWith('en/') ? '../' : './';
  const sourceWidths = new Map(assets);
  const original = (await readFile(absolute(page), 'utf8')).replaceAll('\r\n', '\n');
  const html = original.replace(/<picture class="home-responsive-image"><source[^>]*>(<img\b[^>]+>)<\/picture>/g, '$1');
  const updated = html.replace(/<img\b[^>]+>/g, (tag, offset) => {
    const source = tag.match(/\bsrc="([^"?]+)/)?.[1]?.slice(prefix.length);
    const widths = sourceWidths.get(source);
    if (!widths) return tag;
    const inDialog = html.lastIndexOf('<dialog', offset) > html.lastIndexOf('</dialog>', offset);
    const srcset = widths.map(width => `${prefix}${variant(source, width)} ${width}w`).join(', ');
    const image = tag.includes('id="scenes-fallback"') && !tag.includes('loading=')
      ? tag.replace('<img ', '<img loading="lazy" ')
      : tag;
    return `<picture class="home-responsive-image"><source type="image/webp" srcset="${srcset}" sizes="${imageSizes(source, tag, inDialog)}">${image}</picture>`;
  });
  if (updated !== original) await writeFile(absolute(page), updated);
  console.log('[3/3] 已核對首頁', absolute(page));
}
