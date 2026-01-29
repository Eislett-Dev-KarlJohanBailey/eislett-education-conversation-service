import { RequestContext } from "../../handler/api-gateway/types";
import { UpdateConversationPlanUseCase } from "../usecases/update.conversation.plan.usecase";

export class UpdateConversationPlanController {
  constructor(
    private readonly useCase: UpdateConversationPlanUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const id = req.pathParams.id;

    if (!id) {
      throw new Error("id is required in path");
    }

    const { packageId, stage, name, description, targets } = req.body || {};

    return await this.useCase.execute({
      id,
      packageId,
      stage: stage !== undefined ? Number(stage) : undefined,
      name,
      description,
      targets,
    });
  };
}
