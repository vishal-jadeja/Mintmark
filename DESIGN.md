# Mintmark Design System

> Dark background · Gold/amber accent · Dense and minimal like Linear or Vercel dashboard.
>
> "Mintmark" — the stamp a mint presses on a coin. Authentic. Certified. From a specific source.

---

## Philosophy

| Principle | Expression |
|-----------|-----------|
| **Dense** | 13–15px base type, tight line-heights, compact spacing. Every pixel earns its place. |
| **Dark-first** | Near-black background with warm undertone. Light theme is an override, not the default. |
| **Coin heritage** | Gold/amber palette references metallurgy and permanence — not flashy, but unmistakably premium. |
| **Certified** | Sharp borders, no decorative gradients, subtle shadows. The mark means something. |

---

## Color Tokens

### Raw Brand Tokens (`--mm-*`)

These are the source-of-truth values. Semantic tokens reference these.

#### Gold/Amber Scale (hue ~82°)

| Token | Value | Swatch |
|-------|-------|--------|
| `--mm-gold-50`  | `oklch(0.97 0.025 82)` | Lightest tint |
| `--mm-gold-100` | `oklch(0.93 0.055 82)` | |
| `--mm-gold-200` | `oklch(0.88 0.095 82)` | |
| `--mm-gold-300` | `oklch(0.82 0.135 82)` | |
| `--mm-gold-400` | `oklch(0.78 0.155 82)` | **Primary accent** |
| `--mm-gold-500` | `oklch(0.72 0.165 80)` | |
| `--mm-gold-600` | `oklch(0.64 0.155 78)` | Light-mode primary |
| `--mm-gold-700` | `oklch(0.54 0.135 76)` | |
| `--mm-gold-800` | `oklch(0.43 0.105 74)` | |
| `--mm-gold-900` | `oklch(0.32 0.075 72)` | |
| `--mm-gold-950` | `oklch(0.22 0.055 70)` | Deepest |

#### Neutral Dark Scale (warm-tinted, hue ~82°)

| Token | Value | Role |
|-------|-------|------|
| `--mm-neutral-950` | `oklch(0.09 0.003 82)` | Deep background |
| `--mm-neutral-900` | `oklch(0.12 0.003 82)` | Card / surface |
| `--mm-neutral-850` | `oklch(0.145 0.003 82)` | Elevated surface |
| `--mm-neutral-800` | `oklch(0.175 0.003 82)` | Hover surface |
| `--mm-neutral-750` | `oklch(0.21 0.003 82)` | Active / pressed |
| `--mm-neutral-700` | `oklch(0.265 0.003 82)` | Subtle dividers |
| `--mm-neutral-600` | `oklch(0.35 0.003 82)` | |
| `--mm-neutral-500` | `oklch(0.46 0.003 82)` | Tertiary text |
| `--mm-neutral-400` | `oklch(0.58 0.003 82)` | Secondary text |
| `--mm-neutral-300` | `oklch(0.70 0.003 82)` | Muted text |
| `--mm-neutral-200` | `oklch(0.82 0.003 82)` | |
| `--mm-neutral-100` | `oklch(0.92 0.003 82)` | |
| `--mm-neutral-50`  | `oklch(0.97 0.003 82)` | Near white |

#### Status Colors

| Token | Value | Use |
|-------|-------|-----|
| `--mm-red`    | `oklch(0.65 0.22 27)`  | Destructive / error |
| `--mm-green`  | `oklch(0.72 0.18 150)` | Success |
| `--mm-blue`   | `oklch(0.65 0.18 245)` | Info |
| `--mm-yellow` | `oklch(0.88 0.18 95)`  | Warning |

---

### Semantic Tokens

Semantic tokens are what components consume. They swap between dark and light themes.

| Token | Dark | Light |
|-------|------|-------|
| `--background` | `--mm-neutral-950` | `oklch(0.98 0.003 82)` |
| `--foreground` | `--mm-neutral-50` | `--mm-neutral-950` |
| `--card` | `--mm-neutral-900` | `oklch(1 0 0)` |
| `--card-foreground` | `--mm-neutral-50` | `--mm-neutral-950` |
| `--primary` | `--mm-gold-400` | `--mm-gold-600` |
| `--primary-foreground` | `--mm-neutral-950` | `oklch(1 0 0)` |
| `--secondary` | `--mm-neutral-800` | `oklch(0.94 0.005 82)` |
| `--muted` | `--mm-neutral-800` | `oklch(0.94 0.005 82)` |
| `--muted-foreground` | `--mm-neutral-400` | `--mm-neutral-500` |
| `--border` | `oklch(1 0 0 / 9%)` | `oklch(0 0 0 / 10%)` |
| `--input` | `oklch(1 0 0 / 12%)` | `oklch(0 0 0 / 8%)` |
| `--ring` | `oklch(0.78 0.155 82 / 50%)` | `oklch(0.64 0.155 78 / 50%)` |
| `--destructive` | `--mm-red` | `--mm-red` |
| `--gold` | `--mm-gold-400` | `--mm-gold-600` |
| `--gold-muted` | `oklch(0.78 0.155 82 / 12%)` | `oklch(0.64 0.155 78 / 10%)` |
| `--gold-border` | `oklch(0.78 0.155 82 / 25%)` | `oklch(0.64 0.155 78 / 30%)` |

---

## Typography

| Token | Value |
|-------|-------|
| `--mm-font-sans` | `'Geist', ui-sans-serif, system-ui, -apple-system, sans-serif` |
| `--mm-font-mono` | `'Geist Mono', ui-monospace, 'Cascadia Code', monospace` |

### Font Size Scale (dense — 1rem = 16px)

