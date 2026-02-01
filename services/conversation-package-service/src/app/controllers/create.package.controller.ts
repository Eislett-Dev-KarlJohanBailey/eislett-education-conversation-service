import type { RequestContext } from "../../handler/api-gateway/types";
import type { PackageConversation } from "../../domain/types/package.types";
import { CreatePackageUseCase } from "../usecases/create.package.usecase";

export class CreatePackageController {
  constructor(private readonly useCase: CreatePackageUseCase) {}

  handle = async (req: RequestContext) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const { name, description, category, tags, conversations } = body;

    if (!name || typeof name !== "string") {
      throw new Error("name is required");
    }
    if (!category || typeof category !== "string") {
      throw new Error("category is required");
    }

    return this.useCase.execute({
      name,
      description: typeof description === "string" ? description : undefined,
      category,
      tags: Array.isArray(tags) ? (tags as string[]) : [],
      conversations: Array.isArray(conversations) ? (conversations as PackageConversation[]) : [],
    });
  };
}
