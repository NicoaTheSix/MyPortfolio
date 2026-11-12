const site = new URL('https://nicoathesix.github.io/MyPortfolio/');
const profileId = new URL('#nicoa-the-six', site).href;

const pageGroups = [
  {
    folder: '',
    image: 'assets/portrait.png',
    titles: ['Nicoa The Six｜作品集與個人工作室', 'Nicoa The Six | Portfolio and independent studio'],
    descriptions: ['瀏覽 Nicoa The Six 的程式作品、網站示範與文章，了解程式開發、Scratch 教學、中英文翻譯和文書資料整理服務。', 'Explore software, website demos and articles by Nicoa The Six, and find development, Scratch tutoring, translation and document services.'],
  },
  {
    folder: 'resume/',
    image: 'assets/portrait.png',
    titles: ['Nicoa The Six｜個人履歷', 'Nicoa The Six | Résumé'],
    descriptions: ['了解 Nicoa The Six 的學歷、研究、專案和技術能力，包含 Python、C++ 與大型語言模型的資安應用。', 'Explore the education, research, projects and technical skills of Nicoa The Six, including Python, C++ and security research with large language models.'],
  },
  {
    folder: 'desktiles/',
    image: 'desktiles/assets/DeskTiles-logo.png',
    titles: ['DeskTiles 桌面拼格｜Windows 與 macOS', 'DeskTiles | Desktop notes, timers and photos'],
    descriptions: ['把待辦、倒數和照片拼放在桌面上。觀看 DeskTiles 示範、比較 Windows 與 macOS 功能，並下載軟體或閱讀使用說明。', 'Arrange notes, countdowns and photos on your desktop. Watch the DeskTiles demo, compare Windows and macOS, and find downloads and user guides.'],
  },
  {
    folder: 'fusion-studio/',
    image: 'fusion-studio/assets/source/assets/fusion-studio-icon-monochrome-v3.png',
    titles: ['Fusion Studio｜資安研究工具與使用說明', 'Fusion Studio | Threat research workspace and documentation'],
    descriptions: ['查閱 ATT&CK、ATLAS 與 CAR 參考內容，整理研究範圍與註記。閱讀 Fusion Studio 的快速入門與完整手冊。', 'Look up ATT&CK, ATLAS and CAR references and organize research notes. Explore the Fusion Studio quick start and documentation.'],
  },
];

export const canonicalUrl = file => new URL(file.replace(/(?:^|\/)index\.html$/, match => match.startsWith('/') ? '/' : ''), site).href;

const pageSeo = new Map();
for (const group of pageGroups) {
  const files = [group.folder + 'index.html', group.folder + 'en/index.html'];
  for (const [index, file] of files.entries()) {
    pageSeo.set(file, { group, index, files });
  }
}
export const seoPages = [...pageSeo.keys()];
export const seoImages = [...new Set(pageGroups.map(group => group.image))];
export const languagePairs = [...pageGroups.map(group => [group.folder + 'index.html', group.folder + 'en/index.html']), ['blog/index.html', 'blog/en/index.html']];

const attr = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const marker = /[ \t]*<!-- portfolio-seo:start -->[\s\S]*?<!-- portfolio-seo:end -->\r?\n?/g;

function structuredData(folder, url, lang) {
  if (folder === 'resume/') {
    return {
      '@context': 'https://schema.org', '@type': 'ProfilePage', url, inLanguage: lang,
      mainEntity: {
        '@type': 'Person', '@id': profileId, name: 'Nicoa The Six', url: site.href,
        sameAs: ['https://github.com/NicoaTheSix'],
      },
    };
  }
  if (folder === 'desktiles/') {
    return {
      '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'DeskTiles',
      url, inLanguage: lang, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Windows 10/11 x64; macOS 12 or later',
    };
  }
}

export function applySeoHead(html, file) {
  const page = pageSeo.get(file);
  if (!page) return html;

  const { group, index, files } = page;
  const url = canonicalUrl(file);
  const lang = index === 0 ? 'zh-Hant' : 'en';
  const metadata = [
    `<meta name="description" content="${attr(group.descriptions[index])}">`,
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="zh-Hant" href="${canonicalUrl(files[0])}">`,
    `<link rel="alternate" hreflang="en" href="${canonicalUrl(files[1])}">`,
    `<link rel="alternate" hreflang="x-default" href="${canonicalUrl(files[0])}">`,
    ...Object.entries({
      'og:type': 'website', 'og:site_name': 'Nicoa’Lab', 'og:title': group.titles[index],
      'og:description': group.descriptions[index], 'og:url': url,
      'og:image': new URL(group.image, site).href,
    }).map(([property, content]) => `<meta property="${property}" content="${attr(content)}">`),
  ];
  const data = structuredData(group.folder, url, lang);
  if (data) metadata.push(`<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`);
  const seoBlock = ['<!-- portfolio-seo:start -->', ...metadata, '<!-- portfolio-seo:end -->'].map(line => '  ' + line).join('\n') + '\n';

  return html.replace(/(<head\b[^>]*>)([\s\S]*?)(<\/head>)/i, (_, open, head, close) => {
    const previous = head.replace(marker, '')
      .replace(/[ \t]*<link\b[^>]*>\r?\n?/gi, tag =>
        /\brel=["']canonical["']/i.test(tag) || (/\brel=["']alternate["']/i.test(tag) && /\bhreflang=/i.test(tag)) ? '' : tag)
      .replace(/[ \t]*<meta\b[^>]*>\r?\n?/gi, tag => /\bname=["']description["']/i.test(tag) ? '' : tag);
    const newline = previous.endsWith('\n') ? '' : '\n';
    return open + previous + newline + seoBlock + close;
  });
}
