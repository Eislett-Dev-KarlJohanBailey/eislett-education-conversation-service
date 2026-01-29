import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { ConversationPackage, ConversationPackageFilters } from "../../domain/types/conversation-package.types";
import { Pagination, PaginatedResult } from "./conversation-plan.repository";

export class ConversationPackageRepository {
  private readonly tableName: string;
  private readonly client: DynamoDBDocumentClient;

  constructor(tableName: string) {
    if (!tableName) {
      throw new Error("CONVERSATION_PACKAGES_TABLE environment variable is not set");
    }
    this.tableName = tableName;
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  }

  async save(package_: ConversationPackage): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `PACKAGE#${package_.id}`,
          SK: `METADATA#${package_.id}`,
          id: package_.id,
          name: package_.name,
          description: package_.description,
          productId: package_.productId,
          topics: package_.topics,
          categories: package_.categories,
          tags: package_.tags,
          createdAt: package_.createdAt,
          updatedAt: package_.updatedAt,
        },
      })
    );
  }

  async findById(id: string): Promise<ConversationPackage | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `PACKAGE#${id}`,
          SK: `METADATA#${id}`,
        },
      })
    );

    if (!result.Item) {
      return null;
    }

    return this.mapToDomain(result.Item);
  }

  async list(
    filters: ConversationPackageFilters,
    pagination: Pagination
  ): Promise<PaginatedResult<ConversationPackage>> {
    const pageSize = pagination.pageSize;
    const pageNumber = pagination.pageNumber;

    if (pageNumber < 1) {
      throw new Error("pageNumber must be >= 1");
    }

    const filterExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.category) {
      filterExpressions.push("contains(categories, :category)");
      expressionAttributeValues[":category"] = filters.category;
    }

    const result = await this.client.send(
      new ScanCommand({
        TableName: this.tableName,
        ...(filterExpressions.length > 0 && {
          FilterExpression: filterExpressions.join(" AND "),
          ExpressionAttributeValues: expressionAttributeValues,
        }),
        Limit: pageSize * pageNumber,
      })
    );

    let items = (result.Items || []).map(this.mapToDomain);

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
    await this.client.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          PK: `PACKAGE#${id}`,
          SK: `METADATA#${id}`,
        },
      })
    );
  }

  private mapToDomain(item: any): ConversationPackage {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      productId: item.productId,
      topics: item.topics || [],
      categories: item.categories || [],
      tags: item.tags || [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
