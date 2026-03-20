"use client"

import { motion } from "framer-motion"
import { BookOpen, Zap, TrendingUp } from "lucide-react"
import WaitlistForm from "@/components/waitlist/WaitlistForm"

// ── Animation variants ────────────────────────────────────────────────────────

const SNAP = [0.16, 1, 0.3, 1] as const

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
}

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: SNAP },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

// ── Page constants ────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    Icon: BookOpen,
    title: "Learn anything",
    description:
      "YouTube videos, articles, podcasts, your own notes. Any source, any format, anywhere.",
  },
  {
    Icon: Zap,
    title: "Generate in seconds",
    description:
      "LinkedIn post, X thread, Medium article — all at once, calibrated to your voice.",
  },
  {
    Icon: TrendingUp,
    title: "Grow your brand",
    description:
      "Track what you share, see what resonates, and know exactly what to post next.",
  },
]

const PERSONAS = [
  { emoji: "👨‍💻", label: "Developers" },
  { emoji: "🎨", label: "Designers" },
  { emoji: "📈", label: "Marketers" },
  { emoji: "✍️", label: "Writers" },
  { emoji: "🎓", label: "Students" },
  { emoji: "🚀", label: "Entrepreneurs" },
  { emoji: "💼", label: "Consultants" },
  { emoji: "🔬", label: "Researchers" },
]

// ── Shared sub-components ─────────────────────────────────────────────────────

/** SVG coin stamp mark — M inside a circular dashed ring */
function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className="text-gold"
      aria-hidden="true"
    >
      {/* Outer coin stamp edge */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 2.5"
      />
      {/* Inner ring */}
      <circle
        cx="24"
        cy="24"
        r="18"
        stroke="currentColor"
        strokeWidth="0.75"
        opacity={0.4}
      />
      {/* M letterform */}
      <path
        d="M12 33V15L24 26.5L36 15V33"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Scroll-triggered fade + rise. Wraps any section content. */
function FadeInSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: SNAP, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Page sections ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section className="py-24 px-4 border-t border-border">
      <div className="max-w-5xl mx-auto">
        <FadeInSection className="mb-12 text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            How it works
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Three steps from raw input to published content — in the time it
            takes to read this.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map(({ Icon, title, description }, i) => (
            <FadeInSection key={title} delay={i * 0.08}>
              <div className="bg-card border border-border rounded-lg p-6 shadow-md h-full flex flex-col">
                <div className="size-9 rounded-md bg-gold-muted border border-gold-border flex items-center justify-center mb-4 flex-shrink-0">
                  <Icon className="size-4 text-gold" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {description}
                </p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhoItsForSection() {
  return (
    <section className="py-20 px-4 border-t border-border">
      <div className="max-w-3xl mx-auto text-center">
        <FadeInSection className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            For anyone who learns and wants to be known for it
          </h2>
          <p className="text-sm text-muted-foreground">
            If you&apos;re building expertise and want the world to know,
            Mintmark is for you.
          </p>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          {/* Horizontal scroll on mobile, wrapped grid on desktop */}
          <div
            className="flex md:flex-wrap md:justify-center gap-2 overflow-x-auto pb-2 md:pb-0"
            style={{ scrollbarWidth: "none" }}
          >
            {PERSONAS.map(({ emoji, label }) => (
              <span
                key={label}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-muted border border-border text-muted-foreground text-xs px-3 py-1.5 whitespace-nowrap"
              >
                <span aria-hidden="true">{emoji}</span>
                <span>{label}</span>
              </span>
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}

function SocialProofSection() {
  const claimed = 847
  const total = 1000
  const pct = (claimed / total) * 100

  return (
    <section className="py-20 px-4 border-t border-border">
      <div className="max-w-sm mx-auto text-center">
        <FadeInSection>
          <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-3">
            Early access
          </p>
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Spots are limited
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {claimed.toLocaleString()} of {total.toLocaleString()} spots
            claimed
          </p>

          {/* Progress bar */}
          <div className="relative h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background:
                  "linear-gradient(to right, var(--mm-gold-700), var(--mm-gold-400))",
              }}
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: SNAP, delay: 0.2 }}
            />
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <LogoMark size={20} />
          <span className="text-sm font-semibold text-foreground">
            Mintmark
          </span>
          <span className="text-neutral-700 hidden sm:block">·</span>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Stamp your knowledge on the internet
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a
            href="/legal/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/legal/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms
          </a>
          <span>© 2025 Mintmark</span>
        </div>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-16">
        {/* Ambient glow — like light catching the face of a coin */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% -5%, oklch(0.78 0.155 82 / 11%), transparent 70%)",
          }}
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Hero content — staggered entrance */}
        <motion.div
          className="relative z-10 w-full max-w-xl mx-auto text-center"
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Logo mark */}
          <motion.div
            variants={heroItem}
            className="flex justify-center mb-6"
          >
            <LogoMark size={48} />
          </motion.div>

          {/* Product name */}
          <motion.h1
            variants={heroItem}
            className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight mb-4"
          >
            Mintmark
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={heroItem}
            className="text-xl sm:text-2xl font-semibold text-foreground mb-3"
          >
            Stamp your knowledge on the internet
          </motion.p>

          {/* Subline */}
          <motion.p
            variants={heroItem}
            className="text-sm text-muted-foreground max-w-sm mx-auto mb-10"
            style={{ lineHeight: "1.625" }}
          >
            Turn what you learn into content that builds your personal brand.
            LinkedIn, X, and Medium — all at once.
          </motion.p>

          {/* Waitlist form */}
          <motion.div variants={heroItem} className="w-full">
            <WaitlistForm />
          </motion.div>
        </motion.div>
      </section>

      <HowItWorksSection />
      <WhoItsForSection />
      <SocialProofSection />
      <Footer />
    </div>
  )
}
