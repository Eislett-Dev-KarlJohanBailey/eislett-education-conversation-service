import { ConversationPlanRepository } from "../../infrastructure/repositories/conversation-plan.repository";

export interface DeleteConversationPlanInput {
  id: string;
}

export class DeleteConversationPlanUseCase {
  constructor(
    private readonly repository: ConversationPlanRepository
  ) {}

  async execute(input: DeleteConversationPlanInput): Promise<void> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new Error("Conversation plan not found");
    }

    await this.repository.delete(input.id);
  }
}
