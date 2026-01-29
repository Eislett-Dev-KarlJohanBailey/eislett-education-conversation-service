import { ConversationRepository } from "../../infrastructure/repositories/conversation.repository";
import { Conversation, TargetProgress } from "../../domain/types/conversation.types";

export interface UpdateConversationInput {
  id: string;
  userId: string;
  targetProgress?: TargetProgress[];
}

export interface UpdateConversationOutput extends Conversation {}

export class UpdateConversationUseCase {
  constructor(
    private readonly repository: ConversationRepository
  ) {}

  async execute(input: UpdateConversationInput): Promise<UpdateConversationOutput> {
    const existing = await this.repository.findById(input.id, input.userId);

    if (!existing) {
      throw new Error("Conversation not found");
    }

    const updated: Conversation = {
      ...existing,
      targetProgress: input.targetProgress !== undefined ? input.targetProgress : existing.targetProgress,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.save(updated);

    return updated;
  }
}
