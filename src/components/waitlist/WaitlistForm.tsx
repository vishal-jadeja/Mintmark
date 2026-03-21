"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Copy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/ui/logo-mark"
import { shadows } from "@/lib/design"
import { cn } from "@/lib/utils"

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

const SNAP = [0.16, 1, 0.3, 1] as const

// ── WaitlistCount ─────────────────────────────────────────────────────────────

function WaitlistCount() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/waitlist/count")
      .then((r) => r.json())
      .then((d) => setCount(typeof d.count === "number" ? d.count : 0))
      .catch(() => setCount(0))
  }, [])

  if (count === null) {
    return (
      <div className="flex justify-center">
        <div className="h-4 w-44 rounded bg-neutral-800 animate-pulse" />
      </div>
    )
  }

  return (
    <p className="text-sm text-muted-foreground text-center">
      Join{" "}
      <span className="text-foreground font-medium">
        {count.toLocaleString()}
      </span>{" "}
      {count === 1 ? "person" : "people"} on the waitlist
    </p>
  )
}

// ── SuccessState ──────────────────────────────────────────────────────────────

const successContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const successItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: SNAP } },
}

const NEXT_STEPS = [
  "Check your email and confirm your spot to lock in your place.",
  "Share your referral link — every signup moves you up 5 spots.",
  "We'll email you the moment early access opens.",
]

