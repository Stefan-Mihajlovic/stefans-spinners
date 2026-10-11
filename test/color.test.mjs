import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHex, hexToHsv, hsvToHex } from '../site/color-utils.js';

test('hex input normalizes short and full forms and rejects invalid input',()=>{
  assert.equal(normalizeHex(' #AbC '),'#aabbcc');
  assert.equal(normalizeHex('FF8800'),'#ff8800');
  for(const invalid of ['','12','fffffff','zzzzzz','#12345','red']) assert.equal(normalizeHex(invalid),null);
});

test('HSV picker round-trips colors and preserves hue on achromatic colors',()=>{
  for(const color of ['#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#dedede','#000000','#ffffff','#a3b17f','#ff8800']) assert.equal(hsvToHex(hexToHsv(color)),color);
  assert.equal(hexToHsv('#808080',215).h,215);
  assert.equal(hexToHsv('#000000',215).h,215);
  assert.equal(hsvToHex({h:360,s:1,v:1}),'#ff0000');
  assert.equal(hsvToHex({h:-120,s:1,v:1}),'#0000ff');
  assert.equal(hsvToHex({h:0,s:2,v:-1}),'#000000');
});
