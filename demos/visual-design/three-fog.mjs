import {
  Color, Mesh, OrthographicCamera, PlaneGeometry,
  Scene, ShaderMaterial, WebGLRenderer
} from 'three';

const noise = `
  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float valueNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 w = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1, 0)), w.x),
               mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), w.x), w.y);
  }
  float wisps(vec2 p, float time) {
    vec2 bend = vec2(valueNoise(p * .58 + vec2(time * .09, 9.0)),
                     valueNoise(p * .40 + vec2(13.0, -time * .07)));
    vec2 q = p + (bend - .5) * 2.1 - vec2(time * .24, time * .035);
    return .57 * valueNoise(q) + .28 * valueNoise(q * 2.04 + 13.1)
         + .15 * valueNoise(q * 4.11 - 8.2);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function createPosterFog(canvas, { foreground = false, onUnavailable } = {}) {
  console.info('[Three.js 霧氣 0/2] Input:', location.href, 'Output:', canvas.className, '透明 WebGL 畫布');
  const renderer = new WebGLRenderer({ canvas, alpha: true, powerPreference: 'low-power' });
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, .1, 3);
  camera.position.z = 1;
  const uniforms = {
    time: { value: foreground ? 14 : 0 },
    nearColor: { value: new Color(foreground ? 0xe08fb6 : 0xc16597) },
    farColor: { value: new Color(0x73406d) },
    amplitude: { value: foreground ? .29 : .47 },
    depth: { value: foreground ? 3.5 : 8.5 },
    edge: { value: foreground ? .29 : .13 }
  };
  const material = new ShaderMaterial({
    uniforms, vertexShader, transparent: true, depthWrite: false, toneMapped: false,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time, amplitude, depth, edge;
      uniform vec3 nearColor, farColor;
      ${noise}
      void main() {
        float y = 1.0 - vUv.y;
        float band = smoothstep(0.0, edge, y) * (1.0 - smoothstep(.56, 1.0, y));
        vec2 p = vec2(vUv.x * 3.6 + 5.0, y * depth);
        float density = wisps(p, time);
        float alpha = amplitude * band * smoothstep(.29, .78, density);
        gl_FragColor = vec4(mix(farColor, nearColor, smoothstep(.28, .82, density)), alpha);
        #include <colorspace_fragment>
      }
    `
  });
  const geometry = new PlaneGeometry(2, 2);
  scene.add(new Mesh(geometry, material));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  let frame = 0;
  let lastFrame = null;
  let disposed = false;
  let width = 0, height = 0;

  function draw() {
    const { clientWidth, clientHeight } = canvas;
    if (!clientWidth || !clientHeight) return;
    const scale = Math.min(1, 448 / clientWidth);
    const nextWidth = Math.max(1, Math.round(clientWidth * scale));
    const nextHeight = Math.max(1, Math.round(clientHeight * scale));
    if (width !== nextWidth || height !== nextHeight) {
      width = nextWidth;
      height = nextHeight;
      renderer.setSize(width, height, false);
    }
    renderer.render(scene, camera);
  }

  function step(timestamp) {
    const delta = lastFrame === null ? 0 : timestamp - lastFrame;
    if (lastFrame === null || delta >= 1000 / 25) {
      uniforms.time.value += Math.min(delta, 100) * (foreground ? .00145 : .001);
      lastFrame = timestamp;
      draw();
    }
    frame = requestAnimationFrame(step);
  }

  function update() {
    cancelAnimationFrame(frame);
    lastFrame = null;
    if (!active || document.hidden) return;
    if (motion.matches) draw();
    else frame = requestAnimationFrame(step);
  }

  const observer = new ResizeObserver(() => {
    if (active && !document.hidden && motion.matches) draw();
  });
  observer.observe(canvas);
  motion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  canvas.addEventListener('webglcontextlost', () => {
    disposed = true;
    active = false;
    cancelAnimationFrame(frame);
    observer.disconnect();
    motion.removeEventListener('change', update);
    document.removeEventListener('visibilitychange', update);
    material.dispose();
    geometry.dispose();
    renderer.dispose();
    onUnavailable?.();
  }, { once: true });
  console.info('[Three.js 霧氣 1/2] Wisps shader and transparent canvas ready.');
  return { setActive(nextActive) {
    if (disposed || active === nextActive) return;
    active = nextActive;
    if (active) console.info('[Three.js 霧氣 2/2] Poster layer active.');
    update();
  } };
}
