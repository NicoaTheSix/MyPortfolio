import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createSpheres, resetSpheres, stepSpheres, FIXED_STEP } from './sphere-physics.mjs';

export async function createSphereScene(canvas, { characterUrl, onUnavailable }) {
  console.info('[球體 0/3] Input:', import.meta.url, characterUrl, 'Output:', location.href, canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 7.5, -7.5, .1, 40);
  camera.position.z = 18;
  const environmentScene = new RoomEnvironment();
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromScene(environmentScene, .04);
  scene.environment = environment.texture;
  environmentScene.dispose();
  generator.dispose();
  scene.add(new THREE.HemisphereLight(0xf7eaff, 0x321020, 2.4));
  const key = new THREE.DirectionalLight(0xff92c5, 5.5);
  key.position.set(-4, 7, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x997cff, 3.5);
  fill.position.set(6, 0, 5);
  scene.add(fill);
  const edge = new THREE.PointLight(0xff237d, 20, 16);
  edge.position.set(-2, -4, 3);
  scene.add(edge);
  const spheres = createSpheres();
  const sphereGeometry = new THREE.SphereGeometry(1, 28, 20);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: .56, roughness: .23, envMapIntensity: 1.4,
  });
  const mesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, spheres.length);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  const palette = [0xf9dbe8, 0xf66bb0, 0x8564df, 0x35233e, 0xc6c4db];
  spheres.forEach((sphere, index) => mesh.setColorAt(index, new THREE.Color(palette[sphere.tone])));
  scene.add(mesh);
  const dummy = new THREE.Object3D();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let alive = true;
  let active = false;
  let visible = true;
  let paused = false;
  let pointerId = null;
  let frame = 0;
  let previousTime = 0;
  let accumulated = 0;
  let cursorExpires = 0;
  const cursor = { x: 0, y: 0, previousX: 0, previousY: 0, active: false };
  let characterTexture;

  try {
    characterTexture = await new THREE.TextureLoader().loadAsync(characterUrl);
  } catch (error) {
    sphereGeometry.dispose();
    sphereMaterial.dispose();
    environment.dispose();
    renderer.dispose();
    throw error;
  }
  // A depth-only cutout keeps back spheres behind the existing poster character.
  const occluder = new THREE.Mesh(new THREE.PlaneGeometry(10, 15),
    new THREE.MeshBasicMaterial({ map: characterTexture, alphaTest: .3, colorWrite: false, depthWrite: true }));
  occluder.position.z = .16;
  occluder.renderOrder = -1;
  scene.add(occluder);
  console.info('[球體 1/3] 132 instanced 3D spheres, studio reflections and character depth mask ready.');

  function render() {
    spheres.forEach((sphere, index) => {
      dummy.position.set(sphere.x, sphere.y, sphere.z);
      dummy.scale.setScalar(sphere.radius);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function canRun() {
    return alive && active && visible && !paused && !document.hidden && !motion.matches;
  }

  function tick(now) {
    frame = 0;
    if (!canRun()) return;
    accumulated += Math.min((now - previousTime) / 1000 || FIXED_STEP, .045);
    previousTime = now;
    if (now > cursorExpires) cursor.active = false;
    while (accumulated >= FIXED_STEP) {
      stepSpheres(spheres, cursor);
      cursor.previousX = cursor.x;
      cursor.previousY = cursor.y;
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
    if (active) render();
  }

  function setPoint(x, y) {
    if (!canRun()) return;
    const wasActive = cursor.active;
    cursor.previousX = wasActive ? cursor.x : x;
    cursor.previousY = wasActive ? cursor.y : y;
    cursor.x = x;
    cursor.y = y;
    cursor.active = true;
    cursorExpires = performance.now() + 95;
  }

  function move(event) {
    if (event.pointerType !== 'mouse' && event.pointerId !== pointerId) return;
    const bounds = canvas.getBoundingClientRect();
    setPoint((event.clientX - bounds.left) / bounds.width * 10 - 5,
      7.5 - (event.clientY - bounds.top) / bounds.height * 15);
  }

  function release() {
    cursor.active = false;
    pointerId = null;
  }

  const down = (event) => {
    if (!canRun()) return;
    pointerId = event.pointerId;
    canvas.setPointerCapture(pointerId);
    move(event);
  };
  const keydown = (event) => {
    const offset = {
      ArrowLeft: [-.5, 0], ArrowRight: [.5, 0], ArrowUp: [0, .5], ArrowDown: [0, -.5],
    }[event.key];
    if (event.key === 'Home') {
      event.preventDefault();
      resetSpheres(spheres);
      release();
      sync();
    } else if (offset) {
      event.preventDefault();
      setPoint(Math.max(-4.5, Math.min(4.5, cursor.x + offset[0])),
        Math.max(-6.5, Math.min(3, cursor.y + offset[1])));
    }
  };
  const contextLost = (event) => {
    event.preventDefault();
    alive = false;
    sync();
    onUnavailable();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  intersection.observe(canvas);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointerleave', release);
  canvas.addEventListener('lostpointercapture', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('keydown', keydown);
  canvas.addEventListener('webglcontextlost', contextLost);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);
  resize();
  canvas.dataset.sphereCount = String(spheres.length);
  console.info('[球體 2/3] Cursor sweep, collision solver, touch drag, keyboard and reduced-motion controls ready.');
  return {
    setActive(value) {
      if (value && !alive) throw new Error('Sphere WebGL context is unavailable');
      active = value;
      release();
      sync();
    },
    setPaused(value) {
      paused = value;
      release();
      sync();
    },
    reset() {
      resetSpheres(spheres);
      release();
      sync();
    },
  };
}
