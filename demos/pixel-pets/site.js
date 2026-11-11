const shopUrl = new URL(document.URL);
const shopAsset = (path) => new URL(path, shopUrl).href;
console.info("[電子雞 0/4] 輸入（絕對 URL）", [
  shopUrl.href, shopAsset("styles.css"), shopAsset("pets.js"), shopAsset("site.js"),
  shopAsset("../../assets/fonts/cubic-11.woff2"),
].join("\n"));
console.info("[電子雞 0/4] 輸出", shopAsset("#catalog"), shopAsset("#cart"), "瀏覽器購物車，不輸出檔案。");

const grid = document.querySelector("#pet-grid");
const filters = document.querySelector(".filters");
const resultCount = document.querySelector("#result-count");
const petTemplate = document.querySelector("#pet-window");
const shopStatus = document.querySelector("#shop-status");
const products = new Map(petCatalog.map((pet) => [pet.id, pet]));
const categories = new Map(petCategories.map((category) => [category.id, category]));
const formatPrice = (amount) => `NT$${amount.toLocaleString("zh-TW")}`;

console.info("[電子雞 1/4] 建立十六隻角色與商品分類");
let activeCategory = "all";

function displayProducts() {
  const visible = activeCategory === "all"
    ? petCatalog
    : petCatalog.filter((pet) => pet.category === activeCategory);
  grid.replaceChildren(...visible.map((pet) => {
    const fragment = petTemplate.content.cloneNode(true);
    const category = categories.get(pet.category);
    const screen = fragment.querySelector(".pet-screen");
    screen.style.setProperty("--screen", category.color);
    screen.append(makePetCanvas(pet));
    fragment.querySelector("h3").textContent = pet.name;
    fragment.querySelector(".category-tag").textContent = category.label;
    fragment.querySelector(".price").textContent = formatPrice(pet.price);
    const add = fragment.querySelector(".add-pet");
    add.dataset.petId = pet.id;
    add.setAttribute("aria-label", `將${pet.name}加入購物車`);
    return fragment;
  }));
  resultCount.textContent = `${visible.length} 隻角色`;
}

for (const category of petCategories) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "bevel filter-button";
  button.dataset.category = category.id;
  button.textContent = category.label;
  button.setAttribute("aria-pressed", String(category.id === activeCategory));
  filters.append(button);
}
filters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button || button.dataset.category === activeCategory) return;
  activeCategory = button.dataset.category;
  for (const filter of filters.querySelectorAll("button")) {
    filter.setAttribute("aria-pressed", String(filter === button));
  }
  displayProducts();
  shopStatus.textContent = `${button.textContent}：${resultCount.textContent}。`;
});
displayProducts();

console.info("[電子雞 2/4] 啟動背景角色");
const runners = document.querySelector(".runner-layer");
const heroSprites = document.querySelector(".hero-sprites");
for (const id of ["bolt", "moss", "saucer"]) heroSprites.append(makePetCanvas(products.get(id), true));
petCatalog.forEach((pet, index) => {
  const runner = document.createElement("div");
  runner.className = "runner";
  const seconds = 16 + (index * 7 % 13);
  runner.style.setProperty("--lane", `${9 + index * 5.3}%`);
  runner.style.setProperty("--duration", `${seconds}s`);
  runner.style.setProperty("--delay", `-${(index * 7.3 + 3) % seconds}s`);
  runner.append(makePetCanvas(pet, true));
  runners.append(runner);
});
document.querySelector("#toggle-runners").addEventListener("click", (event) => {
  const paused = document.body.classList.toggle("runners-paused");
  event.currentTarget.setAttribute("aria-pressed", String(paused));
  shopStatus.textContent = paused ? "背景動畫已暫停。" : "背景動畫已繼續。";
});

