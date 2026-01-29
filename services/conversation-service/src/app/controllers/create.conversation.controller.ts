import { RequestContext } from "../../handler/api-gateway/types";
import { CreateConversationUseCase } from "../usecases/create.conversation.usecase";

export class CreateConversationController {
  constructor(
    private readonly useCase: CreateConversationUseCase
  ) {}

  handle = async (req: RequestContext) => {
    if (!req.user?.id) {
      throw new Error("User authentication required");
    }

    const { conversationPlanId } = req.body || {};

    if (!conversationPlanId) {
      throw new Error("conversationPlanId is required");
    }

    return await this.useCase.execute({
      userId: req.user.id,
      conversationPlanId,
    });
  };
}
