import { task } from "@trigger.dev/sdk/v3"
import { randomBytes } from "node:crypto"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendEmail } from "@/lib/email/send"
import { InviteEmail, INVITE_SUBJECT } from "@/lib/email/templates"
import { Redis } from "@upstash/redis"

export interface SendBatchInvitesPayload {
  count: number
  triggeredBy?: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mintmark.app"
const TOKEN_TTL_HOURS = 48

export const sendBatchInvites = task({
  id: "send-batch-invites",
  maxDuration: 300,

  run: async (payload: SendBatchInvitesPayload) => {
    const { count: requestedCount } = payload

    if (requestedCount < 1 || requestedCount > 100) {
      throw new Error("count must be between 1 and 100")
    }

    const supabase = createAdminClient()
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    // Check remaining invite capacity
    const [{ data: capRow }, { count: usedCount }] = await Promise.all([
      supabase.from("system_config").select("value").eq("key", "invite_cap").maybeSingle(),
      supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true })
        .in("status", ["invited", "joined"]),
    ])

    const cap = parseInt(capRow?.value ?? "100", 10)
    const used = usedCount ?? 0
    const remaining = Math.max(0, cap - used)
    const count = Math.min(requestedCount, remaining)

    if (count === 0) {
      return { invited: 0, failed: [], skipped: "No capacity remaining." }
    }

    // Fetch top N waiting users by position
    const { data: candidates } = await supabase
      .from("waitlist")
      .select("id, email, name")
      .eq("status", "waiting")
      .order("position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })
      .limit(count)

    if (!candidates || candidates.length === 0) {
      return { invited: 0, failed: [], skipped: "No waiting users found." }
    }

    const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString()
    const expiresFormatted = new Date(expiresAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

    const results = await Promise.allSettled(
      candidates.map(async (candidate) => {
        const token = randomBytes(32).toString("hex")
        const inviteUrl = `${APP_URL}/invite/${token}`

        const { error: tokenErr } = await supabase
          .from("invite_tokens")
          .insert({ email: candidate.email, token, expires_at: expiresAt })

        if (tokenErr) throw new Error(`Token insert failed for ${candidate.email}`)

        await supabase
          .from("waitlist")
          .update({ status: "invited" })
          .eq("email", candidate.email)

        await sendEmail({
          to: candidate.email,
          subject: INVITE_SUBJECT,
          react: InviteEmail({
            name: candidate.name ?? undefined,
            email: candidate.email,
            inviteUrl,
            expiresAt: expiresFormatted,
          }),
        })

        return candidate.email
      })
    )

    const invited = results.filter((r) => r.status === "fulfilled").length
    const failed = results
      .filter((r) => r.status === "rejected")
      .map((_, i) => candidates[i]?.email ?? "unknown")

    await redis.del("admin:stats")

    return { invited, failed }
  },
})
