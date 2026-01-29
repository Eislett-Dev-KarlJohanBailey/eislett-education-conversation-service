import { OpenAIClient } from "../../infrastructure/openai.client";
import { VoiceSessionRepository } from "../../infrastructure/repositories/voice-session.repository";

export interface CreateVoiceSessionInput {
  instructions?: string;
  userId?: string;
}

export interface CreateVoiceSessionOutput {
  client_secret: string;
  expires_at: string;
  session_id: string;
}

// Template instructions that focus on natural discussion
const INSTRUCTION_TEMPLATE = `You are a engaging conversation partner.
Engage in natural, realistic discussions with the user.
Be conversational and warm, as if talking to a friend.
Keep responses concise and natural, avoiding overly formal language.
Adapt your communication style to match the user's tone and energy.`;

export class CreateVoiceSessionUseCase {
  constructor(
    private readonly openAIClient: OpenAIClient,
    private readonly sessionRepository: VoiceSessionRepository
  ) {}

  async execute(
    input: CreateVoiceSessionInput
  ): Promise<CreateVoiceSessionOutput> {
    // Ensure client is initialized
    const ensureInit = (global as any).__voiceSessionServiceEnsureInit;
    if (ensureInit) {
      await ensureInit();
    }

    // Combine template with user-provided instructions
    const combinedInstructions = input.instructions
      ? `${INSTRUCTION_TEMPLATE}\n\n${input.instructions}`
      : INSTRUCTION_TEMPLATE;

    // Generate session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create session with OpenAI
    const session = await this.openAIClient.createSession(
      combinedInstructions,
      sessionId
    );

    // Calculate TTL (30 days from now)
    const now = new Date();
    const ttlDate = new Date(now);
    ttlDate.setDate(ttlDate.getDate() + 30);
    const ttl = Math.floor(ttlDate.getTime() / 1000);

    // Save session record to DynamoDB
    await this.sessionRepository.save({
      sessionId: session.session_id,
      userId: input.userId,
      createdAt: now.toISOString(),
      expiresAt: session.expires_at,
      ttl: ttl,
    });

    return {
      client_secret: session.client_secret,
      expires_at: session.expires_at,
      session_id: session.session_id,
    };
  }
}
