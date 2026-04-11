import { auth } from "@/auth"
import type { Session } from "next-auth"

/**
 * Throws "UNAUTHORIZED" if there is no valid session.
 * Use in server actions or API routes that need a signed-in user.
 */
export async function requireSession(): Promise<Session> {
  const session = await auth()
  if (!session?.user?.id) throw new Error("UNAUTHORIZED")
  return session
}

/**
 * Returns the Session on success, or a 403 Response on failure.
 * Usage:
 *   const result = await sessionGuard()
 *   if (result instanceof Response) return result
 *   const session = result  // typed as Session
 *
 * Always returns 403 — consistent with adminGuard.
 */
export async function sessionGuard(): Promise<Session | Response> {
  try {
    return await requireSession()
  } catch {
    return Response.json(
      { error: "You must be signed in to access this resource." },
      { status: 403 }
    )
  }
}
