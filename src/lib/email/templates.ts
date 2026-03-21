import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { createElement } from "react"

// ── Shared styles ─────────────────────────────────────────────────────────────

const palette = {
  bg: "#131313",
  card: "#1c1b1b",
  border: "#2a2929",
  gold: "#E6C364",
  goldLight: "#FFE08F",
  text: "#e5e2e1",
  muted: "#9a9390",
  white: "#ffffff",
}

const styles = {
  body: {
    backgroundColor: palette.bg,
    fontFamily:
      '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: "520px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "700",
    color: palette.gold,
    letterSpacing: "-0.02em",
    marginBottom: "32px",
    display: "block" as const,
  },
  heading: {
    fontSize: "22px",
    fontWeight: "700",
    color: palette.text,
    letterSpacing: "-0.02em",
    margin: "0 0 12px",
  },
  body_text: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: palette.muted,
    margin: "0 0 24px",
  },
  cta: {
    backgroundColor: palette.gold,
    color: "#111111",
    fontWeight: "600",
    fontSize: "14px",
    borderRadius: "6px",
    padding: "12px 28px",
    textDecoration: "none",
    display: "inline-block" as const,
  },
  divider: {
    borderColor: palette.border,
    margin: "28px 0",
  },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    color: palette.muted,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    margin: "0 0 8px",
  },
  referralBox: {
    backgroundColor: palette.card,
    border: `1px solid ${palette.border}`,
    borderRadius: "6px",
    padding: "12px 16px",
    fontFamily: '"JetBrains Mono", "Courier New", monospace',
    fontSize: "12px",
    color: palette.gold,
    wordBreak: "break-all" as const,
    margin: "0 0 16px",
  },
  hint: {
    fontSize: "13px",
    color: palette.muted,
    lineHeight: "1.5",
    margin: "0 0 8px",
  },
  warning: {
    fontSize: "13px",
    color: "#e05a5a",
    lineHeight: "1.5",
    margin: "0 0 8px",
  },
  footer: {
    fontSize: "12px",
    color: palette.muted,
    lineHeight: "1.5",
    margin: "32px 0 0",
  },
}

// ── WaitlistConfirmationEmail ─────────────────────────────────────────────────

export const WAITLIST_CONFIRMATION_SUBJECT =
  "Confirm your spot on the Mintmark waitlist"

interface WaitlistConfirmationEmailProps {
  name?: string
  email: string
  verificationUrl: string
  referralCode: string
  referralUrl: string
}

export function WaitlistConfirmationEmail({
  name,
  verificationUrl,
  referralUrl,
}: WaitlistConfirmationEmailProps) {
  const greeting = name ? `Hey ${name},` : "Hey,"

  return createElement(
    Html,
    { lang: "en" },
    createElement(Head, null),
    createElement(Preview, null, "Confirm your spot on the Mintmark waitlist"),
    createElement(
      Body,
      { style: styles.body },
      createElement(
        Container,
        { style: styles.container },

        // Logo
        createElement(Text, { style: styles.logoText }, "Mintmark"),

        // Heading
        createElement(Heading, { style: styles.heading }, "You're almost in."),

        // Body
        createElement(
          Text,
          { style: styles.body_text },
          `${greeting} Thanks for joining the Mintmark waitlist! Click the button below to confirm your email and lock in your spot.`
        ),

        // CTA
        createElement(
          Section,
          { style: { marginBottom: "28px" } },
          createElement(
            Button,
            { href: verificationUrl, style: styles.cta },
            "Confirm my spot"
          )
        ),

        // Fallback link
        createElement(
          Text,
          { style: styles.hint },
          "Button not working? Copy and paste this link into your browser:"
        ),
        createElement(
          Link,
          { href: verificationUrl, style: { color: palette.gold, fontSize: "12px" } },
          verificationUrl
        ),

        createElement(Hr, { style: styles.divider }),

        // Referral section
        createElement(Text, { style: styles.label }, "Move up the queue"),
        createElement(
          Text,
          { style: styles.hint },
          "Every friend who joins with your referral link moves you up 5 spots."
        ),
        createElement(Text, { style: styles.referralBox }, referralUrl),

        createElement(Hr, { style: styles.divider }),

        // Footer
        createElement(
          Text,
          { style: styles.footer },
          "You received this email because you signed up for the Mintmark waitlist. If you didn't request this, you can safely ignore it."
        )
      )
    )
  )
}

// ── InviteEmail ───────────────────────────────────────────────────────────────

export const INVITE_SUBJECT =
  "You're invited to Mintmark — your access is ready"

interface InviteEmailProps {
  name?: string
  email: string
  inviteUrl: string
  expiresAt: string
}

export function InviteEmail({ name, inviteUrl, expiresAt }: InviteEmailProps) {
  const greeting = name ? `Hey ${name},` : "Hey,"

  return createElement(
    Html,
    { lang: "en" },
    createElement(Head, null),
    createElement(
      Preview,
      null,
      "Your Mintmark invitation is ready — accept before it expires."
    ),
    createElement(
      Body,
      { style: styles.body },
      createElement(
        Container,
        { style: styles.container },

        // Logo
        createElement(Text, { style: styles.logoText }, "Mintmark"),

        // Heading
        createElement(
          Heading,
          { style: styles.heading },
          "Your access is ready."
        ),

        // Body
        createElement(
          Text,
          { style: styles.body_text },
          `${greeting} You've been invited to join Mintmark early access. Click below to accept — this link expires on ${expiresAt}.`
        ),

        // CTA
        createElement(
          Section,
          { style: { marginBottom: "28px" } },
          createElement(
            Button,
            { href: inviteUrl, style: styles.cta },
            "Accept your invitation"
          )
        ),

        // Warning
        createElement(
          Text,
          { style: styles.warning },
          `This link is single-use and expires ${expiresAt}. Do not share it.`
        ),

        // Fallback link
        createElement(
          Text,
          { style: styles.hint },
          "Button not working? Copy and paste this link:"
        ),
        createElement(
          Link,
          { href: inviteUrl, style: { color: palette.gold, fontSize: "12px" } },
          inviteUrl
        ),

        createElement(Hr, { style: styles.divider }),

        // Footer
        createElement(
          Text,
          { style: styles.footer },
          "You received this email because you were on the Mintmark waitlist. Questions? Reply to this email."
        )
      )
    )
  )
}
