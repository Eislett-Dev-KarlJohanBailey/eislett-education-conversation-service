import { RequestContext } from "../../handler/api-gateway/types";
import { GetConversationUseCase } from "../usecases/get.conversation.usecase";

export class GetConversationController {
  constructor(
    private readonly useCase: GetConversationUseCase
  ) {}

  handle = async (req: RequestContext) => {
    if (!req.user?.id) {
      throw new Error("User authentication required");
    }

    const id = req.pathParams.id;

    if (!id) {
      throw new Error("id is required in path");
    }

    return await this.useCase.execute({
      id,
      userId: req.user.id,
    });
  };
}
