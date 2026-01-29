import { ConversationPackageRepository } from "../../infrastructure/repositories/conversation-package.repository";

export interface DeleteConversationPackageInput {
  id: string;
}

export class DeleteConversationPackageUseCase {
  constructor(
    private readonly repository: ConversationPackageRepository
  ) {}

  async execute(input: DeleteConversationPackageInput): Promise<void> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new Error("Conversation package not found");
    }

    await this.repository.delete(input.id);
  }
}
