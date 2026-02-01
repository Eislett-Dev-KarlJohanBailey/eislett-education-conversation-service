import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { TranscriptAnalysisResult } from "../../domain/types/package.types";

export interface AnalysisResultRecord {
  userId: string;
  conversationPackageId: string;
  topicKey: string;
  result: TranscriptAnalysisResult;
  createdAt: string;
}

export class AnalysisResultRepository {
  private readonly tableName: string;
  private readonly client: DynamoDBDocumentClient;

  constructor(tableName: string) {
    if (!tableName) {
      throw new Error("ANALYSIS_RESULTS_TABLE environment variable is not set");
    }
    this.tableName = tableName;
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }

  async save(record: AnalysisResultRecord): Promise<void> {
    const now = record.createdAt;
    const sk = `PACKAGE#${record.conversationPackageId}#TOPIC#${record.topicKey}#TS#${now}`;

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${record.userId}`,
          SK: sk,
          userId: record.userId,
          conversationPackageId: record.conversationPackageId,
          topicKey: record.topicKey,
          result: record.result,
          createdAt: now,
        },
      })
    );
  }

  /** List analysis results for a user, optionally by package or topic. */
  async listByUserId(
    userId: string,
    options?: { conversationPackageId?: string; topicKey?: string; limit?: number }
  ): Promise<AnalysisResultRecord[]> {
    const limit = options?.limit ?? 50;
    let keyCondition = "PK = :pk";
    const exprValues: Record<string, string> = { ":pk": `USER#${userId}` };

    if (options?.conversationPackageId) {
      keyCondition += " AND begins_with(SK, :skPrefix)";
      exprValues[":skPrefix"] = `PACKAGE#${options.conversationPackageId}#TOPIC#`;
    }
    if (options?.topicKey && options?.conversationPackageId) {
      exprValues[":skPrefix"] = `PACKAGE#${options.conversationPackageId}#TOPIC#${options.topicKey}#TS#`;
    }

    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: keyCondition,
        ExpressionAttributeValues: exprValues,
        Limit: limit,
        ScanIndexForward: false,
      })
    );

    const items = (result.Items ?? []) as Array<{
      userId: string;
      conversationPackageId: string;
      topicKey: string;
      result: TranscriptAnalysisResult;
      createdAt: string;
    }>;

    return items.map((item) => ({
      userId: item.userId,
      conversationPackageId: item.conversationPackageId,
      topicKey: item.topicKey,
      result: item.result,
      createdAt: item.createdAt,
    }));
  }
}
