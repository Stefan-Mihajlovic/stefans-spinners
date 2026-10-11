import { createElement, type CSSProperties, type HTMLAttributes, type ReactElement } from 'react';
import { spinners, type SpinnerVariant } from './catalog';
export { spinners, type SpinnerName, type SpinnerVariant } from './catalog';
export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'color' | 'children'> {
  /** Diameter in pixels. Default 32. */
  size?: number;
  /** Any CSS color. Default currentColor. */
  color?: string;
  /** Animation cycle in seconds. Default 1.2. */
  speed?: number;
  /** Accessible status label. Default Loading. */
  label?: string;
  /** Hide from assistive technology when nearby text already describes loading. */
  decorative?: boolean;
  /** Pause the animation. */
  paused?: boolean;
}
const positive = (value: number, fallback: number) => Number.isFinite(value) && value > 0 ? value : fallback;
function createSpinner(variant: SpinnerVariant, count: number) {
  function Component({ size = 32, color = 'currentColor', speed = 1.2, label = 'Loading', decorative = false, paused = false, className = '', style, ...rest }: SpinnerProps): ReactElement {
    return createElement('span', {
      ...rest,
      className: `ss-spinner ss-${variant}${paused ? ' ss-paused' : ''}${className ? ` ${className}` : ''}`,
      style: { '--ss-size': `${positive(size, 32)}px`, '--ss-color': color, '--ss-speed': `${positive(speed, 1.2)}s`, ...style } as CSSProperties,
      role: decorative ? undefined : 'status',
      'aria-label': decorative ? undefined : label,
      'aria-hidden': decorative ? true : undefined,
    }, Array.from({ length: count }, (_, i) => createElement('span', { key: i, 'aria-hidden': true, style: { '--ss-i': i } as CSSProperties })));
  }
  Component.displayName = spinners.find(s => s.id === variant)!.name;
  return Component;
}
export const Orbit = createSpinner('orbit', 3);
export const Arc = createSpinner('arc', 1);
export const Ring = createSpinner('ring', 1);
export const Dots = createSpinner('dots', 3);
export const Wave = createSpinner('wave', 5);
export const Pulse = createSpinner('pulse', 1);
export const Ripple = createSpinner('ripple', 3);
export const Bars = createSpinner('bars', 4);
export const Grid = createSpinner('grid', 9);
export const Breathe = createSpinner('breathe', 2);
export const Comet = createSpinner('comet', 1);
export const Dual = createSpinner('dual', 2);
export const Flare = createSpinner('flare', 8);
export const Flip = createSpinner('flip', 1);
export const Bloom = createSpinner('bloom', 6);
export const Chase = createSpinner('chase', 8);
export const Bounce = createSpinner('bounce', 3);
export const Pendulum = createSpinner('pendulum', 3);
export const Square = createSpinner('square', 2);
export const Stack = createSpinner('stack', 3);
export const Zigzag = createSpinner('zigzag', 5);
export const Hourglass = createSpinner('hourglass', 1);
export const Radar = createSpinner('radar', 2);
export const Spark = createSpinner('spark', 4);
