// Approximate the volume of the helmet, torso, sleeves and legs in the source pose.
const forms = [
  [.51, .35, .066, .049, .9],
  [.53, .47, .102, .104, 1],
  [.42, .54, .052, .095, .65],
  [.61, .51, .037, .086, .56],
  [.47, .70, .048, .13, .69],
  [.55, .69, .053, .117, .62],
];

export function createNormalLight(canvas, source) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  const { width, height } = canvas;
  const output = context.createImageData(width, height);
  const samples = [];

  context.drawImage(source, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  context.clearRect(0, 0, width, height);

  const depth = new Float32Array(width * height);
  for (let i = 0; i < depth.length; i++) {
    if (pixels[i * 4 + 3] < 12) continue;
    const x = (i % width) / width;
    const y = Math.floor(i / width) / height;
    for (const [cx, cy, rx, ry, weight] of forms) {
      const radius = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      depth[i] = Math.max(depth[i], Math.sqrt(Math.max(0, 1 - radius)) * weight);
    }
    depth[i] += pixels[i * 4 + 1] / 300;
  }

  for (let i = width; i < depth.length - width; i++) {
    const alpha = pixels[i * 4 + 3];
    if (!alpha) continue;
    const heightAt = index => pixels[index * 4 + 3] >= 12 ? depth[index] : depth[i] - .1;
    const nx = (heightAt(i - 1) - heightAt(i + 1)) * 5.5;
    const ny = (heightAt(i - width) - heightAt(i + width)) * 5.5;
    const length = Math.hypot(nx, ny, 1);
    samples.push({ offset: i * 4, x: (i % width) / width, y: Math.floor(i / width) / height,
      nx: nx / length, ny: ny / length, nz: 1 / length, alpha: alpha / 255 });
  }

  return function draw(lightX = .32, lightY = .43) {
    for (const { offset, x, y, nx, ny, nz, alpha } of samples) {
      const dx = (lightX - x) * 2;
      const dy = (lightY - y) * 3;
      const dz = .38;
      const length = Math.hypot(dx, dy, dz);
      const diffuse = Math.max(0, (nx * dx + ny * dy + nz * dz) / length);
      const intensity = alpha * diffuse ** 2 / (1 + length ** 2 * 2);
      const cool = lightX > .52;
      output.data[offset] = cool ? 158 : 255;
      output.data[offset + 1] = cool ? 128 : 76;
      output.data[offset + 2] = cool ? 255 : 151;
      output.data[offset + 3] = intensity * 116;
    }
    context.putImageData(output, 0, 0);
  };
}
