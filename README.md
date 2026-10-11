# Stefan’s Spinners

**A little motion. A better wait.**

24 accessible CSS loading indicators for React and the web. Customize color, size, and speed. No animation runtime. MIT licensed.

[Explore the gallery](https://spinners.stefanmihajlovic.com) · [AI documentation](https://spinners.stefanmihajlovic.com/llms.txt)

## Install

```sh
npm install stefans-spinners
```

```tsx
import { Orbit } from 'stefans-spinners';
import 'stefans-spinners/styles.css';

export default function Loading() {
  return <Orbit size={32} color="#b5a0ff" speed={1.2} label="Loading content" />;
}
```

Import the stylesheet once at your app root. Requires React 18+. Includes ESM, CommonJS, and TypeScript declarations. Components support server rendering.

## Spinners

Orbit · Arc · Ring · Dots · Wave · Pulse · Ripple · Bars · Grid · Breathe · Comet · Dual · Flare · Flip · Bloom · Chase · Bounce · Pendulum · Square · Stack · Zigzag · Hourglass · Radar · Spark

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | number | `32` | Diameter in pixels |
| `color` | string | `currentColor` | Any CSS color |
| `speed` | number | `1.2` | Seconds per cycle; lower is faster |
| `label` | string | `Loading` | Accessible status label |
| `decorative` | boolean | `false` | Hide from assistive technology |
| `paused` | boolean | `false` | Pause the animation |
| `className` | string | — | Additional CSS classes |
| `style` | CSSProperties | — | Inline style overrides |

Standard span attributes are forwarded. Children are internal. Use `label` and `decorative` to control accessibility. Nonpositive/nonfinite size and speed use their defaults.

## Accessibility

Spinners expose a labeled status and respect `prefers-reduced-motion`. Use `decorative` when adjacent text already describes the loading state, and set `aria-busy` on the region being loaded.

```tsx
<button disabled><Dots size={20} decorative /> Saving…</button>
```

## Without React

Use the bundled `dist/styles.css` and plain HTML. The gallery’s **HTML + CSS** tab generates markup for each spinner. See [llms-full.txt](./llms-full.txt) for child counts and complete documentation.

```js
import { spinners } from 'stefans-spinners/catalog';
```

The catalog is framework independent. Modern evergreen browsers are supported.

## Development

```sh
npm ci
npm test
npm run typecheck
npm run build:site
npm run dev
```

Open http://127.0.0.1:4173. Netlify builds the package and the documentation using `netlify.toml`.

## Release

With an authorized npm account and 2FA configured:

```sh
npm login
npm publish --access public
```

`prepublishOnly` builds, tests, and typechecks before publishing. Never commit credentials. Future releases should increment the package version before publication.

## License

[MIT](./LICENSE) © 2026 [Stefan Mihajlovic](https://stefanmihajlovic.com).
