import { RequestContext } from "../../handler/api-gateway/types";
import { CreateTranscriptUseCase } from "../usecases/create.transcript.usecase";

export class CreateTranscriptController {
  constructor(
    private readonly useCase: CreateTranscriptUseCase
  ) {}

  handle = async (req: RequestContext) => {
    // Require user authentication
    if (!req.user?.id) {
      throw new Error("User authentication required");
    }

    const { conversationId, sentBy, time, start, end, content } = req.body || {};

    if (!conversationId) {
      throw new Error("conversationId is required");
    }

    if (!sentBy) {
      throw new Error("sentBy is required");
    }

    if (!time) {
      throw new Error("time is required");
    }

    if (!content) {
      throw new Error("content is required");
    }

    return await this.useCase.execute({
      conversationId,
      userId: req.user.id,
      sentBy: sentBy as "user" | "ai",
      time,
      start,
      end,
      content,
    });
  };
}
