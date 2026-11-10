import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const absolute = file => fileURLToPath(new URL(file, import.meta.url));
const entry = absolute('./studio-space.mjs');
const model = absolute('./assets/3d/studio-desk/nicoa-pixel-desk.glb');
const output = absolute('./studio-space.js');
console.log('[0/2] Inputs:', entry, model);
console.log('[0/2] Output:', output);
console.log('[1/2] Bundling the 3D viewer and model for both homepage languages.');
const { outputFiles } = await build({
  entryPoints: [entry],
  outfile: output,
  bundle: true,
  format: 'iife',
  target: 'es2020',
  loader: { '.glb': 'binary' },
  minify: true,
  legalComments: 'inline',
  write: false
});
await writeFile(output, outputFiles[0].text.replace(/[ \t]+(?=\r?$)/gm, ''));
console.log('[2/2] Studio bundle written. Open index.html directly or run the preview server.');
