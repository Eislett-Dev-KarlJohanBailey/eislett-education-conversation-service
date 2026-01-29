import { ConversationPlanRepository } from "./infrastructure/repositories/conversation-plan.repository";
import { ConversationPackageRepository } from "./infrastructure/repositories/conversation-package.repository";
import { ConversationRepository } from "./infrastructure/repositories/conversation.repository";
import { UsageEventSQSClient } from "./infrastructure/sqs.client";
import { OpenAIClient } from "./infrastructure/openai.client";
import { CreateConversationPlanUseCase } from "./app/usecases/create.conversation.plan.usecase";
import { UpdateConversationPlanUseCase } from "./app/usecases/update.conversation.plan.usecase";
import { ListConversationPlansUseCase } from "./app/usecases/list.conversation.plans.usecase";
import { DeleteConversationPlanUseCase } from "./app/usecases/delete.conversation.plan.usecase";
import { CreateConversationPackageUseCase } from "./app/usecases/create.conversation.package.usecase";
import { UpdateConversationPackageUseCase } from "./app/usecases/update.conversation.package.usecase";
import { ListConversationPackagesUseCase } from "./app/usecases/list.conversation.packages.usecase";
import { DeleteConversationPackageUseCase } from "./app/usecases/delete.conversation.package.usecase";
import { CreateConversationUseCase } from "./app/usecases/create.conversation.usecase";
import { GetConversationUseCase } from "./app/usecases/get.conversation.usecase";
import { ListConversationsUseCase } from "./app/usecases/list.conversations.usecase";
import { UpdateConversationUseCase } from "./app/usecases/update.conversation.usecase";
import { DeleteConversationUseCase } from "./app/usecases/delete.conversation.usecase";
import { PingConversationUseCase } from "./app/usecases/ping.conversation.usecase";
import { ProcessTranscriptUseCase } from "./app/usecases/process.transcript.usecase";
import { CreateConversationPlanController } from "./app/controllers/create.conversation.plan.controller";
import { UpdateConversationPlanController } from "./app/controllers/update.conversation.plan.controller";
import { ListConversationPlansController } from "./app/controllers/list.conversation.plans.controller";
import { DeleteConversationPlanController } from "./app/controllers/delete.conversation.plan.controller";
import { CreateConversationPackageController } from "./app/controllers/create.conversation.package.controller";
import { UpdateConversationPackageController } from "./app/controllers/update.conversation.package.controller";
import { ListConversationPackagesController } from "./app/controllers/list.conversation.packages.controller";
import { DeleteConversationPackageController } from "./app/controllers/delete.conversation.package.controller";
import { CreateConversationController } from "./app/controllers/create.conversation.controller";
import { GetConversationController } from "./app/controllers/get.conversation.controller";
import { ListConversationsController } from "./app/controllers/list.conversations.controller";
import { UpdateConversationController } from "./app/controllers/update.conversation.controller";
import { DeleteConversationController } from "./app/controllers/delete.conversation.controller";
import { PingConversationController } from "./app/controllers/ping.conversation.controller";

export function bootstrap() {
  const plansTableName = process.env.CONVERSATION_PLANS_TABLE;
  const packagesTableName = process.env.CONVERSATION_PACKAGES_TABLE;
  const conversationsTableName = process.env.CONVERSATIONS_TABLE;

  if (!plansTableName) {
    throw new Error("CONVERSATION_PLANS_TABLE environment variable is not set");
  }

  if (!packagesTableName) {
    throw new Error("CONVERSATION_PACKAGES_TABLE environment variable is not set");
  }

  if (!conversationsTableName) {
    throw new Error("CONVERSATIONS_TABLE environment variable is not set");
  }

  const planRepository = new ConversationPlanRepository(plansTableName);
  const packageRepository = new ConversationPackageRepository(packagesTableName);
  const conversationRepository = new ConversationRepository(conversationsTableName);
  const sqsClient = new UsageEventSQSClient();
  
  // Initialize OpenAI client
  const projectName = process.env.PROJECT_NAME || "eislett-education";
  const environment = process.env.ENVIRONMENT || "dev";
  const openAIClient = new OpenAIClient();
  
  // Initialize async clients
  let initPromise: Promise<void> | null = null;
  const ensureInitialized = async () => {
    if (!initPromise) {
      initPromise = openAIClient.initialize(projectName, environment).then(() => {
        console.log("Conversation service clients initialized");
      }).catch((error) => {
        console.error("Failed to initialize conversation service clients:", error);
        throw error;
      });
    }
    return initPromise;
  };
  (global as any).__conversationServiceEnsureInit = ensureInitialized;

  // Use cases
  const createConversationPlanUseCase = new CreateConversationPlanUseCase(planRepository);
  const updateConversationPlanUseCase = new UpdateConversationPlanUseCase(planRepository);
  const listConversationPlansUseCase = new ListConversationPlansUseCase(planRepository);
  const deleteConversationPlanUseCase = new DeleteConversationPlanUseCase(planRepository);
  const createConversationPackageUseCase = new CreateConversationPackageUseCase(packageRepository);
  const updateConversationPackageUseCase = new UpdateConversationPackageUseCase(packageRepository);
  const listConversationPackagesUseCase = new ListConversationPackagesUseCase(packageRepository);
  const deleteConversationPackageUseCase = new DeleteConversationPackageUseCase(packageRepository);
  const createConversationUseCase = new CreateConversationUseCase(conversationRepository, planRepository);
  const getConversationUseCase = new GetConversationUseCase(conversationRepository);
  const listConversationsUseCase = new ListConversationsUseCase(conversationRepository);
  const updateConversationUseCase = new UpdateConversationUseCase(conversationRepository);
  const deleteConversationUseCase = new DeleteConversationUseCase(conversationRepository);
  const pingConversationUseCase = new PingConversationUseCase(conversationRepository, sqsClient);
  const processTranscriptUseCase = new ProcessTranscriptUseCase(conversationRepository, planRepository, openAIClient);

  // Controllers
  const createConversationPlanController = new CreateConversationPlanController(createConversationPlanUseCase);
  const updateConversationPlanController = new UpdateConversationPlanController(updateConversationPlanUseCase);
  const listConversationPlansController = new ListConversationPlansController(listConversationPlansUseCase);
  const deleteConversationPlanController = new DeleteConversationPlanController(deleteConversationPlanUseCase);
  const createConversationPackageController = new CreateConversationPackageController(createConversationPackageUseCase);
  const updateConversationPackageController = new UpdateConversationPackageController(updateConversationPackageUseCase);
  const listConversationPackagesController = new ListConversationPackagesController(listConversationPackagesUseCase);
  const deleteConversationPackageController = new DeleteConversationPackageController(deleteConversationPackageUseCase);
  const createConversationController = new CreateConversationController(createConversationUseCase);
  const getConversationController = new GetConversationController(getConversationUseCase);
  const listConversationsController = new ListConversationsController(listConversationsUseCase);
  const updateConversationController = new UpdateConversationController(updateConversationUseCase);
  const deleteConversationController = new DeleteConversationController(deleteConversationUseCase);
  const pingConversationController = new PingConversationController(pingConversationUseCase);

  return {
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
    processTranscriptUseCase,
  };
}
