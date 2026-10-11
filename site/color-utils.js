export function normalizeHex(value) {
  const raw = value.trim().replace(/^#/, "");
  if (/^[\da-f]{3}$/i.test(raw))
    return (
      "#" +
      [...raw]
        .map((c) => c + c)
        .join("")
        .toLowerCase()
    );
  return /^[\da-f]{6}$/i.test(raw) ? "#" + raw.toLowerCase() : null;
}
export function hexToHsv(hex, fallbackHue = 0) {
  const color = normalizeHex(hex);
  if (!color) throw new TypeError("Invalid hex color");
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(color.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min;
  let h = fallbackHue;
  if (delta)
    h =
      60 *
      (max === r
        ? ((g - b) / delta + 6) % 6
        : max === g
          ? (b - r) / delta + 2
          : (r - g) / delta + 4);
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}
export function hsvToHex({ h, s, v }) {
  const hue = ((h % 360) + 360) % 360,
    saturation = Math.max(0, Math.min(1, s)),
    value = Math.max(0, Math.min(1, v));
  const chroma = value * saturation,
    x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1)),
    m = value - chroma;
  const [r, g, b] =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return (
    "#" +
    [r, g, b]
      .map((c) =>
        Math.round((c + m) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
