import { RequestContext } from "../../handler/api-gateway/types";
import { CreateConversationPlanUseCase } from "../usecases/create.conversation.plan.usecase";

export class CreateConversationPlanController {
  constructor(
    private readonly useCase: CreateConversationPlanUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const { packageId, stage, name, description, targets } = req.body || {};

    if (!stage) {
      throw new Error("stage is required");
    }

    if (!name) {
      throw new Error("name is required");
    }

    if (!targets || !Array.isArray(targets)) {
      throw new Error("targets is required and must be an array");
    }

    return await this.useCase.execute({
      packageId,
      stage: Number(stage),
      name,
      description,
      targets,
    });
  };
}
