import { ConversationRepository } from "../../infrastructure/repositories/conversation.repository";
import { Conversation } from "../../domain/types/conversation.types";

export interface ListConversationsInput {
  userId: string;
  conversationPlanId?: string;
}

export interface ListConversationsOutput {
  conversations: Conversation[];
}

export class ListConversationsUseCase {
  constructor(
    private readonly repository: ConversationRepository
  ) {}

  async execute(input: ListConversationsInput): Promise<ListConversationsOutput> {
    const conversations = await this.repository.findByUserId(
      input.userId,
      input.conversationPlanId
    );

    return { conversations };
  }
}
