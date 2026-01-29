import { bootstrap } from "../../bootstrap";
import { RequestContext } from "./types";

const {
  createConversationPlanController,
  updateConversationPlanController,
  listConversationPlansController,
  deleteConversationPlanController,
  createConversationPackageController,
  updateConversationPackageController,
  listConversationPackagesController,
  deleteConversationPackageController,
  createConversationController,
  getConversationController,
  listConversationsController,
  updateConversationController,
  deleteConversationController,
  pingConversationController,
} = bootstrap();

export const routes: Record<
  string,
  (req: RequestContext) => Promise<any>
> = {
  "POST /conversation-plans": createConversationPlanController.handle,
  "PUT /conversation-plans/{id}": updateConversationPlanController.handle,
  "GET /conversation-plans": listConversationPlansController.handle,
  "DELETE /conversation-plans/{id}": deleteConversationPlanController.handle,
  "POST /conversation-packages": createConversationPackageController.handle,
  "PUT /conversation-packages/{id}": updateConversationPackageController.handle,
  "GET /conversation-packages": listConversationPackagesController.handle,
  "DELETE /conversation-packages/{id}": deleteConversationPackageController.handle,
  "POST /conversations": createConversationController.handle,
  "GET /conversations": listConversationsController.handle,
  "GET /conversations/{id}": getConversationController.handle,
  "PUT /conversations/{id}": updateConversationController.handle,
  "DELETE /conversations/{id}": deleteConversationController.handle,
  "POST /conversations/{id}/usage": pingConversationController.handle,
};
