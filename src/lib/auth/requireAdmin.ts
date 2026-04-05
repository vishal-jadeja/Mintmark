import { auth } from "@/auth"

/**
 * Server-side guard for admin API routes.
 * Call at the top of every admin route handler before any other logic.
 *
 * @throws {Error} with message "UNAUTHORIZED" or "FORBIDDEN" if the request
 *   is not authenticated or the user is not an admin.
 */
export async function requireAdmin(): Promise<void> {
  const session = await auth()

  if (!session?.user) {
    throw new Error("UNAUTHORIZED")
  }

  if (session.user.role !== "admin") {
    throw new Error("FORBIDDEN")
  }
}

/**
 * Wraps requireAdmin and returns a 403 Response on failure, or null on success.
 * Use in route handlers:
 *
 *   const denied = await adminGuard()
 *   if (denied) return denied
 */
export async function adminGuard(): Promise<Response | null> {
  try {
    await requireAdmin()
    return null
  } catch (err) {
    const message = err instanceof Error ? err.message : "FORBIDDEN"
    const status = message === "UNAUTHORIZED" ? 403 : 403
    // Always 403 — never 401 — so we don't reveal route existence to non-admins
    return Response.json(
      { error: "You do not have permission to access this resource." },
      { status }
    )
  }
}
