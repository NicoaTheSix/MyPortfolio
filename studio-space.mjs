import { HemisphereLight, WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import model from './assets/3d/studio-desk/nicoa-pixel-desk.glb';

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
  const draw = () => {
    frame = 0;
    if (!document.body.classList.contains('motion-paused')) {
      scrollDistance = window.scrollY / Math.max(1, window.innerHeight);
    }
    const float = (speed, amplitude) => Math.sin(scrollDistance * speed) * amplitude;
    backdrop.style.setProperty('--space-caption-shift', float(.94, 48) + 'px');
    backdrop.style.setProperty('--space-caption-depth', float(1.51, 61) + 'px');
    backdrop.style.setProperty('--space-particle-shift', float(.62, 29) + 'px');
    paint?.(float);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  new MutationObserver(schedule).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  schedule();
  console.info('[3D 1/3] Independent text and particle layers are ready.');

  async function attachModel() {
    const { scene, cameras } = await new GLTFLoader().parseAsync(model.buffer, '');
    const camera = cameras[0];
    const findProp = prefix => scene.children.find(obj => obj.name.startsWith(prefix));
    const floating = [
      { object: findProp('07'), rate: 1.14, lift: .17, yaw: .43 },
      { object: findProp('08'), rate: -1.47, lift: .12, yaw: -.58 },
      { object: findProp('09'), rate: .86, lift: .29, yaw: .69 },
      { object: findProp('10'), rate: -1.33, lift: .10, yaw: -.46 },
      { object: findProp('11'), rate: 1.62, lift: .12, yaw: .52 }
    ];
    if (!camera?.isOrthographicCamera || floating.some(prop => !prop.object)) {
      throw new Error('The studio model is missing its camera or floating props.');
    }
    const leftBooks = [
      { source: '09', name: 'Left open book', anchor: [.29, .26], scale: .85, tilt: -.41, rate: -1.04, lift: .13, yaw: -.48 },
      { source: '10', name: 'Left thin booklet', anchor: [.78, .49], scale: 1.23, tilt: .38, rate: 1.67, lift: .12, yaw: .57 },
      { source: '11', name: 'Left thick hardcover', anchor: [.43, .74], scale: .95, tilt: -.27, rate: .72, lift: .15, yaw: -.44 }
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
    const heightRange = camera.top - camera.bottom;
    const deskLeft = camera.left;
    const bookDistance = camera.position.length();
    let lastWidth = 0;
    let lastHeight = 0;
    let lastRatio = 0;
    paint = float => {
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
        // Widen the frame on the left without shifting the original desk composition.
        camera.left = camera.right - heightRange * width / height;
        camera.updateProjectionMatrix();
        const leftRoom = deskLeft - camera.left;
        for (const { object, rest, anchor: [x, y] } of leftBooks) {
          object.visible = leftRoom > .65;
          rest.set(camera.left + leftRoom * x, camera.top - heightRange * y, -bookDistance);
          camera.localToWorld(rest);
        }
      }
      for (const { object, rest, rotation, rate, lift, yaw } of floating) {
        object.position.set(
          rest.x + float(rate * .77, lift * .86),
          rest.y + float(rate, lift),
          rest.z + float(rate * 1.24, lift)
        );
        object.rotation.set(rotation.x + float(rate, .17), rotation.y + float(rate * .81, yaw), rotation.z);
      }
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
