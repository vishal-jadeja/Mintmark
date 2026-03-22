import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

/**
 * How many queue positions a single successful referral is worth.
 * Must stay in sync with the `get_waitlist_position` DB function
 * (which applies -5 per referral, capped at position 1).
 */
export const REFERRAL_SLOTS_BONUS = 5

/**
 * Returns the maximum number of users that can be invited/joined.
 *
 * Resolution order:
 *   1. `system_config` DB row with key = "early_access_limit"  (admin-editable at runtime)
 *   2. `EARLY_ACCESS_LIMIT` environment variable                (set at deploy time)
 *   3. Hard-coded default: 100
 *
 * The DB row wins so the admin dashboard can bump the cap without a redeploy.
 * The env var is the fallback for local dev or CI environments that have no DB.
 */
export async function getEarlyAccessLimit(
  supabase: SupabaseClient<Database>
): Promise<number> {
  const { data } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", "early_access_limit")
    .maybeSingle()

  const raw = data?.value ?? process.env.EARLY_ACCESS_LIMIT ?? "100"
  const parsed = parseInt(raw, 10)
  return isNaN(parsed) || parsed < 1 ? 100 : parsed
}
