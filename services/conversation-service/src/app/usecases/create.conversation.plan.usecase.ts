import { ConversationPlanRepository } from "../../infrastructure/repositories/conversation-plan.repository";
import { ConversationPlan, ConversationPlanTarget } from "../../domain/types/conversation-plan.types";

export interface CreateConversationPlanInput {
  packageId?: string;
  stage: number;
  name: string;
  description?: string;
  targets: ConversationPlanTarget[];
}

export interface CreateConversationPlanOutput {
  id: string;
  packageId?: string;
  stage: number;
  name: string;
  description?: string;
  targets: ConversationPlanTarget[];
  createdAt: string;
  updatedAt: string;
}

export class CreateConversationPlanUseCase {
  constructor(
    private readonly repository: ConversationPlanRepository
  ) {}

  async execute(
    input: CreateConversationPlanInput
  ): Promise<CreateConversationPlanOutput> {
    // Validate stage
    if (input.stage < 1 || input.stage > 10) {
      throw new Error("stage must be between 1 and 10");
    }

    // Validate targets
    if (!Array.isArray(input.targets) || input.targets.length === 0) {
      throw new Error("targets must be a non-empty array");
    }

    // Generate ID
    const id = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const plan: ConversationPlan = {
      id,
      packageId: input.packageId,
      stage: input.stage,
      name: input.name,
      description: input.description,
      targets: input.targets,
      createdAt: now,
      updatedAt: now,
    };

    await this.repository.save(plan);

    return plan;
  }
}
