import { RequestContext } from "../../handler/api-gateway/types";
import { ListConversationPackagesUseCase } from "../usecases/list.conversation.packages.usecase";

export class ListConversationPackagesController {
  constructor(
    private readonly useCase: ListConversationPackagesUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const pageNumber = Number(req.query.page_number ?? 1);
    const pageSize = Number(req.query.page_size ?? 20);
    const category = req.query.category as string | undefined;

    const result = await this.useCase.execute({
      filters: {
        category,
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
