import { easingOptions } from "../src/easing.ts";
import { icons } from "./icons.js";

export function easingPickerMarkup(value) {
  return `<button type="button" class="control-row easing-trigger" id="easing-trigger" aria-label="Easing" aria-haspopup="listbox" aria-expanded="false" aria-controls="easing-options"><span>Easing</span><span class="easing-value">${easingOptions.find(option => option.value === value).label}</span>${icons.chevron}</button>`;
}

export function createEasingPicker({ value, onChange }) {
  const trigger = document.querySelector("#easing-trigger");
  const panel = document.createElement("div");
  panel.id = "easing-options";
  panel.className = "easing-popover";
  panel.setAttribute("popover", "auto");
  panel.setAttribute("role", "listbox");
  panel.setAttribute("aria-label", "Easing type");
  panel.innerHTML = easingOptions.map(option => `<button type="button" role="option" tabindex="-1" data-value="${option.value}" aria-selected="${option.value === value}"><span>${option.label}</span>${icons.check}</button>`).join("");
  document.body.append(panel);
  const options = [...panel.querySelectorAll('[role="option"]')];
  const events = new AbortController();
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  function sync(next) {
    value = next;
    trigger.querySelector(".easing-value").textContent = easingOptions.find(option => option.value === value).label;
    options.forEach(option => option.setAttribute("aria-selected", String(option.dataset.value === value)));
  }
  function position() {
    if (!panel.matches(":popover-open")) return;
    const rect = trigger.getBoundingClientRect();
    panel.style.width = `${Math.min(rect.width, innerWidth - 24)}px`;
    const height = panel.offsetHeight;
    const below = rect.bottom + 6;
    const above = rect.top - height - 6;
    panel.style.top = `${clamp(below + height <= innerHeight - 12 ? below : above, 12, Math.max(12, innerHeight - height - 12))}px`;
    panel.style.left = `${clamp(rect.left, 12, innerWidth - panel.offsetWidth - 12)}px`;
  }
  function close(restoreFocus = false) {
    if (panel.matches(":popover-open")) panel.hidePopover();
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }
  function open() {
    panel.showPopover();
    trigger.setAttribute("aria-expanded", "true");
    position();
    options.find(option => option.dataset.value === value).focus({ preventScroll: true });
  }
  trigger.onclick = () => panel.matches(":popover-open") ? close() : open();
  trigger.onkeydown = event => {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      open();
    }
  };
  panel.addEventListener("toggle", () => trigger.setAttribute("aria-expanded", String(panel.matches(":popover-open"))));
  options.forEach(option => {
    option.onclick = () => {
      sync(option.dataset.value);
      onChange(value);
      close(true);
    };
  });
  panel.onkeydown = event => {
    const current = options.indexOf(document.activeElement);
    let index;
    if (event.key === "ArrowDown") index = (current + 1) % options.length;
    if (event.key === "ArrowUp") index = (current - 1 + options.length) % options.length;
    if (event.key === "Home") index = 0;
    if (event.key === "End") index = options.length - 1;
    if (index !== undefined) {
      event.preventDefault();
      options[index].focus({ preventScroll: true });
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
    if (event.key === "Tab") close(true);
  };
  window.addEventListener("resize", position, { signal: events.signal });
  document.addEventListener("scroll", position, { capture: true, signal: events.signal });
  return {
    sync,
    close,
    destroy() {
      events.abort();
      trigger.onclick = trigger.onkeydown = null;
      panel.remove();
    },
  };
}
