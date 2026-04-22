import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"
import type { Platform } from "@/types/database"
import type { Json } from "@/types/database"

export interface ConnectionInfo {
  platform: Platform
  profile_data: Json
  connected_at: string
  is_active: boolean
}

interface ConnectionsResponse {
  connections: ConnectionInfo[]
}

export function useConnections() {
  return useQuery<ConnectionInfo[]>({
    queryKey: ["connections"],
    queryFn: async () => {
      const { data } = await api.get<ConnectionsResponse>("/api/connections")
      return data.connections
    },
  })
}

export function useDisconnect() {
  const qc = useQueryClient()
  return useMutation<{ success: boolean }, Error, Platform>({
    mutationFn: async (platform) => {
      try {
        const { data } = await api.delete<{ success: boolean }>(
          `/api/connections/${platform}`
        )
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ??
              "Failed to disconnect platform."
          )
        }
        throw err
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["connections"] })
    },
  })
}
