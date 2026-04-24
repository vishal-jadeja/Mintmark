import { task, logger } from "@trigger.dev/sdk/v3"

export interface TopicExtractionPayload {
  userId: string
  rawText: string
  sourceId: string
  sourceType: "session" | "note"
}

export const topicExtraction = task({
  id: "topic-extraction",

  run: async (payload: TopicExtractionPayload) => {
    logger.log("topic-extraction stub", { payload })
    return { status: "not_implemented" }
  },
})
