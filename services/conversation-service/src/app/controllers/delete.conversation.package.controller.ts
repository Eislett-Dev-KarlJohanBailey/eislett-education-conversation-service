import { RequestContext } from "../../handler/api-gateway/types";
import { DeleteConversationPackageUseCase } from "../usecases/delete.conversation.package.usecase";

export class DeleteConversationPackageController {
  constructor(
    private readonly useCase: DeleteConversationPackageUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const id = req.pathParams.id;

    if (!id) {
      throw new Error("id is required in path");
    }

    await this.useCase.execute({ id });
    return { message: "Conversation package deleted successfully" };
  };
}
