const stage = (index, message) => console.info(`[棲光 ${index}/3] ${message}`);
stage(0, `輸入：${new URL('./index.html', document.baseURI).href}、${new URL('./site.js', document.baseURI).href}；輸出：${new URL('#residents', document.baseURI).href} 的清單畫面，不寫入檔案。`);

const filter = document.querySelector('.filter');
const buttons = Array.from(filter.querySelectorAll('[data-filter]'));
const residents = Array.from(document.querySelectorAll('[data-kind]'));
const count = document.querySelector('#resident-count');
stage(1, '已讀取六種住民與三個分類按鈕。');

function showResidents(kind) {
  let visible = 0;
  for (const resident of residents) {
    resident.hidden = kind !== 'all' && resident.dataset.kind !== kind;
    if (!resident.hidden) visible++;
  }
  for (const button of buttons) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === kind));
  }
  count.textContent = `顯示 ${visible} 種`;
}

for (const button of buttons) {
  button.addEventListener('click', () => showResidents(button.dataset.filter));
}
stage(2, '分類按鈕已綁定。');
showResidents('all');
filter.hidden = false;
stage(3, '住民圖鑑可以使用。');
