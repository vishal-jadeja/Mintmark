"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  Copy,
  Loader2,
  RefreshCw,
  Users,
  Mail,
  Palette,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { REFERRAL_SLOTS_BONUS } from "@/lib/config"
import {
  useWaitlistCount,
  useJoinWaitlist,
  useReferralStats,
} from "@/lib/queries"
import { useUIStore } from "@/stores"

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

const SNAP = [0.16, 1, 0.3, 1] as const

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: SNAP } },
}

// ── Glass card style ──────────────────────────────────────────────────────────

const glassStyle: React.CSSProperties = {
  background: "rgba(32, 31, 31, 0.65)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  borderRadius: "10px",
  borderTop: "1px solid rgba(230, 195, 100, 0.22)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow:
    "0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(230,195,100,0.10) inset, 0 0 60px rgba(230,195,100,0.05)",
}

// ── ReferralStats ─────────────────────────────────────────────────────────────
// Uses TanStack Query — polling handled by refetchInterval in the hook.
// The refresh button calls refetch() directly.

function ReferralStats({ email }: { email: string }) {
  const { data: stats, isLoading, isFetching, refetch } = useReferralStats(email)

  return (
    <div
      className="rounded-lg p-3 space-y-2"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(230,195,100,0.12)",
      }}
    >
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Referral Stats
        </p>
        <button
          onClick={() => refetch()}
          className="text-muted-foreground hover:text-gold transition-colors focus-visible:outline-none cursor-pointer"
          aria-label="Refresh stats"
        >
          <RefreshCw className={cn("size-3", isFetching && "animate-spin")} />
        </button>
      </div>
      {isLoading || !stats ? (
        <div className="space-y-1.5">
          <div className="h-3 w-40 rounded bg-neutral-800 animate-pulse" />
        </div>
      ) : (
        <span className="text-xs text-foreground flex items-center gap-1.5">
          <Users className="size-3 text-muted-foreground" />
          <span className="font-semibold">{stats.referrals}</span>
          <span className="text-muted-foreground">
            {stats.referrals === 1 ? "friend joined" : "friends joined"}
          </span>
        </span>
      )}
    </div>
  )
}

// ── SuccessState ──────────────────────────────────────────────────────────────

const NEXT_STEPS = [
  {
    Icon: Mail,
    title: "Verify your email",
    desc: "Check your inbox for the welcome transmission.",
  },
  {
    Icon: Palette,
    title: "Choose your handle",
    desc: "Handles are reserved in order of rank priority.",
  },
  {
    Icon: Sparkles,
    title: "Prepare your studio",
    desc: "Beta invites ship every Tuesday at 10 AM EST.",
  },
]

