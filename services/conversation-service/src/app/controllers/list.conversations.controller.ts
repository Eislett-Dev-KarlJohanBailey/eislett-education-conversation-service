import { RequestContext } from "../../handler/api-gateway/types";
import { ListConversationsUseCase } from "../usecases/list.conversations.usecase";

export class ListConversationsController {
  constructor(
    private readonly useCase: ListConversationsUseCase
  ) {}

  handle = async (req: RequestContext) => {
    if (!req.user?.id) {
      throw new Error("User authentication required");
    }

    const conversationPlanId = req.query.conversationPlanId as string | undefined;

    return await this.useCase.execute({
      userId: req.user.id,
      conversationPlanId,
    });
  };
}
