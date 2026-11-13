const english = document.documentElement.lang === 'en';
const local = (zh, en) => english ? en : zh;
const asset = (file) => new URL(`assets/${file}`, import.meta.url).href;
const currency = (amount) => `NT$${amount.toLocaleString(english ? 'en' : 'zh-TW')}`;
const report = (stage, text) => console.info(`[Dayfold ${stage}/3] ${text}`);
report(0, `Input: ${location.href}, ${import.meta.url}, ${asset('')}. Output: ${new URL('#rooms', location.href)} and ${new URL('#advisor', location.href)}. No files are written.`);

const rooms = [
  {
    id: 'kitchen', name: local('廚房', 'Kitchen'),
    alt: local('小廚房的檯面上有黃色瀝水架和棉布', 'Yellow drying rack and cotton cloths on a kitchen counter'),
    products: [
      { id: 'rack', x: 51, y: 62, price: 690, name: local('檸黃摺疊瀝水架', 'Lemon folding dish rack'), detail: local('小檯面先留給備餐。瀝乾後可以收起架子。', 'Fold the rack away after the dishes dry to free up counter space.') },
      { id: 'cloths', x: 85, y: 75, price: 240, name: local('苔綠棉布雙入組', 'Moss cotton cloth pair'), detail: local('兩條輪替，擦完檯面就掛起來晾乾。', 'Rotate the two cloths and hang each one to dry after wiping the counter.') },
    ],
  },
  {
    id: 'bathroom', name: local('浴室', 'Bathroom'),
    alt: local('灰綠磁磚牆上有奶白置物軌及陶紅掛袋', 'Cream storage rail and a terracotta pouch against sage tiles'),
    products: [
      { id: 'rail', x: 49, y: 43, price: 580, name: local('奶白置物軌與掛籃', 'Cream rail and caddy'), detail: local('把常用瓶罐移出洗手台。安裝前先確認牆面與租約條件。', 'Clear bottles off the sink. Check the wall surface and rental terms before installing.') },
      { id: 'pouch', x: 67, y: 53, price: 320, name: local('陶紅隨手掛袋', 'Terracotta hanging pouch'), detail: local('把備用小物收在一起。可掛在既有掛鉤上。', 'Keep small extras together. Hang it from a hook you already have.') },
    ],
  },
  {
    id: 'laundry', name: local('洗衣陽台', 'Laundry balcony'),
    alt: local('洗衣陽台上有吊掛式網籃與可收合的布洗衣籃', 'Hanging mesh sorter and collapsible cloth hamper on a laundry balcony'),
    products: [
      { id: 'sorter', x: 31, y: 40, price: 420, name: local('芥黃三層網籃', 'Mustard three-tier mesh sorter'), detail: local('利用既有掛桿垂直分層，輕薄衣物可以分開放。', 'Hang it from an existing rail to sort lightweight laundry vertically.') },
      { id: 'hamper', x: 45, y: 76, price: 560, name: local('米白收合洗衣籃', 'Oat collapsible laundry hamper'), detail: local('洗衣前把衣服集中，搬動時可用雙側提把。', 'Gather laundry before washing and carry it by the two handles.') },
    ],
  },
];
const products = new Map(rooms.flatMap((room) => room.products.map((product) => [product.id, product])));
const selected = new Set();
let budget = 1000;
let activeRoom = rooms[0];
let activeProduct = activeRoom.products[0];
const showroom = document.querySelector('#showroom');

function make(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content) node.textContent = content;
  return node;
}

function button(text, className) {
  const node = make('button', className, text);
  node.type = 'button';
  return node;
}

const roomControls = make('div', 'room-controls');
roomControls.setAttribute('role', 'group');
roomControls.setAttribute('aria-label', local('空間', 'Rooms'));
const layout = make('div', 'room-layout');
const photoPanel = make('div', 'photo-panel');
const scene = make('div', 'scene');
const roomPhoto = make('img');
roomPhoto.width = 1440;
roomPhoto.height = 960;
const pins = make('div', 'pins');
scene.append(roomPhoto, pins);
const caption = make('p', 'caption', local('AI 生成情境照', 'AI-generated scene'));
const productChoices = make('div', 'product-choices');
productChoices.setAttribute('role', 'group');
productChoices.setAttribute('aria-label', local('照片中的商品', 'Products in the photo'));
photoPanel.append(scene, caption, productChoices);
const productPanel = make('article', 'product-panel');
const productTag = make('p', 'eyebrow');
const productName = make('h3');
const productPrice = make('p', 'price');
const productDetail = make('p', 'product-description');
const addButton = button('', 'action');
productPanel.append(productTag, productName, productPrice, productDetail, addButton);
layout.append(photoPanel, productPanel);

