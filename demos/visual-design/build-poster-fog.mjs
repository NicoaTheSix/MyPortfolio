import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const input = fileURLToPath(new URL('./three-fog.mjs', import.meta.url));
const output = fileURLToPath(new URL('./poster-fog.js', import.meta.url));
console.log('[0/2] Input:', input, 'Output:', output);
const { outputFiles } = await build({
  entryPoints: [input],
  outfile: output,
  bundle: true,
  format: 'esm',
  target: 'es2020',
  minify: true,
  legalComments: 'eof',
  write: false
});
console.log('[1/2] Three.js poster shader bundled.');
await writeFile(output, outputFiles[0].text.replace(/[ \t]+(?=\r?$)/gm, ''));
console.log('[2/2] Poster fog ready for static hosting.');
