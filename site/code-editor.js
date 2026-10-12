import { normalizeHex } from './color-utils.js';

// This editor reads literal spinner props, never evaluates JavaScript.
export function parseSpinnerCode(source, name, controls) {
  const shape = new RegExp(`^\\s*import\\s*\\{\\s*${name}\\s*\\}\\s*from\\s*["']stefans-spinners["'];?\\s*import\\s*["']stefans-spinners/styles\\.css["'];?\\s*export\\s+function\\s+\\w+\\s*\\(\\s*\\)\\s*\\{\\s*return\\s*<${name}\\b([\\s\\S]*?)\\/\\s*>;?\\s*\\}\\s*$`);
  const match = shape.exec(source);
  if (!match) throw Error(`Keep the ${name} demo structure and edit its props below.`);
  const result = { custom: {} };
  const seen = new Set();
  let rest = match[1].trim();
  while (rest) {
    const prop = /^([A-Za-z]\w*)\b/.exec(rest);
    if (!prop) throw Error('Finish the prop name and its value.');
    const key = prop[1];
    if (seen.has(key)) throw Error(`Use ${key} only once.`);
    seen.add(key);
    rest = rest.slice(key.length).trimStart();
    if (key === 'paused' && !rest.startsWith('=')) {
      result.paused = true;
      continue;
    }
    if (!rest.startsWith('=')) throw Error(`Add a value for ${key}.`);
    rest = rest.slice(1).trimStart();
    let value;
    if (key === 'style') {
      const style = /^\{\{\s*opacity\s*:\s*(\d*\.?\d+)\s*,?\s*\}\}/.exec(rest);
      if (!style) throw Error('Preview style supports {{ opacity: 0.5 }} (0–1).');
      value = Number(style[1]);
      if (value < 0 || value > 1) throw Error('Opacity must be between 0 and 1.');
      result.opacity = value * 100;
      rest = rest.slice(style[0].length).trimStart();
      continue;
    }
    const literal = /^(?:"([^"\n]*)"|'([^'\n]*)'|\{\s*([^{}]*?)\s*\})/.exec(rest);
    if (!literal) throw Error(`Use a quoted string or a value in braces for ${key}.`);
    const quoted = literal[1] !== undefined || literal[2] !== undefined;
    value = literal[1] ?? literal[2] ?? literal[3];
    rest = rest.slice(literal[0].length).trimStart();
    if (key === 'color') {
      const color = quoted && normalizeHex(value);
      if (!color) throw Error(`Use a hex color for ${key}, such as "#a78bfa".`);
      result[key] = color;
    } else if (key === 'easing') {
      if (!quoted || !['linear','ease','ease-in','ease-out','ease-in-out'].includes(value)) throw Error('Choose linear, ease, ease-in, ease-out, or ease-in-out.');
      result.easing = value;
    } else if (key === 'paused') {
      if (quoted || !['true','false'].includes(value)) throw Error('Use paused={true} or paused={false}.');
      result.paused = value === 'true';
    } else {
      if (quoted || !/^-?(?:\d+\.?\d*|\.\d+)$/.test(value) || !Number.isFinite(Number(value))) throw Error(`Use a number in braces for ${key}.`);
      const number = Number(value);
      if (key === 'size') {
        if (number < 8 || number > 240) throw Error('Preview size must be between 8 and 240 pixels.');
        result.size = number;
      } else if (key === 'speed') {
        if (number < .2 || number > 3) throw Error('Preview speed must be between 0.2 and 3 seconds.');
        result.speed = number;
      } else if (controls.includes(key)) result.custom[key] = number;
      else throw Error(`The preview does not support the ${key} prop.`);
    }
  }
  return result;
}

export function createCodeEditor({ element, source, parse, onChange }) {
  const input = element.querySelector('textarea');
  const status = element.querySelector('.code-editor-status');
  let applying = false;
  function resize() { input.rows = Math.max(6, Math.min(16, input.value.split('\n').length)); }
  function validate() {
    try {
      const values = parse(input.value);
      applying = true;
      onChange(values);
      input.removeAttribute('aria-invalid');
      status.textContent = 'Edit props to update the preview.';
    } catch (error) {
      input.setAttribute('aria-invalid', 'true');
      status.textContent = error.message;
    } finally { applying = false; }
    resize();
  }
  input.value = source;
  input.oninput = validate;
  resize();
  return {
    sync(code) {
      if (applying) return;
      input.value = code;
      input.removeAttribute('aria-invalid');
      status.textContent = 'Edit props to update the preview.';
      resize();
    },
    read: () => input.value,
  };
}
