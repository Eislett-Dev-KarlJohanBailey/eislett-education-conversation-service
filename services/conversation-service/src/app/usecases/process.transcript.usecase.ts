import { ConversationRepository } from "../../infrastructure/repositories/conversation.repository";
import { ConversationPlanRepository } from "../../infrastructure/repositories/conversation-plan.repository";
import { OpenAIClient } from "../../infrastructure/openai.client";
import { ConversationPlanTarget, SayWordTarget, AvoidWordTarget, CoverDiscussionPointsTarget } from "../../domain/types/conversation-plan.types";
import { TargetProgress } from "../../domain/types/conversation.types";
import { TranscriptCreatedEvent } from "../../handler/sqs/parse-event";

export interface ProcessTranscriptInput {
  transcriptEvent: TranscriptCreatedEvent;
}

export class ProcessTranscriptUseCase {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly planRepository: ConversationPlanRepository,
    private readonly openAIClient: OpenAIClient
  ) {}

  async execute(input: ProcessTranscriptInput): Promise<void> {
    // Ensure OpenAI client is initialized
    const ensureInit = (global as any).__conversationServiceEnsureInit;
    if (ensureInit) {
      await ensureInit();
    }

    const { transcriptEvent } = input;
    const { conversationId, content, userId } = transcriptEvent.payload;

    // Find conversation by conversationId
    const conversation = await this.conversationRepository.findByConversationId(conversationId);

    if (!conversation) {
      console.log(`Conversation not found: ${conversationId}, skipping transcript processing`);
      return;
    }

    // Verify userId matches
    if (conversation.userId !== userId) {
      console.log(`UserId mismatch for conversation ${conversationId}, skipping`);
      return;
    }

    // Get the conversation plan to check targets
    const plan = await this.planRepository.findById(conversation.conversationPlanId);

    if (!plan) {
      console.log(`Plan not found: ${conversation.conversationPlanId}, skipping transcript processing`);
      return;
    }

    // Update progress for each target
    const updatedProgress: TargetProgress[] = await Promise.all(
      conversation.targetProgress.map(async (targetProgress) => {
        const target = targetProgress.target;
        const progress = { ...targetProgress.progress };

        // Process say_word targets
        if (target.type === "say_word") {
          const sayWordTarget = target as SayWordTarget;
          const wordCount = this.countWordOccurrences(content, sayWordTarget.word);
          progress.wordsSaid = (progress.wordsSaid || 0) + wordCount;
        }

        // Process avoid_word targets
        if (target.type === "avoid_word") {
          const avoidWordTarget = target as AvoidWordTarget;
          const hasAvoidedWords = avoidWordTarget.words.some(word =>
            this.containsWord(content, word)
          );
          if (hasAvoidedWords) {
            progress.wordsAvoided = false; // Words to avoid were said
          }
        }

        // Process cover_discussion_points targets
        if (target.type === "cover_discussion_points") {
          const coverPointsTarget = target as CoverDiscussionPointsTarget;
          try {
            const result = await this.openAIClient.checkDiscussionPoints({
              content,
              points: coverPointsTarget.points,
            });

            const currentPoints = progress.pointsCovered || [];
            const newPoints = result.coveredPoints.filter(
              (point) => !currentPoints.includes(point)
            );
            progress.pointsCovered = [...currentPoints, ...newPoints];
          } catch (error) {
            console.error(`Failed to check discussion points: ${error}`);
            // Continue without updating points if OpenAI fails
          }
        }

        return {
          target,
          progress,
        };
      })
    );

    // Update conversation with new progress
    const updated: typeof conversation = {
      ...conversation,
      targetProgress: updatedProgress,
      updatedAt: new Date().toISOString(),
    };

    await this.conversationRepository.save(updated);
  }

  private countWordOccurrences(text: string, word: string): number {
    const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, "gi");
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  private containsWord(text: string, word: string): boolean {
    const regex = new RegExp(`\\b${this.escapeRegex(word)}\\b`, "gi");
    return regex.test(text);
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
