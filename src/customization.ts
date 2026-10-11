import type { SpinnerVariant } from "./catalog";
import { hourglassMask, arcMask, infinityPath } from "./geometry";

/** Geometry controls use pixels, except angles and arc lengths (degrees),
 * and trackOpacity/pulseScale/innerRadius (fractions from 0 to 1). */
export type CustomizationKey =
  | "arcLength"
  | "outerArcLength"
  | "innerArcLength"
  | "outerBorderRadius"
  | "innerBorderRadius"
  | "thirdStrokeWidth"
  | "trackStrokeWidth"
  | "innerRadius"
  | "travelDistance"
  | "strokeWidth"
  | "outerStrokeWidth"
  | "innerStrokeWidth"
  | "firstStrokeWidth"
  | "secondStrokeWidth"
  | "sweepWidth"
  | "borderRadius"
  | "dotSize"
  | "barWidth"
  | "gap"
  | "tilt"
  | "trackOpacity"
  | "pulseScale"
  | "petalWidth"
  | "petalLength"
  | "bounceHeight"
  | "swing"
  | "waistWidth"
  | "sweepAngle";
export type SpinnerCustomizationProps = Partial<
  Record<CustomizationKey, number>
>;
export interface CustomizationControl {
  key: CustomizationKey;
  label: string;
  css: string;
  unit: "px" | "deg" | "";
  default: number;
  min: number;
  max: number;
  step: number;
  relative?: boolean;
  fallback?: CustomizationKey;
}
const pixels = (
  key: CustomizationKey,
  label: string,
  css: string,
  value: number,
  min: number,
  max: number,
): CustomizationControl => ({
  key,
  label,
  css,
  unit: "px",
  default: value,
  min,
  max,
  step: 0.1,
  relative: true,
});
const stroke = (value: number) =>
  pixels("strokeWidth", "Stroke width", "--ss-stroke-width", value, 0.01, 0.18);
const partStroke = (
  key:
    | "outerStrokeWidth"
    | "innerStrokeWidth"
    | "firstStrokeWidth"
    | "secondStrokeWidth"
    | "thirdStrokeWidth"
    | "trackStrokeWidth",
  label: string,
  css: string,
  value: number,
): CustomizationControl => ({
  ...pixels(key, label, css, value, 0.01, 0.18),
  fallback: "strokeWidth",
});
const pair = (value: number) => [
  partStroke(
    "outerStrokeWidth",
    "Outer width",
    "--ss-outer-stroke-width",
    value,
  ),
  partStroke(
    "innerStrokeWidth",
    "Inner width",
    "--ss-inner-stroke-width",
    value,
  ),
];
const radius = (value: number): CustomizationControl => ({
  key: "borderRadius",
  label: "Border radius",
  css: "--ss-radius",
  unit: "px",
  default: value,
  min: 0,
  max: 0.5,
  step: 0.1,
  relative: true,
});
const dots = (value = 0.21) =>
  pixels("dotSize", "Dot size", "--ss-dot-size", value, 0.08, 0.28);
const bar = (value = 0.12) =>
  pixels("barWidth", "Bar width", "--ss-bar-width", value, 0.04, 0.19);
const absolute = (
  key: CustomizationKey,
  label: string,
  css: string,
  unit: "deg" | "",
  value: number,
  min: number,
  max: number,
  step = 1,
): CustomizationControl => ({
  key,
  label,
  css,
  unit,
  default: value,
  min,
  max,
  step,
});

const length = (value = 180) => absolute("arcLength", "Arc length", "--ss-arc-length", "deg", value, 20, 340);
const caps = () => ({ ...radius(.0425), label: "End radius", max: .09, step: .01 });
const spacing = () => pixels("gap", "Gap", "--ss-gap", .15, .02, .2);
const scale = (value = .3) => absolute("pulseScale", "Minimum scale", "--ss-pulse-scale", "", value, .1, .9, .01);
/** One source of truth for component props and the interactive gallery. */
export const customizationControls: Record<
  SpinnerVariant,
  readonly CustomizationControl[]
