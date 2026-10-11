import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import * as library from '../dist/index.js';
const require=createRequire(import.meta.url);
test('all 24 public components render accessible server-side markup with matching CSS',()=>{
 const css=readFileSync('dist/styles.css','utf8');
 assert.equal(library.spinners.length,24);
 for(const s of library.spinners){const html=renderToStaticMarkup(createElement(library[s.name],{label:'Fetching results',size:48,color:'#123456',speed:.8}));assert.match(html,/role="status"/);assert.match(html,/aria-label="Fetching results"/);assert.match(html,/--ss-size:48px/);assert.match(html,/--ss-speed:0.8s/);assert.equal((html.match(/aria-hidden="true"/g)||[]).length,s.count);assert.ok(css.includes(`.ss-${s.id}`));}
});
test('decorative spinners do not announce duplicate status',()=>{const html=renderToStaticMarkup(createElement(library.Dots,{decorative:true}));assert.doesNotMatch(html,/role=|aria-label=/);assert.match(html,/aria-hidden="true"/);});
test('safe defaults, pause, HTML attributes, and user styles are preserved',()=>{const html=renderToStaticMarkup(createElement(library.Ring,{size:-1,speed:NaN,paused:true,className:'custom',id:'progress',style:{marginLeft:4}}));assert.match(html,/--ss-size:32px/);assert.match(html,/--ss-speed:1.2s/);assert.match(html,/ss-paused custom/);assert.match(html,/id="progress"/);assert.match(html,/margin-left:4px/);});
test('CommonJS exports and framework-independent catalog work',()=>{assert.equal(typeof require('../dist/index.cjs').Orbit,'function');assert.equal(require('../dist/catalog.cjs').spinners.length,24);});
test('reduced motion disables every animation',()=>{assert.match(readFileSync('dist/styles.css','utf8'),/@media\(prefers-reduced-motion:reduce\).*animation:none!important/s);});
