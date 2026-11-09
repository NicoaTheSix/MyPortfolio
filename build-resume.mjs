import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {brandHead, brandLogo} from './brand.mjs';
import {googleTag, googleTagBody} from './google-tag.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const targets = ['resume/index.html', 'resume/en/index.html'];
for (const input of ['build-resume.mjs', 'brand.mjs', 'google-tag.mjs']) {
  console.log('[0/3] 絕對輸入路徑：', path.join(root, input));
}
for (const target of targets) console.log('[0/3] 絕對輸出路徑：', path.join(root, target));

const github = 'https://github.com/NicoaTheSix';
const project = github + '/MITREATTACK_SIMULATOR';
const paper = 'https://drive.google.com/file/d/1PhfLBf8n64QebqmwCDCnP-i2PVZu2-I4/view?usp=sharing';
const h = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list = items => items.map(item => `<li>${h(item)}</li>`).join('');
const data = {
  zh: {
    lang:'zh-Hant', title:'個人履歷', label:'履歷導覽', skip:'跳至履歷內容', home:'回作品集', switchTo:'English',
    headline:'軟體開發・資訊安全研究', intro:'我用 Python 與 C++ 開發工具，做過大型語言模型（LLM）的資安研究，也持續探索 AI 協作與自動化工作流程。',
    contact:'聯絡我', summary:'關於我', about:'我關注如何把需求拆成可驗證的任務，再用 AI 協作開發、除錯與整理文件。從大學專題到獨立專案，我把研究過的技術做成可實際操作的工具。',
    education:'學歷', school:'國立臺灣科技大學', degree:'電資學士班・學士畢業',
    research:'研究與發表', paperTitle:'Mal-GPT：基於大型語言模型的 MITRE ATT&CK 框架生成惡意程式',
    paperText:'以 Python 串接 OpenAI API 與 GPT-4，研究大型語言模型在資安情境下的自動化生成。於臺科大碩一期間在 CICS 2025 發表。',
    paperLink:'閱讀論文', projects:'精選專案', projectText:'以 Python 開發的桌面研究工具。支援 MITRE ATT&CK 技術選取、註解管理、資料匯出及 ATT&CK 版本遷移。',
    projectLink:'GitHub 原始碼', docsLink:'專案文件',
    skills:'技術專長', python:'物件導向、資料處理、檔案操作、爬蟲與自動化腳本。使用 pandas、NumPy、SQL 與 API 串接。',
    cpp:'物件導向、資料結構與演算法、STL、指標、參考與動態記憶體管理。',
    tools:'工具與其他語言', toolsText:'Linux、Git、C、Java、組合語言。具 LLM 整合、AI Agent 流程串接、程式除錯與問題分析經驗。',
    language:'語言能力', languageText:'英文聽、說、讀、寫精通；取得 TOEIC 金色證書。',
    roles:'求職方向', roleList:['軟體工程師','韌體工程師','AI 工程師','演算法工程師','其他資訊專業職務'],
    work:'全職・日班｜工作地點以台北、新北、桃園為主，也接受遠端工作機會。',
    interests:'希望參與 AI 輔助開發、文書自動化、可重複使用的 Agent 工作流程，以及軟體與資料庫開發。',
  },
  en: {
    lang:'en', title:'Résumé', label:'Résumé navigation', skip:'Skip to résumé', home:'Back to portfolio', switchTo:'繁體中文',
    headline:'Software Development & Security Research', intro:'I build tools in Python and C++, research security applications of large language models, and explore AI-assisted development and workflow automation.',
    contact:'Get in touch', summary:'Profile', about:'I break requirements into tasks I can verify, then use AI to help with development, debugging, and documentation. My university research and independent projects have given me practice turning technical ideas into usable tools.',
    education:'Education', school:'National Taiwan University of Science and Technology', degree:'Bachelor’s degree, Electrical and Computer Engineering program',
    research:'Research & Publication', paperTitle:'Mal-GPT: Automated Malware Generation with LLMs and MITRE ATT&CK',
    paperText:'I built a Python framework that used GPT-4 through the OpenAI API to study automated generation in a cybersecurity context. I presented the work at CICS 2025 during my first year of graduate study at NTUST.',
    paperLink:'Read the paper', projects:'Selected Project', projectText:'A Python desktop application for MITRE ATT&CK research, with technique selection, annotations, data export, and migration between ATT&CK versions.',
    projectLink:'View source on GitHub', docsLink:'Project documentation',
    skills:'Technical Skills', python:'Object-oriented programming, data and file processing, web scraping, and automation scripts. Experience with pandas, NumPy, SQL, and API integration.',
    cpp:'Object-oriented programming, data structures and algorithms, STL, pointers, references, and dynamic memory management.',
    tools:'Tools & Other Languages', toolsText:'Linux, Git, C, Java, and assembly. Experience integrating LLMs, connecting AI agent workflows, debugging, and investigating software issues.',
    language:'Languages', languageText:'Advanced English listening, speaking, reading, and writing; TOEIC Gold Certificate.',
    roles:'Roles of Interest', roleList:['Software Engineer','Firmware Engineer','AI Engineer','Algorithm Engineer','Other IT roles'],
    work:'Full-time, daytime roles in Taipei, New Taipei, or Taoyuan. Open to remote work.',
    interests:'I’m interested in AI-assisted development, office automation, reusable agent workflows, and software and database development.',
  },
};

