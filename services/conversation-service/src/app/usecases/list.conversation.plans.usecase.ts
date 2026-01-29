import { ConversationPlanRepository } from "../../infrastructure/repositories/conversation-plan.repository";
import { ConversationPlan, ConversationPlanFilters } from "../../domain/types/conversation-plan.types";
import { Pagination, PaginatedResult } from "../../infrastructure/repositories/conversation-plan.repository";

export interface ListConversationPlansInput {
  filters?: ConversationPlanFilters;
  pagination: Pagination;
}

export interface ListConversationPlansOutput extends PaginatedResult<ConversationPlan> {}

export class ListConversationPlansUseCase {
  constructor(
    private readonly repository: ConversationPlanRepository
  ) {}

  async execute(
    input: ListConversationPlansInput
  ): Promise<ListConversationPlansOutput> {
    return await this.repository.list(
      input.filters || {},
      input.pagination
    );
  }
}
