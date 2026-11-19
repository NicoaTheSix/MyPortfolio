import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const absolute = file => fileURLToPath(new URL(file, import.meta.url));
const input = absolute('./three-dice.mjs');
const physics = absolute('./dice-physics.mjs');
const output = absolute('./poster-dice.js');
console.log('[0/2] Input:', input, physics);
console.log('[0/2] Output:', output);
const { outputFiles } = await build({
  entryPoints: [input], outfile: output, bundle: true, format: 'esm',
  target: 'es2020', minify: true, legalComments: 'eof', write: false,
});
console.log('[1/2] Three.js dice and rigid-body physics bundled.');
await writeFile(output, outputFiles[0].text.replace(/[ \t]+(?=\r?$)/gm, ''));
console.log('[2/2] Dice mode ready for static hosting.');
