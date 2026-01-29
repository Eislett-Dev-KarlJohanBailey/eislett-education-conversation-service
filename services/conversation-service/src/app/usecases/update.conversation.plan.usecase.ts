import { ConversationPlanRepository } from "../../infrastructure/repositories/conversation-plan.repository";
import { ConversationPlan, ConversationPlanTarget } from "../../domain/types/conversation-plan.types";

export interface UpdateConversationPlanInput {
  id: string;
  packageId?: string;
  stage?: number;
  name?: string;
  description?: string;
  targets?: ConversationPlanTarget[];
}

export interface UpdateConversationPlanOutput {
  id: string;
  packageId?: string;
  stage: number;
  name: string;
  description?: string;
  targets: ConversationPlanTarget[];
  createdAt: string;
  updatedAt: string;
}

export class UpdateConversationPlanUseCase {
  constructor(
    private readonly repository: ConversationPlanRepository
  ) {}

  async execute(
    input: UpdateConversationPlanInput
  ): Promise<UpdateConversationPlanOutput> {
    const existing = await this.repository.findById(input.id);

    if (!existing) {
      throw new Error("Conversation plan not found");
    }

    // Validate stage if provided
    if (input.stage !== undefined && (input.stage < 1 || input.stage > 10)) {
      throw new Error("stage must be between 1 and 10");
    }

    // Validate targets if provided
    if (input.targets !== undefined && (!Array.isArray(input.targets) || input.targets.length === 0)) {
      throw new Error("targets must be a non-empty array");
    }

    const updated: ConversationPlan = {
      id: existing.id,
      packageId: input.packageId !== undefined ? input.packageId : existing.packageId,
      stage: input.stage !== undefined ? input.stage : existing.stage,
      name: input.name !== undefined ? input.name : existing.name,
      description: input.description !== undefined ? input.description : existing.description,
      targets: input.targets !== undefined ? input.targets : existing.targets,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.save(updated);

    return updated;
  }
}
