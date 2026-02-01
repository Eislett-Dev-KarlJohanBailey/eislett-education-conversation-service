import { ConversationPackageRepository } from "../../infrastructure/repositories/conversation-package.repository";
import type { ConversationPackage, ConversationPackageFilters } from "../../domain/types/package.types";
import type { Pagination, PaginatedResult } from "../../infrastructure/repositories/conversation-package.repository";

export interface ListPackagesInput {
  filters: ConversationPackageFilters;
  pagination: Pagination;
}

export class ListPackagesUseCase {
  constructor(private readonly repository: ConversationPackageRepository) {}

  async execute(input: ListPackagesInput): Promise<PaginatedResult<ConversationPackage>> {
    return this.repository.list(input.filters, input.pagination);
  }
}
