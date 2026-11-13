(() => {
  const cover = document.querySelector('.showcase-cover--pixel-pets');
  if (!cover) return;

  const catalogUrl = new URL('demos/pixel-pets/pets.js', document.currentScript.src);
  console.info('[首頁電子雞 0/2] 輸入', document.currentScript.src, catalogUrl.href);
  console.info('[首頁電子雞 0/2] 輸出', new URL('#website-demos', location.href).href, '電子雞畫布');

  const pet = petCatalog.find(({ id }) => id === 'bolt');
  const canvas = makePetCanvas(pet, true);
  cover.querySelector('img').replaceWith(canvas);
  console.info('[首頁電子雞 1/2] 角色已繪製');

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const moves = petMoves.map(({ id }) => id);
  const frameDuration = 125;
  const framesPerMove = 16;
  let visible = !('IntersectionObserver' in window);
  let timer;
  let frame = framesPerMove;
  let move;

  function tick() {
    if (document.body.classList.contains('motion-paused')) return;
    if (frame === framesPerMove) {
      const nextMoves = moves.filter(candidate => candidate !== move);
      move = nextMoves[Math.floor(Math.random() * nextMoves.length)];
      frame = 0;
    }
    drawPet(canvas, pet, move, frame++);
  }

  function updatePlayback() {
    if (visible && !document.hidden && !reducedMotion.matches) {
      timer ??= setInterval(tick, frameDuration);
    } else {
      clearInterval(timer);
      timer = undefined;
      if (reducedMotion.matches) drawPet(canvas, pet);
    }
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updatePlayback();
    });
    observer.observe(cover);
  }
  document.addEventListener('visibilitychange', updatePlayback);
  reducedMotion.addEventListener('change', updatePlayback);
  updatePlayback();
  console.info('[首頁電子雞 2/2] 隨機播放已就緒');
})();
