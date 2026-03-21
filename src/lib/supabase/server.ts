import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

/**
 * Service-role client — bypasses RLS.
 * Uses @supabase/supabase-js directly (not @supabase/ssr) so the service role
 * key is sent as-is and never overridden by a user session JWT from cookies.
 */
export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}

/**
 * Anon client — respects RLS.
 * Use for user-scoped operations.
 */
export async function createAnonClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components cannot set cookies — ignore
          }
        },
      },
    }
  )
}
