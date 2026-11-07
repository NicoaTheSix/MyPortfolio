// Shared markup references the approved artwork; it never recreates the letters.
export function brandHead(href){
  return `<link rel="icon" href="${href('assets/brand/nicoa-lab-symbol-32.png')}" type="image/png" sizes="32x32"><link rel="icon" href="${href('assets/brand/nicoa-lab-symbol-64.png')}" type="image/png" sizes="64x64"><link rel="apple-touch-icon" href="${href('assets/brand/nicoa-lab-symbol-180.png')}" sizes="180x180"><link rel="stylesheet" href="${href('brand.css')}?v=20261107-logo">`;
}
export function brandLogo(href,responsive=true){
  return `<picture class="brand-logo">${responsive?`<source media="(max-width:720px)" srcset="${href('assets/brand/nicoa-lab-symbol-128.webp')} 1x, ${href('assets/brand/nicoa-lab-symbol-256.webp')} 2x" width="128" height="128">`:''}<img src="${href('assets/brand/nicoa-lab-wordmark-360.webp')}" srcset="${href('assets/brand/nicoa-lab-wordmark-360.webp')} 1x, ${href('assets/brand/nicoa-lab-wordmark-720.webp')} 2x" alt="Nicoa'Lab" width="360" height="120"></picture>`;
}