const listPanel = make('section', 'shortlist');
const listTitle = make('h3', '', local('我的選品清單', 'My shortlist'));
listTitle.id = 'shortlist-title';
listPanel.setAttribute('aria-labelledby', listTitle.id);
const listHeader = make('div', 'shortlist-header');
const budgetControl = make('div', 'budget');
const budgetLabel = make('label', '', local('整份清單預算', 'Shortlist budget'));
budgetLabel.htmlFor = 'budget';
const budgetSelect = make('select');
budgetSelect.id = 'budget';
for (const value of [500, 1000, 1500, 2500, 4000]) budgetSelect.add(new Option(currency(value), value));
budgetSelect.value = String(budget);
budgetControl.append(budgetLabel, budgetSelect);
listHeader.append(listTitle, budgetControl);
const list = make('ul');
const total = make('p', 'total');
total.setAttribute('role', 'status');
const empty = make('p', 'empty', local('從上方加入想留下的用品。換房間時，清單會保留。', 'Add products from above. Your shortlist stays in place as you switch rooms.'));
listPanel.append(listHeader, empty, list, total);
showroom.append(roomControls, layout, listPanel);

const productTotal = () => [...selected].reduce((sum, id) => sum + products.get(id).price, 0);

function showProduct(product) {
  activeProduct = product;
  productTag.textContent = activeRoom.name;
  productName.textContent = product.name;
  productPrice.textContent = currency(product.price);
  productDetail.textContent = product.detail;
  for (const control of layout.querySelectorAll('button[data-product]')) {
    control.setAttribute('aria-pressed', String(control.dataset.product === product.id));
  }
  const isAdded = selected.has(product.id);
  addButton.textContent = isAdded ? local('從清單移除', 'Remove from shortlist') : local('加入選品清單', 'Add to shortlist');
}

function renderList() {
  const previousFocus = document.activeElement;
  const focusIndex = Array.from(list.querySelectorAll('button')).indexOf(previousFocus);
  const rows = [...selected].map((id) => {
    const product = products.get(id);
    const row = make('li');
    const remove = button(local('移除', 'Remove'), 'remove');
    remove.setAttribute('aria-label', local(`移除${product.name}`, `Remove ${product.name}`));
    remove.addEventListener('click', () => {
      selected.delete(id);
      renderList();
    });
    row.append(make('span', '', product.name), make('strong', '', currency(product.price)), remove);
    return row;
  });
  list.replaceChildren(...rows);
  if (focusIndex >= 0) {
    const buttons = list.querySelectorAll('button');
    (buttons[Math.min(focusIndex, buttons.length - 1)] ?? budgetSelect).focus();
  }
  empty.hidden = selected.size > 0;
  const sum = productTotal();
  const difference = budget - sum;
  const status = difference >= 0
    ? local(`還可用 ${currency(difference)}`, `${currency(difference)} left`)
    : local(`超出預算 ${currency(-difference)}`, `${currency(-difference)} over budget`);
  total.textContent = local(`合計 ${currency(sum)} · ${status}`, `Total ${currency(sum)} · ${status}`);
  total.classList.toggle('over', difference < 0);
  showProduct(activeProduct);
}

function chooseRoom(room) {
  activeRoom = room;
  roomPhoto.src = asset(`${room.id}.webp`);
  roomPhoto.alt = room.alt;
  for (const control of roomControls.querySelectorAll('button')) {
    control.setAttribute('aria-pressed', String(control.dataset.room === room.id));
  }
  pins.replaceChildren();
  productChoices.replaceChildren();
  room.products.forEach((product, index) => {
    const pin = button(String(index + 1), 'pin');
    pin.style.setProperty('--x', `${product.x}%`);
    pin.style.setProperty('--y', `${product.y}%`);
    pin.setAttribute('aria-label', product.name);
    const choice = button(`${index + 1}. ${product.name}`, 'product-choice');
    for (const control of [pin, choice]) {
      control.dataset.product = product.id;
      control.addEventListener('click', () => showProduct(product));
    }
    pins.append(pin);
    productChoices.append(choice);
  });
  showProduct(room.products[0]);
}

report(1, local('建立空間導覽與六項選品。', 'Loaded room navigation and six products.'));
for (const room of rooms) {
  const control = button(room.name, 'room-tab');
  control.dataset.room = room.id;
  control.addEventListener('click', () => chooseRoom(room));
  roomControls.append(control);
}
chooseRoom(activeRoom);
addButton.addEventListener('click', () => {
  if (selected.has(activeProduct.id)) selected.delete(activeProduct.id);
  else selected.add(activeProduct.id);
  renderList();
});
budgetSelect.addEventListener('change', () => {
  budget = Number(budgetSelect.value);
  renderList();
});
renderList();

report(2, local('清單與預算差額已就緒。', 'Shortlist and budget totals are ready.'));
const consultation = document.querySelector('#consult');
const slot = document.querySelector('#slot');
const booking = document.querySelector('#booking');
consultation.addEventListener('submit', (event) => {
  event.preventDefault();
  booking.textContent = local(`示範時段：${slot.value}。這是預覽，沒有送出預約。`, `Sample slot: ${slot.value}. This preview did not submit a booking.`);
});
slot.addEventListener('change', () => { booking.textContent = ''; });
consultation.hidden = false;
report(3, local('預約預覽與選品頁可以使用。', 'Booking preview and product selector are ready.'));
