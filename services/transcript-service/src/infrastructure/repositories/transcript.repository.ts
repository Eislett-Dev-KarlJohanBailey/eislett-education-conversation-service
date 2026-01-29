import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

export interface TranscriptRecord {
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

export class TranscriptRepository {
  private readonly tableName: string;
  private readonly client: DynamoDBDocumentClient;

  constructor(tableName: string) {
    if (!tableName) {
      throw new Error("TRANSCRIPTS_TABLE environment variable is not set");
    }
    this.tableName = tableName;
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }

  async save(record: TranscriptRecord): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `CONVERSATION#${record.conversationId}`,
          SK: `TRANSCRIPT#${record.transcriptId}`,
          transcriptId: record.transcriptId,
          conversationId: record.conversationId,
          userId: record.userId,
          sentBy: record.sentBy,
          time: record.time,
          start: record.start,
          end: record.end,
          content: record.content,
          createdAt: record.createdAt,
        },
      })
    );
  }
}
