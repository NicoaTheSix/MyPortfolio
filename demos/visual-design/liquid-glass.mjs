import * as THREE from 'three';

const TRAIL_LENGTH = 28;
const LIFETIME = 1.6;
const EFFECTS = ['glass', 'ribbon', 'ripples', 'glow'];
const TONES = {
  blue: ['#9ecfff', '#e5c8e9'], pink: ['#f3b8d4', '#ffdfcb'],
  mint: ['#9ee4d1', '#c6e5ff'], lavender: ['#c4b7f3', '#edc7e8'],
  gold: ['#efd1a5', '#fff0ce'],
};

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
      uWidth: { value: 1 },
      uOpacity: { value: .4 },
      uEffect: { value: 0 },
      uTint: { value: new THREE.Color(TONES.blue[0]) },
      uTintEnd: { value: new THREE.Color(TONES.blue[1]) },
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
      uniform float uWidth;
      uniform float uOpacity;
      uniform int uEffect;
      uniform vec3 uTint;
      uniform vec3 uTintEnd;
      varying vec2 vUv;
      void main() {
        float height = 0.0;
        float coverage = 0.0;
        vec2 gradient = vec2(0.0);
        for (int index = 0; index < ${TRAIL_LENGTH}; index++) {
          vec4 samplePoint = uSamples[index];
          float age = max(0.0, uTime - samplePoint.z);
          float life = pow(max(0.0, 1.0 - age / 1.6), 2.0) * samplePoint.w;
          vec2 delta = vUv - samplePoint.xy;
          float radius = (0.035 + age * 0.02) * uWidth;
          if (uEffect == 1 || uEffect == 3) {
            delta += vec2(sin(age * 7.0 + samplePoint.y * 25.0),
              cos(age * 6.0 + samplePoint.x * 20.0)) * age * 0.009;
            radius *= uEffect == 1 ? 0.65 : 1.35;
          }
          float radiusSquared = radius * radius;
          float drop = exp(-dot(delta, delta) / radiusSquared) * life;
          if (uEffect == 2) {
            float distanceFromCenter = length(delta);
            float ringRadius = radius * (0.55 + age * 3.5);
            float ringWidth = max(0.002, radius * 0.18);
            float band = (distanceFromCenter - ringRadius) / ringWidth;
            drop = exp(-band * band) * life;
            gradient += -2.0 * band / ringWidth * delta / max(distanceFromCenter, 0.001) * drop;
          } else {
            gradient += -2.0 * delta / radiusSquared * drop;
          }
          height += drop;
          coverage = max(coverage, drop);
        }
        float lens = smoothstep(0.08, 0.9, height);
        vec2 normal = gradient / (1.0 + length(gradient) * 0.027);
        vec2 offset = normal * 0.0016 * lens;
        if (uEffect == 3) offset *= 0.12;
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
        float tintMix = 0.5 + 0.5 * sin(vUv.x * 9.0 + vUv.y * 6.0 - uTime * 0.8);
        vec3 tint = mix(uTint, uTintEnd, tintMix * 0.45);
        float mask = smoothstep(0.01, 0.65, coverage);
        color = mix(color, tint, mask * (uEffect == 3 ? 0.62 : 0.32));
        color += tint * mask * (uEffect == 3 ? 0.22 : 0.09);
        if (uEffect == 1) color += tint * rim * lens * 0.22;
        vec3 original = texture2D(uScene, vUv).rgb;
        gl_FragColor = vec4(mix(original, color, uOpacity), 1.0);
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
    setOptions({ effect, width, transparency, tone }) {
      const effectIndex = EFFECTS.indexOf(effect);
      if (effectIndex >= 0 && material.uniforms.uEffect.value !== effectIndex) {
        material.uniforms.uEffect.value = effectIndex;
        clear();
      }
      if (Number.isFinite(width)) material.uniforms.uWidth.value = Math.max(.4, Math.min(2.2, width / 100));
      if (Number.isFinite(transparency)) material.uniforms.uOpacity.value = 1 - Math.max(0, Math.min(100, transparency)) / 100;
      if (TONES[tone]) {
        material.uniforms.uTint.value.set(TONES[tone][0]);
        material.uniforms.uTintEnd.value.set(TONES[tone][1]);
      }
    },
    clear,
    move(x, y, now = performance.now() / 1000) {
      if (!enabled) return;
      const previous = trail[trail.length - 1];
      const ripples = material.uniforms.uEffect.value === 2;
      if (ripples && previous && now - previous.time < .075) return;
      if (previous && Math.hypot(x - previous.x, y - previous.y) < .004) return;
      // Interpolate short segments so the liquid remains a ribbon during a fast sweep.
      const distance = previous ? Math.hypot(x - previous.x, y - previous.y) : 0;
      const spacing = .018 * material.uniforms.uWidth.value;
      const steps = ripples ? 1 : Math.max(1, Math.min(10, Math.ceil(distance / spacing)));
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
      if (!enabled || !trail.length || material.uniforms.uOpacity.value === 0) {
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
