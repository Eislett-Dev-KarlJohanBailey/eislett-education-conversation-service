import { ConversationRepository } from "../../infrastructure/repositories/conversation.repository";
import { ConversationPlanRepository } from "../../infrastructure/repositories/conversation-plan.repository";
import { Conversation, TargetProgress } from "../../domain/types/conversation.types";

export interface CreateConversationInput {
  userId: string;
  conversationPlanId: string;
}

export interface CreateConversationOutput {
  id: string;
  userId: string;
  conversationPlanId: string;
  lastPinged: string;
  targetProgress: TargetProgress[];
  createdAt: string;
  updatedAt: string;
}

export class CreateConversationUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly planRepository: ConversationPlanRepository
  ) {}

  async execute(
    input: CreateConversationInput
  ): Promise<CreateConversationOutput> {
    // Verify plan exists
    const plan = await this.planRepository.findById(input.conversationPlanId);
    if (!plan) {
      throw new Error("Conversation plan not found");
    }

    // Generate ID
    const id = `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    // Initialize target progress from plan targets
    const targetProgress: TargetProgress[] = plan.targets.map((target) => ({
      target,
      progress: this.initializeProgress(target),
    }));

    const conversation: Conversation = {
      id,
      userId: input.userId,
      conversationPlanId: input.conversationPlanId,
      lastPinged: now,
      targetProgress,
      createdAt: now,
      updatedAt: now,
    };

    await this.conversationRepository.save(conversation);

    return conversation;
  }

  private initializeProgress(target: any): any {
    switch (target.type) {
      case "say_word":
        return { wordsSaid: 0 };
      case "cover_discussion_points":
        return { pointsCovered: [] };
      case "avoid_word":
        return { wordsAvoided: true };
      default:
        return {};
    }
  }
}
