/* One disposable visual direction. State stays in memory; no production mutations. */
(() => {
  'use strict';
  console.info('[像素測試 0/4] 輸入頁面（絕對 URL）：', location.href);
  for (const file of ['pixel-prototype.css', 'pixel-prototype.js', 'assets/portrait.png', ...['development', 'scratch', 'translation', 'office'].map(name => `assets/service-${name}-zh.png`), 'desktiles/assets/shapes.png', 'fusion-studio/assets/source/assets/fusion-studio-icon-monochrome-v3.png']) console.info('[像素測試 0/4] 輸入檔案（絕對 URL）：', new URL(file, location.href).href);
  console.info('[像素測試 0/4] 選用字型輸入：https://fonts.googleapis.com/css2?family=Silkscreen&display=swap；無網路時使用本機等寬字型。');
  console.info('[像素測試 0/4] 輸出：', location.href, '的頁面 DOM 與互動狀態；不寫入檔案、不上傳資料。');
  const body = document.body;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('#motion-toggle');
  let paused = reducedMotion.matches;
  const updateMotion = () => {
    body.classList.toggle('motion-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? '啟用動畫' : '暫停動畫';
    console.info('[像素測試 狀態] 動畫：', paused ? '暫停' : '啟用', '；系統減少動態：', reducedMotion.matches);
  };
  updateMotion();
  toggle.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; updateMotion(); });
  console.info('[像素測試 1/4] 動畫偏好與控制按鈕完成。');
  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    body.classList.add('motion-ready');
    reveals.forEach(element => observer.observe(element));
    document.querySelector('#replay').addEventListener('click', () => {
      history.replaceState(null, '', '#home');
      window.scrollTo({ top: 0, behavior: 'instant' });
      reveals.forEach(element => { element.classList.remove('visible'); observer.observe(element); });
      const logo = document.querySelector('.hero h1');
      logo.style.animation = 'none';
      void logo.offsetWidth;
      logo.style.animation = '';
      console.info('[像素測試 狀態] 重播進場；動畫：', paused ? '暫停' : '啟用');
    });
  } else document.querySelector('#replay').addEventListener('click', () => window.scrollTo(0, 0));
  console.info('[像素測試 2/4] 區塊進場與重播完成。');
  const sections = [...document.querySelectorAll('.stage')];
  const segments = [...document.querySelectorAll('.segments i')];
  const progress = document.querySelector('#reading-progress');
  const level = document.querySelector('#level');
  let queued = false;
  const updateProgress = () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    const fraction = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
    progress.style.width = `${fraction * 100}%`;
    let index = 0;
    sections.forEach((section, position) => { if (section.getBoundingClientRect().top < innerHeight * 0.42) index = position; });
    if (fraction > 0.99) index = sections.length - 1;
    level.textContent = `${String(index + 1).padStart(2, '0')} / ${sections[index].dataset.label}`;
    segments.forEach((segment, position) => segment.classList.toggle('filled', position <= index));
    document.querySelectorAll('.hud nav a').forEach(link => {
      if (link.hash === `#${sections[index].id}`) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
    queued = false;
  };
  const queueProgress = () => { if (!queued) { queued = true; requestAnimationFrame(updateProgress); } };
  window.addEventListener('scroll', queueProgress, { passive: true });
  window.addEventListener('resize', queueProgress);
  window.addEventListener('load', queueProgress);
  updateProgress();
  console.info('[像素測試 3/4] 六區段關卡與實際閱讀進度完成。');
  const toast = document.querySelector('#toast');
  let toastTimer;
  document.querySelector('#copy-email').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('nick5901879@gmail.com');
      toast.textContent = '✓ 信箱已複製。下一個想法，等你來信！';
    } catch { toast.textContent = '請手動複製：nick5901879@gmail.com'; }
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
  });
  console.info('[像素測試 4/4] 聯絡回饋完成；測試頁已就緒。');
})();
