"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { LogoMark } from "@/components/ui/logo-mark"

// ── Types ─────────────────────────────────────────────────────────────────────

type FormState = {
  status: "idle" | "error" | "success"
  error?: string
  fieldErrors?: {
    name?: string
    password?: string
    confirm?: string
  }
}

// ── Card style (matches WaitlistForm) ─────────────────────────────────────────

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

// ── Action (defined outside component — stable reference for useActionState) ──

async function submitInvite(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = (formData.get("name") as string | null)?.trim() ?? ""
  const password = (formData.get("password") as string | null) ?? ""
  const confirm = (formData.get("confirm") as string | null) ?? ""
  const token = (formData.get("_token") as string | null) ?? ""

  // Client-side pre-validation
  const fieldErrors: FormState["fieldErrors"] = {}
  if (!name) fieldErrors.name = "Name is required."
  else if (name.length > 100) fieldErrors.name = "Name must be 100 characters or fewer."
  if (!password || password.length < 8) fieldErrors.password = "Password must be at least 8 characters."
  else if (password.length > 128) fieldErrors.password = "Password must be 128 characters or fewer."
  if (password !== confirm) fieldErrors.confirm = "Passwords do not match."

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors }
  }

  try {
    const res = await fetch("/api/auth/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, name, password }),
    })
    const data = (await res.json()) as { error?: string; success?: boolean }

    if (!res.ok) {
      return { status: "error", error: data.error ?? "Something went wrong. Please try again." }
    }

    return { status: "success" }
  } catch {
    return { status: "error", error: "Network error. Please try again." }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface InviteSignupFormProps {
  email: string
  token: string
}

export default function InviteSignupForm({ email, token }: InviteSignupFormProps) {
  const router = useRouter()
  const [state, action, isPending] = useActionState(submitInvite, { status: "idle" })
  const hasSubmitted = useRef(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Redirect to login on success
  useEffect(() => {
    if (state.status === "success") {
      const t = setTimeout(() => router.push("/login?welcome=1"), 1500)
      return () => clearTimeout(t)
    }
  }, [state.status, router])

  function handleSubmit() {
    hasSubmitted.current = true
  }

  function showFieldError(field: keyof NonNullable<FormState["fieldErrors"]>) {
    const err = state.fieldErrors?.[field]
    return err && (hasSubmitted.current || touched[field]) ? err : undefined
  }

  const inputBase =
    "w-full rounded-lg px-3.5 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[var(--gold-border)] transition-colors duration-150 leading-normal border border-[var(--border)] bg-[var(--input)]"

  // ── Success state ──────────────────────────────────────────────────────────
  if (state.status === "success") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--background)" }}
      >
        <div style={glassStyle} className="w-full max-w-md p-8 text-center space-y-4">
          <LogoMark size={36} />
          <div
            className="rounded-lg px-4 py-3 text-sm font-body"
            style={{
              background: "rgba(100,200,130,0.08)",
              border: "1px solid rgba(100,200,130,0.25)",
              color: "oklch(0.72 0.18 150)",
            }}
          >
            Account created. Redirecting you to sign in…
          </div>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
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
            You&apos;re in. Create your account.
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            Your invite is ready. Set up your password to continue.
          </p>
        </div>

        <form action={action} onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden token + email */}
          <input type="hidden" name="_token" value={token} />
          <input type="hidden" name="_email" value={email} />

          {/* Email (read-only display) */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <div
              className={`${inputBase} opacity-60 cursor-default select-none`}
              style={{ pointerEvents: "none" }}
              aria-readonly="true"
            >
              {email}
            </div>
          </div>

          {/* Full name */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoFocus
              autoComplete="name"
              placeholder="Your name"
              className={inputBase}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            />
            {showFieldError("name") && (
              <p className="font-body text-xs text-red-400">{showFieldError("name")}</p>
            )}
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
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className={`${inputBase} pr-10`}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
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
            {showFieldError("password") && (
              <p className="font-body text-xs text-red-400">{showFieldError("password")}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirm"
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat your password"
                className={`${inputBase} pr-10`}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {showFieldError("confirm") && (
              <p className="font-body text-xs text-red-400">{showFieldError("confirm")}</p>
            )}
          </div>

          {/* Global error */}
          {state.error && (
            <p className="font-body text-sm text-red-400">{state.error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg py-2.5 font-heading text-sm font-bold text-neutral-950 transition-opacity disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: "var(--mm-gold-400, #e6c364)",
              boxShadow: "0 0 20px rgba(230,195,100,0.15)",
            }}
          >
            {isPending ? (
              <span className="animate-pulse">Creating account…</span>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
