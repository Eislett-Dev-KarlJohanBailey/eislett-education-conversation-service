import { ConversationPackageRepository } from "../../infrastructure/repositories/conversation-package.repository";
import type { ConversationPackage } from "../../domain/types/package.types";

export interface GetPackageInput {
  id: string;
}

export class GetPackageUseCase {
  constructor(private readonly repository: ConversationPackageRepository) {}

  async execute(input: GetPackageInput): Promise<ConversationPackage | null> {
    return this.repository.findById(input.id);
  }
}
