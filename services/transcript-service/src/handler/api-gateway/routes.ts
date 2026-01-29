import { bootstrap } from "../../bootstrap";
import { RequestContext } from "./types";

const { createTranscriptController } = bootstrap();

export const routes: Record<
  string,
  (req: RequestContext) => Promise<any>
> = {
  "POST /transcripts": createTranscriptController.handle,
};
