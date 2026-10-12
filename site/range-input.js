/** Switch a slider row to an exact numeric entry, preserving its existing callback. */
export function bindRangeInputs(root, { getValue, onCommit }) {
  root.querySelectorAll('.control-row.range').forEach(row => {
    const slider = row.querySelector('input[type="range"]');
    const factor = slider.id === 'speed' ? 1000 : 1;
    row.title = 'Double-click to type a value. Press Enter on the slider to edit.';
    let beforeClick = getValue(slider);
    slider.addEventListener('mousedown', e => {
      if (e.detail === 1) beforeClick = getValue(slider);
    });
    function edit(value) {
      if (row.classList.contains('is-editing')) return;
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'range-value-input';
      input.min = Number(slider.min) * factor;
      input.max = Number(slider.max) * factor;
      input.step = Number(slider.step) * factor;
      input.value = Number((Number(value) * factor).toFixed(4));
      input.setAttribute('aria-label', `${slider.getAttribute('aria-label')}${factor === 1000 ? ' in milliseconds' : ''}`);
      row.classList.add('is-editing');
      row.append(input);
      input.focus();
      input.select();
      let done = false;
      function finish(commit) {
        if (done) return;
        done = true;
        if (commit && input.value.trim() !== '' && Number.isFinite(input.valueAsNumber)) {
          const next = Math.max(Number(slider.min), Math.min(Number(slider.max), input.valueAsNumber / factor));
          onCommit(slider, next);
        }
        row.classList.remove('is-editing');
        input.remove();
      }
      input.onblur = () => finish(true);
      input.onkeydown = e => {
        if (e.key !== 'Enter' && e.key !== 'Escape') return;
        e.preventDefault();
        e.stopPropagation();
        finish(e.key === 'Enter');
        slider.focus({preventScroll:true});
      };
      input.ondblclick = e => e.stopPropagation();
    }
    row.ondblclick = e => {
      e.preventDefault();
      if (row.classList.contains('is-editing')) return;
      onCommit(slider, beforeClick);
      edit(beforeClick);
    };
    slider.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); edit(getValue(slider)); }
    });
  });
}
