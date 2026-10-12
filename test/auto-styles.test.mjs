import test from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const require = createRequire(import.meta.url);

function browserDocument() {
  const styles = [];
  return {
    styles,
    head: { appendChild: element => styles.push(element) },
    getElementById: id => styles.find(element => element.id === id),
    createElement: tag => {
      assert.equal(tag, 'style');
      return { id: '', textContent: '' };
    },
  };
}

test('one package import retains automatic CSS in a tree-shaken browser bundle', async () => {
  const result = await build({
    stdin: { contents: 'export { Arc, Clock } from "stefans-spinners";', resolveDir: process.cwd() },
    bundle: true, minify: true, platform: 'browser', format: 'iife', globalName: 'Spinners', write: false,
  });
  const document = browserDocument();
  const context = { document };
  const bundle = result.outputFiles[0].text;
  runInNewContext(bundle, context);
  assert.equal(document.styles.length, 1);
  assert.equal(document.styles[0].textContent, readFileSync('dist/styles.css', 'utf8'));
  assert.match(context.Spinners.Arc({}).props.className, /ss-arc/);
  assert.match(context.Spinners.Clock({}).props.className, /ss-clock/);
  // Another bundle copy, or a hot reload, must not add another stylesheet.
  runInNewContext(bundle, context);
  assert.equal(document.styles.length, 1);
});

test('CommonJS includes the same automatic styles and shares the stylesheet marker', () => {
  const document = browserDocument();
  const context = { document, exports: {}, module: { exports: {} }, require };
  const bundle = readFileSync('dist/index.cjs', 'utf8');
  runInNewContext(bundle, context);
  runInNewContext(bundle, context);
  assert.equal(document.styles.length, 1);
  assert.equal(document.styles[0].textContent, readFileSync('dist/styles.css', 'utf8'));
});
