"use client"

import { useEffect, useRef, useState } from "react"
import { useWaitlistCount } from "@/lib/queries"
import { motion, useMotionValue, useSpring, useMotionTemplate, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Zap,
  TrendingUp,
  Check,
  ChevronDown,
  Plus,
  Brain,
  Share2,
} from "lucide-react"
import Image from "next/image"
import WaitlistForm from "@/components/waitlist/WaitlistForm"
import { LogoMark } from "@/components/ui/logo-mark"
import { FAQS_DATA } from "@/lib/faq-data"

// ── Avatar constants ──────────────────────────────────────────────────────────

const AVATARS = [
  { src: "/avatar-1.jpg", alt: "Waitlist member" },
  { src: "/avatar-2.jpg", alt: "Waitlist member" },
  { src: "/avatar-3.jpg", alt: "Waitlist member" },
]

// ── Animation helpers ─────────────────────────────────────────────────────────

const SNAP = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SNAP } },
}

// ── Constants ─────────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    Icon: BookOpen,
    phase: "Phase 01",
    title: "Observe",
    description:
      "Mintmark quietly tracks your sessions, notes, and learning activity. No manual logging required.",
  },
  {
    Icon: Zap,
    phase: "Phase 02",
    title: "Understand",
    description:
      "Every day, the intelligence layer finds what was notable, what patterns are forming, and what you're ready to share.",
  },
  {
    Icon: TrendingUp,
    phase: "Phase 03",
    title: "Share",
    description:
      "When you're ready, Mintmark generates posts for only the platforms you use — formatted correctly, in your voice.",
  },
]

const PERSONAS = [
  "Creative Designers",
  "Growth Marketers",
  "Product Strategists",
  "Engineering Leaders",
  "Founders",
  "Solo-Preneurs",
  "Content Strategists",
  "Academics",
  "Independent Researchers",
]

const OUTPUT_FEATURES = [
  "Context-aware formatting per platform",
  "Dynamic length adjustment",
  "Visual asset generation",
]

// ── Cursor spotlight ──────────────────────────────────────────────────────────

