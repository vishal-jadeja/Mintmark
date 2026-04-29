// ─── Platform content limits ───────────────────────────────────────────────
// Sources verified 2025. These are hard limits enforced by each platform API.
// Never generate content that exceeds these — the platform will reject it.

// ── X (Twitter) ──────────────────────────────────────────────────────────────
// Premium and Premium+ have the same post limit (25,000 chars).
// Articles (100,000 chars) are X Premium+ exclusive and a separate content type.
// Thread: up to 50 posts per thread; each post obeys the per-post char limit.

export const X_LIMITS = {
  post: {
    free:       { maxChars: 280,    label: "280 characters"    },
    premium:    { maxChars: 25_000, label: "25,000 characters" },
    premiumPlus:{ maxChars: 25_000, label: "25,000 characters" },
  },
  article: {
    free:        null,
    premium:     null,
    premiumPlus: { maxChars: 100_000, label: "100,000 characters" },
  },
  thread: {
    free:       { maxPostsPerThread: 50, maxCharsPerPost: 280    },
    premium:    { maxPostsPerThread: 50, maxCharsPerPost: 25_000 },
    premiumPlus:{ maxPostsPerThread: 50, maxCharsPerPost: 25_000 },
  },
} as const

// ── LinkedIn ──────────────────────────────────────────────────────────────────
// Premium does NOT increase character limits — same 3,000 cap as free.
// Articles and Newsletters use the article limit (~125,000 chars).
// First 210 chars show before "see more" — treat as the visible hook budget.

export const LINKEDIN_LIMITS = {
  post: {
    standard: { maxChars: 3_000,   label: "3,000 characters"    },
    premium:  { maxChars: 3_000,   label: "3,000 characters"    },
  },
  article: {
    standard: { maxChars: 125_000, label: "~125,000 characters" },
    premium:  { maxChars: 125_000, label: "~125,000 characters" },
  },
  comment: {
    standard: { maxChars: 1_250,   label: "1,250 characters"    },
    premium:  { maxChars: 1_250,   label: "1,250 characters"    },
  },
} as const

// ── Medium ────────────────────────────────────────────────────────────────────
// No character or word limit for articles — applies to all account types.
// "Shortform" is a display concept (≤150 words), not a platform-enforced limit.
// Partner Program membership does not affect length limits.

export const MEDIUM_LIMITS = {
  article: {
    standard: { maxChars: null, label: "Unlimited" },
    member:   { maxChars: null, label: "Unlimited" },
  },
  shortform: {
    // ≤150 words = displayed as shortform in feed (not a hard limit, just a UX signal)
    standard: { maxWords: 150, label: "≤150 words (shortform)" },
  },
} as const

// ─── Account tier types ────────────────────────────────────────────────────

export type XTier        = "free" | "premium" | "premiumPlus"
export type LinkedInTier = "standard" | "premium"
export type MediumTier   = "standard" | "member"

// ─── Per-platform max possible limit (across all tiers) ────────────────────
// Used for validation: never allow a user to set max_length above these.

export const PLATFORM_MAX_CHARS = {
  x:        X_LIMITS.post.premiumPlus.maxChars,   // 25,000
  linkedin: LINKEDIN_LIMITS.post.standard.maxChars, // 3,000
  medium:   null,                                   // unlimited
} as const

// ─── Default generation limits (conservative — free tier) ──────────────────
// Used when a user's account tier is unknown.
// The Content Studio should upgrade these when tier info is available.

export const PLATFORM_RULES = {
  linkedin: {
    maxChars:        LINKEDIN_LIMITS.post.standard.maxChars,
    charLabel:       LINKEDIN_LIMITS.post.standard.label,
    suggestedMinWords: 150,
    suggestedMaxWords: 600,
    hookBudget:      210, // chars visible before "see more"
    structure:
      "Hook in first line (within 210 chars). Professional tone. Whitespace-friendly paragraphs. No walls of text.",
  },
  x: {
    maxChars:        X_LIMITS.post.free.maxChars,
    charLabel:       X_LIMITS.post.free.label,
    suggestedMinWords: 20,
    suggestedMaxWords: 50,
    hookBudget:      null,
    structure:
      "Punchy, hook-first. No filler. Single tweet only.",
  },
  medium: {
    maxChars:        null,
    charLabel:       "Unlimited",
    suggestedMinWords: 500,
    suggestedMaxWords: 2_000,
    hookBudget:      null,
    structure:
      "Deep dive. Well-structured with headers. Intro earns the scroll.",
  },
} as const

export type Platform = keyof typeof PLATFORM_RULES

// ─── Tier-aware limit getter ───────────────────────────────────────────────
// Call this in the generation pipeline once the user's tier is known.

export function getXPostLimit(tier: XTier): number {
  return X_LIMITS.post[tier].maxChars
}

export function getLinkedInPostLimit(_tier: LinkedInTier): number {
  return LINKEDIN_LIMITS.post.standard.maxChars // same for all tiers
}

// Returns the effective max chars for a platform given the user's tier info.
// Falls back to PLATFORM_RULES default (free tier) if tier is unknown.
export function getEffectiveMaxChars(
  platform: Platform,
  xTier?: XTier,
  linkedInTier?: LinkedInTier
): number | null {
  if (platform === "x") {
    return getXPostLimit(xTier ?? "free")
  }
  if (platform === "linkedin") {
    return getLinkedInPostLimit(linkedInTier ?? "standard")
  }
  return null // medium: unlimited
}
