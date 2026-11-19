import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createDiceWorld, DICE_TYPES, FIXED_STEP } from './dice-physics.mjs';
import { createLiquidGlass } from './liquid-glass.mjs';

function faceTexture(number, background, ink) {
  const face = document.createElement('canvas');
  face.width = face.height = 128;
  const context = face.getContext('2d');
  context.fillStyle = background;
  context.fillRect(0, 0, 128, 128);
  context.fillStyle = ink;
  const patterns = [
    [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]],
    [[-1, -1], [1, -1], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
    [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
  ];
  for (const [x, y] of patterns[number - 1]) {
    context.beginPath();
    context.arc(64 + x * 29, 64 + y * 29, 9, 0, Math.PI * 2);
    context.fill();
  }
  const texture = new THREE.CanvasTexture(face);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export async function createDiceScene(canvas, { onUnavailable }) {
  console.info('[骰子 0/3] Input:', import.meta.url, 'Output:', location.href, canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0xd7d9df, 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, .1, 30);
  camera.position.z = 16;
  const environmentScene = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  scene.environment = generator.fromScene(environmentScene, .04).texture;
  environmentScene.dispose();
  generator.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa6a2b2, 2.3));
  const key = new THREE.DirectionalLight(0xfff4e6, 3.8);
  key.position.set(-4, 7, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xd4dcff, 1.8);
  fill.position.set(5, -3, 5);
  scene.add(fill);
  const simulation = createDiceWorld();
  const geometry = new RoundedBoxGeometry(1, 1, 1, 3, .09);
  const colors = {
    jelly: { background: '#c90022', ink: '#ffffff' },
    white: { background: '#fbfaf6', ink: '#222634' },
    black: { background: '#141720', ink: '#ffffff' },
  };
  const groups = DICE_TYPES.map(type => {
    const { background, ink } = colors[type];
    const materials = [1, 6, 2, 5, 3, 4].map(number => {
      const map = faceTexture(number, background, ink);
      if (type === 'jelly') {
        return new THREE.MeshPhysicalMaterial({
          map, transmissionMap: faceTexture(number, '#ffffff', '#000000'),
          transmission: .76, thickness: .75, ior: 1.46, roughness: .065,
          clearcoat: 1, clearcoatRoughness: .08, metalness: 0,
          envMapIntensity: .9, attenuationColor: new THREE.Color('#ef1230'), attenuationDistance: .85,
        });
      }
      return new THREE.MeshStandardMaterial({
        map, metalness: .03, roughness: type === 'black' ? .27 : .31, envMapIntensity: .7,
      });
    });
    const dice = simulation.dice.filter(die => die.type === type);
    const mesh = new THREE.InstancedMesh(geometry, materials, dice.length);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return { type, dice, mesh };
  });
  const dummy = new THREE.Object3D();
  const glass = createLiquidGlass(renderer);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let alive = true;
  let active = false;
  let visible = true;
  let paused = false;
  let glassEnabled = true;
  let pointerId = null;
  let frame = 0;
  let previousTime = 0;
  let accumulated = 0;
  const cursor = { x: 0, y: 0, previousX: 0, previousY: 0, active: false };
  console.info('[骰子 1/3] 32 translucent red jelly dice, 32 white rigid dice, 32 black rigid dice and rounded boundary ready.');

  function render() {
    for (const { type, dice, mesh } of groups) {
      dice.forEach(({ body, size, deformation, compressionAxis }, index) => {
        dummy.position.copy(body.position);
        dummy.quaternion.copy(body.quaternion);
        if (type === 'jelly') {
          const compressed = 1 - deformation;
          const bulge = 1 / Math.sqrt(compressed);
          dummy.scale.set(size * bulge, size * bulge, size * bulge);
          dummy.scale.setComponent(compressionAxis, size * compressed);
        } else {
          dummy.scale.setScalar(size);
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    glass.render(scene, camera);
  }
  function canRun() {
    return alive && active && visible && (!paused || glassEnabled) && !document.hidden && !motion.matches;
  }
  function tick(now) {
    frame = 0;
    if (!canRun()) return;
    accumulated += Math.min((now - previousTime) / 1000 || FIXED_STEP, .05);
    previousTime = now;
    while (accumulated >= FIXED_STEP) {
      if (!paused) simulation.step();
      accumulated -= FIXED_STEP;
    }
    render();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = performance.now();
    accumulated = 0;
    if (active && alive) render();
    if (canRun()) frame = requestAnimationFrame(tick);
  }
  function resize() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height || !alive) return;
    renderer.setSize(bounds.width, bounds.height, false);
    glass.resize(bounds.width, bounds.height);
    if (active) render();
  }
  function setPoint(x, y) {
    if (!canRun()) return;
    cursor.previousX = cursor.active ? cursor.x : x;
    cursor.previousY = cursor.active ? cursor.y : y;
    cursor.x = x;
    cursor.y = y;
    cursor.active = true;
    if (!paused) simulation.push(cursor);
    glass.move((x + 5) / 10, (y + 5) / 10);
  }
  function move(event) {
    if (event.pointerType !== 'mouse' && event.pointerId !== pointerId) return;
    const bounds = canvas.getBoundingClientRect();
    setPoint((event.clientX - bounds.left) / bounds.width * 10 - 5,
      5 - (event.clientY - bounds.top) / bounds.height * 10);
  }
  function release() {
    cursor.active = false;
    pointerId = null;
  }
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerdown', event => {
    if (!canRun()) return;
    pointerId = event.pointerId;
    canvas.setPointerCapture(pointerId);
    move(event);
  });
  for (const name of ['pointerup', 'pointerleave', 'lostpointercapture', 'pointercancel']) {
    canvas.addEventListener(name, release);
  }
  canvas.addEventListener('keydown', event => {
    const offset = {
      ArrowLeft: [-.6, 0], ArrowRight: [.6, 0], ArrowUp: [0, .6], ArrowDown: [0, -.6],
    }[event.key];
    if (!offset || !canRun()) return;
    event.preventDefault();
    if (!cursor.active) cursor.active = true;
    setPoint(Math.max(-4.3, Math.min(4.3, cursor.x + offset[0])),
      Math.max(-4.3, Math.min(4.3, cursor.y + offset[1])));
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    alive = false;
    sync();
    onUnavailable();
  });
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(canvas);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', () => {
    glass.clear();
    sync();
  });
  resize();
  canvas.dataset.diceCount = String(simulation.dice.length);
  console.info('[骰子 2/3] Mouse impulse, touch drag, damping, keyboard and pause controls ready.');
  return {
    setActive(value) {
      if (value && !alive) throw new Error('Dice WebGL context is unavailable');
      active = value;
      if (!active) glass.clear();
      release();
      sync();
    },
    setPaused(value) {
      paused = value;
      release();
      sync();
    },
    setGlassEnabled(value) {
      glassEnabled = value;
      glass.setEnabled(value);
      canvas.dataset.glassEnabled = String(value);
      sync();
    },
  };
}
