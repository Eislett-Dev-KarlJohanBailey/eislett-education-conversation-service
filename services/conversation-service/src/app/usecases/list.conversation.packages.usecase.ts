import { ConversationPackageRepository } from "../../infrastructure/repositories/conversation-package.repository";
import { ConversationPackage, ConversationPackageFilters } from "../../domain/types/conversation-package.types";
import { Pagination, PaginatedResult } from "../../infrastructure/repositories/conversation-plan.repository";

export interface ListConversationPackagesInput {
  filters?: ConversationPackageFilters;
  pagination: Pagination;
}

export interface ListConversationPackagesOutput extends PaginatedResult<ConversationPackage> {}

export class ListConversationPackagesUseCase {
  constructor(
    private readonly repository: ConversationPackageRepository
  ) {}

  async execute(
    input: ListConversationPackagesInput
  ): Promise<ListConversationPackagesOutput> {
    return await this.repository.list(
      input.filters || {},
      input.pagination
    );
  }
}
