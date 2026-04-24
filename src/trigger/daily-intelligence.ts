import { task, logger } from "@trigger.dev/sdk/v3"

export interface DailyIntelligencePayload {
  userId: string
  date?: string
}

export const dailyIntelligence = task({
  id: "daily-intelligence",

  run: async (payload: DailyIntelligencePayload) => {
    logger.log("daily-intelligence stub", { payload })
    return { status: "not_implemented" }
  },
})