function render(en) {
  const d = data[en ? 'en' : 'zh'];
  const prefix = en ? '../../' : '../';
  const href = file => prefix + file;
  const home = href(en ? 'en/' : '');
  const canonical = 'https://nicoathesix.github.io/MyPortfolio/resume/' + (en ? 'en/' : '');
  const opposite = en ? '../' : './en/';
  const sections = [['profile',d.summary],['education',d.education],['research',d.research],['projects',d.projects],['skills',d.skills],['roles',d.roles]];
  const section = (id, title, body) => `<section id="${id}" class="resume-section" aria-labelledby="${id}-title">
  <h2 id="${id}-title">${h(title)}</h2>
  <div class="section-content">${body}</div>
</section>`;
  return `<!doctype html>
<html lang="${d.lang}">
<head>
${googleTag}
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${h(d.intro)}">
  <title>${h(d.title)} | Nicoa The Six</title>
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="zh-Hant" href="${en ? opposite : './'}">
  <link rel="alternate" hreflang="en" href="${en ? './' : opposite}">
  ${brandHead(href)}
  <link rel="stylesheet" href="${href('assets/fonts/fonts.css')}">
  <link rel="stylesheet" href="${href('resume/resume.css')}">
</head>
<body>
${googleTagBody}
<a class="skip-link" href="#main">${h(d.skip)}</a>
<header class="resume-header">
  <div class="resume-frame header-row">
    <a class="brand" href="${home}" aria-label="${h(d.home)}">${brandLogo(href)}</a>
    <nav aria-label="${h(d.label)}"><a href="${home}">${h(d.home)} ↗</a><a href="${opposite}" lang="${en ? 'zh-Hant' : 'en'}">${h(d.switchTo)}</a></nav>
  </div>
</header>
<main id="main" class="resume-frame">
  <div class="resume-hero">
    <p class="eyebrow">NICOA’LAB / ${h(d.title)}</p>
    <h1>Nicoa The Six</h1>
    <p class="headline">${h(d.headline)}</p>
    <p class="intro">${h(d.intro)}</p>
    <div class="resume-actions"><a class="action-primary" href="${home}#contact">${h(d.contact)} ↗</a><a class="action-secondary" href="${github}">GitHub ↗</a></div>
  </div>
  <nav class="resume-jump" aria-label="${h(d.label)}">
    <ul>${sections.map(([id,label]) => `<li><a href="#${id}">${h(label)}</a></li>`).join('')}</ul>
  </nav>
  ${section('profile',d.summary,`<p>${h(d.about)}</p>`)}
  ${section('education',d.education,`<article class="resume-card"><p class="eyebrow"><time datetime="2019-09">2019.09</time> – <time datetime="2022-06">2022.06</time></p><h3>${h(d.school)}</h3><p>${h(d.degree)}</p></article>`)}
  ${section('research',d.research,`<article class="resume-card"><p class="eyebrow">CICS 2025</p><h3>${h(d.paperTitle)}</h3><p>${h(d.paperText)}</p><a class="detail-link" href="${paper}">${h(d.paperLink)} ↗</a></article>`)}
  ${section('projects',d.projects,`<article class="resume-card"><p class="eyebrow">PYTHON / MITRE ATT&amp;CK</p><h3>TTP Selection Studio</h3><p>${h(d.projectText)}</p><div class="resume-actions"><a class="detail-link" href="${project}">${h(d.projectLink)} ↗</a><a class="detail-link" href="${href(en ? 'fusion-studio/en/' : 'fusion-studio/')}">${h(d.docsLink)} ↗</a></div></article>`)}
  ${section('skills',d.skills,`<div class="skills-grid">${[['Python',d.python],['C++',d.cpp],[d.tools,d.toolsText],[d.language,d.languageText]].map(([name,detail])=>`<article class="resume-card"><h3>${h(name)}</h3><p>${h(detail)}</p></article>`).join('')}</div>`)}
  ${section('roles',d.roles,`<ul class="role-list">${list(d.roleList)}</ul><p>${h(d.work)}</p><p>${h(d.interests)}</p>`)}
</main>
<footer class="resume-frame resume-footer"><span>Nicoa The Six</span><a href="${home}">${h(d.home)} ↗</a></footer>
</body>
</html>
`;
}

console.log('[1/3] 套用雙語公開履歷內容與共用品牌。');
for (const [i, target] of targets.entries()) {
  const output = path.join(root, target);
  await mkdir(path.dirname(output), {recursive:true});
  await writeFile(output, render(i === 1));
  console.log(`[2/3] 已產生 ${i + 1}/${targets.length}：${output}`);
}
console.log('[3/3] 履歷頁已產生；未改動原始 PDF 或正式版本。');
