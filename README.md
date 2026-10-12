# Stefan’s Spinners

**Spin spin, little star. Good things are never far.**

60 accessible CSS loading indicators for React and the web. Customize color, size, speed, and each spinner’s shape. No animation runtime. MIT licensed.

[Explore the gallery](https://spinners.stefanmihajlovic.com) · [AI documentation](https://spinners.stefanmihajlovic.com/llms.txt)

## Install

```sh
npm install stefans-spinners
```

```tsx
import { Orbit } from 'stefans-spinners';

export default function Loading() {
  return <Orbit size={32} color="#b5a0ff" speed={1.2} label="Loading content" />;
}
```

Styles load automatically with the component import, once per browser document. Requires React 18+. Includes ESM, CommonJS, and TypeScript declarations.

Server rendering is supported without browser globals. To style the initial server HTML before JavaScript loads (or when inline stylesheets are blocked by your Content Security Policy), optionally import `stefans-spinners/styles.css` once in your app root. This is also needed for React Server Components that never import the package in the browser.

## Spinners

Orbit · Arc · Ring · Dots · Wave · Pulse · Ripple · Bars · Grid · Breathe · Comet · Dual · Flare · Flip · Bloom · Chase · Bounce · Pendulum · Square · Stack · Zigzag · Hourglass · Radar · Spark · Star · Twinkle · Satellite · Eclipse · Helix · Pinwheel · Asterisk · Binary · Beads · Constellation · Vortex · Gyro · Infinity · Newton · Shuttle · Typing · Domino · Steps · Tetris · Checker · Diamond · Prism · Fan · Flower · Clock · Crosshair · Rain · Compass · Meteor · Pacman · Conveyor · Fountain · Gauge · Slinky · Firework · Book

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | number | `32` | Diameter in pixels |
| `color` | string | `currentColor` | Any CSS color |
| `speed` | number | `1.2` | Seconds per cycle; lower is faster |
| `easing` | SpinnerEasing | Per spinner | `linear`, `ease`, `ease-in`, `ease-out`, or `ease-in-out` |
| `label` | string | `Loading` | Accessible status label |
| `decorative` | boolean | `false` | Hide from assistive technology |
| `paused` | boolean | `false` | Pause the animation |
| `className` | string | — | Additional CSS classes |
| `style` | CSSProperties | — | Inline style overrides |

Standard span attributes are forwarded. Children are internal. Use `label` and `decorative` to control accessibility. Nonpositive/nonfinite size and speed use their defaults.

## Shape controls

Each spinner exposes controls for its own geometry. Double-click a gallery slider (or press Enter while it is focused) to type an exact value. Enter or blur applies it; Escape cancels. Speed entry uses milliseconds.

The React example below the preview is editable: change literal props to update the spinner and controls live. The editor supports size, hex color, speed, easing, opacity, pause, and the selected spinner’s geometry. Invalid drafts keep the last valid preview; Reset restores the demo. The editor reads props without executing JavaScript.

```tsx
<Arc size={48} strokeWidth={5} borderRadius={2.5} arcLength={220} />
<Ring size={48} strokeWidth={5} trackOpacity={0.2} />
<Bars size={48} barWidth={8} borderRadius={4} />
<Bloom size={48} petalWidth={14} petalLength={20} />
<Dual size={48} outerStrokeWidth={5} innerStrokeWidth={2} />
<Hourglass size={48} borderRadius={4} />
```

| Spinner | Props |
| --- | --- |
| Orbit | `strokeWidth`, `tilt` |
| Arc | `strokeWidth`, `borderRadius`, `arcLength` |
| Ring | `strokeWidth`, `borderRadius`, `arcLength`, `trackStrokeWidth`, `trackOpacity` |
| Dots | `dotSize`, `borderRadius`, `gap` |
| Wave | `barWidth`, `borderRadius`, `pulseScale` |
| Pulse | `borderRadius`, `pulseScale` |
| Ripple | `strokeWidth`, `pulseScale` |
| Bars | `barWidth`, `borderRadius`, `pulseScale` |
| Grid | `gap`, `borderRadius` |
| Breathe | `firstStrokeWidth`, `secondStrokeWidth` |
| Comet | `strokeWidth`, `borderRadius`, `arcLength` |
| Dual | `outerStrokeWidth`, `innerStrokeWidth`, `outerBorderRadius`, `innerBorderRadius`, `outerArcLength`, `innerArcLength` |
| Flare | `barWidth`, `borderRadius` |
| Flip | `borderRadius` |
| Bloom | `petalWidth`, `petalLength` |
| Chase | `dotSize`, `borderRadius` |
| Bounce | `dotSize`, `borderRadius`, `gap`, `bounceHeight` |
| Pendulum | `dotSize`, `gap`, `swing` |
| Square | `outerStrokeWidth`, `innerStrokeWidth`, `borderRadius` |
| Stack | `borderRadius`, `gap` |
| Zigzag | `barWidth`, `borderRadius` |
| Hourglass | `waistWidth`, `borderRadius` |
| Radar | `outerStrokeWidth`, `sweepWidth`, `sweepAngle` |
| Spark | `dotSize`, `borderRadius` |
| Star | `innerRadius` |
| Twinkle | `innerRadius`, `pulseScale` |
| Satellite | `outerStrokeWidth`, `dotSize` |
| Eclipse | `strokeWidth` |
| Helix | `dotSize`, `travelDistance` |
| Pinwheel | `petalWidth`, `petalLength` |
| Asterisk | `barWidth`, `petalLength`, `borderRadius` |
| Binary | `dotSize`, `gap` |
| Beads | `dotSize`, `pulseScale` |
| Constellation | `dotSize`, `pulseScale` |
| Vortex | `firstStrokeWidth`, `secondStrokeWidth`, `thirdStrokeWidth`, `borderRadius`, `arcLength` |
| Gyro | `outerStrokeWidth`, `innerStrokeWidth`, `tilt` |
| Infinity | `dotSize`, `travelDistance` |
| Newton | `dotSize`, `swing` |
| Shuttle | `dotSize`, `strokeWidth`, `travelDistance` |
| Typing | `dotSize`, `gap`, `pulseScale` |
| Domino | `barWidth`, `borderRadius`, `tilt` |
| Steps | `dotSize`, `borderRadius` |
| Tetris | `dotSize`, `borderRadius` |
| Checker | `gap`, `borderRadius` |
| Diamond | `strokeWidth`, `borderRadius`, `pulseScale` |
| Prism | `petalWidth`, `tilt` |
| Fan | `petalWidth`, `petalLength`, `borderRadius` |
| Flower | `petalWidth`, `petalLength`, `borderRadius` |
| Clock | `outerStrokeWidth`, `innerStrokeWidth`, `trackStrokeWidth`, `petalLength`, `travelDistance`, `borderRadius` |
| Crosshair | `strokeWidth`, `petalLength`, `borderRadius` |
| Rain | `dotSize`, `strokeWidth` |
| Compass | `strokeWidth`, `petalWidth`, `swing` |
| Meteor | `strokeWidth`, `petalLength`, `borderRadius` |
| Pacman | `dotSize`, `sweepAngle` |
| Conveyor | `dotSize`, `borderRadius` |
| Fountain | `dotSize`, `bounceHeight` |
| Gauge | `strokeWidth`, `petalLength`, `swing` |
| Slinky | `strokeWidth`, `gap` |
| Firework | `barWidth`, `petalLength`, `borderRadius` |
| Book | `strokeWidth`, `borderRadius` |

Clock has twelve fixed hour marks and two hands sharing a central pivot. `speed` controls one minute-hand revolution; the hour hand takes twelve times as long.

All geometry props are numbers. Dimensions are in pixels; `tilt`, `swing`, `sweepAngle`, `arcLength`, `outerArcLength`, and `innerArcLength` use degrees. `trackOpacity`, `pulseScale`, and `innerRadius` use fractions from 0 to 1. For Star and Twinkle, `innerRadius` is the inner-to-outer radius ratio. Helix `travelDistance` is the horizontal displacement from its center in pixels; Pinwheel uses `petalWidth` and `petalLength` for its blades. Omitted geometry values use the spinner’s defaults; most scale with `size`. Explicit pixel values keep their size and are clamped to the supported range. Nonfinite values use the default. Unsupported geometry props are ignored. `customizationControls` exports the supported props, units, defaults, and ranges for each spinner; `relative: true` means the metadata’s default/min/max are multiplied by `size`.

Hourglass defaults to a 6 px waist and 8 px corner radius at size 48 (both scale proportionally with `size`); set it to `0` for sharp corners. Its rounded SVG mask is generated when props change, while rotation remains a CSS animation. Dual and Square have separate outer/inner widths; Breathe has first/second ring widths; Radar has a ring width and a sweep width. The legacy `strokeWidth` prop still sets both stroke widths unless a part-specific value overrides it.

### Arc geometry

`arcLength`, `outerArcLength`, and `innerArcLength` are measured in degrees. `borderRadius` rounds the ends of Arc, Ring, and Comet; Dual uses independent `outerBorderRadius` and `innerBorderRadius`. Radius is in pixels and visually stops at half the relevant stroke thickness (fully round). Vortex exposes all three stroke widths separately. Arc geometry uses a static SVG mask; motion still runs entirely in CSS. Set geometry through component props; CSS stroke variables alone do not recompute a mask.

For CSS-only Infinity, `--ss-path` is a CSS `path()` value in pixels, with a default path sized for 32px. Use the React component to automatically rebuild it when changing size or loop width.

## Accessibility

Spinners expose a labeled status and respect `prefers-reduced-motion`. Use `decorative` when adjacent text already describes the loading state, and set `aria-busy` on the region being loaded.

```tsx
<button disabled><Dots size={20} decorative /> Saving…</button>
```

## Without React

Use the bundled `dist/styles.css` and plain HTML. See [llms-full.txt](./llms-full.txt) for child counts and complete documentation.

```js
import { spinners } from 'stefans-spinners/catalog';
```

The catalog is framework independent. Modern evergreen browsers are supported.

## License

[MIT](./LICENSE) © 2026 [Stefan Mihajlovic](https://stefanmihajlovic.com).
