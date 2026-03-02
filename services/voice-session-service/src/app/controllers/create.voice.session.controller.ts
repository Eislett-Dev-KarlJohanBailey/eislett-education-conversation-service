import { RequestContext } from "../../handler/api-gateway/types";
import { CreateVoiceSessionUseCase } from "../usecases/create.voice.session.usecase";

export class CreateVoiceSessionController {
  constructor(
    private readonly useCase: CreateVoiceSessionUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const body = (req.body || {}) as Record<string, unknown>;
    const { instructions, text_only, use_instruction_template } = body;
    const userId = req.user?.id;

    return await this.useCase.execute({
      instructions: typeof instructions === "string" ? instructions : undefined,
      textOnlyOutput: text_only === true || text_only === "true",
      useInstructionTemplate: use_instruction_template === false || use_instruction_template === "false" ? false : undefined,
      userId: userId,
    });
  };
}
