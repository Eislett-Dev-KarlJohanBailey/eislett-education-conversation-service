import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { ConversationPlan, ConversationPlanFilters } from "../../domain/types/conversation-plan.types";

export interface Pagination {
  pageNumber: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export class ConversationPlanRepository {
  private readonly tableName: string;
  private readonly client: DynamoDBDocumentClient;

  constructor(tableName: string) {
    if (!tableName) {
      throw new Error("CONVERSATION_PLANS_TABLE environment variable is not set");
    }
    this.tableName = tableName;
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }

  async save(plan: ConversationPlan): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: plan.packageId ? `PACKAGE#${plan.packageId}` : "PLAN#GLOBAL",
          SK: `PLAN#${plan.id}`,
          GSI1PK: `STAGE#${plan.stage}`,
          GSI1SK: `PLAN#${plan.id}`,
          id: plan.id,
          packageId: plan.packageId,
          stage: plan.stage,
          name: plan.name,
          description: plan.description,
          targets: plan.targets,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        },
      })
    );
  }

  async findById(id: string): Promise<ConversationPlan | null> {
    // Scan for the plan (since we don't know the packageId)
    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
          ":id": id,
        },
        Limit: 1,
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    return this.mapToDomain(result.Items[0]);
  }

  async list(
    filters: ConversationPlanFilters,
    pagination: Pagination
  ): Promise<PaginatedResult<ConversationPlan>> {
    const pageSize = pagination.pageSize;
    const pageNumber = pagination.pageNumber;

    if (pageNumber < 1) {
      throw new Error("pageNumber must be >= 1");
    }

    let items: ConversationPlan[] = [];
    let lastEvaluatedKey: any = undefined;
    let scannedCount = 0;

    // If filtering by stage, use GSI1
    if (filters.stage !== undefined) {
      const filterExpressions: string[] = [];
      const expressionAttributeValues: Record<string, any> = {};

      if (filters.packageId) {
        filterExpressions.push("packageId = :packageId");
        expressionAttributeValues[":packageId"] = filters.packageId;
      }

      // Query by stage using GSI1
      const result = await this.client.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :stagePk",
          ExpressionAttributeValues: {
            ":stagePk": `STAGE#${filters.stage}`,
            ...expressionAttributeValues,
          },
          ...(filterExpressions.length > 0 && {
            FilterExpression: filterExpressions.join(" AND "),
          }),
          Limit: pageSize * pageNumber,
        })
      );

      items = (result.Items || []).map(this.mapToDomain);
      scannedCount = result.Count || 0;
    } else {
      // Scan the table
      const filterExpressions: string[] = [];
      const expressionAttributeValues: Record<string, any> = {};

      if (filters.packageId) {
        filterExpressions.push("packageId = :packageId");
        expressionAttributeValues[":packageId"] = filters.packageId;
      }

      const result = await this.client.send(
        new ScanCommand({
          TableName: this.tableName,
          ...(filterExpressions.length > 0 && {
            FilterExpression: filterExpressions.join(" AND "),
            ExpressionAttributeValues: expressionAttributeValues,
          }),
          Limit: pageSize * pageNumber,
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );

      items = (result.Items || []).map(this.mapToDomain);
      scannedCount = result.ScannedCount || 0;
      lastEvaluatedKey = result.LastEvaluatedKey;
    }

    // Sort by stage
    items.sort((a, b) => a.stage - b.stage);

    // Apply pagination
    const startIndex = (pageNumber - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total: items.length,
      hasMore: endIndex < items.length,
    };
  }

  async delete(id: string): Promise<void> {
    // Find the plan first to get PK/SK
    const plan = await this.findById(id);
    if (!plan) {
      throw new Error("Conversation plan not found");
    }

    const pk = plan.packageId ? `PACKAGE#${plan.packageId}` : "PLAN#GLOBAL";
    const sk = `PLAN#${id}`;

    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: pk,
          SK: sk,
        },
      })
    );
  }

  private mapToDomain(item: any): ConversationPlan {
    return {
      id: item.id,
      packageId: item.packageId,
      stage: item.stage,
      name: item.name,
      description: item.description,
      targets: item.targets || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
