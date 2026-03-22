import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Cormorant_Garamond,
  Sora,
  Outfit,
  DM_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

/*
 * next/font injects CSS variables onto <html> at runtime.
 * We use the --nf-* prefix ("nf" = next font) to avoid colliding with
 * Tailwind's --font-* semantic names defined in src/styles/bridge.css.
 * The bridge.css @theme inline block references these --nf-* vars.
 */

const geist = Geist({
  variable: "--nf-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--nf-geist-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--nf-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--nf-sora",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--nf-outfit",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--nf-dm-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--nf-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mintmark — Stamp your knowledge on the internet",
  description:
    "Turn what you learn into content that builds your personal brand. LinkedIn, X, and Medium — all at once.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = [
    geist.variable,
    geistMono.variable,
    cormorantGaramond.variable,
    sora.variable,
    outfit.variable,
    dmSans.variable,
    jetbrainsMono.variable,
  ].join(" ");

  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${fontVars} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
