(() => {
  const report = (step, message) => console.info(`[進階示範 ${step}/3] ${message}`);
  const script = document.currentScript.src;
  report(0, `輸入：${location.href}、${script}。輸出：目前頁面的互動狀態。`);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function arrowNavigation(container, move) {
    container.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    });
  }

  function watchScroll(update) {
    let frame = 0;
    const queueUpdate = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    addEventListener('scroll', queueUpdate, { passive: true });
    addEventListener('resize', queueUpdate);
    reducedMotion.addEventListener('change', queueUpdate);
    update();
  }

  function bindBook(book) {
    const pages = Array.from(book.querySelectorAll('.book-page'));
    const index = book.querySelector('.book-index');
    const buttons = Array.from(index.querySelectorAll('[data-page]'));
    const controls = book.querySelector('.book-controls');
    const count = book.querySelector('[data-book-count]');
    let current = 0;
    function show(page, direction = 1) {
      current = (page + pages.length) % pages.length;
      pages.forEach((item, position) => { item.hidden = position !== current; });
      buttons.forEach((button, position) => {
        button.setAttribute('aria-pressed', String(position === current));
      });
      count.textContent = `${current + 1} / ${pages.length} · ${pages[current].querySelector('h3').textContent}`;
      if (!reducedMotion.matches) {
        pages[current].animate([
          { transform: `perspective(1200px) rotateY(${direction * -14}deg)`, opacity: .5 },
          { transform: 'perspective(1200px) rotateY(0deg)', opacity: 1 },
        ], { duration: 440, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
    }
    const turn = (delta) => show(current + delta, delta);
    buttons.forEach((button, page) => {
      button.addEventListener('click', () => show(page, page >= current ? 1 : -1));
    });
    book.querySelector('[data-prev]').addEventListener('click', () => turn(-1));
    book.querySelector('[data-next]').addEventListener('click', () => turn(1));
    document.querySelector('[data-open-book]').addEventListener('click', () => show(1));
    arrowNavigation(book, turn);
    index.hidden = false;
    controls.hidden = false;
    show(0);
  }

  function bindJourney(journey) {
    const scenes = Array.from(journey.querySelectorAll('[data-scene]'));
    const links = Array.from(journey.querySelectorAll('.journey-nav a'));
    let active = -1;
    watchScroll(() => {
      const horizon = innerHeight * .52;
      const total = journey.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (horizon - total.top) / total.height));
      journey.style.setProperty('--journey-progress', progress);
      let chapter = 0;
      scenes.forEach((scene, index) => {
        const { top, height } = scene.getBoundingClientRect();
        const phase = Math.max(0, Math.min(1, (innerHeight - top) / (innerHeight + height)));
        scene.style.setProperty('--phase', phase);
        if (top <= horizon) chapter = index;
      });
      if (active === chapter) return;
      active = chapter;
      links.forEach((link, index) => {
        if (index === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }

  function bindGallery(gallery) {
    const track = gallery.querySelector('.gallery-track');
    const cards = Array.from(track.querySelectorAll('.resident-frame'));
    const dialog = gallery.querySelector('dialog');
    const dialogImage = dialog.querySelector('img');
    const count = gallery.querySelector('[data-gallery-count]');
    let selected = 0;
    let touchOrigin;
    function select(index) {
      selected = (index + cards.length) % cards.length;
      cards.forEach((card, position) => {
        let offset = (position - selected + cards.length) % cards.length;
        if (offset > cards.length / 2) offset -= cards.length;
        card.dataset.position = String(offset);
        card.inert = Math.abs(offset) > 1;
      });
      count.textContent = `${selected + 1} / ${cards.length} · ${cards[selected].querySelector('h3').textContent}`;
    }
    cards.forEach((card, index) => {
      const link = card.querySelector('a');
      link.addEventListener('click', (event) => {
        event.preventDefault();
        select(index);
        dialogImage.src = link.href;
        dialogImage.alt = link.querySelector('img').alt;
        dialog.querySelector('h3').textContent = card.querySelector('h3').textContent;
        dialog.querySelector('p').textContent = card.querySelector('p').textContent;
        dialog.showModal();
      });
    });
    const turn = (delta) => select(selected + delta);
    gallery.querySelector('[data-prev]').addEventListener('click', () => turn(-1));
    gallery.querySelector('[data-next]').addEventListener('click', () => turn(1));
    arrowNavigation(gallery.querySelector('.gallery-controls'), turn);
    arrowNavigation(track, turn);
    track.addEventListener('touchstart', ({ changedTouches: [touch] }) => {
      touchOrigin = { x: touch.clientX, y: touch.clientY };
    }, { passive: true });
    track.addEventListener('touchend', (event) => {
      if (!touchOrigin) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchOrigin.x;
      const dy = touch.clientY - touchOrigin.y;
      touchOrigin = undefined;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      if (event.cancelable) event.preventDefault();
      turn(dx < 0 ? 1 : -1);
    }, { passive: false });
    gallery.querySelector('.gallery-controls').hidden = false;
    track.classList.add('is-carousel');
    select(0);
  }

  function bindDevice(device) {
    const controls = device.querySelector('.device-controls');
    const parts = Array.from(controls.querySelectorAll('[data-part]'));
    const note = device.querySelector('[data-part-note]');
    const picker = device.querySelector('#device-pet');
    const moves = device.querySelector('.device-moves');
    const canvas = device.querySelector('[data-device-screen]');
    const english = document.documentElement.lang === 'en';
    const descriptions = english ? {
      case: 'The shell protects the screen and circuitry and gives the device its round shape.',
      screen: 'The LCD shows your chosen pet and all five of its moves.',
      buttons: 'The buttons send commands to your pet.',
      circuit: 'The circuit board reads the buttons and updates the pixels on the screen.',
      expanded: 'All four layers are expanded.',
      assembled: 'The device is assembled.',
    } : {
      case: '外殼包住螢幕和電路，保留電子雞的圓形輪廓。',
      screen: 'LCD 顯示你選的角色，也能試玩牠的五種動作。',
      buttons: '按鍵是給寵物下指令的入口。',
      circuit: '電路板接收按鍵訊號，更新螢幕上的像素。',
      expanded: '四層機身已展開。',
      assembled: '機身已組合。',
    };
    let spread;
    let pet = petCatalog[0];
    let motion = 'walk';
    let started = performance.now();
    let inView = true;
    const markPart = (activePart) => {
      device.dataset.part = activePart;
      parts.forEach((part) => part.setAttribute('aria-pressed', String(part.dataset.part === activePart)));
    };
    const setSpread = (amount) => device.style.setProperty('--spread', amount);
    watchScroll(() => {
      if (spread !== undefined) return;
      const top = device.getBoundingClientRect().top;
      setSpread(reducedMotion.matches ? .52 : Math.min(1, Math.max(.12, (innerHeight * .23 - top) / (innerHeight * .43))));
    });
    controls.addEventListener('click', (event) => {
      const part = event.target.closest('[data-part]');
      if (!part) return;
      const name = part.dataset.part;
      const currentSpread = Number(device.style.getPropertyValue('--spread'));
      spread = name === 'all' && currentSpread > .55 ? .08 : 1;
      setSpread(spread);
      markPart(name);
      note.textContent = descriptions[name] ?? (spread > .5 ? descriptions.expanded : descriptions.assembled);
    });

    picker.replaceChildren(...petCatalog.map((item) => new Option(item.name, item.id)));
    const redraw = () => drawPet(canvas, pet, motion, 0);
    picker.addEventListener('change', () => {
      pet = petCatalog.find((item) => item.id === picker.value);
      started = performance.now();
      redraw();
    });
    const motionButtons = petMoves.map((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.label;
      button.setAttribute('aria-pressed', String(item.id === motion));
      button.addEventListener('click', () => {
        motion = item.id;
        started = performance.now();
        motionButtons.forEach((control) => control.setAttribute('aria-pressed', String(control === button)));
        redraw();
      });
      return button;
    });
    moves.replaceChildren(...motionButtons);
    controls.hidden = false;
    device.querySelector('.pet-test').hidden = false;
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }).observe(canvas);
    setInterval(() => {
      if (!inView || reducedMotion.matches || document.hidden) return;
      drawPet(canvas, pet, motion, Math.floor((performance.now() - started) / 145));
    }, 145);
    redraw();
  }

  report(1, '辨識此頁的互動元件。');
  for (const [selector, bind] of [
    ['[data-book]', bindBook], ['[data-journey]', bindJourney],
    ['[data-gallery]', bindGallery], ['[data-device]', bindDevice],
  ]) {
    const section = document.querySelector(selector);
    if (section) bind(section);
  }
  report(2, '已綁定導覽及操作控制。');
  report(3, '頁面就緒。');
})();