console.info("[電子雞 3/4] 讀取本機購物車");
const cartKey = "nicoa-pixel-pet-cart-v1";
const cart = document.querySelector("#cart");
const cartCount = document.querySelector("#cart-count");
const cartItems = document.querySelector("#cart-items");
const cartStatus = document.querySelector("#cart-status");
const cartTotal = document.querySelector("#cart-total");
const checkout = document.querySelector("#checkout");
let basket = new Map();
try {
  const saved = JSON.parse(localStorage.getItem(cartKey) ?? "[]");
  if (Array.isArray(saved)) {
    basket = new Map(saved.filter((row) => Array.isArray(row) && products.has(row[0])
      && Number.isInteger(row[1]) && row[1] > 0 && row[1] <= 99));
  }
} catch {
  console.info("[電子雞] 購物車以當頁資料開始。");
}

function quantityButton(pet, change) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "bevel";
  button.textContent = change > 0 ? "＋" : "−";
  button.dataset.petId = pet.id;
  button.dataset.change = String(change);
  button.setAttribute("aria-label", `${change > 0 ? "增加" : "減少"}一隻${pet.name}`);
  button.disabled = change > 0 && basket.get(pet.id) === 99;
  return button;
}

function displayCart() {
  let total = 0;
  let count = 0;
  const items = [...basket].map(([id, quantity]) => {
    const pet = products.get(id);
    count += quantity;
    total += pet.price * quantity;
    const item = document.createElement("li");
    const name = document.createElement("span");
    const controls = document.createElement("div");
    const amount = document.createElement("span");
    name.textContent = `${pet.name} · ${formatPrice(pet.price)}`;
    amount.textContent = String(quantity);
    controls.className = "cart-item-controls";
    controls.append(quantityButton(pet, -1), amount, quantityButton(pet, 1));
    item.append(makePetCanvas(pet, true), name, controls);
    return item;
  });
  cartItems.replaceChildren(...items);
  cartCount.textContent = String(count);
  cartTotal.textContent = formatPrice(total);
  document.querySelector("#empty-cart").hidden = items.length > 0;
  checkout.disabled = items.length === 0;
}

function persistCart() {
  try {
    localStorage.setItem(cartKey, JSON.stringify([...basket]));
  } catch {
    // The cart still works in this page when storage is unavailable.
  }
  displayCart();
}

function changeQuantity(id, change) {
  const quantity = Math.min(99, Math.max(0, (basket.get(id) ?? 0) + change));
  if (quantity) basket.set(id, quantity);
  else basket.delete(id);
  persistCart();
}

grid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-pet-id]");
  if (!button) return;
  const pet = products.get(button.dataset.petId);
  if (basket.get(pet.id) === 99) {
    shopStatus.textContent = `${pet.name}已達單品數量上限。`;
    return;
  }
  changeQuantity(pet.id, 1);
  shopStatus.textContent = `${pet.name}已加入購物車。`;
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-pet-id]");
  if (!button) return;
  const { petId, change } = button.dataset;
  changeQuantity(petId, Number(change));
  const replacement = cartItems.querySelector(`[data-pet-id="${petId}"][data-change="${change}"]`);
  if (replacement && !replacement.disabled) replacement.focus();
  else (cartItems.querySelector("button:not(:disabled)") ?? cart.querySelector(".close-cart")).focus();
  cartStatus.textContent = `${products.get(petId).name}：${basket.get(petId) ?? 0} 隻。`;
});

document.querySelector("#open-cart").addEventListener("click", () => {
  cartStatus.textContent = "";
  cart.showModal();
});
checkout.addEventListener("click", () => {
  const count = cartCount.textContent;
  basket.clear();
  persistCart();
  cartStatus.textContent = `模擬結帳完成。你選了 ${count} 隻電子雞寵物。`;
  shopStatus.textContent = "模擬結帳完成。";
  cart.querySelector(".close-cart").focus();
});
displayCart();
console.info("[電子雞 4/4] 分類、跑動背景與模擬購物流程就緒");
