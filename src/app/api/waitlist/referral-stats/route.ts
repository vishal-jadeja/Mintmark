import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit, statsLimiter } from "@/lib/rate-limit"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function GET(request: Request) {
  // Rate limit by IP — 10 req/min
  const ip = getIP(request)
  const rl = await checkRateLimit(ip, statsLimiter)
  if (!rl.success) {
    return Response.json(
      { error: "Too many requests. Please wait a moment." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.reset - Date.now()) / 1000)),
        },
      }
    )
  }

  const email =
    new URL(request.url).searchParams.get("email")?.trim() ?? ""

  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Valid email required." }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Effective position (accounts for referral bonuses)
  const { data: position } = await supabase.rpc("get_waitlist_position", {
    p_email: email,
  })

  // Referral code for this email
  const { data: entry } = await supabase
    .from("waitlist")
    .select("referral_code")
    .eq("email", email)
    .maybeSingle()

  // Count how many people joined using this referral code
  let referrals = 0
  if (entry?.referral_code) {
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .eq("referred_by", entry.referral_code)
    referrals = count ?? 0
  }

  // Total waitlist size
  const { count: total } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true })

  return Response.json({
    position: position ?? null,
    referrals,
    total: total ?? 0,
  })
}
