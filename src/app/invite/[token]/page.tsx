import { notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { LogoMark } from "@/components/ui/logo-mark"
import InviteSignupForm from "@/components/auth/InviteSignupForm"

// Never cache — token state changes (used_at gets set)
export const dynamic = "force-dynamic"

interface Props {
  params: Promise<{ token: string }>
}

// ── Expired / used token view ─────────────────────────────────────────────────

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

function InviteExpiredView() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <div style={glassStyle} className="w-full max-w-md p-8 text-center space-y-5">
        <LogoMark size={36} />
        <div className="space-y-2">
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Invite link unavailable
          </h1>
          <p className="font-body text-sm text-muted-foreground">
            This invite link has expired or has already been used. Each link
            can only be used once.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block font-body text-sm text-gold hover:underline transition-colors"
          style={{ color: "var(--mm-gold-400, #e6c364)" }}
        >
          Back to homepage
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InvitePage({ params }: Props) {
  const { token } = await params

  if (!token) notFound()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("invite_tokens")
    .select("email, expires_at, used_at")
    .eq("token", token)
    .maybeSingle()

  // Token not found at all → 404
  if (!data) notFound()

  // Token exists but is used or expired → show expired UI (not 404)
  const isValid = data.used_at === null && new Date(data.expires_at) > new Date()
  if (!isValid) {
    return <InviteExpiredView />
  }

  // Valid — render signup form
  return <InviteSignupForm token={token} email={data.email} />
}
