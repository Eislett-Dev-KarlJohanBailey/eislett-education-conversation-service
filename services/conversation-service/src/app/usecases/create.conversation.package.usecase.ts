import { ConversationPackageRepository } from "../../infrastructure/repositories/conversation-package.repository";
import { ConversationPackage } from "../../domain/types/conversation-package.types";

export interface CreateConversationPackageInput {
  name: string;
  description?: string;
  productId?: string;
  topics?: string[];
  categories?: string[];
  tags?: string[];
}

export interface CreateConversationPackageOutput {
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

export class CreateConversationPackageUseCase {
  constructor(
    private readonly repository: ConversationPackageRepository
  ) {}

  async execute(
    input: CreateConversationPackageInput
  ): Promise<CreateConversationPackageOutput> {
    if (!input.name || input.name.trim().length === 0) {
      throw new Error("name is required");
    }

    // Generate ID
    const id = `package-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const package_: ConversationPackage = {
      id,
      name: input.name,
      description: input.description,
      productId: input.productId,
      topics: input.topics || [],
      categories: input.categories || [],
      tags: input.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    await this.repository.save(package_);

    return package_;
  }
}
