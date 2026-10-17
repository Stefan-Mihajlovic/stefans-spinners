import { bindRangeInputs } from "./range-input.js";
import { createScrollStars } from "./scroll-stars.js";
import { createCodeEditor, parseSpinnerCode } from "./code-editor.js";
import { getDefaultEasing } from "../src/easing.ts";
import { spinners } from "../src/catalog.ts";
import { icons } from "./icons.js";
import { colorPickerMarkup, createColorPicker } from "./color-picker.js";
import {
  getCustomizationControls,
  customizationStyle,
  resolveCustomization,
} from "../src/customization.ts";
import { easingPickerMarkup, createEasingPicker } from "./easing-picker.js";
const $ = (s) => document.querySelector(s);
const catalog = [...spinners].sort((a, b) => a.name.localeCompare(b.name));
const defaults = {
  size: 48,
  color: "#dedede",
  speed: 1.2,
  easing: undefined,
  opacity: 100,
  paused: false,
  custom: {},
};
let state = { ...defaults },
  selected = null,
  searchIndex = 0,
  searchItems = [],
  toastTimer;
let colorPicker = null;
let codeEditor = null;
let easingPicker = null;
let renderedPath = null;
let destroyPageTimeline = null;
let previewTheme = "dark";
const scrollStars = createScrollStars(document.querySelector(".starfield"));
function previewColor() {
  return state.color.toLowerCase() === defaults.color && previewTheme === "light"
    ? "#282828" : state.color;
}
const escape = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const stroke = (path) =>
  `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
icons.pause = stroke('<path d="M6 3v10M10 3v10"/>');
icons.play = stroke('<path d="M5 4.3Q5 3.25 5.9 3.8L12 7.2Q13.3 8 12 8.8L5.9 12.2Q5 12.75 5 11.7Z"/>');
icons.chevron = stroke('<path d="m6 4 4 4-4 4"/>');
icons.reset = stroke('<path d="M3 6a5 5 0 1 1 0 5M3 2v4h4"/>');
icons.menu = stroke('<path d="M3 5h10M3 8h10M3 11h10"/>');
icons.close = stroke('<path d="m4 4 8 8M12 4l-8 8"/>');
icons.check = stroke('<path d="m3 8 3 3 7-7"/>');
icons.sun = stroke('<circle cx="8" cy="8" r="3"/><path d="M8 1v1M8 14v1M1 8h1M14 8h1M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1"/>');
icons.moon = stroke('<path d="M13.5 9.5A6 6 0 0 1 6.5 2.5 6 6 0 1 0 13.5 9.5Z"/>');
function hydrateIcons(root = document) {
  root
    .querySelectorAll("[data-icon]")
    .forEach((el) => (el.innerHTML = icons[el.dataset.icon] || ""));
  root.querySelectorAll(".logo").forEach((el) => (el.innerHTML = icons.logo));
}
hydrateIcons();
const logoMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const logoAnimations = new Map();
function animateBrandLogos(selector = ".brand-link .logo") {
  document.querySelectorAll(selector).forEach((logo) => {
    logoAnimations.get(logo)?.forEach((animation) => animation.cancel());
    logoAnimations.delete(logo);
    if (logoMotion.matches) return;
    const stroke = logo.querySelector(".logo-stroke");
    const dots = logo.querySelector(".logo-dots");
    const timing = { duration: 1500, easing: "cubic-bezier(.4,0,.2,1)" };
    const animations = [
      stroke.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], timing),
      dots.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], timing),
    ];
    logoAnimations.set(logo, animations);
    animations[0].onfinish = () => {
      if (logoAnimations.get(logo) === animations) logoAnimations.delete(logo);
    };
  });
}
logoMotion.addEventListener("change", () => {
  if (logoMotion.matches) {
    for (const animations of logoAnimations.values())
      animations.forEach((animation) => animation.cancel());
    logoAnimations.clear();
  }
});
$("#star-motion").onclick = () => {
  const paused = document.body.classList.toggle("stars-paused");
  scrollStars.setPaused(paused);
  $("#star-motion").setAttribute("aria-pressed", String(paused));
  $("#star-motion").setAttribute("aria-label", paused ? "Play star background" : "Pause star background");
  $("#star-motion span").textContent = paused ? "Play stars" : "Pause stars";
};
$("#menu").innerHTML = icons.menu;
function markup(spinner, props = {}) {
  const p = {
    size: 24,
    color: "#dedede",
    speed: 1.2,
    opacity: 100,
    paused: false,
    ...props,
  };
  const geometry = Object.entries(
    customizationStyle(spinner.id, p.size, p.custom),
  )
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
  return `<span class="ss-spinner ss-${spinner.id}${p.paused ? " ss-paused" : ""}" style="--ss-size:${p.size}px;--ss-color:${p.color};--ss-speed:${p.speed}s;${geometry};${p.easing ? `--ss-easing:${escape(p.easing)};` : ""}opacity:${p.opacity / 100}" aria-hidden="true">${Array.from({ length: spinner.count }, (_, i) => `<span style="--ss-i:${i}"></span>`).join("")}</span>`;
}
function url(s) {
  return `/spinners/${s.id}`;
}
$("#spinner-nav").innerHTML = catalog
  .map((spinner) => `<a href="${url(spinner)}" data-route>${spinner.name}</a>`)
  .join("");

function header(title, subtitle, eyebrow) {
  return `<header class="intro"><h1>${eyebrow ? `<span>${eyebrow}</span> ${title}` : title}</h1><p>${subtitle}</p></header>`;
}
function home() {
  return `${header("Spin spin, little star.<span>Good things are never far.</span>", "Loading spinners for React. A little spin, a little glow, and you’re ready to go.")}<div class="install"><span>$</span><code>npm install <span class="package">stefans-spinners</span></code><button class="icon-button" data-copy="npm install stefans-spinners" aria-label="Copy to clipboard">${icons.copy}</button></div><div id="grid">${catalog.map((s) => `<a href="${url(s)}" data-route class="spinner-card" data-spinner="${s.id}" aria-label="${s.name}"><span class="card-preview">${markup(s)}</span><span class="card-label">${s.name}</span></a>`).join("")}</div>
    <footer class="inspiration">
      <svg class="inspiration-star" viewBox="0 0 80 80" fill="currentColor" aria-hidden="true">
        <g class="inspiration-orbit"><circle cx="40" cy="8" r="1.5" opacity=".65"/><circle cx="40" cy="72" r="1" opacity=".35"/></g>
        <g class="inspiration-spark"><path d="M40 19C43 34 46 37 61 40C46 43 43 46 40 61C37 46 34 43 19 40C34 37 37 34 40 19Z"/></g>
        <path class="inspiration-twinkle" d="m64 16 1.5 4.5L70 22l-4.5 1.5L64 28l-1.5-4.5L58 22l4.5-1.5Z"/>
      </svg>
      <p>Inspired by <a href="https://loading.dev/" target="_blank" rel="noopener noreferrer">loading.dev</a>’s spark.<br>Spinning my own little stars in the dark.</p>
    </footer>`;
}
function highlight(line) {
  return line
    .split(
      /("[^"]*"|'[^']*'|\b(?:import|from|export|function|return)\b|\b\d+(?:\.\d+)?\b)/g,
    )
    .map((token) => {
      const cls = /^["']/.test(token)
        ? "string"
        : /^(import|from|export|function|return)$/.test(token)
          ? "keyword"
          : /^\d/.test(token)
            ? "number"
            : "";
      return cls
        ? `<span class="syntax-${cls}">${escape(token)}</span>`
        : escape(token);
    })
    .join("");
}
function codeMarkup(text) {
  return text
    .split("\n")
    .map((line) => `<span class="code-line">${highlight(line)}</span>`)
    .join("");
}
function codeBlock(text, id = "") {
  if (id === "live-code") return `<figure class="code-block code-editor" id="live-code"><button class="icon-button copy-code" aria-label="Copy code">${icons.copy}</button><div class="code-editor-scroll"><div class="code-editor-content"><pre aria-hidden="true"><code class="code-editor-highlight">${codeMarkup(text)}</code></pre><textarea aria-label="Edit spinner code" aria-describedby="code-editor-status" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off">${escape(text)}</textarea></div></div><figcaption class="code-editor-status" id="code-editor-status" role="status"></figcaption></figure>`;
  return `<figure class="code-block" ${id ? `id="${id}"` : ""}><button class="icon-button copy-code" aria-label="Copy to clipboard">${icons.copy}</button><pre><code>${codeMarkup(text)}</code></pre></figure>`;
}
function imports(s) {
  return `import { ${s.name} } from "stefans-spinners";`;
}
function example(s, props, suffix = "Demo") {
  return `${imports(s)}\n\nexport function ${s.name}${suffix}() {\n  return <${s.name} ${props} />;\n}`;
}
function activeControls() {
  return selected ? getCustomizationControls(selected.id, state.size) : [];
}
function formatValue(value) {
  return Number(value.toFixed(2)).toString();
}
function customizationControlsMarkup() {
  const resolved = resolveCustomization(selected.id, state.size, state.custom);
  return activeControls()
    .map((control) => {
      const step = control.step;
      const min = Math.ceil(control.min / step) * step;
      const max = Math.floor(control.max / step + 1e-9) * step;
      return `<label class="control-row range"><span>${control.label}</span><output id="${control.key}-value">${formatValue(resolved[control.key])}${control.unit}</output><input data-custom="${control.key}" id="custom-${control.key}" type="range" min="${formatValue(min)}" max="${formatValue(max)}" step="${step}" value="${resolved[control.key]}" aria-label="${control.label}"></label>`;
    })
    .join("");
}
function customizationDocs(spinner) {
  const controls = getCustomizationControls(spinner.id, 48);
  return docsSection(
    "customization",
    "Customization",
    controls
      .map(
        (c) =>
          `<code>${c.key}</code> adjusts ${c.label.toLowerCase()}${c.unit === "px" ? " in pixels" : c.unit === "deg" ? " in degrees" : " (0–1)"}.`,
      )
      .join(" "),
    example(
      spinner,
      `size={48} ${controls.map((c) => `${c.key}={${formatValue(c.default)}}`).join(" ")}`,
      "Customized",
    ),
  );
}
function liveCode() {
  const props = [`size={${state.size}}`];
  if (previewColor() !== defaults.color) props.push(`color="${previewColor()}"`);
  if (state.speed !== defaults.speed) props.push(`speed={${state.speed}}`);
  if (state.easing) props.push(`easing="${state.easing}"`);
  if (state.opacity !== 100)
    props.push(`style={{ opacity: ${state.opacity / 100} }}`);
  for (const control of activeControls()) {
    if (state.custom[control.key] !== undefined)
      props.push(`${control.key}={${formatValue(state.custom[control.key])}}`);
  }
  if (state.paused) props.push("paused");
  return example(selected, props.join(" "));
}
const sections = [
  ["customization", "Customization"],
  ["size", "Size"],
  ["custom-classes", "Custom Classes"],
  ["color", "Color"],
  ["speed", "Speed"],
  ["easing", "Easing"],
  ["state", "State"],
  ["accessibility", "Accessibility"],
];
function docsSection(id, title, description, code, preview = "") {
  return `<section class="docs-section" id="${id}"><h2><a href="#${id}">${title}</a></h2><p>${description}</p>${preview ? `<div class="example-preview">${preview}</div>` : ""}${codeBlock(code)}</section>`;
}
function detail(s) {
  const n = catalog.indexOf(s);
  return `${header(s.name, s.description, "Component /")}<section class="playground" id="preview" aria-label="Interactive preview"><div class="preview-stage"><div class="stage-canvas" data-theme="${previewTheme}"><div class="preview-theme" role="group" aria-label="Preview background"><button type="button" data-preview-theme="dark" aria-label="Dark preview background" title="Dark background" aria-pressed="${previewTheme === 'dark'}">${icons.moon}</button><button type="button" data-preview-theme="light" aria-label="Light preview background" title="Light background" aria-pressed="${previewTheme === 'light'}">${icons.sun}</button></div><div id="detail-preview">${markup(s, state)}</div><button id="pause" class="icon-button" aria-label="Pause animation" aria-pressed="false"><span class="pause-glyph" aria-hidden="true">${icons.pause}</span><span class="play-glyph" aria-hidden="true">${icons.play}</span></button><button id="customize-toggle" class="icon-button" aria-label="Hide customization" aria-expanded="true">${icons.chevron}</button></div><div class="controls"><div class="segmented" role="radiogroup" aria-label="Size">${[
    [24, "Small"],
    [48, "Medium"],
    [72, "Large"],
  ]
    .map(
      ([size, name]) =>
        `<label><input type="radio" name="size" value="${size}" ${size === state.size ? "checked" : ""}>${name}</label>`,
    )
    .join(
      "",
    )}</div>${customizationControlsMarkup()}${colorPickerMarkup()}<label class="control-row range"><span>Speed</span><output id="speed-value">1200ms</output><input id="speed" type="range" min="0.2" max="3" step="0.1" value="1.2" aria-label="Speed"></label>${easingPickerMarkup(state.easing ?? getDefaultEasing(s.id))}<label class="control-row range" style="--fill:100%"><span>Opacity</span><output id="opacity-value">100%</output><input id="opacity" type="range" min="0" max="100" step="1" value="100" aria-label="Opacity"></label><button id="reset">${icons.reset} Reset</button></div></div>${codeBlock(liveCode(), "live-code")}</section>${customizationDocs(s)}${docsSection("size", "Size", "Sets the spinner’s dimensions in pixels. The default value is <code>32</code>.", `${imports(s)}\n\nexport function ${s.name}Size() {\n  return (\n    <div style={{ display: "flex", gap: 24 }}>\n      <${s.name} size={16} />\n      <${s.name} size={24} />\n      <${s.name} size={40} />\n    </div>\n  );\n}`, [16, 24, 40].map((size) => markup(s, { size })).join(""))}${docsSection("custom-classes", "Custom Classes", "Pass a <code>className</code> or <code>style</code> to adjust the spinner for your interface.", example(s, 'className="my-spinner" size={32}', "ClassName"))}${docsSection("color", "Color", "Inherits <code>currentColor</code> by default. Use any valid CSS color to change it.", example(s, 'color="#a3a3a3" size={32}', "Color"))}${docsSection("speed", "Speed", "Controls the duration of one animation cycle in seconds. Larger values animate more slowly.", example(s, "speed={2} size={32}", "Speed"))}${docsSection("easing", "Easing", `Choose <code>linear</code>, <code>ease</code>, <code>ease-in</code>, <code>ease-out</code>, or <code>ease-in-out</code>. The default for ${s.name} is <code>${getDefaultEasing(s.id)}</code>.`, example(s, 'easing="ease-out" size={32}', "Easing"))}${docsSection("state", "State", "Pause the animation with <code>paused</code>. Remove it to resume.", example(s, "paused size={32}", "State"))}${docsSection("accessibility", "Accessibility", "Use <code>label</code> for a loading announcement, or <code>decorative</code> when nearby text already explains the loading state. Reduced motion preferences are respected.", example(s, 'label="Loading content" size={32}', "Accessible"))}<nav class="more-spinners" aria-label="More spinners">${n > 0 ? `<a href="${url(catalog[n - 1])}" data-route><small>Previous</small>${catalog[n - 1].name}</a>` : "<span></span>"}${n < catalog.length - 1 ? `<a href="${url(catalog[n + 1])}" data-route><small>Next</small>${catalog[n + 1].name}</a>` : ""}</nav>`;
}
function updatePreview() {
  const spinner = $("#detail-preview .ss-spinner");
  const resolved = resolveCustomization(selected.id, state.size, state.custom);
  for (const control of activeControls()) {
    if (state.custom[control.key] !== undefined)
      state.custom[control.key] = resolved[control.key];
    const input = $("#custom-" + control.key);
    input.min = formatValue(
      Math.ceil(control.min / control.step) * control.step,
    );
    input.max = formatValue(
      Math.floor(control.max / control.step + 1e-9) * control.step,
    );
    input.value = resolved[control.key];
    $("#" + control.key + "-value").textContent =
      `${formatValue(resolved[control.key])}${control.unit}`;
    input.parentElement.style.setProperty(
      "--fill",
      `${((resolved[control.key] - control.min) / (control.max - control.min)) * 100}%`,
    );
  }
  for (const [key, value] of Object.entries(
    customizationStyle(selected.id, state.size, state.custom),
  ))
    spinner.style.setProperty(key, value);
  spinner.style.setProperty("--ss-size", `${state.size}px`);
  spinner.style.setProperty("--ss-color", previewColor());
  spinner.style.setProperty("--ss-speed", `${state.speed}s`);
  if (state.easing) spinner.style.setProperty("--ss-easing", state.easing);
  else spinner.style.removeProperty("--ss-easing");
  easingPicker?.sync(state.easing ?? getDefaultEasing(selected.id));
  spinner.style.opacity = state.opacity / 100;
  spinner.classList.toggle("ss-paused", state.paused);
  $("#pause").setAttribute(
    "aria-label",
    state.paused ? "Play animation" : "Pause animation",
  );
  $("#pause").setAttribute("aria-pressed", String(state.paused));
  colorPicker?.sync(previewColor(), state.opacity);
  document.querySelectorAll("[name=size]").forEach(input => input.checked = Number(input.value) === state.size);
  $("#speed").value = state.speed;
  $("#opacity").value = state.opacity;
  $("#speed-value").textContent = `${Math.round(state.speed * 1000)}ms`;
  $("#opacity-value").textContent = `${state.opacity}%`;
  $("#speed").parentElement.style.setProperty(
    "--fill",
    `${((state.speed - 0.2) / 2.8) * 100}%`,
  );
  $("#opacity").parentElement.style.setProperty("--fill", `${state.opacity}%`);
  codeEditor?.sync(liveCode());
}
function bindDetail() {
  document.querySelectorAll("[data-preview-theme]").forEach((button) => {
    button.onclick = () => {
      previewTheme = button.dataset.previewTheme;
      $(".stage-canvas").dataset.theme = previewTheme;
      document.querySelectorAll("[data-preview-theme]").forEach((option) => {
        option.setAttribute("aria-pressed", String(option.dataset.previewTheme === previewTheme));
      });
      updatePreview();
    };
  });
  codeEditor = createCodeEditor({
    element: $("#live-code"), source: liveCode(), render: codeMarkup,
    parse: code => parseSpinnerCode(code, selected.name, activeControls().map(c => c.key)),
    onChange(values) {
      const next = { ...defaults, ...values };
      if (values.color?.toLowerCase() === previewColor().toLowerCase()) next.color = state.color;
      const resolved = resolveCustomization(selected.id, next.size, next.custom);
      for (const [key, value] of Object.entries(next.custom)) {
        if (Math.abs(resolved[key] - value) > 0.001) throw Error(`${key} is outside the range for size ${next.size}.`);
      }
      state = next;
      updatePreview();
    },
  });
  colorPicker = createColorPicker({
    color: previewColor(),
    opacity: state.opacity,
    onChange: (values) => {
      if (values.color?.toLowerCase() === previewColor().toLowerCase()) values = { ...values, color: state.color };
      Object.assign(state, values);
      updatePreview();
    },
  });
  document.querySelectorAll("[data-custom]").forEach(
    (input) =>
      (input.oninput = () => {
        state.custom = {
          ...state.custom,
          [input.dataset.custom]: Number(input.value),
        };
        updatePreview();
      }),
  );
  document.querySelectorAll("[name=size]").forEach(
    (input) =>
      (input.onchange = () => {
        state.size = Number(input.value);
        updatePreview();
      }),
  );
  for (const key of ["speed", "opacity"])
    $("#" + key).oninput = (e) => {
      state[key] = Number(e.target.value);
      updatePreview();
    };
  bindRangeInputs($(".controls"), {
    getValue: input => input.dataset.custom
      ? resolveCustomization(selected.id, state.size, state.custom)[input.dataset.custom]
      : state[input.id],
    onCommit(input, value) {
      if (input.dataset.custom) state.custom[input.dataset.custom] = value;
      else state[input.id] = value;
      updatePreview();
    },
  });
  easingPicker = createEasingPicker({
    value: state.easing ?? getDefaultEasing(selected.id),
    onChange(value) {
      state.easing = value === getDefaultEasing(selected.id) ? undefined : value;
      updatePreview();
    },
  });
  $("#pause").onclick = () => {
    state.paused = !state.paused;
    updatePreview();
  };
  $("#reset").onclick = () => {
    state = { ...defaults, custom: {} };
    document.querySelector('[name=size][value="48"]').checked = true;
    for (const key of ["speed", "opacity"]) $("#" + key).value = state[key];
    updatePreview();
  };
  $("#customize-toggle").onclick = () => {
    colorPicker?.close();
    easingPicker?.close();
    const controls = $(".controls");
    const collapsed = controls.classList.toggle("is-collapsed");
    controls.inert = collapsed;
    controls.setAttribute("aria-hidden", String(collapsed));
    $("#customize-toggle").setAttribute(
      "aria-expanded",
      String(!collapsed),
    );
    $("#customize-toggle").setAttribute(
      "aria-label",
      collapsed ? "Show customization" : "Hide customization",
    );
    $("#customize-toggle").style.rotate = collapsed ? "180deg" : "";
  };
  $("#copy-page").onclick = () =>
    copy(
      `# ${selected.name}\n\n${selected.description}\n\n\`\`\`jsx\n${liveCode()}\n\`\`\`\n\n${sections.map(([id, title]) => `## ${title}\n${$("#" + id + " p").textContent}\n\n\`\`\`jsx\n${readCode($("#" + id + " figure"))}\n\`\`\``).join("\n\n")}`,
      $("#copy-page"),
    );
  updatePreview();
}
function bindPageTimeline() {
  const nav = document.querySelector(".page-timeline");
  const links = [...nav.querySelectorAll("a")];
  // Scope headings to sections: some playground controls share their IDs.
  const targets = links.map((a) => document.querySelector(
    a.hash === "#preview" ? ".playground" : `.docs-section${a.hash}`,
  ));
  function jump(event) {
    const link = event.target.closest("a");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = targets[links.indexOf(link)];
    if (!target) return;
    event.preventDefault();
    history.pushState(null, "", link.hash);
    target.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth" });
  }
  nav.addEventListener("click", jump);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  function update() {
    frame = 0;
    if (!nav.getClientRects().length) return;
    const y = window.scrollY;
    const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const stops = targets.map((el) => Math.max(0, Math.min(max, el.getBoundingClientRect().top + y - 120)));
    // Reserve scroll distance for the final sections instead of collapsing
    // several markers onto the same bottom-of-page position.
    const minimumSpan = Math.min(180, max / Math.max(1, stops.length - 1));
    for (let i = stops.length - 2; i >= 0; i--) {
      stops[i] = Math.min(stops[i], stops[i + 1] - minimumSpan);
    }
    let index = 0;
    while (index < stops.length - 1 && y >= stops[index + 1]) index++;
    const next = Math.min(index + 1, stops.length - 1);
    const span = stops[next] - stops[index];
    const progress = span > 0 ? Math.max(0, Math.min(1, (y - stops[index]) / span)) : 0;
    const centers = links.map((a) => a.offsetTop + a.offsetHeight / 2);
    const top = centers[0];
    const position = centers[index] + (centers[next] - centers[index]) * progress;
    nav.style.setProperty("--rail-top", `${top}px`);
    nav.style.setProperty("--rail-height", `${centers.at(-1) - top}px`);
    nav.style.setProperty("--star-y", `${position}px`);
    nav.style.setProperty("--trail-height", `${position - top}px`);
    nav.style.setProperty("--star-turn", `${reducedMotion.matches ? 0 : y * 0.18}deg`);
    links.forEach((a, i) => {
      if (i === index) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  const observer = new ResizeObserver(schedule);
  observer.observe(document.querySelector("#content"));
  observer.observe(nav);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  reducedMotion.addEventListener("change", schedule);
  schedule();
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    nav.removeEventListener("click", jump);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    reducedMotion.removeEventListener("change", schedule);
  };
}
function route() {
  destroyPageTimeline?.();
  destroyPageTimeline = null;
  renderedPath = location.pathname;
  const pathname = location.pathname.replace(/\/+$/, "") || "/";
  codeEditor = null;
  easingPicker?.destroy();
  easingPicker = null;
  colorPicker?.destroy();
  colorPicker = null;
  selected = catalog.find((s) => url(s) === pathname) || null;
  state = { ...defaults, custom: {} };
  document.body.classList.toggle("detail", !!selected);
  $("#content").innerHTML = selected ? detail(selected) : home();
  $("#page-nav").hidden = !selected;
  if (selected) {
    $("#page-nav").innerHTML =
      `<button id="copy-page">Copy page ${icons.copy}</button><nav class="page-timeline" aria-label="On this page"><span class="timeline-rail" aria-hidden="true"></span><span class="timeline-star" aria-hidden="true"><svg viewBox="0 0 20 20"><path d="M10 0 12.5 7.5 20 10 12.5 12.5 10 20 7.5 12.5 0 10 7.5 7.5Z" fill="currentColor"/></svg></span><a href="#preview">Preview</a>${sections.map(([id, title]) => `<a href="#${id}">${title}</a>`).join("")}</nav>`;
    bindDetail();
    destroyPageTimeline = bindPageTimeline();
  }
  document.title = selected
    ? `Stefan’s Spinners › ${selected.name}`
    : "Stefan’s Spinners";
  document.querySelectorAll("#sidebar [data-route]").forEach((a) => {
    a.removeAttribute("aria-current");
    if (a.getAttribute("href") === pathname) {
      a.setAttribute("aria-current", "page");
    }
  });
  closeMenu();
  if (location.hash) {
    requestAnimationFrame(() =>
      ([...document.querySelectorAll(".docs-section")].find((section) => section.id === location.hash.slice(1)) || document.getElementById(location.hash.slice(1)))?.scrollIntoView(),
    );
  }
}
function navigate(href, source = null) {
  const nextPath = new URL(href, location.href).pathname.replace(/\/+$/, "");
  if (source && nextPath.startsWith("/spinners/") && nextPath !== location.pathname.replace(/\/+$/, "")) {
    const box = (source.querySelector(".card-preview") || source).getBoundingClientRect();
    scrollStars.nudgeTo(box.left + box.width / 2, box.top + box.height / 2);
  }
  if ($("#search-dialog").open) $("#search-dialog").close();
  history.pushState(null, "", href);
  route();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  scrollStars.resetScroll();
  $("#content").focus({ preventScroll: true });
}
window.addEventListener("popstate", () => {
  if (location.pathname !== renderedPath) {
    route();
    scrollStars.resetScroll();
  }
});
function readCode(figure) {
  if (figure.id === "live-code") return codeEditor.read();
  return [...figure.querySelectorAll(".code-line")]
    .map((line) => line.textContent)
    .join("\n");
}
document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-route]");
  if (
    link &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.shiftKey &&
    !e.altKey &&
    e.button === 0
  ) {
    e.preventDefault();
    if (link.classList.contains("brand-link")) animateBrandLogos();
    navigate(link.getAttribute("href"), link);
    return;
  }
  const copyButton = e.target.closest("[data-copy],.copy-code");
  if (copyButton)
    copy(
      copyButton.dataset.copy || readCode(copyButton.closest("figure")),
      copyButton,
    );
});
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 2600);
}
async function copy(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const icon = button.innerHTML;
    button.innerHTML =
      button.id === "copy-page" ? `Copied ${icons.check}` : icons.check;
    button.setAttribute("aria-label", "Copied");
    setTimeout(() => {
      if (button.isConnected) {
        button.innerHTML = icon;
        button.setAttribute(
          "aria-label",
          button.id === "copy-page" ? "Copy page" : "Copy to clipboard",
        );
      }
    }, 1500);
  } catch {
    toast("Could not copy. Select and copy the text manually.");
  }
}
function closeMenu() {
  const restoreFocus = $("#sidebar").contains(document.activeElement) && $("#sidebar").classList.contains("open");
  $("#sidebar").classList.remove("open");
  document.documentElement.classList.remove("menu-open");
  ["#page-shell", "#page-nav", "#star-motion"].forEach((selector) => $(selector).inert = false);
  $("#menu").setAttribute("aria-expanded", "false");
  $("#menu").setAttribute("aria-label", "Open navigation");
  $("#menu").innerHTML = icons.menu;
  $("#nav-backdrop").hidden = true;
  if (restoreFocus) $("#menu").focus({ preventScroll: true });
}
$("#menu").onclick = () => {
  const open = !$("#sidebar").classList.contains("open");
  if (!open) { closeMenu(); return; }
  $("#sidebar").classList.toggle("open", open);
  document.documentElement.classList.add("menu-open");
  ["#page-shell", "#page-nav", "#star-motion"].forEach((selector) => $(selector).inert = true);
  $("#menu").setAttribute("aria-expanded", String(open));
  $("#menu").setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  $("#menu").innerHTML = icons[open ? "close" : "menu"];
  $("#nav-backdrop").hidden = !open;
};
window.matchMedia("(max-width: 767px)").addEventListener("change", closeMenu);
$("#nav-backdrop").onclick = closeMenu;
function search() {
  const query = $("#search").value.trim().toLowerCase();
  searchItems = [
    ...(!query || "overview".includes(query)
      ? [{ name: "Overview", id: "overview" }]
      : []),
    ...catalog.filter((s) =>
      `${s.name} ${s.category}`.toLowerCase().includes(query),
    ),
  ];
  searchIndex = 0;
  $("#search-results").innerHTML = searchItems.length
    ? searchItems
        .map(
          (s, i) =>
            `<div class="search-option" role="option" id="result-${i}" data-index="${i}" aria-selected="${i === 0}">${s.name}</div>`,
        )
        .join("")
    : '<p class="search-empty">No matches yet.<span>Try a different name or shape.</span></p>';
  $("#search-count").textContent = `${searchItems.length} ${searchItems.length === 1 ? "result" : "results"}`;
  $("#search").setAttribute(
    "aria-activedescendant",
    searchItems.length ? "result-0" : "",
  );
  $("#search-results").scrollTop = 0;
}
function openSearch() {
  closeMenu();
  $("#search").value = "";
  search();
  $("#search-dialog").showModal();
  $("#search").focus();
  animateBrandLogos("#search-dialog .logo");
}
$("#search-trigger").onclick = openSearch;
$("#search").oninput = search;
$("#close-search").onclick = () => $("#search-dialog").close();
$("#search-dialog").addEventListener("click", (e) => {
  if (e.target === $("#search-dialog")) {
    const r = e.target.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      e.target.close();
  }
});
$("#search-results").onclick = (e) => {
  const option = e.target.closest("[data-index]");
  if (option) selectSearch(Number(option.dataset.index));
};
function selectSearch(i) {
  const s = searchItems[i];
  if (s) navigate(s.id === "overview" ? "/" : url(s));
}
$("#search").onkeydown = (e) => {
  if (e.key === "Escape") {
    e.preventDefault();
    $("#search-dialog").close();
    return;
  }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    if (!searchItems.length) return;
    searchIndex =
      (searchIndex + (e.key === "ArrowDown" ? 1 : -1) + searchItems.length) %
      searchItems.length;
    document
      .querySelectorAll(".search-option")
      .forEach((o, i) =>
        o.setAttribute("aria-selected", String(i === searchIndex)),
      );
    $("#search").setAttribute("aria-activedescendant", `result-${searchIndex}`);
    $("#result-" + searchIndex).scrollIntoView({ block: "nearest" });
  }
  if (e.key === "Enter") {
    e.preventDefault();
    selectSearch(searchIndex);
  }
};
let lastKey = "";
document.addEventListener("keydown", (e) => {
  const typing = e.target.matches("input,textarea,[contenteditable]");
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if ($("#search-dialog").open) $("#search-dialog").close();
    else openSearch();
  }
  if (e.key === "Escape") closeMenu();
  if (!typing && !e.metaKey && !e.ctrlKey) {
    if (lastKey === "g" && e.key === "o") navigate("/");
    lastKey = e.key;
    setTimeout(() => (lastKey = ""), 1000);
  }
});
route();
requestAnimationFrame(() => animateBrandLogos());
