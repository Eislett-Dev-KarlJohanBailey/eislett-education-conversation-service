import { RequestContext } from "../../handler/api-gateway/types";
import { UpdateConversationPackageUseCase } from "../usecases/update.conversation.package.usecase";

export class UpdateConversationPackageController {
  constructor(
    private readonly useCase: UpdateConversationPackageUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const id = req.pathParams.id;

    if (!id) {
      throw new Error("id is required in path");
    }

    const { name, description, productId, topics, categories, tags } = req.body || {};

    return await this.useCase.execute({
      id,
      name,
      description,
      productId,
      topics,
      categories,
      tags,
    });
  };
}
