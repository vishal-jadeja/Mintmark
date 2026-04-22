import { task } from "@trigger.dev/sdk/v3"
import { decrypt } from "@/lib/encryption"
import { computeIntensity, INTENSITY_THRESHOLDS } from "@/lib/activity-thresholds"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Json } from "@/types/database"

export interface GitHubBackfillPayload {
  userId: string
  encryptedToken: string
}

export const githubBackfill = task({
  id: "github-backfill",
  maxDuration: 300,

  run: async (payload: GitHubBackfillPayload) => {
    const { userId, encryptedToken } = payload
    const token = decrypt(encryptedToken)
    const authHeader = `token ${token}`

    // Get authenticated user login
    const profileRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: authHeader,
        Accept: "application/vnd.github+json",
      },
    })
    if (!profileRes.ok) {
      throw new Error(`GitHub profile fetch failed: ${profileRes.status}`)
    }
    const profile = await profileRes.json()
    const login: string = profile.login

    // Build 90-day date window
    const since = new Date()
    since.setDate(since.getDate() - 90)
    const sinceStr = since.toISOString().split("T")[0] // YYYY-MM-DD

    // Paginate commit search — GitHub caps results at 1 000
    const commitsByDate = new Map<string, number>()
    let page = 1

    while (true) {
      const url =
        `https://api.github.com/search/commits` +
        `?q=author:${login}+author-date:>=${sinceStr}` +
        `&sort=author-date&order=desc&per_page=100&page=${page}`

      const res = await fetch(url, {
        headers: {
          Authorization: authHeader,
          Accept: "application/vnd.github+json",
        },
      })

      if (res.status === 403 || res.status === 422) break // rate-limited or invalid query
      if (!res.ok) throw new Error(`GitHub search failed: ${res.status}`)

      const data = await res.json()
      const items: Array<{ commit?: { author?: { date?: string }; committer?: { date?: string } } }> =
        data.items ?? []

      for (const item of items) {
        const raw =
          item.commit?.author?.date ?? item.commit?.committer?.date
        const date = raw?.split("T")[0]
        if (date) {
          commitsByDate.set(date, (commitsByDate.get(date) ?? 0) + 1)
        }
      }

      const fetched = page * 100
      const totalCapped = Math.min(data.total_count ?? 0, 1000)
      if (items.length < 100 || fetched >= totalCapped) break
      page++
    }

    const supabase = createAdminClient()
    const thresholds = INTENSITY_THRESHOLDS.github

    // Upsert one row per (user, date) into unified_activity
    for (const [date, count] of commitsByDate) {
      const intensity = computeIntensity(count, thresholds)
      const { error } = await supabase.from("unified_activity").upsert(
        {
          user_id: userId,
          activity_date: date,
          source: "github" as const,
          activity_count: count,
          intensity,
          metadata: {} as Json,
        },
        { onConflict: "user_id,activity_date,source" }
      )
      if (error) {
        console.error(`[github-backfill] upsert failed for ${date}:`, error.message)
      }
    }

    // Mark backfill complete
    const { data: conn } = await supabase
      .from("platform_connections")
      .select("profile_data")
      .eq("user_id", userId)
      .eq("platform", "github")
      .single()

    const existing = (conn?.profile_data ?? {}) as Record<string, unknown>
    await supabase
      .from("platform_connections")
      .update({
        profile_data: {
          ...existing,
          backfill_complete: true,
          synced_days: commitsByDate.size,
        },
      })
      .eq("user_id", userId)
      .eq("platform", "github")

    return { synced_days: commitsByDate.size }
  },
})
