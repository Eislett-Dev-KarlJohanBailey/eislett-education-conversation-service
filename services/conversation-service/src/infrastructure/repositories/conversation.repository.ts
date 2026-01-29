import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { Conversation } from "../../domain/types/conversation.types";

export class ConversationRepository {
  private readonly tableName: string;
  private readonly client: DynamoDBDocumentClient;

  constructor(tableName: string) {
    if (!tableName) {
      throw new Error("CONVERSATIONS_TABLE environment variable is not set");
    }
    this.tableName = tableName;
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }

  async save(conversation: Conversation): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `USER#${conversation.userId}`,
          SK: `CONVERSATION#${conversation.id}`,
          GSI1PK: `PLAN#${conversation.conversationPlanId}`,
          GSI1SK: `CONVERSATION#${conversation.id}`,
          id: conversation.id,
          userId: conversation.userId,
          conversationPlanId: conversation.conversationPlanId,
          lastPinged: conversation.lastPinged,
          targetProgress: conversation.targetProgress,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
      })
    );
  }

  async findById(id: string, userId: string): Promise<Conversation | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: `CONVERSATION#${id}`,
        },
      })
    );

    if (!result.Item) {
      return null;
    }

    return this.mapToDomain(result.Item);
  }

  async findByConversationId(conversationId: string): Promise<Conversation | null> {
    // Note: conversationId from transcript maps to conversation.id
    // We need to scan since we don't have an index on id
    // In production, consider adding a GSI or storing voice session ID mapping
    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": conversationId,
        },
        Limit: 1,
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return this.mapToDomain(result.Items[0]);
  }

  async findByUserId(userId: string, conversationPlanId?: string): Promise<Conversation[]> {
    const expressionAttributeValues: Record<string, any> = {
      ":pk": `USER#${userId}`,
    };

    const filterExpressions: string[] = [];

    if (conversationPlanId) {
      filterExpressions.push("conversationPlanId = :planId");
      expressionAttributeValues[":planId"] = conversationPlanId;
    }

    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk",
        ...(filterExpressions.length > 0 && {
          FilterExpression: filterExpressions.join(" AND "),
        }),
        ExpressionAttributeValues: expressionAttributeValues,
      })
    );

    return (result.Items || []).map(this.mapToDomain);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: `CONVERSATION#${id}`,
        },
      })
    );
  }

  private mapToDomain(item: any): Conversation {
    return {
      id: item.id,
      userId: item.userId,
      conversationPlanId: item.conversationPlanId,
      lastPinged: item.lastPinged,
      targetProgress: item.targetProgress || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
