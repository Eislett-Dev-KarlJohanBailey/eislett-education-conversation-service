import type { RequestContext } from "../../handler/api-gateway/types";
import type { PackageConversation } from "../../domain/types/package.types";
import { UpdatePackageUseCase } from "../usecases/update.package.usecase";

export class UpdatePackageController {
  constructor(private readonly useCase: UpdatePackageUseCase) {}

  handle = async (req: RequestContext) => {
    const id = req.pathParams?.id;
    if (!id) {
      throw new Error("id is required in path");
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const { name, description, category, tags, conversations } = body;

    const input: {
      id: string;
      name?: string;
      description?: string;
      category?: string;
      tags?: string[];
      conversations?: PackageConversation[];
    } = { id };
    if (typeof name === "string") input.name = name;
    if (description !== undefined) input.description = typeof description === "string" ? description : undefined;
    if (typeof category === "string") input.category = category;
    if (Array.isArray(tags)) input.tags = tags as string[];
    if (Array.isArray(conversations)) input.conversations = conversations as PackageConversation[];

    return this.useCase.execute(input);
  };
}
