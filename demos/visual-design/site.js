import { createFog } from './fog.js?v=poster-fog-r1';
import { createNormalLight } from './normal-light.js';
import { createLayeredLight } from './layered-light.js?v=2';

const exhibit = document.querySelector('.exhibit');
const controls = document.querySelector('.exhibit-controls');
const fullscreenButton = document.querySelector('[data-fullscreen]');
const modeButtons = [...document.querySelectorAll('[data-show-mode]')];
const sharedLayers = [...exhibit.querySelectorAll('.poster-floor, .poster-wordmark')];
const status = exhibit.querySelector('.exhibit-status');
const poster = exhibit.querySelector('.poster');
const lightingSelect = exhibit.querySelector('[data-light-preset]');
const lightingControls = lightingSelect.closest('label');
const normalCanvas = exhibit.querySelector('.character-normal-light');
const layeredCanvas = exhibit.querySelector('.character-layered-light');
const lightSurface = exhibit.querySelector('.layered-light-surface');
const lightGuide = exhibit.querySelector('.layered-light-guide');
const diceCanvas = exhibit.querySelector('.poster-dice');
const diceControls = exhibit.querySelector('.dice-controls');
const diceGuide = exhibit.querySelector('.dice-guide');
const pauseDice = exhibit.querySelector('[data-pause-dice]');

let diceScene;
let diceRequest;
let dicePaused = false;
const character = exhibit.querySelector('.poster-character img');
const originalCharacter = exhibit.querySelector('.poster-character-original');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const languageLink = exhibit.querySelector('[data-exhibit-language]');
const alternateLanguage = new URL(languageLink.href);
const params = new URL(location.href).searchParams;
const classicFog = params.get('fog') === 'classic';
const loadRenderer = () => import('./poster-fog.js?v=1');
const lightingOptions = {
  mist: ['original', 'original-lit', 'layered-lit', 'layered'],
  layers: ['mask', 'sweep', 'normal', 'layered', 'original-lit', 'layered-lit', 'off']
};
const selectedLighting = { mist: 'original', layers: 'mask' };
const imageLoads = new Map();
const usesOriginalPlate = lighting => lighting === 'original-lit' || lighting === 'layered-lit';
const usesPosterLayers = (mode, lighting) => mode === 'layers' || (mode === 'mist' && lighting !== 'original');
let modeRequest = 0;
let drawNormalLight;
const layeredDraws = new Map();
let lightX = .31;
let lightY = .39;
let dragPointer = null;
let lightFrame = 0;

console.info('[視覺展示 0/3] 輸入絕對 URL', location.href, import.meta.url, exhibit.querySelector('img').src,
  ...[...sharedLayers, character, originalCharacter].map(image => new URL(image.dataset.src, location.href).href));
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
  diceScene?.setActive(mode === 'dice');
  diceControls.hidden = mode !== 'dice';
  diceGuide.hidden = mode !== 'dice';
  const choices = lightingOptions[mode] ?? [];
  lightingControls.hidden = choices.length === 0;
  for (const option of lightingSelect.options) {
    option.disabled = !choices.includes(option.value);
    option.hidden = option.disabled;
  }
  if (choices.length) lightingSelect.value = selectedLighting[mode];
  updateLighting();
  for (const button of modeButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.showMode === mode));
  }
}

function updateLighting() {
  const mode = exhibit.dataset.mode;
  const lighting = selectedLighting[mode] ?? '';
  const interactive = lighting === 'layered' || lighting === 'layered-lit';
  exhibit.dataset.lighting = lighting;
  exhibit.dataset.posterLayers = String(usesPosterLayers(mode, lighting));
  exhibit.dataset.characterPlate = usesOriginalPlate(lighting) ? 'original' : 'neutral';
  exhibit.dataset.interactiveLight = String(interactive);
  lightGuide.hidden = !interactive;
  alternateLanguage.search = '';
  if (mode === 'dice') {
    alternateLanguage.searchParams.set('mode', 'dice');
  } else if (mode !== 'still') {
    alternateLanguage.searchParams.set('mode', mode);
    if (classicFog) alternateLanguage.searchParams.set('fog', 'classic');
    if (lighting !== lightingOptions[mode][0]) alternateLanguage.searchParams.set('lighting', lighting);
  }
  languageLink.href = alternateLanguage.href;
  if (lighting === 'normal') {
    drawNormalLight ??= createNormalLight(normalCanvas, character);
    drawNormalLight?.();
  } else if (interactive) {
    if (!layeredDraws.has(lighting)) {
      const preserveOriginal = usesOriginalPlate(lighting);
      const image = preserveOriginal ? originalCharacter : character;
      layeredDraws.set(lighting, createLayeredLight(layeredCanvas, image, { preserveOriginal }));
    }
    layeredDraws.get(lighting)?.(lightX, lightY);
  }
}