> = {
  orbit: [
    stroke(0.045),
    absolute("tilt", "Orbit tilt", "--ss-tilt", "deg", 65, 0, 85),
  ],
  arc: [stroke(0.085), caps(), length()],
  ring: [
    stroke(0.075),
    caps(), length(90),
    partStroke("trackStrokeWidth", "Track width", "--ss-track-stroke-width", .075),
    absolute(
      "trackOpacity",
      "Track opacity",
      "--ss-track-opacity",
      "",
      0.18,
      0,
      1,
      0.01,
    ),
  ],
  dots: [dots(), radius(0.105), spacing()],
  wave: [bar(), { ...radius(10), relative: false, max: 24 }, scale()],
  pulse: [
    radius(0.38),
    absolute(
      "pulseScale",
      "Minimum scale",
      "--ss-pulse-scale",
      "",
      0.45,
      0.1,
      0.9,
      0.01,
    ),
  ],
  ripple: [stroke(0.045), scale(.1)],
  bars: [
    { ...bar(0.17), max: 0.24 },
    { ...radius(1), relative: false, max: 24 },
    scale(.25),
  ],
  grid: [pixels("gap", "Gap", "--ss-gap", 0.12, 0, 0.25), radius(0.033)],
  breathe: [
    partStroke(
      "firstStrokeWidth",
      "First ring width",
      "--ss-first-stroke-width",
      0.035,
    ),
    partStroke(
      "secondStrokeWidth",
      "Second ring width",
      "--ss-second-stroke-width",
      0.035,
    ),
  ],
  comet: [stroke(0.105), caps(), length(300)],
  dual: [
    ...pair(.06),
    {...caps(), key: "outerBorderRadius", label: "Outer end radius", css: "--ss-outer-radius"},
    {...caps(), key: "innerBorderRadius", label: "Inner end radius", css: "--ss-inner-radius-px"},
    {...length(70), key: "outerArcLength", label: "Outer arc length", css: "--ss-outer-arc-length", max: 170},
    {...length(70), key: "innerArcLength", label: "Inner arc length", css: "--ss-inner-arc-length", max: 170},
  ],
  flare: [
    { ...bar(0.08), max: 0.18 },
    { ...radius(9), relative: false, max: 24 },
  ],
  flip: [radius(0.1216)],
  bloom: [
    pixels("petalWidth", "Petal width", "--ss-petal-width", 0.25, 0.12, 0.4),
    pixels("petalLength", "Petal length", "--ss-petal-length", 0.45, 0.25, 0.5),
  ],
  chase: [{ ...dots(0.17), max: 0.24 }, radius(0.085)],
  bounce: [
    dots(), radius(.105), spacing(),
    pixels(
      "bounceHeight",
      "Bounce height",
      "--ss-bounce-height",
      0.21,
      0.05,
      0.65,
    ),
  ],
  pendulum: [
    dots(), spacing(),
    absolute("swing", "Swing angle", "--ss-swing", "deg", 30, 5, 65),
  ],
  square: [...pair(0.05), radius(0)],
  stack: [
    { ...radius(2), relative: false, max: 24 },
    pixels("gap", "Gap", "--ss-gap", 0.11, 0.02, 0.22),
  ],
  zigzag: [bar(), { ...radius(1), relative: false, max: 24 }],
  hourglass: [
    pixels("waistWidth", "Waist width", "--ss-waist-width", 0.125, 0.02, 0.5),
    { ...radius(1 / 6), max: 0.2 },
  ],
  radar: [
    partStroke(
      "outerStrokeWidth",
      "Ring width",
      "--ss-outer-stroke-width",
      0.035,
    ),
    pixels("sweepWidth", "Sweep width", "--ss-sweep-width", 0.5, 0.04, 0.5),
    absolute(
      "sweepAngle",
      "Sweep angle",
      "--ss-sweep-angle",
      "deg",
      126,
      20,
      300,
    ),
  ],
  star: [absolute("innerRadius", "Inner radius", "--ss-inner-radius", "", .45, .2, .75, .01)],
  twinkle: [
    absolute("innerRadius", "Inner radius", "--ss-inner-radius", "", .25, .1, .6, .01),
    absolute("pulseScale", "Minimum scale", "--ss-pulse-scale", "", .65, .3, .9, .01),
  ],
  satellite: [
    partStroke("outerStrokeWidth", "Ring width", "--ss-outer-stroke-width", .025),
    { ...dots(.18), max: .3 },
  ],
  eclipse: [{ ...stroke(.18), label: "Crescent width", max: .38 }],
  helix: [
    { ...dots(.12), min: .06, max: .18 },
    pixels("travelDistance", "Travel distance", "--ss-travel-distance", .25, .08, .35),
  ],
  pinwheel: [
    pixels("petalWidth", "Blade width", "--ss-petal-width", .28, .1, .45),
    pixels("petalLength", "Blade length", "--ss-petal-length", .42, .25, .5),
  ],
  asterisk: [bar(.07), pixels("petalLength", "Ray length", "--ss-petal-length", .35, .15, .45), radius(.035)],
  binary: [dots(.2), pixels("gap", "Orbit radius", "--ss-gap", .32, .15, .36)],
  beads: [{...dots(.1), min: .04, max: .16}, scale(.4)],
  constellation: [{...dots(.22), label: "Star size", min: .1, max: .3}, scale(.3)],
  vortex: [
    partStroke("firstStrokeWidth", "Outer width", "--ss-first-stroke-width", .045),
    {...partStroke("secondStrokeWidth", "Middle width", "--ss-second-stroke-width", .035), max: .12},
    {...partStroke("thirdStrokeWidth", "Inner width", "--ss-third-stroke-width", .025), max: .08},
    caps(), length(240),
  ],
  gyro: [...pair(.035), absolute("tilt", "Tilt", "--ss-tilt", "deg", 60, 20, 80)],
  infinity: [dots(.14), pixels("travelDistance", "Loop width", "--ss-travel-distance", .38, .2, .4)],
  newton: [dots(.21), absolute("swing", "Swing angle", "--ss-swing", "deg", 40, 10, 65)],
  shuttle: [dots(.18), stroke(.025), pixels("travelDistance", "Travel distance", "--ss-travel-distance", .36, .1, .4)],
  typing: [dots(.22), spacing(), scale(.3)],
  domino: [{...bar(.1), max: .14}, radius(.025), absolute("tilt", "Lean angle", "--ss-tilt", "deg", 35, 10, 55)],
  steps: [{...dots(.15), label: "Step size", min: .06, max: .18}, radius(.02)],
  tetris: [{...dots(.28), label: "Tile size", min: .12, max: .32}, radius(.04)],
  checker: [pixels("gap", "Gap", "--ss-gap", .1, .02, .22), radius(.06)],
  diamond: [stroke(.045), radius(.06), scale(.65)],
  prism: [pixels("petalWidth", "Triangle width", "--ss-petal-width", .8, .4, .9), absolute("tilt", "Tilt", "--ss-tilt", "deg", 30, 0, 60)],
  fan: [pixels("petalWidth", "Blade width", "--ss-petal-width", .28, .12, .4), pixels("petalLength", "Blade length", "--ss-petal-length", .42, .25, .48), radius(.12)],
  flower: [pixels("petalWidth", "Petal width", "--ss-petal-width", .17, .08, .25), pixels("petalLength", "Petal length", "--ss-petal-length", .32, .15, .42), radius(.085)],
  clock: [...pair(.045).map((c, i) => ({...c, label: i === 0 ? "Hour hand width" : "Minute hand width"})), partStroke("trackStrokeWidth", "Track width", "--ss-track-stroke-width", .02), pixels("petalLength", "Hour hand length", "--ss-petal-length", .25, .12, .35), pixels("travelDistance", "Minute hand length", "--ss-travel-distance", .38, .2, .44), radius(.025)],
  crosshair: [stroke(.05), pixels("petalLength", "Corner length", "--ss-petal-length", .26, .15, .36), radius(.03)],
  spark: [{ ...dots(0.25), label: "Diamond size", max: 0.35 }, radius(0.0625)],
};

