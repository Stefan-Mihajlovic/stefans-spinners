import type { SpinnerVariant } from "./catalog";

export const easingOptions = [
  { value: "linear", label: "Linear" },
  { value: "ease", label: "Ease" },
  { value: "ease-in", label: "Ease-in" },
  { value: "ease-out", label: "Ease-out" },
  { value: "ease-in-out", label: "Ease-in-out" },
] as const;
export type SpinnerEasing = (typeof easingOptions)[number]["value"];

const linearSpinners: ReadonlySet<SpinnerVariant> = new Set([
  "arc", "ring", "comet", "dual", "radar", "star", "satellite", "eclipse",
  "pinwheel", "asterisk", "binary", "vortex", "gyro", "infinity", "fan", "clock",
]);
export function getDefaultEasing(variant: SpinnerVariant): SpinnerEasing {
  return linearSpinners.has(variant) ? "linear" : "ease-in-out";
}
