import { RequestContext } from "../../handler/api-gateway/types";
import { UpdateConversationUseCase } from "../usecases/update.conversation.usecase";

export class UpdateConversationController {
  constructor(
    private readonly useCase: UpdateConversationUseCase
  ) {}

  handle = async (req: RequestContext) => {
    if (!req.user?.id) {
      throw new Error("User authentication required");
    }

    const id = req.pathParams.id;

    if (!id) {
      throw new Error("id is required in path");
    }

    const { targetProgress } = req.body || {};

    return await this.useCase.execute({
      id,
      userId: req.user.id,
      targetProgress,
    });
  };
}
