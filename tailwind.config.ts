/**
 * Mintmark — Tailwind CSS v4 configuration
 *
 * In Tailwind v4, design tokens (colors, spacing, radius, shadows, fonts)
 * are defined in CSS using @theme — not here. See:
 *   src/styles/globals.css  → all --mm-* raw tokens + @theme inline bridge
 *   src/app/globals.css     → entry point that imports the design system
 *
 * This file handles the parts that CSS can't: plugins, prefix, safelist.
 * To add a plugin: npm install <plugin>, then add it to the plugins array.
 */

import type { Config } from "tailwindcss";

const config: Config = {
  // v4 auto-detects content from your project. Explicit list only if needed:
  // content: ["./src/**/*.{ts,tsx}"],

  // Dark mode is handled via [data-theme="dark"] attribute on <html>.
  // The @custom-variant in globals.css wires this up for Tailwind utilities.
  darkMode: ["selector", '[data-theme="dark"]'],

  plugins: [
    // Add Tailwind plugins here, e.g.:
    // require("@tailwindcss/typography"),
    // require("@tailwindcss/forms"),
  ],
};

export default config;
