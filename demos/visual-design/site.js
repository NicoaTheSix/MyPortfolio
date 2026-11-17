import { createFog } from './fog.js?v=poster-fog-r1';
import { createNormalLight } from './normal-light.js';

const exhibit = document.querySelector('.exhibit');
const controls = document.querySelector('.exhibit-controls');
const fullscreenButton = document.querySelector('[data-fullscreen]');
const modeButtons = [...document.querySelectorAll('[data-show-mode]')];
const layerImages = [...exhibit.querySelectorAll('[data-src]')];
const status = exhibit.querySelector('.exhibit-status');
const poster = exhibit.querySelector('.poster');
const lightingSelect = exhibit.querySelector('[data-light-preset]');
const lightingControls = lightingSelect.closest('label');
const normalCanvas = exhibit.querySelector('.character-normal-light');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const languageLink = exhibit.querySelector('[data-exhibit-language]');
const alternateLanguage = new URL(languageLink.href);
const params = new URL(location.href).searchParams;
const classicFog = params.get('fog') === 'classic';
const loadRenderer = () => import('./poster-fog.js?v=1');
let layerLoad;
let requestedMode;
let drawNormalLight;
let lightFrame = 0;

console.info('[視覺展示 0/3] 輸入絕對 URL', location.href, import.meta.url, exhibit.querySelector('img').src,
  ...layerImages.map(image => new URL(image.dataset.src, location.href).href));
console.info('[視覺展示 0/3] 輸出絕對 URL', location.href, '只更新展示模式與全螢幕狀態。');
const fog = posterFog(exhibit.querySelector('.mist'));
const foregroundFog = posterFog(exhibit.querySelector('.mist-foreground'), true);

function posterFog(canvas, foreground = false) {
  const { width, height } = canvas;
  let layer;
  let request;
  let active = false;

  function fallback() {
    const replacement = canvas.cloneNode();
    replacement.width = width;
    replacement.height = height;
    canvas.replaceWith(replacement);
    canvas = replacement;
    layer = createFog(canvas, { foreground });
    layer?.setActive(active);
  }

  return {
    prepare() {
      request ??= classicFog ? Promise.resolve().then(fallback) : loadRenderer().then(module => {
        layer = module.createPosterFog(canvas, { foreground, onUnavailable: fallback });
      }).catch(fallback);
      return request;
    },
    setActive(value) {
      active = value;
      layer?.setActive(value);
    }
  };
}

function setMode(mode) {
  exhibit.dataset.mode = mode;
  fog.setActive(mode === 'mist' || mode === 'layers');
  foregroundFog.setActive(mode === 'layers');
  alternateLanguage.search = '';
  if (mode !== 'still') {
    alternateLanguage.searchParams.set('mode', mode);
    if (classicFog) alternateLanguage.searchParams.set('fog', 'classic');
  }
  languageLink.href = alternateLanguage.href;
  lightingControls.hidden = mode !== 'layers';
  updateLighting();
  for (const button of modeButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.showMode === mode));
  }
}

function updateLighting() {
  exhibit.dataset.lighting = lightingSelect.value;
  if (exhibit.dataset.mode !== 'layers' || lightingSelect.value !== 'normal') return;
  drawNormalLight ??= createNormalLight(normalCanvas, exhibit.querySelector('.poster-character img'));
  drawNormalLight?.();
}

function moveNormalLight(event) {
  if (lightingControls.hidden || lightingSelect.value !== 'normal' || motion.matches || !drawNormalLight) return;
  const bounds = poster.getBoundingClientRect();
  cancelAnimationFrame(lightFrame);
  lightFrame = requestAnimationFrame(() => {
    drawNormalLight((event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height);
  });
}
poster.addEventListener('pointermove', moveNormalLight);
poster.addEventListener('pointerdown', moveNormalLight);
lightingSelect.addEventListener('change', updateLighting);

async function showMode(mode) {
  requestedMode = mode;
  status.hidden = true;
  if (mode === 'still') {
    setMode('still');
    return;
  }
  const backMist = fog.prepare();
  if (mode === 'mist') {
    await backMist;
    if (requestedMode === mode) setMode(mode);
    return;
  }
  const frontMist = foregroundFog.prepare();

  layerLoad ??= Promise.all(layerImages.map(image => {
    image.src = image.dataset.src;
    return image.decode();
  }));
  try {
    await Promise.all([layerLoad, backMist, frontMist]);
    if (requestedMode === 'layers') setMode('layers');
  } catch {
    layerLoad = undefined;
    if (requestedMode !== 'layers') return;
    setMode('still');
    status.textContent = status.dataset.layerError;
    status.hidden = false;
  }
}

function syncFullscreen() {
  const active = document.fullscreenElement === exhibit || exhibit.classList.contains('is-immersive');
  fullscreenButton.textContent = active ? fullscreenButton.dataset.exitLabel : fullscreenButton.dataset.enterLabel;
}

for (const button of modeButtons) {

  button.addEventListener('click', () => showMode(button.dataset.showMode));
}
const lighting = params.get('lighting');
lightingSelect.value = ['off', 'mask', 'sweep', 'normal'].includes(lighting) ? lighting : 'mask';
const initialMode = params.get('mode');
showMode(['mist', 'layers'].includes(initialMode) ? initialMode : 'still');
console.info('[視覺展示 1/3] 靜態、霧氣與分層控制就緒。');

fullscreenButton.addEventListener('click', async () => {
  if (document.fullscreenElement === exhibit) {
    await document.exitFullscreen();
  } else if (exhibit.classList.contains('is-immersive')) {
    exhibit.classList.remove('is-immersive');
  } else {
    try {
      if (!exhibit.requestFullscreen) throw new Error('Fullscreen unavailable');
      await exhibit.requestFullscreen();
    } catch {
      exhibit.classList.add('is-immersive');
    }
  }
  syncFullscreen();
});
document.addEventListener('fullscreenchange', syncFullscreen);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && exhibit.classList.contains('is-immersive')) {
    exhibit.classList.remove('is-immersive');
    syncFullscreen();
  }
});
console.info('[視覺展示 2/3] 全螢幕與備援控制就緒。');
controls.hidden = false;
console.info('[視覺展示 3/3] 展示控制已顯示。');
