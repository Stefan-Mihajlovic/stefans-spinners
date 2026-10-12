import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { spinners, customizationControls, Ring, Bars, Arc, Bloom, Radar } from '../dist/index.js';
import * as library from '../dist/index.js';
const render = (component, props) => renderToStaticMarkup(createElement(component,props));

test('every spinner supports geometry props connected to its CSS without leaking HTML attributes',()=>{
  const css=readFileSync('dist/styles.css','utf8');
  for(const spinner of spinners){
    const controls=customizationControls[spinner.id];
    assert.ok(controls.length>0,`${spinner.name} needs a control`);
    for(const control of controls){
      const value=control.relative ? control.max*48 : control.max;
      const html=render(library[spinner.name],{size:48,[control.key]:value});
      assert.ok(html.includes(`${control.css}:${value}${control.unit}`),`${spinner.name}.${control.key} must reach CSS`);
      const computedMask = ['hourglass','arc','ring','comet','dual','vortex','infinity'].includes(spinner.id);
      if (computedMask) {
        const component = library[spinner.name];
        const low = component({size:48,[control.key]:control.relative ? control.min*48 : control.min}).props.style;
        const high = component({size:48,[control.key]:value}).props.style;
        const geometryKeys = Object.keys(high).filter(k => k.includes('mask') || k === '--ss-path');
        assert.ok(css.includes(`var(${control.css}`) || geometryKeys.some(k => low[k] !== high[k]), `${spinner.name}.${control.key} must affect CSS or generated geometry`);
      } else {
        assert.ok(css.includes(`var(${control.css}`),`${control.key} must affect a CSS rule`);
      }
      assert.ok(!html.includes(` ${control.key}=`),`${control.key} must not leak onto the span`);
    }
  }
});

test('stroke, radius, petal, and sweep props survive React rendering',()=>{
  assert.match(render(Ring,{strokeWidth:5,trackOpacity:0}),/--ss-track-opacity:0/);
  assert.match(render(Bars,{borderRadius:0,barWidth:6}),/--ss-bar-width:6px;--ss-radius:0px/);
  assert.match(render(Bloom,{petalWidth:9,petalLength:12}),/--ss-petal-width:9px;--ss-petal-length:12px/);
  assert.match(render(Radar,{sweepAngle:270}),/--ss-sweep-angle:270deg/);
});

test('invalid geometry falls back or clamps, including when size is invalid',()=>{
  assert.match(render(Ring,{size:0,strokeWidth:-10,trackOpacity:Infinity}),/--ss-stroke-width:0.32px/);
  assert.match(render(Arc,{size:100,strokeWidth:999}),/--ss-stroke-width:18px/);
  assert.match(render(Bars,{borderRadius:NaN}),/--ss-radius:1px/);
  assert.doesNotMatch(render(Arc,{petalWidth:9}),/petalWidth|--ss-petal-width/);
});

test('consumer CSS overrides still take precedence over geometry props',()=>{
  assert.match(render(Ring,{strokeWidth:5,style:{'--ss-stroke-width':'2px'}}),/--ss-stroke-width:2px/);
});


test('paired widths remain independent and shared strokeWidth is a backwards-compatible fallback',()=>{
  for(const name of ['Dual','Square']){
    const html=render(library[name],{size:48,strokeWidth:4,innerStrokeWidth:2});
    assert.match(html,/--ss-outer-stroke-width:4px/);
    assert.match(html,/--ss-inner-stroke-width:2px/);
  }
  const breathe=render(library.Breathe,{size:48,strokeWidth:3,firstStrokeWidth:1});
  assert.match(breathe,/--ss-first-stroke-width:1px/);
  assert.match(breathe,/--ss-second-stroke-width:3px/);
  const radar=render(Radar,{size:48,outerStrokeWidth:2,sweepWidth:8});
  assert.match(radar,/--ss-outer-stroke-width:2px/);
  assert.match(radar,/--ss-sweep-width:8px/);
});

