import { createFog } from './fog.js';

const exhibit = document.querySelector('.exhibit');
const controls = document.querySelector('.exhibit-controls');
const fullscreenButton = document.querySelector('[data-fullscreen]');
const modeButtons = [...document.querySelectorAll('[data-show-mode]')];
const layerImages = [...exhibit.querySelectorAll('[data-src]')];
const status = exhibit.querySelector('.exhibit-status');
let layerLoad;
let requestedMode;

console.info('[視覺展示 0/3] 輸入絕對 URL', location.href, import.meta.url, exhibit.querySelector('img').src,
  ...layerImages.map(image => new URL(image.dataset.src, location.href).href));
console.info('[視覺展示 0/3] 輸出絕對 URL', location.href, '只更新展示模式與全螢幕狀態。');
const fog = createFog(exhibit.querySelector('.mist'));

function setMode(mode) {
  exhibit.dataset.mode = mode;
  fog?.setActive(mode !== 'still');
  for (const button of modeButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.showMode === mode));
  }
}

async function showMode(mode) {
  requestedMode = fog ? mode : 'still';
  status.hidden = true;
  if (requestedMode !== 'layers') {
    setMode(requestedMode);
    return;
  }

  layerLoad ??= Promise.all(layerImages.map(image => {
    image.src = image.dataset.src;
    return image.decode();
  }));
  try {
    await layerLoad;
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
  button.disabled = !fog && button.dataset.showMode !== 'still';
  button.addEventListener('click', () => showMode(button.dataset.showMode));
}
const initialMode = new URL(location.href).searchParams.get('mode');
showMode(['mist', 'layers'].includes(initialMode) ? initialMode : 'still');
console.info('[視覺展示 1/3] 靜態、動態霧氣與分層模式控制就緒。');

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
