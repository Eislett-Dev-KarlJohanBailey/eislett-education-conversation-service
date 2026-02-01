import { OpenAIClient } from "../../infrastructure/openai.client";
import { AnalysisResultRepository } from "../../infrastructure/repositories/analysis-result.repository";
import type { ConversationTarget } from "../../domain/types/package.types";
import type { TranscriptAnalysisResult } from "../../domain/types/package.types";

export interface AnalyzeTranscriptInput {
  userId: string;
  conversationPackageId: string;
  topicKey: string;
  targets: ConversationTarget[];
  transcript: string;
}

export interface AnalyzeTranscriptOutput {
  feedback: TranscriptAnalysisResult["feedback"];
  saved: boolean;
}

export class AnalyzeTranscriptUseCase {
  constructor(
    private readonly openAIClient: OpenAIClient,
    private readonly analysisResultRepository: AnalysisResultRepository
  ) {}

  async execute(input: AnalyzeTranscriptInput): Promise<AnalyzeTranscriptOutput> {
    const ensureInit = (global as unknown as { __conversationPackageServiceEnsureOpenAI?: () => Promise<void> }).__conversationPackageServiceEnsureOpenAI;
    if (ensureInit) {
      await ensureInit();
    }

    const result = await this.openAIClient.analyzeTranscript({
      targets: input.targets,
      transcript: input.transcript,
    });

    const now = new Date().toISOString();
    await this.analysisResultRepository.save({
      userId: input.userId,
      conversationPackageId: input.conversationPackageId,
      topicKey: input.topicKey,
      result,
      createdAt: now,
    });

    return {
      feedback: result.feedback,
      saved: true,
    };
  }
}
