import { schedules } from "@trigger.dev/sdk/v3"
import { createAdminClient } from "@/lib/supabase/admin"
import { Redis } from "@upstash/redis"

export const cleanupExpiredTokens = schedules.task({
  id: "cleanup-expired-tokens",
  // 2am UTC daily
  cron: "0 2 * * *",

  run: async () => {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    // Find expired unused tokens
    const { data: expired } = await supabase
      .from("invite_tokens")
      .select("email, token")
      .lt("expires_at", now)
      .is("used_at", null)

    if (!expired || expired.length === 0) {
      return { cleaned: 0, emailsReverted: [] }
    }

    const expiredEmails = [...new Set(expired.map((t) => t.email))]
    const expiredTokens = expired.map((t) => t.token)

    // Delete expired unused tokens
    await supabase.from("invite_tokens").delete().in("token", expiredTokens)

    // Find which of those emails have NO remaining valid token
    // (prevents reverting someone who received a newer invite)
    const { data: stillValid } = await supabase
      .from("invite_tokens")
      .select("email")
      .in("email", expiredEmails)
      .gte("expires_at", now)
      .is("used_at", null)

    const stillValidEmails = new Set((stillValid ?? []).map((t) => t.email))
    const emailsToRevert = expiredEmails.filter((e) => !stillValidEmails.has(e))

    if (emailsToRevert.length > 0) {
      await supabase
        .from("waitlist")
        .update({ status: "waiting" })
        .in("email", emailsToRevert)
        .eq("status", "invited")
    }

    // Invalidate admin stats cache if anything changed
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    await redis.del("admin:stats")

    return { cleaned: expiredTokens.length, emailsReverted: emailsToRevert }
  },
})
