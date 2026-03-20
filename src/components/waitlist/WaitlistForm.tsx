"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Copy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Helpers ───────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

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

function SuccessState({ referralCode }: { referralCode: string }) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-card border border-border rounded-xl p-6 text-center"
    >
      {/* Check icon */}
      <div className="size-10 rounded-full bg-gold-muted border border-gold-border flex items-center justify-center mx-auto mb-4">
        <Check className="size-5 text-gold" strokeWidth={2.5} />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">
        You&apos;re on the list!
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Check your email to confirm your spot.
      </p>

      {/* Referral link */}
      <div className="mb-4 text-left">
        <p className="text-xs text-muted-foreground mb-1.5">Your referral link</p>
        <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-2">
          <span className="flex-1 text-xs text-foreground font-mono truncate">
            {referralUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 text-muted-foreground hover:text-gold transition-colors focus-visible:outline-none"
            aria-label={copyState === "copied" ? "Copied!" : "Copy referral link"}
          >
            {copyState === "copied" ? (
              <Check className="size-3.5 text-gold" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Share your link — move up the queue for every friend who joins
      </p>
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

      setReferralCode((data as { referral_code?: string }).referral_code ?? "")
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
          <SuccessState key="success" referralCode={referralCode} />
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
