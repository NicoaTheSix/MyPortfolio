// Coordinates trace the existing artwork in the 2× inspection crop.
const posterSize = [640, 960];
const crop = { x: 212, y: 290, width: 205, height: 345 };
const regions = [
  {
    name: 'shoulder-back',
    path: 'M153 221 Q193 213 233 218 Q276 207 322 195 Q376 198 384 250 L390 309 Q375 360 346 411 L322 472 Q275 509 198 497 L146 486 L134 340 Z',
    form: [241, 335, 156, 141, .38, .76], depth: 0, gloss: .08, exponent: 11
  },
  {
    name: 'near-arm',
    path: 'M219 238 Q190 239 170 253 Q123 266 99 318 Q86 355 80 399 Q66 450 53 485 L14 602 L12 646 Q26 679 65 680 L94 594 Q130 552 153 508 Q175 480 179 447 Q193 410 214 387 Q228 367 239 342 Q248 298 219 238 Z',
    form: [122, 428, 57, 212, .40, .25], depth: 15, gloss: .10, exponent: 13
  },
  {
    name: 'helmet',
    path: 'M138 21 Q224 -9 282 32 Q321 59 322 106 Q323 152 292 176 L274 194 L154 199 Q148 184 150 168 L139 101 Q131 52 138 21 Z',
    form: [230, 103, 86, 84, .48, 1.1], depth: 22, gloss: .34, exponent: 28
  },
  {
    name: 'standing-collar',
    path: 'M144 185 Q178 182 198 188 Q260 189 305 166 Q316 160 322 146 Q342 139 333 163 L322 203 Q320 234 287 247 Q240 260 200 245 Q170 235 158 241 Q169 218 144 185 Z',
    form: [240, 209, 93, 47, .48, .55], depth: 33, gloss: .15, exponent: 16
  }
];

const clamp = value => Math.max(0, Math.min(1, value));
const blend = (start, end, weight) => start + (end - start) * weight;

function surfaceNormal(part, x, y) {
  const [cx, cy, rx, ry, elevation, gradient] = part.form;
  // The sleeve axis follows the diagonal from shoulder to wrist.
  const cxAtY = part.name === 'near-arm' ? cx - .32 * (y - cy) : cx;
  const dx = Math.max(-1.15, Math.min(1.15, (x - cxAtY) / rx));
  const dy = Math.max(-1.12, Math.min(1.12, (y - cy) / ry));
  const nx = dx * (.82 + gradient * .28);
  const ny = dy * (.55 + elevation) + (part.name === 'standing-collar' ? -.20 : 0);
  const nz = Math.max(.42, 1 - (dx ** 2 + dy ** 2) * .29);
  const length = Math.hypot(nx, ny, nz);
  return [nx / length, ny / length, nz / length];
}

function maskedShade(part, column, row, shiftX, shiftY) {
  // Three samples soften a mask-projected shadow and keep it within its receiver.
  let total = 0;
  for (let tap = -1; tap <= 1; tap++) {
    const x = column - shiftX + tap * 2;
    const y = row - shiftY + tap;
    if (x >= 0 && x < crop.width && y >= 0 && y < crop.height) {
      total += part.mask[y * crop.width + x];
    }
  }
  return total / (255 * 3);
}