function SuccessState({
  referralCode,
  position,
  email,
}: {
  referralCode: string
  position: number | null
  email: string
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")
  const referralUrl = `https://mintmark.app/r/${referralCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopyState("copied")
      setTimeout(() => setCopyState("idle"), 2000)
    } catch {
      // clipboard not available
    }
  }

  // Only show "move up" incentive if there's room to climb
  const canMoveUp = position === null || position > REFERRAL_SLOTS_BONUS

  const tweetText = encodeURIComponent(
    `Just joined the Mintmark waitlist! Turn what you learn into content for LinkedIn, X, and Medium — all at once.`
  )
  const tweetUrl = encodeURIComponent(referralUrl)
  const xShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`
  const liShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${tweetUrl}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      style={glassStyle}
      className="relative overflow-hidden"
    >
      {/* Decorative glow */}
      <div
        className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "rgba(230,195,100,0.07)", filter: "blur(60px)" }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-8 space-y-6"
      >
        {/* Success icon + headline */}
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center space-y-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(230,195,100,0.12)" }}
          >
            <Check className="size-6 text-gold" strokeWidth={2} />
          </div>
          <h2
            className="font-display text-3xl md:text-4xl tracking-tight"
            style={{
              fontStyle: "italic",
              fontWeight: 400,
              color: "#e5e2e1",
            }}
          >
            You&apos;re on the list.
          </h2>
        </motion.div>

        {/* Rank */}
        {position !== null && (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-6"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.05)",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Your position
            </span>
            <span
              className="font-heading font-extrabold text-7xl tracking-tighter leading-none"
              style={{
                background: "linear-gradient(135deg, #FFE08F 0%, #E6C364 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              #{position?.toLocaleString()}
            </span>
          </motion.div>
        )}

        {/* Referral */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex justify-between items-end">
            {canMoveUp ? (
              <>
                <p className="font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-foreground">
                  Move up the queue
                </p>
                <span className="font-mono text-[10px] text-gold">
                  +{REFERRAL_SLOTS_BONUS} slots per invite
                </span>
              </>
            ) : (
              <>
                <p className="font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-foreground">
                  You&apos;re near the top
                </p>
                <span className="font-mono text-[10px] text-gold">
                  Share anyway — help a friend
                </span>
              </>
            )}
          </div>

          {/* URL row */}
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg"
            style={{
              background: "rgba(14,14,14,0.8)",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.4) inset",
            }}
          >
            <code className="font-mono text-xs text-muted-foreground flex-1 truncate">
              {referralUrl}
            </code>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={handleCopy}
              className="shrink-0 text-muted-foreground hover:text-gold transition-colors focus-visible:outline-none cursor-pointer p-1"
              aria-label={copyState === "copied" ? "Copied!" : "Copy link"}
            >
              {copyState === "copied" ? (
                <Check className="size-3.5 text-gold" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </motion.button>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={xShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-heading text-xs font-semibold text-foreground transition-all hover:text-gold"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X / Twitter
            </a>
            <a
              href={liShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-heading text-xs font-semibold text-foreground transition-all hover:text-gold"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </motion.div>

        {/* Live referral stats */}
        <motion.div variants={itemVariants}>
          <ReferralStats email={email} />
        </motion.div>

        {/* Next steps */}
        <motion.div
          variants={itemVariants}
          className="pt-5 space-y-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Next Steps
          </p>
          <ul className="space-y-3.5">
            {NEXT_STEPS.map(({ Icon, title, desc }, i) => (
              <li key={i} className="flex items-start gap-3.5 group">
                <div
                  className="mt-0.5 w-8 h-8 shrink-0 flex items-center justify-center rounded transition-colors"
                  style={{
                    background: "rgba(42,42,42,0.8)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-0 items-start">
                  <p className="text-sm font-normal text-foreground">{title}</p>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ── Input styles ──────────────────────────────────────────────────────────────

const inputClass = cn(
  "w-full rounded-lg px-3.5 py-2.5",
  "font-body text-sm text-foreground placeholder:text-muted-foreground",
  "focus:outline-none focus:ring-1 focus:ring-gold-border",
  "transition-colors duration-150 leading-normal",
  "border"
)

// ── WaitlistForm ──────────────────────────────────────────────────────────────

export default function WaitlistForm() {
  // Controlled form inputs — local UI state, correct to keep as useState
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [reason, setReason] = useState("")
  // Client-side validation error (not from server — stays local)
  const [clientError, setClientError] = useState("")
  // Referral cookie — local, one-time read on mount
  const [referredBy, setReferredBy] = useState("")
  const honeypotRef = useRef<HTMLInputElement>(null)

  // Server state via TanStack Query
  const { mutate: join, isPending, isSuccess, data: joinData, error: mutationError } = useJoinWaitlist()
  const { data: countData, isLoading: countLoading } = useWaitlistCount()

  // Notify hero section to swap background/content when join succeeds
  const setWaitlistJoined = useUIStore((s) => s.setWaitlistJoined)
  useEffect(() => {
    if (isSuccess && joinData) setWaitlistJoined(true)
  }, [isSuccess, joinData, setWaitlistJoined])

  // Read referral code from cookie (set by /ref/[code] page)
  useEffect(() => {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("referral_code="))
    if (match) setReferredBy(decodeURIComponent(match.split("=")[1]))
  }, [])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedEmail = email.trim()
    if (!isValidEmail(trimmedEmail)) {
      setClientError("Please enter a valid email address.")
      return
    }
    setClientError("")

    join({
      email: trimmedEmail.slice(0, 254),
      name: name.trim().slice(0, 100) || null,
      reason: reason.trim().slice(0, 500) || null,
      website: honeypotRef.current?.value ?? "",
      referred_by: referredBy || undefined,
    })
  }

  const errorMessage = clientError || mutationError?.message

  return (
    <div className="w-full space-y-3">
      <AnimatePresence mode="wait">
        {isSuccess && joinData ? (
          <SuccessState
            key="success"
            referralCode={joinData.referral_code}
            position={joinData.position}
            email={email}
          />
        ) : (
          <motion.div
            key="form"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-3 p-1.5 rounded-xl"
              style={{
                background: "rgba(28,27,27,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow:
                  "0 4px 24px rgba(0,0,0,0.45), 0 1px 0 rgba(230,195,100,0.07) inset",
              }}
            >
              {/* Honeypot */}
              <input
                ref={honeypotRef}
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: "1px",
                  height: "1px",
                  opacity: 0,
                  overflow: "hidden",
                }}
              />

              <div className="flex flex-col sm:flex-row gap-2 p-0.5">
                {/* Email */}
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    inputClass,
                    "flex-1 bg-transparent border-transparent text-base focus:ring-0"
                  )}
                  aria-label="Email address"
                />
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isPending}
                  className="shrink-0 flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-heading font-bold text-sm text-neutral-950 transition-all shadow-lg cursor-pointer disabled:opacity-60"
                  style={{
                    background: "var(--mm-gold-400)",
                    boxShadow: "0 0 20px rgba(230,195,100,0.15)",
                  }}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Joining&hellip;
                    </>
                  ) : (
                    "Join the waitlist"
                  )}
                </motion.button>
              </div>

              {/* Optional fields — only shown when email has content */}
              <AnimatePresence>
                {email.length > 3 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: SNAP }}
                    className="overflow-hidden px-0.5 space-y-2"
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name (optional)"
                      maxLength={100}
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn(inputClass, "bg-transparent border-border")}
                      aria-label="Your name"
                    />
                    <textarea
                      name="reason"
                      placeholder="What are you hoping to use Mintmark for? (optional)"
                      maxLength={500}
                      rows={2}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className={cn(inputClass, "resize-none bg-transparent border-border")}
                      aria-label="Why do you want access?"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              {errorMessage && (
                <p className="font-body text-sm text-red-400 px-1 pb-1" role="alert">
                  {errorMessage}
                </p>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waitlist count — shown below form only when not in success state */}
      {!isSuccess && (
        countLoading ? (
          <div className="flex justify-center">
            <div className="h-4 w-44 rounded bg-neutral-800 animate-pulse" />
          </div>
        ) : (
          <p className="font-mono text-xs text-muted-foreground text-center tracking-tight">
            <span className="text-neutral-300 font-semibold">
              {(countData?.count ?? 0)?.toLocaleString()}
            </span>{" "}
            people already on the waitlist
          </p>
        )
      )}
    </div>
  )
}
