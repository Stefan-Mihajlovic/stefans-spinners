import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
} from "react";
import { spinners, type SpinnerVariant } from "./catalog";
import {
  customizationStyle,
  type SpinnerCustomizationProps,
} from "./customization";
export {
  customizationControls,
  type SpinnerCustomizationProps,
} from "./customization";
export { spinners, type SpinnerName, type SpinnerVariant } from "./catalog";
import type { SpinnerEasing } from "./easing";
export { easingOptions, getDefaultEasing, type SpinnerEasing } from "./easing";
export interface SpinnerProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color" | "children">,
    SpinnerCustomizationProps {
  /** Diameter in pixels. Default 32. */
  size?: number;
  /** Any CSS color. Default currentColor. */
  color?: string;
  /** Animation cycle in seconds. Default 1.2. */
  speed?: number;
  /** Animation timing. Omit to preserve the spinner’s original easing. */
  easing?: SpinnerEasing;
  /** Accessible status label. Default Loading. */
  label?: string;
  /** Hide from assistive technology when nearby text already describes loading. */
  decorative?: boolean;
  /** Pause the animation. */
  paused?: boolean;
}
const positive = (value: number, fallback: number) =>
  Number.isFinite(value) && value > 0 ? value : fallback;
function createSpinner(variant: SpinnerVariant, count: number) {
  function Component({
    size = 32,
    color = "currentColor",
    speed = 1.2,
    easing,
    label = "Loading",
    decorative = false,
    paused = false,
    className = "",
    style,
    arcLength,
    outerArcLength,
    innerArcLength,
    outerBorderRadius,
    innerBorderRadius,
    thirdStrokeWidth,
    trackStrokeWidth,
    innerRadius,
    travelDistance,
    strokeWidth,
    outerStrokeWidth,
    innerStrokeWidth,
    firstStrokeWidth,
    secondStrokeWidth,
    sweepWidth,
    borderRadius,
    dotSize,
    barWidth,
    gap,
    tilt,
    trackOpacity,
    pulseScale,
    petalWidth,
    petalLength,
    bounceHeight,
    swing,
    waistWidth,
    sweepAngle,
    ...rest
  }: SpinnerProps): ReactElement {
    return createElement(
      "span",
      {
        ...rest,
        className: `ss-spinner ss-${variant}${paused ? " ss-paused" : ""}${className ? ` ${className}` : ""}`,
        style: {
          "--ss-size": `${positive(size, 32)}px`,
          "--ss-color": color,
          "--ss-speed": `${positive(speed, 1.2)}s`,
          ...(easing ? { "--ss-easing": easing } : {}),
          ...customizationStyle(variant, positive(size, 32), {
            arcLength,
            outerArcLength,
            innerArcLength,
            outerBorderRadius,
            innerBorderRadius,
            thirdStrokeWidth,
            trackStrokeWidth,
            innerRadius,
            travelDistance,
            strokeWidth,
            outerStrokeWidth,
            innerStrokeWidth,
            firstStrokeWidth,
            secondStrokeWidth,
            sweepWidth,
            borderRadius,
            dotSize,
            barWidth,
            gap,
            tilt,
            trackOpacity,
            pulseScale,
            petalWidth,
            petalLength,
            bounceHeight,
            swing,
            waistWidth,
            sweepAngle,
          }),
          ...style,
        } as CSSProperties,
        role: decorative ? undefined : "status",
        "aria-label": decorative ? undefined : label,
        "aria-hidden": decorative ? true : undefined,
      },
      Array.from({ length: count }, (_, i) =>
        createElement("span", {
          key: i,
          "aria-hidden": true,
          style: { "--ss-i": i } as CSSProperties,
        }),
      ),
    );
  }
  Component.displayName = spinners.find((s) => s.id === variant)!.name;
  return Component;
}
export const Orbit = createSpinner("orbit", 3);
export const Arc = createSpinner("arc", 1);
export const Ring = createSpinner("ring", 1);
export const Dots = createSpinner("dots", 3);
export const Wave = createSpinner("wave", 5);
export const Pulse = createSpinner("pulse", 1);
export const Ripple = createSpinner("ripple", 3);
export const Bars = createSpinner("bars", 4);
export const Grid = createSpinner("grid", 9);
export const Breathe = createSpinner("breathe", 2);
export const Comet = createSpinner("comet", 1);
export const Dual = createSpinner("dual", 2);
export const Flare = createSpinner("flare", 8);
export const Flip = createSpinner("flip", 1);
export const Bloom = createSpinner("bloom", 6);
export const Chase = createSpinner("chase", 8);
export const Bounce = createSpinner("bounce", 3);
export const Pendulum = createSpinner("pendulum", 3);
export const Square = createSpinner("square", 2);
export const Stack = createSpinner("stack", 3);
export const Zigzag = createSpinner("zigzag", 5);
export const Hourglass = createSpinner("hourglass", 1);
export const Radar = createSpinner("radar", 2);
export const Spark = createSpinner("spark", 4);
export const Star = createSpinner("star", 1);
export const Twinkle = createSpinner("twinkle", 1);
export const Satellite = createSpinner("satellite", 2);
export const Eclipse = createSpinner("eclipse", 1);
export const Helix = createSpinner("helix", 8);
export const Pinwheel = createSpinner("pinwheel", 6);
export const Asterisk = createSpinner("asterisk", 6);
export const Binary = createSpinner("binary", 2);
export const Beads = createSpinner("beads", 12);
export const Constellation = createSpinner("constellation", 5);
export const Vortex = createSpinner("vortex", 3);
export const Gyro = createSpinner("gyro", 2);
export const Infinity = createSpinner("infinity", 2);
export const Newton = createSpinner("newton", 3);
export const Shuttle = createSpinner("shuttle", 1);
export const Typing = createSpinner("typing", 3);
export const Domino = createSpinner("domino", 5);
export const Steps = createSpinner("steps", 5);
export const Tetris = createSpinner("tetris", 4);
export const Checker = createSpinner("checker", 4);
export const Diamond = createSpinner("diamond", 1);
export const Prism = createSpinner("prism", 1);
export const Fan = createSpinner("fan", 4);
export const Flower = createSpinner("flower", 8);
export const Clock = createSpinner("clock", 2);
export const Crosshair = createSpinner("crosshair", 4);
