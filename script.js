/* Browser progress stays in the developer console; page content is visitor-focused. */
(() => {
  'use strict';
  console.info('[Nicoa 0/3] 輸入：', new URL('./index.html', location.href).href);
  console.info('[Nicoa 0/3] 輸出：目前瀏覽器頁面 DOM；不寫入檔案。');
  const glyphs = {
    N: ['10001','11001','11001','10101','10011','10011','10001'],
    i: ['00100','00000','01100','00100','00100','00100','01110'],
    c: ['00000','00000','01111','10000','10000','10000','01111'],
    o: ['00000','00000','01110','10001','10001','10001','01110'],
    a: ['00000','00000','01110','00001','01111','10001','01111']
  };
  const wordmark = document.querySelector('#wordmark');
  let path = '';
  [...'Nicoa'].forEach((letter, letterIndex) => {
    glyphs[letter].forEach((row, y) => [...row].forEach((pixel, x) => {
      if (pixel === '1') path += `M${letterIndex * 7 + x} ${y}h1v1h-1z`;
    }));
  });
  const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  shape.setAttribute('d', path);
  wordmark.append(shape);
  document.querySelector('#year').textContent = String(new Date().getFullYear());
  console.info('[Nicoa 1/3] 品牌字樣與年份完成。');
  document.querySelectorAll('[data-open-dialog]').forEach(button => {
    button.addEventListener('click', () => document.getElementById(button.dataset.openDialog).showModal());
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
  });
  console.info('[Nicoa 2/3] 圖片預覽互動完成。');
  document.querySelector('#copy-email').addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText('nick5901879@gmail.com');
      status.textContent = '已複製信箱，期待收到你的來信！';
    } catch {
      status.textContent = '無法自動複製，請選取上方信箱手動複製。';
    }
  });
  console.info('[Nicoa 3/3] 聯絡功能就緒。');
})();
