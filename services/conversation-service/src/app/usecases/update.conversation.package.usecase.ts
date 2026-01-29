import { ConversationPackageRepository } from "../../infrastructure/repositories/conversation-package.repository";
import { ConversationPackage } from "../../domain/types/conversation-package.types";

export interface UpdateConversationPackageInput {
  id: string;
  name?: string;
  description?: string;
  productId?: string;
  topics?: string[];
  categories?: string[];
  tags?: string[];
}

export interface UpdateConversationPackageOutput {
  id: string;
  name: string;
  description?: string;
  productId?: string;
  topics: string[];
  categories: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export class UpdateConversationPackageUseCase {
  constructor(
    private readonly repository: ConversationPackageRepository
  ) {}

  async execute(
    input: UpdateConversationPackageInput
  ): Promise<UpdateConversationPackageOutput> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new Error("Conversation package not found");
    }

    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new Error("name cannot be empty");
    }

    const updated: ConversationPackage = {
      id: existing.id,
      name: input.name !== undefined ? input.name : existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      productId: input.productId !== undefined ? input.productId : existing.productId,
      topics: input.topics !== undefined ? input.topics : existing.topics,
      categories: input.categories !== undefined ? input.categories : existing.categories,
      tags: input.tags !== undefined ? input.tags : existing.tags,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.save(updated);

    return updated;
  }
}
