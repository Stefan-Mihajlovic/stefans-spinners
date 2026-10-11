/** A rounded polygon mask keeps the hourglass corners soft at every size.
 * The mask is computed once per render; rotation remains a CSS animation. */
export function hourglassMask(
  size: number,
  waistWidth: number,
  radius: number,
): string {
  const extent = size * 0.88;
  const half = extent / 2;
  const points = [
    [0, 0],
    [extent, 0],
    [half + waistWidth / 2, half],
    [extent, extent],
    [0, extent],
    [half - waistWidth / 2, half],
  ];
  const rounded = points.map((point, i) => {
    const before = points[(i + points.length - 1) % points.length];
    const after = points[(i + 1) % points.length];
    const incoming = Math.hypot(before[0] - point[0], before[1] - point[1]);
    const outgoing = Math.hypot(after[0] - point[0], after[1] - point[1]);
    const distance = Math.min(radius, incoming / 2, outgoing / 2);
    const approach = (other: number[], length: number) =>
      point.map(
        (value, axis) => value + ((other[axis] - value) * distance) / length,
      );
    return {
      point,
      start: approach(before, incoming),
      end: approach(after, outgoing),
    };
  });
  const xy = (point: number[]) =>
    point.map((value) => Number(value.toFixed(4))).join(" ");
  const path =
    `M${xy(rounded[0].start)} ` +
    rounded
      .map(
        (corner) =>
          `L${xy(corner.start)} Q${xy(corner.point)} ${xy(corner.end)}`,
      )
      .join(" ") +
    "Z";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${extent} ${extent}"><path d="${path}"/></svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
}

/** Rounded annular sectors. Radius is clamped to half the stroke thickness;
 * masks are static geometry, while rotation remains entirely in CSS. */
export function arcMask(diameter: number, width: number, radius: number, degrees: number, copies = 1): string {
  const outer = diameter / 2;
  const thickness = Math.min(width, diameter * .45);
  const inner = outer - thickness;
  const angle = degrees * Math.PI / 180;
  const round = Math.min(Math.max(0, radius), thickness / 2);
  const fullyRound = round >= thickness / 2;
  // Offset the sector inward, then expand it with a circular stroke. Unlike
  // quadratic corner approximations, this converges to true semicircular caps.
  const outside = outer - round;
  const inside = inner + round;
  const xy = (r: number, a: number) => `${(outer + r * Math.cos(a)).toFixed(5)} ${(outer + r * Math.sin(a)).toFixed(5)}`;
  const paths = Array.from({ length: copies }, (_, i) => {
    const start = -Math.PI / 2 + i * Math.PI * 2 / copies;
    const end = start + angle;
    const arc = `M${xy(outside, start)} A${outside} ${outside} 0 ${angle > Math.PI ? 1 : 0} 1 ${xy(outside, end)}`;
    return fullyRound ? arc : `${arc} L${xy(inside, end)} A${inside} ${inside} 0 ${angle > Math.PI ? 1 : 0} 0 ${xy(inside, start)}Z`;
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${diameter} ${diameter}"><path d="${paths.join(' ')}" fill="${fullyRound ? 'none' : 'black'}" stroke="black" stroke-width="${round * 2}" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
  return `url('data:image/svg+xml,${encodeURIComponent(svg)}')`;
}

/** Pixel path for CSS motion-path; both particles share one continuous loop. */
export function infinityPath(size: number, travel: number): string {
  const c = size / 2, left = c - travel, right = c + travel;
  const top = size * .02, bottom = size * .98;
  return `path('M ${c} ${c} C ${left} ${top}, ${left} ${top}, ${left} ${c} C ${left} ${bottom}, ${left} ${bottom}, ${c} ${c} C ${right} ${top}, ${right} ${top}, ${right} ${c} C ${right} ${bottom}, ${right} ${bottom}, ${c} ${c} Z')`;
}
