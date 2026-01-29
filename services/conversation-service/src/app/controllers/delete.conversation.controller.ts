import { RequestContext } from "../../handler/api-gateway/types";
import { DeleteConversationUseCase } from "../usecases/delete.conversation.usecase";

export class DeleteConversationController {
  constructor(
    private readonly useCase: DeleteConversationUseCase
  ) {}

  handle = async (req: RequestContext) => {
    if (!req.user?.id) {
      throw new Error("User authentication required");
    }

    const id = req.pathParams.id;

    if (!id) {
      throw new Error("id is required in path");
    }

    await this.useCase.execute({
      id,
      userId: req.user.id,
    });

    return { message: "Conversation deleted successfully" };
  };
}
