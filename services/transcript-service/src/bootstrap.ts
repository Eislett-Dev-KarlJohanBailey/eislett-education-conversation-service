import { TranscriptRepository } from "./infrastructure/repositories/transcript.repository";
import { TranscriptEventPublisher } from "./infrastructure/event.publisher";
import { CreateTranscriptUseCase } from "./app/usecases/create.transcript.usecase";
import { CreateTranscriptController } from "./app/controllers/create.transcript.controller";

export function bootstrap() {
  const transcriptsTableName = process.env.TRANSCRIPTS_TABLE;

  if (!transcriptsTableName) {
    throw new Error("TRANSCRIPTS_TABLE environment variable is not set");
  }

  const transcriptRepository = new TranscriptRepository(transcriptsTableName);
  
  // Initialize event publisher - required for transcript service
  let eventPublisher: TranscriptEventPublisher;
  try {
    eventPublisher = new TranscriptEventPublisher();
  } catch (error) {
    console.error("TranscriptEventPublisher initialization failed:", error);
    throw error; // Fail if SNS is not configured since event publishing is required
  }

  const createTranscriptUseCase = new CreateTranscriptUseCase(
    transcriptRepository,
    eventPublisher
  );

  const createTranscriptController = new CreateTranscriptController(
    createTranscriptUseCase
  );

  return {
    createTranscriptController,
  };
}
