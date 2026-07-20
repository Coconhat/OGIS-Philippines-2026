/* Tiny haptic wrapper. No-ops everywhere it isn't supported (all of
   desktop, and iOS Safari), but on an Android demo device it's the
   difference between "web page" and "app". */

export type HapticKind = "light" | "medium" | "none";

export function haptic(kind: HapticKind = "light") {
  if (kind === "none") return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function")
    return;
  try {
    navigator.vibrate(kind === "medium" ? 12 : 8);
  } catch {
    // Some browsers throw when vibrate is blocked by permissions policy.
  }
}