test('Hourglass default, sharp and rounded outlines differ and scale safely',()=>{
  const mask=props=>library.Hourglass(props).props.style['--ss-hourglass-mask'];
  const defaultMask=mask({size:48});
  assert.equal(defaultMask,mask({size:48,waistWidth:6,borderRadius:8}));
  assert.notEqual(defaultMask,mask({size:48,borderRadius:0}));
  assert.notEqual(defaultMask,mask({size:48,borderRadius:4}));
  assert.notEqual(defaultMask,mask({size:48,waistWidth:1}));
  for(const size of [16,32,48,72]){
    for(const radius of [0,3,999,NaN]){
      const svg=decodeURIComponent(mask({size,borderRadius:radius}));
      assert.match(svg,/<svg.*<path d="M.*Q/);
      assert.doesNotMatch(svg,/NaN|Infinity/);
    }
  }
});

test('arc length and corner radius change actual geometry, including both Dual arcs',()=>{
  for(const name of ['Arc','Ring','Comet','Vortex']){
    const style=props=>library[name]({size:48,...props}).props.style;
    const key=name==='Vortex'?'--ss-arc-mask-0':'--ss-arc-mask';
    assert.notEqual(style({arcLength:60})[key],style({arcLength:270})[key]);
    assert.notEqual(style({borderRadius:0})[key],style({borderRadius:2})[key]);
    for(const size of [16,32,48,72])for(const arcLength of [20,180,340]){
      const mask=library[name]({size,arcLength,borderRadius:999,strokeWidth:999}).props.style[key];
      assert.match(decodeURIComponent(mask),/<path d="M.*A.*fill="none".*stroke-linecap="round"/);
      assert.doesNotMatch(mask,/NaN|Infinity/);
    }
  }
  const style=props=>library.Dual({size:48,...props}).props.style;
  const base=style({});
  const inner=style({innerArcLength:30,innerBorderRadius:0});
  const outer=style({outerArcLength:150,outerBorderRadius:0});
  assert.equal(inner['--ss-arc-mask'],base['--ss-arc-mask']);
  assert.notEqual(inner['--ss-inner-arc-mask'],base['--ss-inner-arc-mask']);
  assert.equal(outer['--ss-inner-arc-mask'],base['--ss-inner-arc-mask']);
  assert.notEqual(outer['--ss-arc-mask'],base['--ss-arc-mask']);
});

test('end-radius sliders can reach a true round cap at the largest selectable stroke',()=>{
  for (const name of ['Arc','Ring','Comet','Dual','Vortex']) {
    for (const size of [16,24,32,48,72]) {
      const controls=library.customizationControls[name.toLowerCase()].map(c=>({...c,max:c.relative ? c.max*size : c.max}));
      const values=Object.fromEntries(controls
        .filter(c=>/strokeWidth|StrokeWidth|borderRadius|BorderRadius/.test(c.key))
        .map(c=>[c.key,Number((Math.floor(c.max/c.step + 1e-9)*c.step).toFixed(2))]));
      const style=library[name]({size,...values}).props.style;
      for (const [key,mask] of Object.entries(style).filter(([key])=>key.includes('mask'))) {
        const svg=decodeURIComponent(mask);
        assert.match(svg,/fill="none"/,`${name} at ${size}px: ${key} must reach fully round`);
        assert.match(svg,/stroke-linecap="round"/);
        assert.doesNotMatch(svg,/NaN|Infinity/);
      }
    }
  }
  const svg=decodeURIComponent(library.Arc({size:72,strokeWidth:12.9,borderRadius:6.48,arcLength:209}).props.style['--ss-arc-mask']);
  assert.match(svg,/stroke-width="12.9"/);
  assert.match(svg,/fill="none"/);
});

test('Ring track width is independent and new components keep stable defaults',()=>{
  const style=library.Ring({size:48,strokeWidth:5,trackStrokeWidth:1}).props.style;
  assert.equal(style['--ss-stroke-width'],'5px');
  assert.equal(style['--ss-track-stroke-width'],'1px');
  const ids=new Set(library.spinners.map(s=>s.id));
  assert.equal(ids.size,60);
  for(const spinner of library.spinners.slice(30)){
    for(const size of [16,48,72]){
      const html=render(library[spinner.name],{size,paused:true,decorative:true});
      assert.doesNotMatch(html,/NaN|Infinitypx|undefined/);
      assert.match(html,/ss-paused/);
    }
  }
});

test('easing is a shared animation prop without changing defaults or leaking attributes',()=>{
  for (const spinner of spinners) {
    const component = library[spinner.name];
    assert.doesNotMatch(render(component,{}), /--ss-easing/);
    for (const {value} of library.easingOptions) {
      const html = render(component,{easing:value});
      assert.ok(html.includes(`--ss-easing:${value}`));
      assert.doesNotMatch(html, / easing=/);
    }
  }
  assert.match(render(Bars,{easing:'ease-out',style:{'--ss-easing':'linear'}}), /--ss-easing:linear/);
  const css=readFileSync('dist/styles.css','utf8');
  assert.match(css, /ss-spinner>span\{[^}]*animation-timing-function:var\(--ss-easing,ease-in-out\)/);
  assert.match(css, /ss-beads>span::before\{[^}]*animation:ss-bead var\(--ss-speed\) var\(--ss-easing,ease-in-out\)/);
  for (const spinner of spinners) {
    const rule=new RegExp(`\\.ss-${spinner.id}>span(?::last-child)?\\{[^}]*animation-timing-function:var\\(--ss-easing,linear\\)`);
    assert.equal(library.getDefaultEasing(spinner.id),rule.test(css)?'linear':'ease-in-out',spinner.name);
  }
});
