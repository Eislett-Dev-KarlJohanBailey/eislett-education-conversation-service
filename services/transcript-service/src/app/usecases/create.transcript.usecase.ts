import { TranscriptRepository } from "../../infrastructure/repositories/transcript.repository";
import { TranscriptEventPublisher } from "../../infrastructure/event.publisher";

export interface CreateTranscriptInput {
  conversationId: string;
  userId: string;
  sentBy: "user" | "ai";
  time: string;
  start?: string;
  end?: string;
  content: string;
}

export interface CreateTranscriptOutput {
  transcriptId: string;
  conversationId: string;
  userId: string;
  sentBy: "user" | "ai";
  time: string;
  start?: string;
  end?: string;
  content: string;
  createdAt: string;
}

export class CreateTranscriptUseCase {
  constructor(
    private readonly transcriptRepository: TranscriptRepository,
    private readonly eventPublisher: TranscriptEventPublisher
  ) {}

  async execute(
    input: CreateTranscriptInput
  ): Promise<CreateTranscriptOutput> {
    // Validate sentBy
    if (input.sentBy !== "user" && input.sentBy !== "ai") {
      throw new Error("sentBy must be either 'user' or 'ai'");
    }

    // Generate transcript ID
    const transcriptId = `transcript-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();

    // Create transcript record
    const transcript: CreateTranscriptOutput = {
      transcriptId,
      conversationId: input.conversationId,
      userId: input.userId,
      sentBy: input.sentBy,
      time: input.time,
      start: input.start,
      end: input.end,
      content: input.content,
      createdAt,
    };

    // Save to DynamoDB
    await this.transcriptRepository.save(transcript);

    // Publish event to SNS
    await this.eventPublisher.publishTranscriptCreated(transcript);

    return transcript;
  }
}