function moveNormalLight(event) {
  if (lightingControls.hidden || lightingSelect.value !== 'normal' || motion.matches || !drawNormalLight) return;
  const bounds = poster.getBoundingClientRect();
  cancelAnimationFrame(lightFrame);
  lightFrame = requestAnimationFrame(() => {
    if (lightingControls.hidden || lightingSelect.value !== 'normal') return;
    drawNormalLight((event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height);
  });
}
function moveLayeredLight(event) {
  const bounds = poster.getBoundingClientRect();
  setLightPoint((event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height);
}

function setLightPoint(x, y) {
  lightX = Math.max(0, Math.min(1, x));
  lightY = Math.max(0, Math.min(1, y));
  cancelAnimationFrame(lightFrame);
  lightFrame = requestAnimationFrame(() => {
    if (!lightGuide.hidden) layeredDraws.get(exhibit.dataset.lighting)?.(lightX, lightY);
  });
}

poster.addEventListener('pointermove', event => {
  if (lightGuide.hidden) moveNormalLight(event);
  else if (event.pointerType === 'mouse' || dragPointer === event.pointerId) moveLayeredLight(event);
});
poster.addEventListener('pointerdown', moveNormalLight);
lightSurface.addEventListener('pointerdown', event => {
  if (event.pointerType === 'mouse' || dragPointer !== null) return;
  dragPointer = event.pointerId;
  lightSurface.setPointerCapture(dragPointer);
  moveLayeredLight(event);
});
lightSurface.addEventListener('lostpointercapture', event => {
  if (dragPointer === event.pointerId) dragPointer = null;
});
lightSurface.addEventListener('keydown', event => {
  if (event.key === 'Home') {
    event.preventDefault();
    setLightPoint(.31, .39);
    return;
  }
  const offset = { ArrowLeft: [-.04, 0], ArrowRight: [.04, 0], ArrowUp: [0, -.04], ArrowDown: [0, .04] }[event.key];
  if (!offset) return;
  event.preventDefault();
  setLightPoint(lightX + offset[0], lightY + offset[1]);
});
lightingSelect.addEventListener('change', () => {
  const mode = exhibit.dataset.mode;
  if (!lightingOptions[mode]?.includes(lightingSelect.value)) return;
  selectedLighting[mode] = lightingSelect.value;
  showMode(mode);
});

function prepareLayers(lighting) {
  const activeCharacter = usesOriginalPlate(lighting) ? originalCharacter : character;
  return Promise.all([...sharedLayers, activeCharacter].map(image => {
    if (!imageLoads.has(image)) {
      image.src = image.dataset.src;
      imageLoads.set(image, image.decode().catch(error => {
        imageLoads.delete(image);
        throw error;
      }));
    }
    return imageLoads.get(image);
  }));
}

async function showMode(mode) {
  const request = ++modeRequest;
  status.hidden = true;
  if (mode === 'still') {
    setMode('still');
    return;
  }
  if (mode === 'dice') {
    try {
      diceRequest ??= import('./poster-dice.js?v=4').then(module => module.createDiceScene(diceCanvas, {

        onUnavailable() {
          ++modeRequest;
          setMode('still');
          status.textContent = status.dataset.diceError;
          status.hidden = false;
        },
      })).then(scene => { diceScene = scene; }).catch(error => {
        diceRequest = null;
        throw error;
      });
      await diceRequest;
      if (request !== modeRequest) return;
      setMode('dice');
      console.info('[骰子 3/3] Interactive dice mode visible.');
    } catch {
      if (request !== modeRequest) return;
      setMode('still');
      status.textContent = status.dataset.diceError;
      status.hidden = false;
    }
    return;
  }
  const ready = [fog.prepare()];
  if (mode === 'layers') ready.push(foregroundFog.prepare());
  const lighting = selectedLighting[mode];
  if (usesPosterLayers(mode, lighting)) ready.push(prepareLayers(lighting));
  try {
    await Promise.all(ready);
    if (request === modeRequest) setMode(mode);
  } catch {
    if (request !== modeRequest) return;
    if (mode === 'mist') {
      selectedLighting.mist = 'original';
      await fog.prepare();
      if (request !== modeRequest) return;
      setMode('mist');
      status.textContent = status.dataset.mistLightError;
    } else {
      setMode('still');
      status.textContent = status.dataset.layerError;
    }
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
const initialMode = params.get('mode') === 'spheres' ? 'dice' : params.get('mode');
const lightingMode = initialMode === 'mist' ? 'mist' : 'layers';
if (lightingOptions[lightingMode].includes(lighting)) selectedLighting[lightingMode] = lighting;
showMode(['mist', 'layers', 'dice'].includes(initialMode) ? initialMode : 'still');
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
pauseDice.addEventListener('click', () => {
  dicePaused = !dicePaused;
  diceScene?.setPaused(dicePaused);
  pauseDice.setAttribute('aria-pressed', String(dicePaused));
  pauseDice.textContent = dicePaused ? pauseDice.dataset.resumeLabel : pauseDice.dataset.pauseLabel;
});

console.info('[視覺展示 3/3] 展示控制已顯示。');
