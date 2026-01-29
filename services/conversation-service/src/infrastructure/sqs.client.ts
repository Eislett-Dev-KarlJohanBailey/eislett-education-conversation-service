import { SQSClient as AWSSQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export interface UsageEventMessage {
  userId: string;
  entitlementKey: string;
  amount: number;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export class UsageEventSQSClient {
  private readonly queueUrl: string;
  private readonly client: AWSSQSClient;

  constructor() {
    const queueUrl = process.env.USAGE_EVENT_QUEUE_URL;
    if (!queueUrl) {
      throw new Error("USAGE_EVENT_QUEUE_URL environment variable is not set");
    }
    this.queueUrl = queueUrl;
    this.client = new AWSSQSClient({ region: "us-east-1" });
  }

  async sendUsageEvent(message: UsageEventMessage): Promise<void> {
    await this.client.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      })
    );
  }
}
