import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

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

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createAdminClient()
  const { data: settings } = await supabase
    .from("user_settings")
    .select("onboarding_completed")
    .eq("user_id", session.user.id)
    .maybeSingle()

  if (!settings?.onboarding_completed) redirect("/onboarding")

  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-4 p-8">
      <div style={glassStyle} className="w-full max-w-lg p-8 rounded-xl text-center space-y-3">
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          Dashboard
        </h1>
        <p className="font-body text-sm text-muted-foreground">
          Your workspace is coming in Phase 8.8.
        </p>
        <p className="font-mono text-xs" style={{ color: "var(--mm-gold-400)" }}>
          Phase 8.2 stub — full dashboard in Phase 8.8
        </p>
      </div>
    </div>
  )
}
