/**
 * Minimum commit/event counts required to reach each intensity level (0–4).
 * Index i = minimum count to reach intensity i.
 *
 * Formula (from spec):
 *   intensity = thresholds.findIndex(t => count < t) - 1   (clamped 0–4)
 */
export const INTENSITY_THRESHOLDS: Record<string, number[]> = {
  github:  [0, 1, 4, 8, 15],  // 0=none  1–3=1  4–7=2  8–14=3  15+=4
  session: [0, 1, 2, 4, 6],   // session minutes buckets (TBD for duration)
  linkedin: [0, 1, 2, 3, 5],
  x:       [0, 1, 3, 5, 8],
}

export function computeIntensity(count: number, thresholds: number[]): number {
  if (count === 0) return 0
  const idx = thresholds.findIndex((t) => count < t)
  if (idx === -1) return 4
  return Math.max(0, idx - 1)
}