function CursorSpotlight() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const opacity = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 200, damping: 30, restDelta: 0.001 })
  const springY = useSpring(mouseY, { stiffness: 200, damping: 30, restDelta: 0.001 })

  const bg = useMotionTemplate`
    radial-gradient(150px circle at ${springX}px ${springY}px, oklch(0.80 0.12 82 / 5%), transparent 100%),
    radial-gradient(380px circle at ${springX}px ${springY}px, oklch(0.80 0.12 82 / 2.5%), transparent 100%),
    radial-gradient(700px circle at ${springX}px ${springY}px, oklch(0.80 0.12 82 / 1%), transparent 100%)
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
      style={{ background: bg, opacity, mixBlendMode: "screen" }}
      transition={{ opacity: { duration: 0.6 } }}
    />
  )
}

// ── FadeInSection ─────────────────────────────────────────────────────────────

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

// ── GlassCard ─────────────────────────────────────────────────────────────────

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
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
      className={`group relative h-full cursor-default ${className}`}
      style={{
        background: "rgba(32, 31, 31, 0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "0.5rem",
        borderTop: "1px solid rgba(230, 195, 100, 0.18)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow:
          "0 4px 24px rgba(0,0,0,0.45), 0 1px 0 rgba(230,195,100,0.08) inset, 0 0 40px rgba(230,195,100,0.04)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          borderRadius: "0.5rem",
          background:
            "radial-gradient(200px circle at var(--mx, 50%) var(--my, 50%), rgba(230,195,100,0.06), transparent 100%)",
        }}
      />
      <div className="relative h-full">{children}</div>
    </motion.div>
  )
}


// ── SocialAvatars ─────────────────────────────────────────────────────────────

function SocialAvatars({ count }: { count: number | null }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex -space-x-3">
        {AVATARS.map(({ src, alt }, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full border-2 border-neutral-950 overflow-hidden shadow-xl shrink-0"
          >
            <Image
              src={src}
              alt={alt}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
        <div className="w-10 h-10 rounded-full border-2 border-neutral-950 bg-neutral-800 flex items-center justify-center text-[10px] font-mono font-semibold text-neutral-400 shrink-0">
          {count != null ? `+${count > 999 ? Math.floor(count / 1000) + "k" : count}` : "+1k"}
        </div>
      </div>

    </div>
  )
}

// ── ScrollIndicator ───────────────────────────────────────────────────────────

function ScrollIndicator() {
  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-400">
        Explore
      </span>
      <div className="w-px h-10 bg-gradient-to-b from-gold/50 to-transparent" />
    </div>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  const { data: countData } = useWaitlistCount()
  const count = countData?.count ?? null

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-10 md:py-28 overflow-hidden"
      style={{
        background: "#0A0A0A",
      }}
    >
      {/* Background — texture before join, solid color after */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.18,
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: "550px 550px",
          filter: "blur(1px) brightness(0.7)",
          backgroundRepeat: "repeat",
        }}
      />

      {/* Ambient radial gold glow — sits on top of background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(230,195,100,0.055) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="relative z-10 text-center max-w-[680px] w-full"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow pill */}
        <motion.div variants={heroItem} className="mb-8 flex justify-center">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest uppercase"
            style={{
              background: "rgba(79,72,59,0.3)",
              border: "1px solid rgba(77,70,55,0.4)",
              color: "#cfc5b4",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
            Now in early access
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={heroItem}
          className="font-display mb-8 tracking-tight"
          style={{
            fontSize: "clamp(4rem, 10vw, 7.5rem)",
            lineHeight: 0.92,
            color: "#e5e2e1",
          }}
        >
          Know what{" "}
          <em
            className="not-italic"
            style={{
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            you know.
          </em>
          <br />
          Share when you&apos;re ready.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={heroItem}
          className="font-body text-lg md:text-xl max-w-lg mx-auto mb-12 leading-relaxed"
          style={{ color: "#d0c5b2" }}
        >
          Mintmark watches your learning life and surfaces what you know — so when you&apos;re ready to post, the hard work is already done.
        </motion.p>

        {/* Waitlist form */}
        <motion.div variants={heroItem} className="w-full max-w-md mx-auto mb-10">
          <WaitlistForm />
        </motion.div>

        {/* Social proof */}
        <motion.div variants={heroItem}>
          <SocialAvatars count={count} />
        </motion.div>
      </motion.div>

      <ScrollIndicator />
    </section>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section className="py-32 px-6 max-w-[1200px] mx-auto">
      <FadeInSection className="text-center mb-24">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gold mb-4">
          The Process
        </p>
        <h2 className="font-heading text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          How Mintmark works
        </h2>
        <p className="font-body text-muted-foreground text-lg">
          Three steps to authoritative digital presence.
        </p>
      </FadeInSection>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {HOW_IT_WORKS.map(({ Icon, phase, title, description }, i) => (
          <FadeInSection key={title} delay={i * 0.1} className="relative">
            <GlassCard className="p-8 flex flex-col items-start">
              <div
                className="w-11 h-11 rounded-lg flex items-center justify-center mb-6 text-gold"
                style={{ background: "rgba(53,53,52,0.8)" }}
              >
                <Icon className="size-5" strokeWidth={1.5} />
              </div>
              <span className="font-mono text-[10px] text-gold mb-2 tracking-widest uppercase">
                {phase}
              </span>
              <h3 className="font-heading text-xl font-bold mb-3 text-foreground">
                {title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </GlassCard>

            {/* Dashed connector */}
            {i < 2 && (
              <div
                className="hidden md:block absolute top-1/2 -right-3 w-6 h-px z-10"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #4d4637 50%, transparent 50%)",
                  backgroundSize: "8px 1px",
                  backgroundRepeat: "repeat-x",
                }}
              />
            )}
          </FadeInSection>
        ))}
      </div>
    </section>
  )
}

// ── Output Preview ────────────────────────────────────────────────────────────

function OutputPreviewSection() {
  return (
    <section
      className="py-32 overflow-hidden"
      style={{ background: "rgba(28,27,27,0.3)" }}
    >
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — copy */}
        <FadeInSection>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gold mb-4">
            Multi-Platform
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight mb-6 text-foreground">
            Polished to Perfection
          </h2>
          <p className="font-body text-lg text-muted-foreground mb-8 leading-relaxed">
            Your content shouldn&apos;t just exist — it should resonate. Mintmark
            adapts your ideas for every canvas, maintaining your tone while
            optimising for the medium.
          </p>
          <ul className="space-y-3">
            {OUTPUT_FEATURES.map((feat) => (
              <li key={feat} className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <Check className="size-4 text-gold shrink-0" strokeWidth={2} />
                {feat}
              </li>
            ))}
          </ul>
        </FadeInSection>

        {/* Right — fanned card mockups */}
        <FadeInSection delay={0.15}>
          <div className="relative h-[480px] flex items-center justify-center">
            {/* Medium card (back) */}
            <div
              className="absolute w-64 md:w-72 p-6 rounded-lg shadow-2xl -rotate-12 -translate-x-14 z-0 opacity-35"
              style={{
                background: "rgba(32,31,31,0.7)",
                backdropFilter: "blur(12px)",
                borderTop: "1px solid rgba(230,195,100,0.15)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-neutral-200" />
                <div className="space-y-1">
                  <div className="w-20 h-2 bg-white/15 rounded" />
                  <div className="w-12 h-1.5 bg-white/08 rounded" />
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="w-full h-2.5 bg-white/08 rounded" />
                <div className="w-5/6 h-2.5 bg-white/08 rounded" />
                <div className="w-4/6 h-2.5 bg-white/08 rounded" />
              </div>
            </div>

            {/* X card (middle) */}
            <div
              className="absolute w-64 md:w-72 p-6 rounded-lg shadow-2xl rotate-6 translate-x-14 z-10"
              style={{
                background: "rgba(32,31,31,0.75)",
                backdropFilter: "blur(12px)",
                borderTop: "1px solid rgba(230,195,100,0.15)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex gap-3">
                <div
                  className="w-9 h-9 rounded-full shrink-0"
                  style={{ background: "rgba(230,195,100,0.2)" }}
                />
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-white/30 rounded" />
                    <div className="w-12 h-1.5 bg-white/10 rounded" />
                  </div>
                  <div className="w-full h-2 bg-white/15 rounded" />
                  <div className="w-full h-2 bg-white/15 rounded" />
                  <div className="w-3/4 h-2 bg-white/15 rounded" />
                  <div
                    className="w-full h-28 rounded-lg overflow-hidden"
                    style={{ background: "rgba(53,53,52,0.8)" }}
                  >
                    <div
                      className="w-full h-full animate-pulse"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(230,195,100,0.15), rgba(230,195,100,0.05))",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* LinkedIn card (front) */}
            <div
              className="absolute w-64 md:w-72 p-6 rounded-lg shadow-2xl -rotate-2 -translate-y-10 z-20"
              style={{
                background: "rgba(32,31,31,0.8)",
                backdropFilter: "blur(16px)",
                borderTop: "1px solid rgba(230,195,100,0.3)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-11 h-11 rounded"
                  style={{ background: "rgba(79,72,59,0.7)" }}
                />
                <div className="space-y-1.5">
                  <div className="w-24 h-2.5 bg-white/70 rounded" />
                  <div className="w-32 h-1.5 bg-white/30 rounded" />
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="w-full h-2 bg-white/15 rounded" />
                <div className="w-full h-2 bg-white/15 rounded" />
                <div className="w-2/3 h-2 bg-white/15 rounded" />
                <div
                  className="pt-3 border-t flex justify-between"
                  style={{ borderColor: "rgba(255,255,255,0.04)" }}
                >
                  <div className="w-14 h-1.5 bg-gold/25 rounded" />
                  <div className="w-14 h-1.5 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}

// ── Bento Features ────────────────────────────────────────────────────────────

function BentoFeaturesSection() {
  const glassStyle = {
    background: "rgba(32,31,31,0.55)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderTop: "1px solid rgba(230,195,100,0.18)",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow:
      "0 4px 24px rgba(0,0,0,0.45), 0 1px 0 rgba(230,195,100,0.08) inset, 0 0 40px rgba(230,195,100,0.04)",
  }

  return (
    <section className="py-32 px-6 max-w-[1200px] mx-auto">
      <FadeInSection className="text-center mb-16">
        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Engineered for Authors
        </h2>
      </FadeInSection>

      <FadeInSection delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:h-[580px]">
          {/* AI Instructions — wide */}
          <div
            className="md:col-span-8 rounded-lg p-10 relative overflow-hidden flex flex-col justify-end group cursor-default"
            style={glassStyle}
          >
            <div className="absolute top-0 right-0 p-10 opacity-15 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none select-none">
              <Brain className="size-28 text-gold" strokeWidth={0.75} />
            </div>
            <div>
              <h3 className="font-heading text-2xl font-bold mb-3 text-foreground">
                Custom AI Instructions
              </h3>
              <p className="font-body text-muted-foreground max-w-md leading-relaxed">
                Fine-tune your curator&apos;s logic. Define your tone, specific
                vocabulary, and formatting preferences — every output feels
                authentically yours.
              </p>
            </div>
          </div>

          {/* Instant Publish — gold accent */}
          <div
            className="md:col-span-4 rounded-lg p-10 flex flex-col justify-between cursor-default"
            style={{ background: "var(--mm-gold-400)" }}
          >
            <Zap className="size-8 text-neutral-950" strokeWidth={1.5} />
            <div>
              <h3 className="font-heading text-2xl font-bold mb-3 text-neutral-950">
                Instant Publish
              </h3>
              <p className="font-body text-neutral-950/75 leading-relaxed">
                Skip the copy-paste fatigue. Direct API integrations for your
                favourite platforms.
              </p>
            </div>
          </div>

          {/* Growth Intelligence */}
          <div
            className="md:col-span-5 rounded-lg p-10 flex flex-col justify-between cursor-default"
            style={glassStyle}
          >
            <div className="flex items-end gap-1.5 mb-8 h-20">
              {[12, 24, 16, 32, 20, 38, 28].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm transition-all duration-500"
                  style={{
                    height: `${h * 2}px`,
                    background:
                      i === 5
                        ? "var(--mm-gold-400)"
                        : `rgba(230,195,100,${0.2 + i * 0.06})`,
                  }}
                />
              ))}
            </div>
            <div>
              <h3 className="font-heading text-2xl font-bold mb-3 text-foreground">
                Growth Intelligence
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Track your brand&apos;s resonance and authority metrics across
                the entire web ecosystem.
              </p>
            </div>
          </div>

          {/* And more */}
          <div
            className="md:col-span-7 rounded-lg p-10 flex items-center justify-between cursor-default"
            style={{
              background: "rgba(42,42,42,0.6)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>
              <h3 className="font-heading text-2xl font-bold mb-2 text-foreground">
                And more&hellip;
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Collaborative vaults, semantic search, and brand voice cloning.
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center"
              style={{
                border: "1px solid var(--mm-gold-400)",
                color: "var(--mm-gold-400)",
              }}
            >
              <Plus className="size-5" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </FadeInSection>
    </section>
  )
}

// ── Who It's For ──────────────────────────────────────────────────────────────

function WhoItsForSection() {
  return (
    <section
      className="py-32 px-6"
      style={{ background: "rgba(28,27,27,0.3)" }}
    >
      <div className="max-w-[1200px] mx-auto text-center">
        <FadeInSection className="mb-12">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Who is Mintmark for?
          </h2>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {PERSONAS.map((label) => (
              <motion.span
                key={label}
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.15 }}
                className="px-5 py-2.5 rounded-full font-mono text-xs text-foreground cursor-default transition-colors duration-200 hover:text-neutral-950"
                style={{
                  background: "rgba(42,42,42,0.8)",
                  border: "1px solid rgba(77,70,55,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--mm-gold-400)"
                  e.currentTarget.style.border = "1px solid var(--mm-gold-400)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(42,42,42,0.8)"
                  e.currentTarget.style.border = "1px solid rgba(77,70,55,0.3)"
                }}
              >
                {label}
              </motion.span>
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-32 px-6 max-w-3xl mx-auto">
      <FadeInSection className="text-center mb-16">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Frequently Asked Questions
        </h2>
      </FadeInSection>

      <div className="space-y-3">
        {FAQS_DATA.map(({ q, a }, i) => (
          <FadeInSection key={i} delay={i * 0.07}>
            <div
              className="rounded-lg overflow-hidden cursor-pointer"
              style={{
                background: "rgba(32,31,31,0.55)",
                backdropFilter: "blur(12px)",
                borderTop: "1px solid rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="flex items-center justify-between p-6 gap-4">
                <h3 className="font-heading font-semibold text-foreground text-sm md:text-base">
                  {q}
                </h3>
                <motion.div
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="shrink-0"
                >
                  <ChevronDown className="size-4 text-muted-foreground" />
                </motion.div>
              </div>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: SNAP }}
                    className="overflow-hidden"
                  >
                    <p
                      className="font-body text-sm text-muted-foreground px-6 pt-2 pb-4 leading-relaxed"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      {a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeInSection>
        ))}
      </div>
    </section>
  )
}

// ── Social Proof ──────────────────────────────────────────────────────────────

const CAPACITY = 1000

function SocialProofSection() {
  const { data: countData } = useWaitlistCount()
  const count = countData?.count ?? null

  const pct = count !== null ? Math.min((count / CAPACITY) * 100, 100) : 0

  return (
    <section className="py-20 px-6 border-t border-border">
      <div className="max-w-sm mx-auto text-center">
        <FadeInSection>
          <p className="font-mono text-[10px] font-semibold text-gold uppercase tracking-widest mb-3">
            Early access
          </p>
          <h2 className="font-heading text-xl font-semibold text-foreground mb-1">
            Spots are limited
          </h2>
          {count === null ? (
            <div className="flex justify-center mb-6">
              <div className="h-4 w-48 rounded bg-neutral-800 animate-pulse" />
            </div>
          ) : (
            <p className="font-body text-sm text-muted-foreground mb-6">
              {count?.toLocaleString()} of {CAPACITY?.toLocaleString()} spots claimed
            </p>
          )}
          <div className="relative h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: "linear-gradient(to right, var(--mm-gold-700), var(--mm-gold-400))",
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

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="py-14 px-6"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand — spans 2 cols */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-6">
            <LogoMark size={28} />
            <span className="font-heading text-xl font-bold tracking-tighter text-gold">
              Mintmark
            </span>
          </div>
          <p className="font-body text-sm text-muted-foreground max-w-xs mb-8 leading-relaxed">
            The premium curation engine for the modern intellectual. Stamping
            your authority on the digital frontier.
          </p>
          <div className="flex gap-3">
            <a
              href="https://x.com/mintmark"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-gold transition-colors"
              aria-label="Mintmark on X"
            >
              <Share2 className="size-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-gold mb-6">
            Navigation
          </h4>
          <ul className="space-y-3 font-body text-sm text-muted-foreground">
            {["Home", "Features", "About Us", "Waitlist"].map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-foreground transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-gold mb-6">
            Legal
          </h4>
          <ul className="space-y-3 font-body text-sm text-muted-foreground">
            <li>
              <a href="/legal/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/legal/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground transition-colors">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-[1200px] mx-auto mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          © 2025 Mintmark Technologies. All Rights Reserved.
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          Stamp your knowledge on the internet.
        </p>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0A0A0A" }}>
      <CursorSpotlight />
      <HeroSection />
      <HowItWorksSection />
      <OutputPreviewSection />
      <BentoFeaturesSection />
      <WhoItsForSection />
      <FAQSection />
      <SocialProofSection />
      <Footer />
    </div>
  )
}
