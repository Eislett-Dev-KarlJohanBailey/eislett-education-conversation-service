import type { RequestContext } from "../../handler/api-gateway/types";
import { ListAnalysisResultsUseCase } from "../usecases/list.analysis.results.usecase";
import { AuthenticationError } from "@libs/domain";

export class ListAnalysisResultsController {
  constructor(private readonly useCase: ListAnalysisResultsUseCase) {}

  handle = async (req: RequestContext) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AuthenticationError("User authentication required");
    }

    const conversationPackageId = req.query?.conversationPackageId as string | undefined;
    const topicKey = req.query?.topicKey as string | undefined;
    const limit = req.query?.limit != null ? Number(req.query.limit) : undefined;

    const items = await this.useCase.execute({
      userId,
      conversationPackageId,
      topicKey,
      limit,
    });

    return {
      amount: items.length,
      data: items,
    };
  };
}
