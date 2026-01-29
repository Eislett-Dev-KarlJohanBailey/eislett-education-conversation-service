import { ConversationRepository } from "../../infrastructure/repositories/conversation.repository";

export interface DeleteConversationInput {
  id: string;
  userId: string;
}

export class DeleteConversationUseCase {
  constructor(
    private readonly repository: ConversationRepository
  ) {}

  async execute(input: DeleteConversationInput): Promise<void> {
    const existing = await this.repository.findById(input.id, input.userId);

    if (!existing) {
      throw new Error("Conversation not found");
    }

    await this.repository.delete(input.id, input.userId);
  }
}
