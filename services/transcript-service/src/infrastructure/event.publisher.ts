import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

export interface TranscriptCreatedEvent {
  type: "TRANSCRIPT_CREATED";
  payload: {
    transcriptId: string;
    conversationId: string;
    userId: string;
    sentBy: "user" | "ai";
    time: string;
    start?: string;
    end?: string;
    content: string;
    createdAt: string;
  };
  meta: {
    eventId: string;
    occurredAt: string;
    source: string;
  };
  version: number;
}

export class TranscriptEventPublisher {
  private readonly topicArn: string;
  private readonly client: SNSClient;

  constructor() {
    const topicArn = process.env.TRANSCRIPT_EVENTS_TOPIC_ARN;
    if (!topicArn) {
      throw new Error("TRANSCRIPT_EVENTS_TOPIC_ARN environment variable is not set");
    }
    this.topicArn = topicArn;
    this.client = new SNSClient({});
  }

  async publishTranscriptCreated(payload: TranscriptCreatedEvent["payload"]): Promise<void> {
    const event: TranscriptCreatedEvent = {
      type: "TRANSCRIPT_CREATED",
      payload,
      meta: {
        eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        occurredAt: new Date().toISOString(),
        source: "transcript-service",
      },
      version: 1,
    };

    try {
      await this.client.send(
        new PublishCommand({
          TopicArn: this.topicArn,
          Message: JSON.stringify(event),
          MessageAttributes: {
            eventType: {
              DataType: "String",
              StringValue: event.type,
            },
          },
        })
      );
      console.log(`Published transcript created event: ${payload.transcriptId}`);
    } catch (error) {
      console.error(`Failed to publish transcript created event ${payload.transcriptId}:`, error);
      // Don't throw - event publishing failure shouldn't fail the main process
    }
  }
}
