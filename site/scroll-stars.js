// Use the original sky tiles so density, dot sizes and brightness stay familiar.
export function createScrollStars(host) {
  let paused = false, lastScroll = window.scrollY, ignoreUntil = 0;
  let velocity = 0, offset = 0, drift = 0, frame = 0, previous = 0;
  let panX = 0, panY = 0, targetX = 0, targetY = 0, panVX = 0, panVY = 0;
  let render = () => {}, ready = false;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const staticSky = matchMedia("(max-width: 767px), (hover: none) and (pointer: coarse)");
  let initialized = false;
  function tick(time) {
    frame = 0;
    const dt = previous ? Math.min((time - previous) / 1000, .05) : 0;
    previous = time;
    const y = window.scrollY;
    const moving = !paused && !reduced.matches && !staticSky.matches && !document.hidden;
    if (moving && dt > 0) {
      const delta = time > ignoreUntil ? y - lastScroll : 0;
      offset += delta;
      const speed = Math.max(-4000, Math.min(4000, delta / dt));
      velocity += (speed - velocity) * (1 - Math.exp(-dt * 12));
      const blend = 1 - Math.exp(-dt * 6);
      const dx = (targetX - panX) * blend, dy = (targetY - panY) * blend;
      panX += dx; panY += dy;
      panVX = dx / dt; panVY = dy / dt;
      drift += dt;
    } else { velocity = 0; panVX = 0; panVY = 0; }
    lastScroll = y;
    render();
    if (moving) frame = requestAnimationFrame(tick);
  }
  function resume() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!ready || staticSky.matches) return;
    previous = 0;
    lastScroll = window.scrollY;
    frame = requestAnimationFrame(tick);
  }
  function initialize() {
    if (initialized || staticSky.matches) return;
    initialized = true;
    Promise.all(["far", "near"].map(async (layer) => {
    const response = await fetch(`/stars-${layer}.svg`);
    if (!response.ok) throw Error("Star tile unavailable");
    const svg = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
    return [...svg.querySelectorAll("circle")].map((dot) =>
      ["cx", "cy", "r", "opacity"].map((key) => Number(dot.getAttribute(key))));
  })).then((patterns) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.className = "scroll-star-canvas";
    host.prepend(canvas);
    let width = 0, height = 0;
    const wrap = (value, period) => ((value % period) + period) % period;
    function dot(x, y, radius, alpha, tail, tailX = 0) {
      if (x < -3 || x > width + 3 || y < -20 || y > height + 20) return;
      if (Math.hypot(tail, tailX) > .2) {
        const gradient = ctx.createLinearGradient(x, y, x + tailX, y + tail);
        gradient.addColorStop(0, `rgba(231,233,239,${alpha * .7})`);
        gradient.addColorStop(1, "rgba(231,233,239,0)");
        ctx.strokeStyle = gradient;
        ctx.lineWidth = radius * 1.3;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + tailX, y + tail); ctx.stroke();
      }
      ctx.fillStyle = `rgba(231,233,239,${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
    render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = "round";
      patterns.forEach((pattern, layer) => {
        const depth = layer ? .32 : .17;
        const shift = wrap((layer ? 120 : 0) + panY * depth - offset * depth - drift * (layer ? 8.18 : 5), 900);
        const shiftX = wrap((layer ? 70 : -100) + panX * depth, 900);
        const tail = Math.max(-14, Math.min(14, (velocity - panVY) * depth * .022));
        const tailX = Math.max(-8, Math.min(8, -panVX * depth * .022));
        for (let row = -1; row <= Math.ceil(height / 900); row++) {
          for (let col = -1; col <= Math.ceil(width / 900); col++) {
            for (const [x, y, radius, alpha] of pattern) {
              dot(x + col * 900 + shiftX, y + row * 900 + shift, radius, alpha, tail, tailX);
            }
          }
        }
      });
      // The four larger stars follow the same scroll, with a nearer depth.
      [[.12,.18],[.79,.12],[.92,.64],[.24,.79]].forEach(([px,py], index) => {
        const x = wrap(px * width + panX * .4 + 12, width + 24) - 12;
        const y = wrap(py * height + panY * .4 - offset * .4 - drift * 3 + 12, height + 24) - 12;
        const alpha = .3 + .15 * Math.sin(drift * .4 + index * 2);
        dot(x, y, .8, alpha, Math.sign(velocity) * Math.min(16, Math.abs(velocity) * .009));
        ctx.fillStyle = `rgba(231,233,239,${alpha})`;
        ctx.beginPath();
        [[0,-4.5],[1,-1],[4.5,0],[1,1],[0,4.5],[-1,1],[-4.5,0],[-1,-1]].forEach(([dx,dy], i) => {
          if (!i) ctx.moveTo(x+dx,y+dy); else ctx.lineTo(x+dx,y+dy);
        });
        ctx.closePath(); ctx.fill();
      });
    };
    new ResizeObserver(() => {
      if (staticSky.matches) return;
      width = host.clientWidth; height = host.clientHeight;
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      render();
      host.classList.add("scroll-stars-ready");
    }).observe(host);
    ready = true;
    resume();
  }).catch(() => { /* Keep the original CSS sky if a tile cannot be loaded. */ });
  }
  initialize();
  function settle() { targetX = panX; targetY = panY; resume(); }
  reduced.addEventListener("change", settle);
  staticSky.addEventListener("change", () => { initialize(); settle(); });
  document.addEventListener("visibilitychange", settle);
  return {
    nudgeTo(x, y) {
      if (paused || reduced.matches || staticSky.matches || document.hidden) return;
      const bounds = host.getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, (x - bounds.left) / Math.max(1, bounds.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, (y - bounds.top) / Math.max(1, bounds.height) * 2 - 1));
      // The camera approaches the clicked position; the sky slips the other way.
      targetX -= nx * 200;
      targetY -= ny * 200;
    },
    setPaused(value) { paused = value; velocity = 0; settle(); },
    resetScroll() { lastScroll = window.scrollY; velocity = 0; ignoreUntil = performance.now() + 150; },
  };
}
