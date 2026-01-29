import { bootstrap } from "../../bootstrap";
import { RequestContext } from "./types";

const { createVoiceSessionController } = bootstrap();

export const routes: Record<
  string,
  (req: RequestContext) => Promise<any>
> = {
  "POST /voice-session": createVoiceSessionController.handle,
};
