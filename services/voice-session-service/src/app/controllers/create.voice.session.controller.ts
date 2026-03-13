import { RequestContext } from "../../handler/api-gateway/types";
import { CreateVoiceSessionUseCase } from "../usecases/create.voice.session.usecase";

export class CreateVoiceSessionController {
  constructor(
    private readonly useCase: CreateVoiceSessionUseCase
  ) {}

  handle = async (req: RequestContext) => {
    const body = (req.body || {}) as Record<string, unknown>;
    const { instructions, use_instruction_template } = body;
    const userId = req.user?.id;

    return await this.useCase.execute({
      instructions: typeof instructions === "string" ? instructions : undefined,
      textOnlyOutput: false,
      useInstructionTemplate: use_instruction_template === false || use_instruction_template === "false" ? false : undefined,
      userId: userId,
    });
  };
}
