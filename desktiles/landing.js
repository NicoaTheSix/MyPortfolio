(() => {
  'use strict';
  const main = document.querySelector('.docs-main');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const input = new URL(document.currentScript.src, location.href);
  console.info('[DeskTiles landing 0/2] Input:', location.href, input.href);
  console.info('[DeskTiles landing 0/2] Output:', new URL('#content', location.href).href, 'CSS properties in the page');
  let frame = 0;

  function draw() {
    frame = 0;
    const offset = motion.matches ? 0 : Math.max(0, scrollY);
    main.style.setProperty('--dt-scroll', `${offset}px`);
    main.style.setProperty('--dt-turn', `${Math.min(70, offset * 0.018)}deg`);
  }

  function schedule() {
    if (!motion.matches && !frame) frame = requestAnimationFrame(draw);
  }

  console.info('[DeskTiles landing 1/2] Applying initial position and motion preference.');
  draw();
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('pageshow', draw);
  motion.addEventListener('change', draw);
  console.info('[DeskTiles landing 2/2] Scroll-linked background ready.');
})();
