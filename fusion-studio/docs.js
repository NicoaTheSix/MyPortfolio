(() => {
  'use strict';
  const zh = document.body.dataset.language === 'zh';
  const logPrefix = document.body.dataset.project || 'Fusion Docs';
  const script = document.querySelector('script[data-search-index]');
  const indexUrl = new URL(script.dataset.searchIndex, location.href);
  console.info(`[${logPrefix} 0/3] 輸入頁面（絕對 URL）：`, location.href);
  console.info(`[${logPrefix} 0/3] 輸入搜尋索引（絕對 URL）：`, indexUrl.href);
  console.info(`[${logPrefix} 0/3] 輸出：目前瀏覽器 DOM／使用者要求的剪貼簿；無檔案輸出。`);
  const sidebar = document.querySelector('#docs-sidebar');
  const menu = document.querySelector('#menu-button');
  const closeMenu = () => { sidebar.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); };
  menu.addEventListener('click', () => {
    const open = sidebar.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
  });
  sidebar.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('click', event => { if (!sidebar.contains(event.target) && !menu.contains(event.target)) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  const current = sidebar.querySelector('[aria-current="page"]');
  if (current && current.offsetTop > sidebar.clientHeight - 100) sidebar.scrollTop = current.offsetTop - 180;
  const headings = [...document.querySelectorAll('.prose h2[id],.prose h3[id]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (!visible.length) return;
      const id = visible[0].target.id;
      document.querySelectorAll('.page-toc nav a').forEach(link => link.classList.toggle('is-current', decodeURIComponent(link.hash.slice(1)) === id));
    }, {rootMargin:'-105px 0px -60% 0px'});
    headings.forEach(heading => observer.observe(heading));
  }
  console.info(`[${logPrefix} 1/3] 文件導覽、目前頁面與章節目錄就緒。`);
  let toastTimer;
  const toast = text => {
    const element = document.querySelector('#toast');
    element.textContent = text;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { element.textContent = ''; }, 4000);
  };
  document.querySelectorAll('.copy-code').forEach(button => button.addEventListener('click', async () => {
    const code = button.closest('.code-block').querySelector('pre code').textContent;
    try {
      await navigator.clipboard.writeText(code);
      toast(zh ? '程式碼已複製' : 'Code copied');
    } catch {
      toast(zh ? '無法自動複製，請選取程式碼手動複製。' : 'Copy unavailable. Select and copy the code manually.');
    }
  }));
  console.info(`[${logPrefix} 2/3] 程式碼複製功能就緒。`);
  const dialog = document.querySelector('#search-dialog');
  const input = document.querySelector('#docs-search');
  const status = document.querySelector('#search-status');
  const results = document.querySelector('#search-results');
  let index, loading, queryTimer;
  const normalized = text => text.normalize('NFKC').toLowerCase();
  async function loadIndex() {
    if (index) return;
    if (!loading) loading = fetch(indexUrl).then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    }).then(data => {
      index = data.filter(entry => entry.lang === document.body.dataset.language).map(entry => ({...entry, haystack:normalized(entry.title + ' ' + entry.pageTitle + ' ' + entry.text)}));
    }).catch(error => { loading = null; throw error; });
    await loading;
  }
  function renderSearch() {
    const query = input.value.trim();
    results.replaceChildren();
    if (!query) {status.textContent = zh ? '輸入文字搜尋目前語言的完整文件。' : 'Search full documentation in the current language.';return;}
    if (!index) return;
    const words = normalized(query).split(/\s+/);
    const matches = index.filter(entry => words.every(word => entry.haystack.includes(word))).map(entry => ({entry, score:words.reduce((sum,word) => sum + (normalized(entry.pageTitle).includes(word) ? 30 : 0) + (normalized(entry.title).includes(word) ? 15 : 0),0)})).sort((a,b) => b.score - a.score).slice(0,12);
    status.textContent = matches.length ? (zh ? `顯示 ${matches.length} 筆相關章節` : `${matches.length} matching sections`) : (zh ? '找不到相符文件，請試試其他關鍵字。' : 'No matching documents. Try another keyword.');
    for (const {entry} of matches) {
      const link = document.createElement('a'); link.className = 'search-result'; link.href = new URL(entry.url,indexUrl).href;
      const title = document.createElement('strong'); title.textContent = entry.title;
      const page = document.createElement('span'); page.textContent = entry.pageTitle;
      const snippet = document.createElement('p');
      const position = normalized(entry.text).indexOf(words[0]);
      const start = Math.max(0,position - 40);
      snippet.textContent = (start ? '…' : '') + entry.text.slice(start,start + 150) + (entry.text.length > start + 150 ? '…' : '');
      link.append(title,page,snippet); results.append(link);
    }
  }
  async function openSearch() {
    closeMenu();
    if (!dialog.open) dialog.showModal();
    input.focus();
    status.textContent = zh ? '正在載入本機文件索引…' : 'Loading the documentation index…';
    try { await loadIndex(); renderSearch(); }
    catch { status.textContent = zh ? '搜尋索引載入失敗，請確認連線後重新開啟搜尋。' : 'Could not load the search index. Check your connection and reopen search.'; }
  }
  document.querySelector('#open-search').addEventListener('click', openSearch);
  document.querySelector('#close-search').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  results.addEventListener('click', event => { if (event.target.closest('a')) dialog.close(); });
  input.addEventListener('input', () => {clearTimeout(queryTimer);queryTimer = setTimeout(renderSearch,100);});
  input.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {event.preventDefault();results.querySelector('a')?.focus();}
    if (event.key === 'Enter' && results.querySelector('a')) {event.preventDefault();results.querySelector('a').click();}
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {event.preventDefault();openSearch();}
  });
  console.info(`[${logPrefix} 3/3] 目前語言的全文搜尋已就緒，開啟搜尋時載入索引。`);
})();
