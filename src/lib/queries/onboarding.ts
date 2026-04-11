import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import api from "@/lib/axios"

interface OnboardingUpdate {
  step?: number
  completed?: boolean
}

export function useUpdateOnboarding() {
  return useMutation<{ success: boolean }, Error, OnboardingUpdate>({
    mutationFn: async (payload) => {
      try {
        const { data } = await api.patch<{ success: boolean }>(
          "/api/user/onboarding",
          payload
        )
        return data
      } catch (err) {
        if (isAxiosError(err)) {
          throw new Error(
            (err.response?.data as { error?: string })?.error ??
              "Failed to update onboarding."
          )
        }
        throw err
      }
    },
  })
}
