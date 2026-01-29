import { RequestContext } from "../../handler/api-gateway/types";
import { CreateVoiceSessionUseCase } from "../usecases/create.voice.session.usecase";

export class CreateVoiceSessionController {
  constructor(
    private readonly useCase: CreateVoiceSessionUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const { instructions } = req.body || {};
    const userId = req.user?.id;

    return await this.useCase.execute({
      instructions: typeof instructions === "string" ? instructions : undefined,
      userId: userId,
    });
  };
}
