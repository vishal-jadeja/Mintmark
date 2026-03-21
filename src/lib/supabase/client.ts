import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

/**
 * Browser client — publishable key, respects RLS.
 * Use in Client Components only ("use client").
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