function SuccessState({
  referralCode,
  position,
  total,
}: {
  referralCode: string
  position: number | null
  total: number | null
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle")
  const referralUrl = `https://mintmark.app/ref/${referralCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopyState("copied")
      setTimeout(() => setCopyState("idle"), 2000)
    } catch {
      // Clipboard not available — silently fail
    }
  }

  const tweetText = encodeURIComponent(
    `Just joined the Mintmark waitlist! Turn what you learn into content for LinkedIn, X, and Medium — all at once.`
  )
  const tweetUrl = encodeURIComponent(referralUrl)
  const xShareUrl = `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`
  const liShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${tweetUrl}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(32, 31, 31, 0.6)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: "1px solid rgba(230, 195, 100, 0.2)",
        borderTop: "1px solid rgba(230, 195, 100, 0.35)",
      }}
    >
      <motion.div
        variants={successContainer}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center text-center p-6"
      >
        {/* [1] Rank badge */}
        {position !== null && (
          <motion.div variants={successItem} className="mb-1">
            <span
              className="text-6xl font-bold tabular-nums leading-none"
              style={{
                background: "linear-gradient(135deg, #FFE08F 0%, #E6C364 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              #{position.toLocaleString()}
            </span>
          </motion.div>
        )}

        {/* [2] Label */}
        <motion.p
          variants={successItem}
          className="text-sm font-medium text-foreground mb-1"
        >
          your spot on the waitlist
        </motion.p>

        {/* [3] Total context */}
        {total !== null && (
          <motion.p
            variants={successItem}
            className="text-xs text-muted-foreground mb-5"
          >
            Out of{" "}
            <span className="text-foreground font-medium">
              {total.toLocaleString()}
            </span>{" "}
            early curators
          </motion.p>
        )}

        {/* [4] Divider */}
        <motion.div
          variants={successItem}
          className="w-full mb-5 overflow-hidden"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: SNAP, delay: 0.3 }}
            style={{
              transformOrigin: "left",
              height: "1px",
              background: "rgba(230, 195, 100, 0.15)",
            }}
            className="w-full"
          />
        </motion.div>

        {/* [5] Referral section */}
        <motion.div variants={successItem} className="w-full text-left space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground mb-0.5">
              Move up the waitlist
            </p>
            <p className="text-xs text-muted-foreground">
              Every friend who joins with your link moves you up 5 spots.
            </p>
          </div>

          {/* URL card */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(230,195,100,0.15)",
            }}
          >
            <span className="flex-1 text-xs text-foreground font-mono truncate">
              {referralUrl}
            </span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="flex-shrink-0 text-muted-foreground hover:text-gold transition-colors focus-visible:outline-none cursor-pointer"
              aria-label={copyState === "copied" ? "Copied!" : "Copy referral link"}
            >
              {copyState === "copied" ? (
                <Check className="size-3.5 text-gold" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </motion.button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <a href={xShareUrl} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Share on X
              </a>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <a href={liShareUrl} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </Button>
          </div>
        </motion.div>

        {/* [6] Divider */}
        <motion.div variants={successItem} className="w-full my-5 overflow-hidden">
          <div style={{ height: "1px", background: "rgba(230,195,100,0.15)" }} className="w-full" />
        </motion.div>

        {/* [7] What's next */}
        <motion.div variants={successItem} className="w-full text-left space-y-2.5">
          <p className="text-sm font-semibold text-foreground">What&apos;s next?</p>
          <ul className="space-y-2">
            {NEXT_STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 flex-shrink-0 size-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: "rgba(230,195,100,0.15)",
                    color: "#E6C364",
                  }}
                >
                  {i + 1}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">{step}</span>
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
  "w-full bg-input border border-border rounded-md px-3 py-[7px]",
  "text-sm text-foreground placeholder:text-muted-foreground",
  "focus:outline-none focus:border-gold-border focus:ring-2 focus:ring-ring",
  "transition-colors duration-150 leading-normal"
)

// ── WaitlistForm ──────────────────────────────────────────────────────────────

type FormStatus = "idle" | "submitting" | "success" | "error"

export default function WaitlistForm() {
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [position, setPosition] = useState<number | null>(null)
  const [total, setTotal] = useState<number | null>(null)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [reason, setReason] = useState("")
  const honeypotRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const trimmedEmail = email.trim()

    if (!isValidEmail(trimmedEmail)) {
      setStatus("error")
      setErrorMessage("Please enter a valid email address.")
      return
    }

    setStatus("submitting")
    setErrorMessage("")

    const honeypot = honeypotRef.current?.value ?? ""

    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail.slice(0, 254),
          name: name.trim().slice(0, 100) || null,
          reason: reason.trim().slice(0, 500) || null,
          website: honeypot,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setStatus("error")
        setErrorMessage(
          res.status === 429
            ? "Too many requests. Please wait a moment and try again."
            : (data as { error?: string }).error ?? "Something went wrong. Please try again."
        )
        return
      }

      const d = data as { referral_code?: string; position?: number; total?: number }
      setReferralCode(d.referral_code ?? "")
      setPosition(typeof d.position === "number" ? d.position : null)
      setTotal(typeof d.total === "number" ? d.total : null)
      setStatus("success")
    } catch {
      setStatus("error")
      setErrorMessage(
        "Unable to connect. Please check your connection and try again."
      )
    }
  }

  return (
    <div className="w-full space-y-3">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <SuccessState key="success" referralCode={referralCode} position={position} total={total} />
        ) : (
          <motion.div
            key="form"
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-card border border-border rounded-xl p-6 space-y-3"
            >
              {/*
               * HONEYPOT — hidden from real users via CSS position trick.
               * display:none is avoided because many bots ignore it.
               * tabIndex={-1} and aria-hidden keep it out of keyboard/AT flow.
               */}
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

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                maxLength={254}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                aria-label="Email address"
              />

              {/* Name */}
              <input
                type="text"
                name="name"
                placeholder="Your name (optional)"
                maxLength={100}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                aria-label="Your name"
              />

              {/* Reason */}
              <textarea
                name="reason"
                placeholder="What are you hoping to use Mintmark for? (optional)"
                maxLength={500}
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={cn(inputClass, "resize-none")}
                aria-label="Why do you want access?"
              />

              {/* Inline error */}
              {status === "error" && errorMessage && (
                <p className="text-sm text-destructive" role="alert">
                  {errorMessage}
                </p>
              )}

              {/* Submit */}
              <motion.div whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.97 }}>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Joining&hellip;
                    </>
                  ) : (
                    "Join the waitlist →"
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Count — only shown before success */}
      {status !== "success" && <WaitlistCount />}
    </div>
  )
}
