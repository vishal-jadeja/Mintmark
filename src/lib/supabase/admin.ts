import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

/**
 * Admin client — service role key, bypasses RLS.
 * Server-side only. NEVER import this in Client Components or expose to the browser.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
