import { RequestContext } from "../../handler/api-gateway/types";
import { DeleteConversationPlanUseCase } from "../usecases/delete.conversation.plan.usecase";

export class DeleteConversationPlanController {
  constructor(
    private readonly useCase: DeleteConversationPlanUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const id = req.pathParams.id;

    if (!id) {
      throw new Error("id is required in path");
    }

    await this.useCase.execute({ id });
    return { message: "Conversation plan deleted successfully" };
  };
}
