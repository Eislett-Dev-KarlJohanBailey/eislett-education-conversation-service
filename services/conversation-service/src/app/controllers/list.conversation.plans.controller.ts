import { RequestContext } from "../../handler/api-gateway/types";
import { ListConversationPlansUseCase } from "../usecases/list.conversation.plans.usecase";

export class ListConversationPlansController {
  constructor(
    private readonly useCase: ListConversationPlansUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const pageNumber = Number(req.query.page_number ?? 1);
    const pageSize = Number(req.query.page_size ?? 20);
    const packageId = req.query.packageId as string | undefined;
    const stage = req.query.stage ? Number(req.query.stage) : undefined;

    const result = await this.useCase.execute({
      filters: {
        packageId,
        stage,
      },
      pagination: {
        pageNumber,
        pageSize,
      },
    });

    const total = result.total >= 0 ? result.total : 0;
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

    return {
      amount: total,
      data: result.items,
      pagination: {
        page_size: pageSize,
        page_number: pageNumber,
        total_pages: totalPages,
      },
    };
  };
}
