import { RequestContext } from "../../handler/api-gateway/types";
import { CreateConversationPackageUseCase } from "../usecases/create.conversation.package.usecase";

export class CreateConversationPackageController {
  constructor(
    private readonly useCase: CreateConversationPackageUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const { name, description, productId, topics, categories, tags } = req.body || {};

    if (!name) {
      throw new Error("name is required");
    }

    return await this.useCase.execute({
      name,
      description,
      productId,
      topics,
      categories,
      tags,
    });
  };
}
