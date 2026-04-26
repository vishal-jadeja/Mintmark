"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, X, ArrowRight } from "lucide-react"

// ── Component ─────────────────────────────────────────────────────────────────

function LoginPageInner() {
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
    setIsLoading(false)
  }

  const inputClass =
    "w-full rounded-lg px-3.5 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-[var(--mm-gold-400,#e6c364)] transition-all duration-300 leading-normal bg-[#0e0e0e] border-0"

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        backgroundImage: "linear-gradient(rgba(10,9,8,0.62), rgba(10,9,8,0.62)), url('/bg-texture.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >

      <div className="w-full max-w-[400px] flex flex-col items-center gap-10">
        {/* Brand header */}
        <div className="flex flex-col items-center gap-1.5">
          <span
            className="font-heading text-4xl font-extrabold tracking-tight"
            style={{ color: "#C9A84C" }}
          >
            Mintmark
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            The Digital Curator
          </span>
        </div>

        {/* Auth card */}
        <div
          className="w-full rounded-[10px] p-10 shadow-2xl relative overflow-hidden"
          style={{
            background: "rgba(32, 31, 31, 0.6)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderTop: "1px solid rgba(230,195,100,0.2)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Subtle inner glow */}
          <div
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full"
            style={{
              background: "rgba(230,195,100,0.05)",
              filter: "blur(60px)",
            }}
          />

          <div className="relative z-10 flex flex-col gap-7">
            {/* Card heading */}
            <div className="flex flex-col gap-1.5">
              <h1 className="font-heading text-3xl font-bold text-foreground tracking-tight">
                Welcome back
              </h1>
              <p className="font-body text-sm text-muted-foreground">
                Access your curated collection.
              </p>
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
                <p
                  className="font-body text-sm"
                  style={{ color: "var(--mm-gold-400, #e6c364)" }}
                >
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  placeholder="curator@mintmark.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-end ml-1">
                  <label
                    htmlFor="password"
                    className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputClass} pr-10`}
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
                className="mt-1 w-full rounded-lg py-3.5 font-heading text-sm font-semibold text-neutral-950 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
                style={{
                  background: "var(--mm-gold-400, #e6c364)",
                  boxShadow: "0 4px 20px rgba(230,195,100,0.12)",
                }}
              >
                {isLoading ? (
                  <span className="animate-pulse">Signing in…</span>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center font-body text-xs text-muted-foreground">
          New to Mintmark?{" "}
          <a
            href="/"
            className="font-semibold hover:underline underline-offset-4 transition-colors"
            style={{ color: "var(--mm-gold-400, #e6c364)" }}
          >
            Request access
          </a>
        </p>

        {/* Meta footer */}
        <div className="flex gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground opacity-50">
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          <span>v1.0.4</span>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}
