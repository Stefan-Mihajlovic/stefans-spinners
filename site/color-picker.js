import { hexToHsv, hsvToHex, normalizeHex } from "./color-utils.js";

export function colorPickerMarkup() {
  return `<button type="button" class="control-row color-trigger" id="color-trigger" aria-label="Color" aria-haspopup="dialog" aria-expanded="false" aria-controls="color-popover"><span>Color</span><span id="color-value"></span><span id="color-swatch" aria-hidden="true"></span></button>`;
}

export function createColorPicker({ color, opacity, onChange }) {
  const trigger = document.querySelector("#color-trigger");
  const panel = document.createElement("div");
  panel.id = "color-popover";
  panel.className = "color-popover";
  panel.setAttribute("popover", "auto");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Choose color");
  panel.innerHTML = `<div class="color-plane" tabindex="0" role="slider" aria-label="Saturation and brightness" aria-valuemin="0" aria-valuemax="100" aria-describedby="color-help"><span class="color-cursor" aria-hidden="true"></span></div><p id="color-help" class="sr-only">Left and right adjust saturation. Up and down adjust brightness. Hold Shift for larger steps.</p><input class="color-hue" type="range" min="0" max="360" step="1" aria-label="Hue"><div class="color-fields"><label class="color-hex-field"><span aria-hidden="true">#</span><input class="color-hex" aria-label="Hex color" maxlength="7" spellcheck="false" autocomplete="off"></label><div class="color-alpha-field"><input class="color-alpha" type="number" min="0" max="100" step="1" aria-label="Color opacity"><span class="color-alpha-scrub" role="slider" tabindex="0" aria-label="Drag color opacity" aria-valuemin="0" aria-valuemax="100" aria-describedby="alpha-help" title="Drag left or right to adjust opacity">%</span></div></div><p id="alpha-help" class="sr-only">Drag left to decrease opacity or right to increase it. Arrow keys adjust by one percent; hold Shift for ten.</p>`;
  document.body.append(panel);
  const plane = panel.querySelector(".color-plane"),
    cursor = panel.querySelector(".color-cursor"),
    hue = panel.querySelector(".color-hue"),
    hex = panel.querySelector(".color-hex"),
    alpha = panel.querySelector(".color-alpha"),
    alphaScrub = panel.querySelector(".color-alpha-scrub");
  let hsv = hexToHsv(color),
    lastColor = color,
    lastOpacity = opacity,
    dragging = false;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function paint() {
    plane.style.backgroundColor = `hsl(${hsv.h} 100% 50%)`;
    cursor.style.left = `${hsv.s * 100}%`;
    cursor.style.top = `${(1 - hsv.v) * 100}%`;
    cursor.style.background = lastColor;
    plane.setAttribute("aria-valuenow", String(Math.round(hsv.s * 100)));
    plane.setAttribute(
      "aria-valuetext",
      `Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`,
    );
    hue.value = hsv.h;
    hue.style.setProperty("--selected-hue", `hsl(${hsv.h} 100% 50%)`);
    if (document.activeElement !== hex)
      hex.value = lastColor.slice(1).toUpperCase();
    if (document.activeElement !== alpha) alpha.value = lastOpacity;
    alphaScrub.setAttribute("aria-valuenow", String(lastOpacity));
    alphaScrub.setAttribute("aria-valuetext", `${lastOpacity}%`);
    trigger.querySelector("#color-value").textContent = lastColor.toUpperCase();
    trigger.querySelector("#color-swatch").style.background = lastColor;
  }
  function commit() {
    lastColor = hsvToHex(hsv);
    hex.removeAttribute("aria-invalid");
    paint();
    onChange({ color: lastColor, opacity: lastOpacity });
  }
  function position() {
    if (!panel.matches(":popover-open")) return;
    const r = trigger.getBoundingClientRect();
    const width = Math.min(224, window.innerWidth - 24);
    panel.style.width = `${width}px`;
    const height = panel.getBoundingClientRect().height;
    const below = r.bottom + 6,
      above = r.top - height - 6;
    const top =
      below + height <= window.innerHeight - 12
        ? below
        : above >= 12
          ? above
          : clamp(below, 12, Math.max(12, window.innerHeight - height - 12));
    panel.style.left = `${clamp(r.right - width, 12, window.innerWidth - width - 12)}px`;
    panel.style.top = `${top}px`;
  }
  function close(restoreFocus = false) {
    if (panel.matches(":popover-open")) panel.hidePopover();
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }
  trigger.onclick = () => {
    if (panel.matches(":popover-open")) return close();
    panel.showPopover();
    position();
    paint();
    plane.focus({ preventScroll: true });
  };
  panel.addEventListener("toggle", () =>
    trigger.setAttribute(
      "aria-expanded",
      String(panel.matches(":popover-open")),
    ),
  );
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    }
  });
  function point(event) {
    const r = plane.getBoundingClientRect();
    hsv.s = clamp((event.clientX - r.left) / r.width, 0, 1);
    hsv.v = 1 - clamp((event.clientY - r.top) / r.height, 0, 1);
    commit();
  }
  plane.onpointerdown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    plane.focus({ preventScroll: true });
    plane.setPointerCapture(e.pointerId);
    point(e);
  };
  plane.onpointermove = (e) => {
    if (dragging) point(e);
  };
  plane.onpointerup = (e) => {
    if (dragging) {
      point(e);
      dragging = false;
      plane.releasePointerCapture(e.pointerId);
    }
  };
  plane.onpointercancel = () => (dragging = false);
  plane.onkeydown = (e) => {
    const amount = e.shiftKey ? 0.1 : 0.01;
    if (e.key === "ArrowRight") hsv.s = clamp(hsv.s + amount, 0, 1);
    else if (e.key === "ArrowLeft") hsv.s = clamp(hsv.s - amount, 0, 1);
    else if (e.key === "ArrowUp") hsv.v = clamp(hsv.v + amount, 0, 1);
    else if (e.key === "ArrowDown") hsv.v = clamp(hsv.v - amount, 0, 1);
    else return;
    e.preventDefault();
    commit();
  };
  hue.oninput = () => {
    hsv.h = Number(hue.value);
    commit();
  };
  hex.oninput = () => {
    const valid = normalizeHex(hex.value);
    hex.setAttribute("aria-invalid", String(!valid));
    if (valid) {
      hsv = hexToHsv(valid, hsv.h);
      commit();
    }
  };
  hex.onblur = () => {
    hex.value = lastColor.slice(1).toUpperCase();
    hex.removeAttribute("aria-invalid");
  };
  hex.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      hex.blur();
      plane.focus({ preventScroll: true });
    }
  };
  alpha.oninput = () => {
    if (alpha.value === "") return;
    const value = Number(alpha.value);
    if (Number.isFinite(value)) {
      lastOpacity = clamp(value, 0, 100);
      commit();
    }
  };
  alpha.onblur = () => (alpha.value = lastOpacity);

  // Increment from the last pointer position so reversing at 0/100 responds
  // immediately, even if the pointer has travelled past a boundary.
  let alphaDrag = null;
  function scrubOpacity(e) {
    if (!alphaDrag || e.pointerId !== alphaDrag.id) return;
    alphaDrag.value = clamp(alphaDrag.value + (e.clientX - alphaDrag.x), 0, 100);
    alphaDrag.x = e.clientX;
    const next = Math.round(alphaDrag.value);
    if (next !== lastOpacity) {
      lastOpacity = next;
      commit();
    }
  }
  function endAlphaDrag(e) {
    if (!alphaDrag || e.pointerId !== alphaDrag.id) return;
    alphaDrag = null;
    alphaScrub.classList.remove("is-dragging");
    if (alphaScrub.hasPointerCapture(e.pointerId))
      alphaScrub.releasePointerCapture(e.pointerId);
  }
  alphaScrub.onpointerdown = (e) => {
    if (e.button !== 0 || alphaDrag) return;
    e.preventDefault();
    alphaScrub.focus({ preventScroll: true });
    alphaDrag = { id: e.pointerId, x: e.clientX, value: lastOpacity };
    alphaScrub.classList.add("is-dragging");
    alphaScrub.setPointerCapture(e.pointerId);
  };
  alphaScrub.onpointermove = scrubOpacity;
  alphaScrub.onpointerup = (e) => {
    scrubOpacity(e);
    endAlphaDrag(e);
  };
  alphaScrub.onpointercancel = endAlphaDrag;
  alphaScrub.onlostpointercapture = endAlphaDrag;
  alphaScrub.onkeydown = (e) => {
    const step = e.shiftKey ? 10 : 1;
    let next = lastOpacity;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") next -= step;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") next += step;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 100;
    else return;
    e.preventDefault();
    lastOpacity = clamp(next, 0, 100);
    commit();
  };

  const onScroll = () => position();
  window.addEventListener("resize", position);
  window.addEventListener("scroll", onScroll, true);
  paint();
  return {
    sync(nextColor, nextOpacity) {
      if (nextColor !== lastColor) {
        hsv = hexToHsv(nextColor, hsv.h);
        lastColor = nextColor;
      }
      lastOpacity = nextOpacity;
      paint();
    },
    close,
    destroy() {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", onScroll, true);
      panel.remove();
      trigger.onclick = null;
    },
  };
}