| Token | Size | px equivalent |
|-------|------|--------------|
| `--mm-font-size-xs`   | `0.6875rem` | 11px — labels, badges |
| `--mm-font-size-sm`   | `0.8125rem` | 13px — secondary text, meta |
| `--mm-font-size-base` | `0.9375rem` | 15px — body copy |
| `--mm-font-size-md`   | `1rem`      | 16px |
| `--mm-font-size-lg`   | `1.125rem`  | 18px |
| `--mm-font-size-xl`   | `1.25rem`   | 20px — section headings |
| `--mm-font-size-2xl`  | `1.5rem`    | 24px |
| `--mm-font-size-3xl`  | `1.875rem`  | 30px — page headings |
| `--mm-font-size-4xl`  | `2.25rem`   | 36px — hero |

### Font Weight

| Token | Value |
|-------|-------|
| `--mm-font-weight-normal`   | `400` |
| `--mm-font-weight-medium`   | `500` |
| `--mm-font-weight-semibold` | `600` |
| `--mm-font-weight-bold`     | `700` |

### Line Height

| Token | Value |
|-------|-------|
| `--mm-line-height-tight`   | `1.25` |
| `--mm-line-height-snug`    | `1.375` |
| `--mm-line-height-normal`  | `1.5` |
| `--mm-line-height-relaxed` | `1.625` |

---

## Spacing Scale

Standard Tailwind 4px base grid. Dense UI defaults to 4–12px gutters.

| Token | Value | px |
|-------|-------|----|
| `--mm-spacing-1`  | `0.25rem` | 4px |
| `--mm-spacing-2`  | `0.5rem`  | 8px |
| `--mm-spacing-3`  | `0.75rem` | 12px |
| `--mm-spacing-4`  | `1rem`    | 16px |
| `--mm-spacing-5`  | `1.25rem` | 20px |
| `--mm-spacing-6`  | `1.5rem`  | 24px |
| `--mm-spacing-8`  | `2rem`    | 32px |
| `--mm-spacing-10` | `2.5rem`  | 40px |
| `--mm-spacing-12` | `3rem`    | 48px |
| `--mm-spacing-16` | `4rem`    | 64px |

---

## Border Radius

Base radius is **6px** — tight and professional, not bubbly.

| Token | Multiplier | Value |
|-------|-----------|-------|
| `--radius-sm`  | 0.6× | `3.6px` |
| `--radius-md`  | 0.8× | `4.8px` |
| `--radius-lg`  | 1.0× | `6px` (base) |
| `--radius-xl`  | 1.4× | `8.4px` |
| `--radius-2xl` | 1.8× | `10.8px` |
| `--radius-3xl` | 2.2× | `13.2px` |
| `--radius-full` | — | `9999px` |

---

## Shadows

Dark-appropriate shadows with black base (not gray). Gold glow for interactive elements.

| Token | Definition |
|-------|-----------|
| `--mm-shadow-sm`    | `0 1px 2px oklch(0 0 0 / 40%)` |
| `--mm-shadow-md`    | `0 4px 8px oklch(0 0 0 / 50%), 0 1px 2px oklch(0 0 0 / 30%)` |
| `--mm-shadow-lg`    | `0 8px 24px oklch(0 0 0 / 60%), 0 2px 4px oklch(0 0 0 / 40%)` |
| `--mm-shadow-xl`    | `0 16px 48px oklch(0 0 0 / 70%), 0 4px 8px oklch(0 0 0 / 50%)` |
| `--mm-shadow-gold`    | `0 0 20px oklch(0.78 0.155 82 / 25%), 0 0 40px oklch(0.78 0.155 82 / 10%)` |
| `--mm-shadow-gold-sm` | `0 0 8px oklch(0.78 0.155 82 / 20%)` |

---

## Component Patterns

### Button — Primary (Gold)
```
bg: var(--primary)          → gold-400 in dark
color: var(--primary-foreground) → neutral-950 in dark
hover: bg-gold-300 (slightly lighter)
focus ring: gold ring at 50% opacity
border-radius: var(--radius-md) → ~5px
font-weight: 500
padding: 6px 14px (dense)
```

### Button — Secondary
```
bg: var(--secondary)        → neutral-800
color: var(--secondary-foreground)
border: 1px solid var(--border)
hover: bg-neutral-750
```

### Button — Ghost
```
bg: transparent
hover: bg var(--gold-muted) → gold at 12% opacity
color: var(--foreground)
```

### Input
```
bg: var(--input)            → white at 12% opacity (dark)
border: 1px solid var(--border)
focus: border var(--gold-border), ring var(--ring)
placeholder: var(--muted-foreground)
border-radius: var(--radius-md)
padding: 7px 12px
font-size: var(--mm-font-size-sm) → 13px
```

### Card
```
bg: var(--card)             → neutral-900
border: 1px solid var(--border)
border-radius: var(--radius-lg) → 6px
shadow: var(--mm-shadow-md)
padding: 16px or 24px
```

### Badge
```
Variants: default, secondary, gold, destructive, outline
gold: bg var(--gold-muted), color var(--gold), border var(--gold-border)
border-radius: var(--radius-full)
padding: 2px 8px
font-size: var(--mm-font-size-xs) → 11px
font-weight: 500
```

---

## Theming

Theme is set via `data-theme` attribute on `<html>`:

```html
<html data-theme="dark">  <!-- default -->
<html data-theme="light"> <!-- override -->
```

Dark is the canonical experience. Light is supported as an opt-in.

---

## Usage in Framer Motion

Raw values for animations that need exact pixel/color values are exported from `src/lib/design.ts`:

```ts
import { colors, shadows, spacing } from '@/lib/design'

// gold glow pulse
animate={{ boxShadow: [shadows.goldSm, shadows.gold, shadows.goldSm] }}
// accent color transitions
animate={{ color: colors.gold[400] }}
```