export function createLayeredLight(canvas, image) {
  console.info('[分層打光 0/3] Input:', image.currentSrc, 'Output:', location.href, canvas.className);
  const { x, y, width, height } = crop;
  canvas.width = width;
  canvas.height = height;
  canvas.style.left = `${x / posterSize[0] * 100}%`;
  canvas.style.top = `${y / posterSize[1] * 100}%`;
  canvas.style.width = `${width / posterSize[0] * 100}%`;
  canvas.style.height = `${height / posterSize[1] * 100}%`;
  const context = canvas.getContext('2d');
  const scratch = document.createElement('canvas');
  scratch.width = width;
  scratch.height = height;
  const edit = scratch.getContext('2d', { willReadFrequently: true });
  if (!context || !edit) return null;
  const sx = image.naturalWidth / posterSize[0];
  const sy = image.naturalHeight / posterSize[1];
  edit.drawImage(image, x * sx, y * sy, width * sx, height * sy, 0, 0, width, height);
  const source = edit.getImageData(0, 0, width, height).data;

  const parts = regions.map(region => {
    edit.clearRect(0, 0, width, height);
    edit.save();
    edit.scale(.5, .5);
    edit.fill(new Path2D(region.path));
    edit.restore();
    const mask = new Uint8Array(width * height);
    const pixels = edit.getImageData(0, 0, width, height).data;
    for (let i = 0; i < mask.length; i++) mask[i] = pixels[i * 4 + 3];
    return { ...region, mask };
  });
  const [back, arm, helmet, collar] = parts;
  console.info('[分層打光 1/3] Four masks traced from the source pose.');

  const samples = [];
  for (let i = 0; i < width * height; i++) {
    const offset = i * 4;
    if (!source[offset + 3]) continue;
    const column = i % width;
    const row = Math.floor(i / width);
    const pointX = column * 2 + 1;
    const pointY = row * 2 + 1;
    let remaining = 1;
    const surfaces = [];
    for (let index = parts.length - 1; index >= 0; index--) {
      const part = parts[index];
      const weight = remaining * part.mask[i] / 255;
      if (weight < .002) continue;
      const [nx, ny, nz] = surfaceNormal(part, pointX, pointY);
      surfaces.push({ part, weight, nx, ny, nz });
      remaining -= weight;
    }
    if (!surfaces.length) continue;
    const alpha = 1 - remaining;
    // Fine texture modulates the added light, independently of the authored shape.
    const detail = .68 + source[offset + 1] / 420;
    samples.push({ offset, column, row, pointX, pointY, surfaces, alpha, detail });
  }
  const output = context.createImageData(width, height);
  console.info('[分層打光 2/3] Surface normals, material responses and occluders ready.');
  let drawn = false;

  return function draw(lightX = .31, lightY = .39) {
    const lx = (lightX * posterSize[0] - x) * 2;
    const ly = (lightY * posterSize[1] - y) * 2;
    const cool = clamp((lightX - .37) / .28);
    const red = blend(1, .67, cool);
    const green = blend(.41, .59, cool);
    const blue = blend(.70, 1, cool);
    const offsetX = Math.round(Math.max(-14, Math.min(14, (205 - lx) * .049)));
    const offsetY = Math.round(Math.max(-12, Math.min(16, (213 - ly) * .056)));

    for (const { offset, column, row, pointX, pointY, surfaces, alpha, detail } of samples) {
      let tint = 0;
      let shade = 0;
      const dx = lx - pointX;
      const dy = ly - pointY;
      for (const { part, weight, nx, ny, nz } of surfaces) {
        const dz = 166 - part.depth;
        const length = Math.hypot(dx, dy, dz);
        const lz = dz / length;
        const normalDotLight = (nx * dx + ny * dy + nz * dz) / length;
        const diffuse = Math.max(0, normalDotLight);
        const halfDot = Math.max(0, (normalDotLight + nz) / Math.sqrt(2 + 2 * lz));
        const reach = 1 / (1 + (length / 292) ** 2);
        let shadow = 0;
        if (part === back) {
          shadow = Math.max(
            .68 * maskedShade(collar, column, row, offsetX, offsetY + 7),
            .56 * maskedShade(arm, column, row, Math.round(offsetX * .75), Math.round(offsetY * .66) + 4)
          );
        } else if (part === collar) {
          shadow = .51 * maskedShade(helmet, column, row, offsetX, offsetY + 6);
        }
        const light = reach * (1 - shadow);
        const specular = part.gloss * halfDot ** part.exponent;
        shade += weight * (.88 + .27 * light * diffuse - .23 * shadow);
        tint += weight * (97 * diffuse ** 1.5 + 120 * specular) * light * detail;
      }
      output.data[offset] = (source[offset] * shade + tint * red) / alpha;
      output.data[offset + 1] = (source[offset + 1] * shade + tint * green) / alpha;
      output.data[offset + 2] = (source[offset + 2] * shade + tint * blue) / alpha;
      output.data[offset + 3] = source[offset + 3] * alpha;
    }
    context.putImageData(output, 0, 0);
    if (!drawn) {
      drawn = true;
      console.info('[分層打光 3/3] First relit frame ready.');
    }
  };
}
