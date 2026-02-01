import { ConversationPackageRepository } from "../../infrastructure/repositories/conversation-package.repository";
import type { ConversationPackage, PackageConversation } from "../../domain/types/package.types";

export interface UpdatePackageInput {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  conversations?: PackageConversation[];
}

export class UpdatePackageUseCase {
  constructor(private readonly repository: ConversationPackageRepository) {}

  async execute(input: UpdatePackageInput): Promise<ConversationPackage> {
    const existing = await this.repository.findById(input.id);
    if (!existing) {
      throw new Error("Package not found");
    }

    const now = new Date().toISOString();
    const pkg: ConversationPackage = {
      id: existing.id,
      name: input.name ?? existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      category: input.category ?? existing.category,
      tags: input.tags ?? existing.tags,
      conversations: input.conversations ?? existing.conversations,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    await this.repository.save(pkg);
    return pkg;
  }
}
