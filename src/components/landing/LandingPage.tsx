"use client"

import { useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion"
import {
  BookOpen,
  Zap,
  TrendingUp,
  Code2,
  Paintbrush,
  BarChart3,
  PenLine,
  GraduationCap,
  Rocket,
  Briefcase,
  FlaskConical,
} from "lucide-react"
import WaitlistForm from "@/components/waitlist/WaitlistForm"
import { LogoMark } from "@/components/ui/logo-mark"

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
  { Icon: Code2, label: "Developers" },
  { Icon: Paintbrush, label: "Designers" },
  { Icon: BarChart3, label: "Marketers" },
  { Icon: PenLine, label: "Writers" },
  { Icon: GraduationCap, label: "Students" },
  { Icon: Rocket, label: "Entrepreneurs" },
  { Icon: Briefcase, label: "Consultants" },
  { Icon: FlaskConical, label: "Researchers" },
]

// ── Cursor spotlight ──────────────────────────────────────────────────────────

function CursorSpotlight() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const opacity = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 120, damping: 22, restDelta: 0.001 })
  const springY = useSpring(mouseY, { stiffness: 120, damping: 22, restDelta: 0.001 })

  const bg = useMotionTemplate`
    radial-gradient(200px circle at ${springX}px ${springY}px, oklch(0.78 0.155 82 / 6%), transparent 80%),
    radial-gradient(700px circle at ${springX}px ${springY}px, oklch(0.78 0.155 82 / 2%), transparent 80%)
  `

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      opacity.set(1)
    }
    window.addEventListener("mousemove", move)
    return () => window.removeEventListener("mousemove", move)
  }, [mouseX, mouseY, opacity])

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-30"
      style={{ background: bg, opacity }}
      transition={{ opacity: { duration: 0.6 } }}
    />
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

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

/** Card with a cursor-tracked gold border glow. The 1px outer wrapper acts as
 *  the border — its background (gradient at mouse position) shows through the
 *  gap around the inner bg-card div, making only the border near the cursor glow. */
function GlowCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`)
    el.style.setProperty("--my", `${e.clientY - rect.top}px`)
  }

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onMouseMove={handleMouseMove}
      className="group relative p-px rounded-lg h-full cursor-default"
      style={{ background: "var(--color-border)" }}
    >
      {/* Gold glow overlay — only visible through the 1px border gap */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background:
            "radial-gradient(180px circle at var(--mx, 50%) var(--my, 50%), oklch(0.78 0.155 82 / 50%), transparent 100%)",
        }}
      />
      {/* Card body covers everything except the 1px border gap */}
      <div className="relative bg-card rounded-lg p-6 h-full flex flex-col shadow-md">
        {children}
      </div>
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
              <GlowCard>
                <div className="size-9 rounded-md bg-gold-muted border border-gold-border flex items-center justify-center mb-4 flex-shrink-0">
                  <Icon className="size-4 text-gold" strokeWidth={1.75} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {description}
                </p>
              </GlowCard>
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
        <FadeInSection className="mb-4">
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
            className="flex md:flex-wrap md:justify-center gap-2 overflow-x-auto py-2"
            style={{ scrollbarWidth: "none" }}
          >
            {PERSONAS.map(({ Icon, label }) => (
              <motion.span
                key={label}
                whileHover={{ scale: 1.06, backgroundColor: "var(--gold-muted)" }}
                transition={{ duration: 0.15 }}
                className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-muted border border-border text-muted-foreground text-xs px-3 py-1.5 whitespace-nowrap cursor-default"
              >
                <Icon className="size-3 text-gold" aria-hidden="true" />
                <span>{label}</span>
              </motion.span>
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
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Privacy Policy
          </a>
          <a
            href="/legal/terms"
            className="hover:text-foreground transition-colors cursor-pointer"
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
      <CursorSpotlight />

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
