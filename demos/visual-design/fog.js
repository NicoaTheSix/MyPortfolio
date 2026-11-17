function smooth(value) {
  return value * value * (3 - 2 * value);
}

function gridValue(x, y) {
  const seed = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  const hash = Math.imul(seed ^ (seed >>> 13), 1274126177);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967295;
}

function noise(x, y) {
  const left = Math.floor(x);
  const top = Math.floor(y);
  const u = smooth(x - left);
  const v = smooth(y - top);
  const upper = gridValue(left, top) * (1 - u) + gridValue(left + 1, top) * u;
  const lower = gridValue(left, top + 1) * (1 - u) + gridValue(left + 1, top + 1) * u;
  return upper * (1 - v) + lower * v;
}

function fogDensity(x, y, time) {
  const warp = noise(x * .74 + time * .07, y * .49 + 12) - .5;
  const alongWind = x - time * .28 + 8;
  const acrossWind = y + warp * 2.2 + time * .04;
  return noise(alongWind, acrossWind) * .58
    + noise(alongWind * 2 + 11, acrossWind * 2 + 7) * .28
    + noise(alongWind * 4 + 3, acrossWind * 4 + 19) * .14;
}

export function createFog(canvas, { foreground = false } = {}) {
  const context = canvas.getContext('2d');
  if (!context) return null;

  const { width, height } = canvas;
  const frame = context.createImageData(width, height);
  const layer = foreground
    ? { peakAlpha: 72, phase: 14, speed: 1.45, depth: 4.1, leadingFade: .28, trailingFade: .36 }
    : { peakAlpha: 120, phase: 0, speed: 1, depth: 8.5, leadingFade: .15, trailingFade: .55 };
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false;
  let scheduled = 0;
  let elapsed = 0;
  let lastFrame = 0;

  for (let offset = 0; offset < frame.data.length; offset += 4) {
    frame.data[offset] = 215;
    frame.data[offset + 1] = 112;
    frame.data[offset + 2] = 156;
  }

  function draw() {
    const time = layer.phase + elapsed * layer.speed;
    for (let row = 0; row < height; row++) {
      const v = row / (height - 1);
      const fadeIn = smooth(Math.min(v / layer.leadingFade, 1));
      const fadeOut = smooth(Math.min((1 - v) / layer.trailingFade, 1));
      for (let column = 0; column < width; column++) {
        const u = column / (width - 1);
        const density = fogDensity(u * 3.1, v * layer.depth, time);
        const opacity = smooth(Math.max(0, Math.min(1, (density - .33) / .52)));
        frame.data[(row * width + column) * 4 + 3] = layer.peakAlpha * opacity * fadeIn * fadeOut;
      }
    }
    context.putImageData(frame, 0, 0);
  }

  function tick(timestamp) {
    if (!lastFrame || timestamp - lastFrame >= 1000 / 24) {
      if (lastFrame) elapsed += Math.min(timestamp - lastFrame, 100) / 1000;
      lastFrame = timestamp;
      draw();
    }
    scheduled = requestAnimationFrame(tick);
  }

  function update() {
    cancelAnimationFrame(scheduled);
    lastFrame = 0;
    if (!active || document.hidden) return;
    if (motion.matches) draw();
    else scheduled = requestAnimationFrame(tick);
  }

  motion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  return {
    setActive(nextActive) {
      active = nextActive;
      update();
    }
  };
}
