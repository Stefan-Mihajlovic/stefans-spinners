import { build } from 'esbuild';
import { mkdir, cp, copyFile } from 'node:fs/promises';
await mkdir('site-dist', {recursive:true});
await cp('site','site-dist',{recursive:true});
await build({entryPoints:['site/app.js'],bundle:true,outfile:'site-dist/app.js',minify:true,target:'es2020'});
await copyFile('src/styles.css','site-dist/spinners.css');
for(const name of ['llms.txt','llms-full.txt']) await copyFile(name,`site-dist/${name}`);
console.log('Site ready in site-dist/');
