import { adminGuard } from "@/lib/auth/requireAdmin"
import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const CACHE_KEY = "admin:stats"
const CACHE_TTL = 60 // seconds

export async function GET() {
  const denied = await adminGuard()
  if (denied) return denied

  // Try cache first
  const cached = await redis.get<string>(CACHE_KEY)
  if (cached) {
    return Response.json(cached, {
      headers: { "X-Cache": "HIT" },
    })
  }

  const supabase = createAdminClient()

  // Run all counts in parallel
  const [
    { count: totalWaitlist },
    { count: waitingCount },
    { count: invitedCount },
    { count: joinedCount },
    { count: totalUsers },
    { count: pendingTokens },
    { count: expiredTokens },
    { data: capRow },
    { data: bonusRow },
  ] = await Promise.all([
    supabase.from("waitlist").select("*", { count: "exact", head: true }),
    supabase.from("waitlist").select("*", { count: "exact", head: true }).eq("status", "waiting"),
    supabase.from("waitlist").select("*", { count: "exact", head: true }).eq("status", "invited"),
    supabase.from("waitlist").select("*", { count: "exact", head: true }).eq("status", "joined"),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase
      .from("invite_tokens")
      .select("*", { count: "exact", head: true })
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString()),
    supabase
      .from("invite_tokens")
      .select("*", { count: "exact", head: true })
      .lt("expires_at", new Date().toISOString())
      .is("used_at", null),
    supabase.from("system_config").select("value").eq("key", "invite_cap").maybeSingle(),
    supabase.from("system_config").select("value").eq("key", "referral_bonus").maybeSingle(),
  ])

  const stats = {
    totalWaitlist: totalWaitlist ?? 0,
    waitingCount: waitingCount ?? 0,
    invitedCount: invitedCount ?? 0,
    joinedCount: joinedCount ?? 0,
    totalUsers: totalUsers ?? 0,
    pendingTokens: pendingTokens ?? 0,
    expiredTokens: expiredTokens ?? 0,
    currentInviteCap: parseInt(capRow?.value ?? "100", 10),
    referralBonus: parseInt(bonusRow?.value ?? "5", 10),
  }

  // Cache for 60 seconds
  await redis.setex(CACHE_KEY, CACHE_TTL, stats)

  return Response.json(stats, {
    headers: { "X-Cache": "MISS" },
  })
}
