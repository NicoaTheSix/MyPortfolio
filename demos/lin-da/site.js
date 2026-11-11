const pageUrl = new URL(document.URL);
const absoluteUrl = (path) => new URL(path, pageUrl).href;
const photos = [...document.querySelectorAll("main img")];
console.info("[林達 0/3] 輸入（絕對 URL）", [
  pageUrl.href,
  absoluteUrl("styles.css"),
  absoluteUrl("site.js"),
  ...photos.map((photo) => photo.src),
]);
console.info("[林達 0/3] 輸出（頁面內更新，無輸出檔案）", [
  absoluteUrl("#homes"),
  absoluteUrl("#contact"),
]);

console.info("[林達 1/3] 初始化住宅篩選");
const filters = document.querySelector(".filters");
const filterButtons = [...filters.querySelectorAll("button")];
const cards = [...document.querySelectorAll(".home-card")];
const filterStatus = document.querySelector("#filter-status");

for (const button of filterButtons) {
  button.addEventListener("click", () => {
    for (const item of filterButtons) {
      item.setAttribute("aria-pressed", String(item === button));
    }
    const type = button.dataset.filter;
    for (const card of cards) {
      card.hidden = type !== "all" && card.dataset.type !== type;
    }
    const visibleCount = cards.filter((card) => !card.hidden).length;
    filterStatus.textContent = `顯示 ${visibleCount} 個住宅案例。`;
    console.info(`[林達] 已篩選住宅案例，共 ${visibleCount} 筆。`);
  });
}
filters.hidden = false;

console.info("[林達 2/3] 初始化諮詢表單");
const form = document.querySelector("#inquiry");
const nameInput = document.querySelector("#name");
const intent = document.querySelector("#intent");
const message = document.querySelector("#message");
const formStatus = document.querySelector("#form-status");

for (const link of document.querySelectorAll(".inquiry-link")) {
  link.addEventListener("click", () => {
    intent.value = "了解住宅格局";
    if (!message.value.trim()) {
      message.value = `我想了解「${link.dataset.topic}」這類住宅的格局。`;
    }
    formStatus.textContent = "";
  });
}

form.addEventListener("input", () => {
  nameInput.setCustomValidity("");
  formStatus.textContent = "";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.setCustomValidity("請輸入示範稱呼。");
    nameInput.reportValidity();
    return;
  }

  const selectedIntent = intent.value;
  form.reset();
  formStatus.textContent = `${name}，你的「${selectedIntent}」諮詢已完成試送出。資料僅在本頁處理。`;
  console.info("[林達] 已完成諮詢表單試送出。");
});
form.hidden = false;
console.info("[林達 3/3] 頁面互動就緒");
