/**
 * Token query hooks — stub for Step 6 (invite acceptance page).
 */

import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"

export const tokenKeys = {
  verify: (token: string) => ["tokens", "verify", token] as const,
}

export interface TokenVerifyResponse {
  valid: boolean
  email?: string
}

// TODO (Step 6): Token verification happens server-side first.
// This hook is available for client-side re-checks if needed.
export function useVerifyToken(token: string | null) {
  return useQuery<TokenVerifyResponse>({
    queryKey: tokenKeys.verify(token ?? ""),
    queryFn: async () => {
      try {
        const { data } = await api.get<TokenVerifyResponse>(
          `/api/auth/verify-token?token=${encodeURIComponent(token!)}`
        )
        return data
      } catch (err) {
        if (isAxiosError(err)) return { valid: false }
        throw err
      }
    },
    enabled: !!token,
    staleTime: 1000 * 10,
    retry: false,
  })
}
