import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSpinnerCode } from '../site/code-editor.js';
const demo = props => `import { Checker } from "stefans-spinners";
export function CheckerDemo() { return <Checker ${props} />; }`;
test('code editor reads geometry, color, timing, opacity and pause atomically', () => {
  assert.deepEqual(parseSpinnerCode(demo('size={72} color="#abc" gap={8} speed={0.5} easing="ease-out" style={{ opacity: 0.35 }} paused'), 'Checker', ['gap']), {
    size:72, color:'#aabbcc', custom:{gap:8}, speed:.5, easing:'ease-out', opacity:35, paused:true,
  });
});
test('code editor rejects expressions, unknown props, duplicate props and malformed demos', () => {
  for (const props of ['size={alert(1)}', 'onClick={foo}', 'size={48} size={72}', 'size={NaN}', 'speed={0}', 'style={{ opacity: 2 }}', 'color="url(secret)"', 'paused="false"']) {
    assert.throws(() => parseSpinnerCode(demo(props),'Checker',['gap']));
  }
  assert.throws(() => parseSpinnerCode(demo('size={48}')+'; alert(1)','Checker',['gap']));
  assert.throws(() => parseSpinnerCode(demo('secondaryColor="#123"'),'Checker',['gap']));
});
test('removing props restores defaults in the caller without retaining old custom values', () => {
  assert.deepEqual(parseSpinnerCode(demo('size={48}'),'Checker',['gap']), {size:48,custom:{}});
});

test('code editor still accepts the optional legacy stylesheet import', () => {
  const source = demo('size={48}').replace('export function', 'import "stefans-spinners/styles.css";\nexport function');
  assert.deepEqual(parseSpinnerCode(source, 'Checker', ['gap']), {size:48,custom:{}});
});
