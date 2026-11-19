import * as THREE from 'three';

const TRAIL_LENGTH = 28;
const LIFETIME = 1.6;

export function createLiquidGlass(renderer) {
  console.info('[玻璃 0/2] Input:', import.meta.url, 'Output: dice scene render target and screen refraction.');
  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
  });
  const samples = Array.from({ length: TRAIL_LENGTH }, () => new THREE.Vector4(-10, -10, 0, 0));
  const trail = [];
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uScene: { value: target.texture },
      uSamples: { value: samples },
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uScene;
      uniform vec4 uSamples[${TRAIL_LENGTH}];
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float height = 0.0;
        vec2 gradient = vec2(0.0);
        for (int index = 0; index < ${TRAIL_LENGTH}; index++) {
          vec4 samplePoint = uSamples[index];
          float age = max(0.0, uTime - samplePoint.z);
          float life = pow(max(0.0, 1.0 - age / 1.6), 2.0) * samplePoint.w;
          vec2 delta = vUv - samplePoint.xy;
          float radius = 0.035 + age * 0.02;
          float radiusSquared = radius * radius;
          float drop = exp(-dot(delta, delta) / radiusSquared) * life;
          height += drop;
          gradient += -2.0 * delta / radiusSquared * drop;
        }
        float lens = smoothstep(0.08, 0.9, height);
        vec2 normal = gradient / (1.0 + length(gradient) * 0.027);
        vec2 offset = normal * 0.0016 * lens;
        vec2 refracted = clamp(vUv + offset, vec2(0.001), vec2(0.999));
        vec2 dispersion = offset * 0.075;
        vec3 color;
        color.r = texture2D(uScene, clamp(refracted + dispersion, 0.001, 0.999)).r;
        color.g = texture2D(uScene, refracted).g;
        color.b = texture2D(uScene, clamp(refracted - dispersion, 0.001, 0.999)).b;
        vec3 surfaceNormal = normalize(vec3(normal * 0.17, 1.0));
        vec3 light = normalize(vec3(-0.6, 0.8, 1.3));
        float highlight = pow(max(0.0, dot(reflect(-light, surfaceNormal), vec3(0.0, 0.0, 1.0))), 28.0);
        float rim = pow(1.0 - surfaceNormal.z, 2.0);
        color += vec3(0.7, 0.85, 1.0) * (highlight * 0.24 + rim * 0.28) * lens;
        color *= 1.0 - rim * lens * 0.075;
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);
  let enabled = true;
  console.info('[玻璃 1/2] Refraction, liquid highlights and trail shader ready.');

  function clear() {
    trail.length = 0;
    for (const sample of samples) sample.set(-10, -10, 0, 0);
  }

  console.info('[玻璃 2/2] Pointer trail, resize and enable controls ready.');
  return {
    resize(width, height) {
      const ratio = renderer.getPixelRatio();
      target.setSize(Math.max(1, Math.round(width * ratio)), Math.max(1, Math.round(height * ratio)));
    },
    setEnabled(value) {
      enabled = value;
      clear();
    },
    clear,
    move(x, y, now = performance.now() / 1000) {
      if (!enabled) return;
      const previous = trail[trail.length - 1];
      if (previous && Math.hypot(x - previous.x, y - previous.y) < .004) return;
      // Interpolate short segments so the liquid remains a ribbon during a fast sweep.
      const distance = previous ? Math.hypot(x - previous.x, y - previous.y) : 0;
      const steps = Math.max(1, Math.min(10, Math.ceil(distance / .018)));
      for (let index = 1; index <= steps; index++) {
        const t = index / steps;
        trail.push({
          x: previous ? previous.x + (x - previous.x) * t : x,
          y: previous ? previous.y + (y - previous.y) * t : y,
          time: now,
        });
      }
      if (trail.length > TRAIL_LENGTH) trail.splice(0, trail.length - TRAIL_LENGTH);
    },
    render(world, worldCamera, now = performance.now() / 1000) {
      while (trail.length && now - trail[0].time >= LIFETIME) trail.shift();
      if (!enabled || !trail.length) {
        renderer.setRenderTarget(null);
        renderer.render(world, worldCamera);
        return;
      }
      samples.forEach((sample, index) => {
        const point = trail[index];
        if (point) sample.set(point.x, point.y, point.time, .7);
        else sample.set(-10, -10, 0, 0);
      });
      material.uniforms.uTime.value = now;
      renderer.setRenderTarget(target);
      renderer.render(world, worldCamera);
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    },
  };
}
