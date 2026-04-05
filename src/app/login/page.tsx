"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, X } from "lucide-react"
import { LogoMark } from "@/components/ui/logo-mark"

// ── Card style ────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [showWelcome, setShowWelcome] = useState(searchParams.get("welcome") === "1")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const cleanedUp = useRef(false)

  // Remove ?welcome=1 from URL on mount — cosmetic, no reload
  useEffect(() => {
    if (showWelcome && !cleanedUp.current) {
      cleanedUp.current = true
      const url = new URL(window.location.href)
      url.searchParams.delete("welcome")
      window.history.replaceState({}, "", url.toString())
    }
  }, [showWelcome])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password.")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  const inputBase =
    "w-full rounded-lg px-3.5 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold-border)] transition-colors duration-150 leading-normal border border-[var(--border)] bg-[var(--input)]"

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div style={glassStyle} className="w-full max-w-md p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoMark size={36} />
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Sign in to Mintmark
          </h1>
        </div>

        {/* Welcome banner */}
        {showWelcome && (
          <div
            className="flex items-start justify-between gap-3 rounded-lg px-4 py-3"
            style={{
              background: "rgba(230,195,100,0.08)",
              border: "1px solid rgba(230,195,100,0.22)",
            }}
          >
            <p className="font-body text-sm" style={{ color: "var(--mm-gold-400, #e6c364)" }}>
              Account created. Sign in to get started.
            </p>
            <button
              type="button"
              onClick={() => setShowWelcome(false)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputBase}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputBase} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="font-body text-sm text-red-400">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg py-2.5 font-heading text-sm font-bold text-neutral-950 transition-opacity disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: "var(--mm-gold-400, #e6c364)",
              boxShadow: "0 0 20px rgba(230,195,100,0.15)",
            }}
          >
            {isLoading ? (
              <span className="animate-pulse">Signing in…</span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
