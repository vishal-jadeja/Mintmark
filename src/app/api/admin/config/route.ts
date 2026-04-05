import { adminGuard } from "@/lib/auth/requireAdmin"
import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ALLOWED_KEYS = ["invite_cap", "referral_bonus"] as const
type ConfigKey = (typeof ALLOWED_KEYS)[number]

export async function PATCH(request: Request) {
  const denied = await adminGuard()
  if (denied) return denied

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 })
  }

  const key = body.key as string
  const value = body.value

  if (!ALLOWED_KEYS.includes(key as ConfigKey)) {
    return Response.json(
      { error: "Invalid config key. Allowed keys: invite_cap, referral_bonus." },
      { status: 400 }
    )
  }

  const numValue = typeof value === "number" ? value : parseInt(String(value), 10)
  if (isNaN(numValue) || numValue < 0 || !Number.isInteger(numValue)) {
    return Response.json(
      { error: "Value must be a non-negative integer." },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from("system_config")
    .upsert(
      { key, value: String(numValue), updated_at: new Date().toISOString() },
      { onConflict: "key" }
    )

  if (error) {
    console.error("[admin/config] Upsert error:", error.message)
    return Response.json(
      { error: "Failed to update config. Please try again." },
      { status: 500 }
    )
  }

  // Invalidate stats cache
  await redis.del("admin:stats")

  return Response.json({ success: true })
}
