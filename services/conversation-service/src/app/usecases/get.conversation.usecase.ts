import { ConversationRepository } from "../../infrastructure/repositories/conversation.repository";
import { Conversation } from "../../domain/types/conversation.types";

export interface GetConversationInput {
  id: string;
  userId: string;
}

export interface GetConversationOutput extends Conversation {}

export class GetConversationUseCase {
  constructor(
    private readonly repository: ConversationRepository
  ) {}

  async execute(input: GetConversationInput): Promise<GetConversationOutput> {
    const conversation = await this.repository.findById(input.id, input.userId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    return conversation;
  }
}
