import { BufferGeometry, Float32BufferAttribute, HemisphereLight, Points, ShaderMaterial, Vector3, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import model from './assets/3d/studio-desk/nicoa-pixel-desk.glb';

function createTwinkles() {
  const columns = 9;
  const rows = 7;
  const seeds = [];
  const styles = [];
  let seed = 9387;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const depth = random();
      seeds.push([(column + .18 + random() * .64) / columns, (row + .18 + random() * .64) / rows, 4.1 + depth * 4.3]);
      styles.push(3.3 + (1 - depth) * 4.1, random() * 6.283, .85 + random() * 1.35);
    }
  }
  const geometry = new BufferGeometry();
  const positions = new Float32BufferAttribute(new Float32Array(seeds.length * 3), 3);
  geometry.setAttribute('position', positions);
  geometry.setAttribute('sparkStyle', new Float32BufferAttribute(styles, 3));
  const uniforms = { time: { value: 0 }, pixelRatio: { value: 1 } };
  const material = new ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      attribute vec3 sparkStyle;
      uniform float pixelRatio;
      varying vec2 pulseStyle;
      void main() {
        pulseStyle = sparkStyle.yz;
        gl_PointSize = sparkStyle.x * pixelRatio;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 pulseStyle;
      void main() {
        vec2 point = abs(gl_PointCoord - 0.5);
        float core = 1.0 - smoothstep(0.06, 0.4, length(point));
        float arms = (1.0 - smoothstep(0.035, 0.13, min(point.x, point.y)))
          * (1.0 - smoothstep(0.10, 0.49, max(point.x, point.y)));
        float pulse = pow(0.5 + 0.5 * sin(time * pulseStyle.y + pulseStyle.x), 3.0);
        gl_FragColor = vec4(vec3(1.0), max(core, arms * pulse) * (0.11 + pulse * 0.85));
      }
    `
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  const point = new Vector3();
  const layout = (camera, ratio) => {
    const width = camera.right - camera.left;
    const height = camera.top - camera.bottom;
    seeds.forEach(([x, y, distance], i) => {
      point.set(camera.left + width * x, camera.top - height * y, -distance);
      camera.localToWorld(point);
      positions.setXYZ(i, point.x, point.y, point.z);
    });
    positions.needsUpdate = true;
    uniforms.pixelRatio.value = ratio;
  };
  return { points, uniforms, layout };
}

const backdrop = document.querySelector('.studio-fixed-backdrop');
if (backdrop) {
  const canvas = backdrop.querySelector('canvas');
  const fallback = backdrop.querySelector('img');
  const source = document.currentScript?.src || document.URL;
  console.info('[3D 0/3] Input:', document.URL, source, fallback.src);
  console.info('[3D 0/3] Output:', document.URL.split('#')[0] + '#studio-background');

  let paint;
  let frame = 0;
  let scrollDistance = 0;
  let dirty = true;
  let elapsed = 0;
  let lastTick = null;
  let lastPaint = -Infinity;
  const draw = now => {
    frame = 0;
    const playing = !document.hidden && !document.body.classList.contains('motion-paused');
    if (playing && lastTick !== null) elapsed += (now - lastTick) / 1000;
    lastTick = playing ? now : null;
    if (dirty || (playing && now - lastPaint >= 1000 / 30)) {
      if (playing) scrollDistance = window.scrollY / Math.max(1, window.innerHeight);
      const float = (speed, amplitude) => Math.sin(scrollDistance * speed) * amplitude;
      if (dirty) {
        backdrop.style.setProperty('--space-caption-shift', float(.94, 62) + 'px');
        backdrop.style.setProperty('--space-caption-depth', float(1.51, 77) + 'px');
      }
      paint?.(float, elapsed);
      lastPaint = now;
      dirty = false;
    }
    if (playing && backdrop.dataset.renderer === 'webgl') frame = requestAnimationFrame(draw);
  };
  const schedule = () => {
    dirty = true;
    if (!frame && !document.hidden) frame = requestAnimationFrame(draw);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('visibilitychange', () => {
    lastTick = null;
    schedule();
  });
  new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  schedule();
  console.info('[3D 1/3] Independent text and particle layers are ready.');

  async function attachModel() {
    const { scene, cameras } = await new GLTFLoader().parseAsync(model.buffer, '');
    const camera = cameras[0];
    const findProp = prefix => scene.children.find(obj => obj.name.startsWith(prefix));
    const floating = [
      { object: findProp('07'), rate: 1.14, lift: .25, yaw: .52 },
      { object: findProp('08'), rate: -1.47, lift: .20, yaw: -.64 },
      { object: findProp('09'), rate: .86, lift: .38, yaw: .77 },
      { object: findProp('10'), rate: -1.33, lift: .13, yaw: -.52 },
      { object: findProp('11'), rate: 1.62, lift: .17, yaw: .61 }
    ];
    if (!camera?.isOrthographicCamera || floating.some(prop => !prop.object)) {
      throw new Error('The studio model is missing its camera or floating props.');
    }
    const leftBooks = [
      { source: '09', name: 'Left open book', anchor: [.29, .26], scale: .85, tilt: -.41, rate: -1.04, lift: .23, yaw: -.58 },
      { source: '10', name: 'Left thin booklet', anchor: [.78, .49], scale: 1.23, tilt: .38, rate: 1.67, lift: .22, yaw: .69 },
      { source: '11', name: 'Left thick hardcover', anchor: [.43, .74], scale: .95, tilt: -.27, rate: .72, lift: .26, yaw: -.56 }
    ].map(({ source, name, scale, tilt, ...motion }) => {
      const object = findProp(source).clone();
      object.name = name;
      object.scale.multiplyScalar(scale);
      object.rotateZ(tilt);
      scene.add(object);
      return { object, ...motion };
    });
    floating.push(...leftBooks);
    for (const prop of floating) {
      prop.rest = prop.object.position.clone();
      prop.rotation = prop.object.rotation.clone();
    }
    for (const object of scene.children) {
      if (object.name.startsWith('Environment')) object.visible = false;
    }
    scene.add(new HemisphereLight(0xffffff, 0x333333, .85));
    console.info('[3D 2/3] Loaded the desk, two stars and six independently positioned books.');

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    const twinkles = createTwinkles();
    scene.add(twinkles.points);
    const heightRange = camera.top - camera.bottom;
    const deskLeft = camera.left;
    const deskRight = camera.right;
    const deskTop = camera.top;
    const bookDistance = camera.position.length();
    let lastWidth = 0;
    let lastHeight = 0;
    let lastRatio = 0;
    paint = (float, elapsed) => {
      if (renderer.getContext().isContextLost()) return;
      const { clientWidth: width, clientHeight: height } = canvas;
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      if (width !== lastWidth || height !== lastHeight || ratio !== lastRatio) {
        lastWidth = width;
        lastHeight = height;
        lastRatio = ratio;
        renderer.setPixelRatio(ratio);
        renderer.setSize(width, height, false);
        // Extend the frustum to the viewport while keeping the original desk projection.
        const canvasRect = canvas.getBoundingClientRect();
        const desk = fallback.getBoundingClientRect();
        const unit = heightRange / desk.height;
        camera.left = deskRight + (canvasRect.left - desk.right) * unit;
        camera.right = deskRight + (canvasRect.right - desk.right) * unit;
        camera.top = deskTop + (desk.top - canvasRect.top) * unit;
        camera.bottom = deskTop + (desk.top - canvasRect.bottom) * unit;
        camera.updateProjectionMatrix();
        const stageLeft = deskRight + (fallback.parentElement.getBoundingClientRect().left - desk.right) * unit;
        const leftRoom = deskLeft - stageLeft;
        for (const { object, rest, anchor: [x, y] } of leftBooks) {
          object.visible = leftRoom > .65;
          rest.set(stageLeft + leftRoom * x, deskTop - heightRange * y, -bookDistance);
          camera.localToWorld(rest);
        }
        twinkles.layout(camera, ratio);
      }
      for (const { object, rest, rotation, rate, lift, yaw } of floating) {
        object.position.set(
          rest.x + float(rate * .77, lift * 1.20),
          rest.y + float(rate, lift),
          rest.z + float(rate * 1.24, lift * .88)
        );
        object.rotation.set(rotation.x + float(rate, .24), rotation.y + float(rate * .81, yaw), rotation.z);
      }
      twinkles.uniforms.time.value = elapsed;
      renderer.render(scene, camera);
      backdrop.dataset.renderer = 'webgl';
    };
    canvas.addEventListener('webglcontextlost', () => { delete backdrop.dataset.renderer; });
    canvas.addEventListener('webglcontextrestored', schedule);
    schedule();
    console.info('[3D 3/3] Scroll motion and reduced-motion controls are ready.');
  }

  attachModel().catch(error => console.info('[3D 3/3] Using the static render.', error.message));
}
