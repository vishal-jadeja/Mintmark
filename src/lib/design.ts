/**
 * Mintmark design tokens as typed TypeScript constants.
 *
 * Use these for Framer Motion animations or any context where you need
 * raw values instead of CSS custom properties. These mirror the values
 * defined in src/styles/globals.css — keep them in sync.
 *
 * Example usage:
 *   import { colors, shadows, spacing } from '@/lib/design'
 *   animate={{ boxShadow: [shadows.goldSm, shadows.gold, shadows.goldSm] }}
 *   animate={{ color: colors.gold[400] }}
 */

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

export const colors = {
  /** Gold/amber scale (hue ~82°) */
  gold: {
    50: "oklch(0.97 0.025 82)",
    100: "oklch(0.93 0.055 82)",
    200: "oklch(0.88 0.095 82)",
    300: "oklch(0.82 0.135 82)",
    /** Primary accent — dark mode */
    400: "oklch(0.78 0.155 82)",
    500: "oklch(0.72 0.165 80)",
    /** Primary accent — light mode */
    600: "oklch(0.64 0.155 78)",
    700: "oklch(0.54 0.135 76)",
    800: "oklch(0.43 0.105 74)",
    900: "oklch(0.32 0.075 72)",
    950: "oklch(0.22 0.055 70)",
  },

  /** Neutral dark scale (warm-tinted, hue ~82°) */
  neutral: {
    50: "oklch(0.97 0.003 82)",
    100: "oklch(0.92 0.003 82)",
    200: "oklch(0.82 0.003 82)",
    300: "oklch(0.70 0.003 82)",
    400: "oklch(0.58 0.003 82)",
    500: "oklch(0.46 0.003 82)",
    600: "oklch(0.35 0.003 82)",
    700: "oklch(0.265 0.003 82)",
    750: "oklch(0.21 0.003 82)",
    800: "oklch(0.175 0.003 82)",
    850: "oklch(0.145 0.003 82)",
    900: "oklch(0.12 0.003 82)",
    /** Deep background */
    950: "oklch(0.09 0.003 82)",
  },

  /** Status */
  red: "oklch(0.65 0.22 27)",
  green: "oklch(0.72 0.18 150)",
  blue: "oklch(0.65 0.18 245)",
  yellow: "oklch(0.88 0.18 95)",
} as const;

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

export const shadows = {
  sm: "0 1px 2px oklch(0 0 0 / 40%)",
  md: "0 4px 8px oklch(0 0 0 / 50%), 0 1px 2px oklch(0 0 0 / 30%)",
  lg: "0 8px 24px oklch(0 0 0 / 60%), 0 2px 4px oklch(0 0 0 / 40%)",
  xl: "0 16px 48px oklch(0 0 0 / 70%), 0 4px 8px oklch(0 0 0 / 50%)",
  /** Ambient gold glow — for hover/focused interactive elements */
  gold: "0 0 20px oklch(0.78 0.155 82 / 25%), 0 0 40px oklch(0.78 0.155 82 / 10%)",
  /** Subtle gold glow — for badges and small elements */
  goldSm: "0 0 8px oklch(0.78 0.155 82 / 20%)",
  none: "none",
} as const;

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------

/** Base radius is 6px (0.375rem). Multipliers match CSS: 0.6× 0.8× 1× 1.4× 1.8× */
export const radius = {
  sm: "3.6px",    // 0.6 × 6px
  md: "4.8px",    // 0.8 × 6px
  lg: "6px",      // base
  xl: "8.4px",    // 1.4 × 6px
  "2xl": "10.8px", // 1.8 × 6px
  "3xl": "13.2px", // 2.2 × 6px
  full: "9999px",
} as const;

// ---------------------------------------------------------------------------
// Spacing (mirrors Tailwind 4px grid)
// ---------------------------------------------------------------------------

export const spacing = {
  1: "0.25rem",  // 4px
  2: "0.5rem",   // 8px
  3: "0.75rem",  // 12px
  4: "1rem",     // 16px
  5: "1.25rem",  // 20px
  6: "1.5rem",   // 24px
  8: "2rem",     // 32px
  10: "2.5rem",  // 40px
  12: "3rem",    // 48px
  16: "4rem",    // 64px
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const fontFamily = {
  sans: "'Geist', ui-sans-serif, system-ui, -apple-system, sans-serif",
  mono: "'Geist Mono', ui-monospace, 'Cascadia Code', monospace",
} as const;

export const fontSize = {
  xs: "0.6875rem",   // 11px
  sm: "0.8125rem",   // 13px
  base: "0.9375rem", // 15px
  md: "1rem",        // 16px
  lg: "1.125rem",    // 18px
  xl: "1.25rem",     // 20px
  "2xl": "1.5rem",   // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem",  // 36px
} as const;

export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const lineHeight = {
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
} as const;

// ---------------------------------------------------------------------------
// Animation easing (Framer Motion)
// ---------------------------------------------------------------------------

/** Standard easing values for Framer Motion transitions */
export const easing = {
  /** Snappy entrance — content appearing */
  snap: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Smooth exit — content leaving */
  smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
  /** Elastic — for gold glows and attention effects */
  elastic: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
} as const;

export const duration = {
  fast: 0.12,
  base: 0.2,
  slow: 0.35,
  slower: 0.5,
} as const;