export function getCustomizationControls(
  variant: SpinnerVariant,
  size: number,
): CustomizationControl[] {
  return customizationControls[variant].map((control) => {
    const factor = control.relative ? size : 1;
    return {
      ...control,
      default: control.default * factor,
      min: control.min * factor,
      max: control.max * factor,
    };
  });
}
export function resolveCustomization(
  variant: SpinnerVariant,
  size: number,
  values: SpinnerCustomizationProps = {},
): SpinnerCustomizationProps {
  return Object.fromEntries(
    getCustomizationControls(variant, size).map((control) => {
      const explicit = values[control.key];
      const value =
        typeof explicit === "number" && Number.isFinite(explicit)
          ? explicit
          : control.fallback
            ? values[control.fallback]
            : explicit;
      return [
        control.key,
        typeof value === "number" && Number.isFinite(value)
          ? Math.max(control.min, Math.min(control.max, value))
          : control.default,
      ];
    }),
  );
}
export function customizationStyle(
  variant: SpinnerVariant,
  size: number,
  values: SpinnerCustomizationProps = {},
): Record<string, string> {
  const resolved = resolveCustomization(variant, size, values);
  const style = Object.fromEntries(
    getCustomizationControls(variant, size).map((control) => [
      control.css,
      `${resolved[control.key]}${control.unit}`,
    ]),
  );
  if (variant === "hourglass")
    style["--ss-hourglass-mask"] = hourglassMask(
      size,
      resolved.waistWidth!,
      resolved.borderRadius!,
    );
  if (["arc", "ring", "comet"].includes(variant)) {
    const diameter = size * (variant === "arc" ? .84 : variant === "ring" ? .92 : 1);
    style["--ss-arc-mask"] = arcMask(diameter, resolved.strokeWidth!, resolved.borderRadius!, resolved.arcLength!);
  }
  if (variant === "dual") {
    style["--ss-arc-mask"] = arcMask(size, resolved.outerStrokeWidth!, resolved.outerBorderRadius!, resolved.outerArcLength!, 2);
    style["--ss-inner-arc-mask"] = arcMask(size * .52, resolved.innerStrokeWidth!, resolved.innerBorderRadius!, resolved.innerArcLength!, 2);
  }
  if (variant === "vortex") {
    [resolved.firstStrokeWidth!, resolved.secondStrokeWidth!, resolved.thirdStrokeWidth!].forEach((width, i) => {
      style[`--ss-arc-mask-${i}`] = arcMask(size * (1 - i * .32), width, resolved.borderRadius!, resolved.arcLength!);
    });
  }
  if (variant === "infinity") style["--ss-path"] = infinityPath(size, resolved.travelDistance!);
  return style;
}
