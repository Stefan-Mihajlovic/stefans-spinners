import { build } from 'esbuild';
import { mkdir, copyFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
await mkdir('dist', { recursive: true });
for (const format of ['esm', 'cjs']) {
  await build({entryPoints:['src/index.tsx','src/catalog.ts'],outdir:'dist',bundle:true,format,platform:'neutral',target:'es2020',external:['react'],outExtension:{'.js':format==='esm'?'.js':'.cjs'},minify:true});
}
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc'], {stdio:'inherit'});
await copyFile('src/styles.css','dist/styles.css');
console.log('Built ESM, CommonJS, TypeScript declarations, and CSS.');
