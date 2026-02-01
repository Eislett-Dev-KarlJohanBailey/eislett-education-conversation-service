import { AnalysisResultRepository } from "../../infrastructure/repositories/analysis-result.repository";
import type { AnalysisResultRecord } from "../../infrastructure/repositories/analysis-result.repository";

export interface ListAnalysisResultsInput {
  userId: string;
  conversationPackageId?: string;
  topicKey?: string;
  limit?: number;
}

export class ListAnalysisResultsUseCase {
  constructor(private readonly repository: AnalysisResultRepository) {}

  async execute(input: ListAnalysisResultsInput): Promise<AnalysisResultRecord[]> {
    return this.repository.listByUserId(input.userId, {
      conversationPackageId: input.conversationPackageId,
      topicKey: input.topicKey,
      limit: input.limit ?? 50,
    });
  }
}
