import { OpenAIClient } from "./infrastructure/openai.client";
import { VoiceSessionRepository } from "./infrastructure/repositories/voice-session.repository";
import { CreateVoiceSessionUseCase } from "./app/usecases/create.voice.session.usecase";
import { CreateVoiceSessionController } from "./app/controllers/create.voice.session.controller";

export function bootstrap() {
  const voiceSessionsTableName = process.env.VOICE_SESSIONS_TABLE;
  const projectName = process.env.PROJECT_NAME || "eislett-education";
  const environment = process.env.ENVIRONMENT || "dev";

  if (!voiceSessionsTableName) {
    throw new Error("VOICE_SESSIONS_TABLE environment variable is not set");
  }

  const sessionRepository = new VoiceSessionRepository(voiceSessionsTableName);
  const openAIClient = new OpenAIClient();

  // Initialize async clients - must be done before use
  // Note: In Lambda, this will be called on cold start
  let initPromise: Promise<void> | null = null;
  
  const ensureInitialized = async () => {
    if (!initPromise) {
      initPromise = openAIClient.initialize(projectName, environment).then(() => {
        console.log("Voice session service clients initialized");
      }).catch((error) => {
        console.error("Failed to initialize voice session service clients:", error);
        throw error;
      });
    }
    return initPromise;
  };

  // Store init function for use cases to call
  (global as any).__voiceSessionServiceEnsureInit = ensureInitialized;

  const createVoiceSessionUseCase = new CreateVoiceSessionUseCase(
    openAIClient,
    sessionRepository
  );

  const createVoiceSessionController = new CreateVoiceSessionController(
    createVoiceSessionUseCase
  );

  return {
    createVoiceSessionController,
  };
}
