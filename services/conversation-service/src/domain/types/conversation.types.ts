import { ConversationPlanTarget } from "./conversation-plan.types";

// Progress tracking for each target
export interface TargetProgress {
  target: ConversationPlanTarget;
  progress: TargetProgressData;
}

export interface TargetProgressData {
  // For say_word target
  wordsSaid?: number;
  
  // For cover_discussion_points target
  pointsCovered?: string[]; // List of covered point IDs
  
  // For avoid_word target
  wordsAvoided?: boolean; // Whether words were successfully avoided
  
  // Extensible for custom targets
  [key: string]: any;
}

export interface Conversation {
  id: string;
  userId: string;
  conversationPlanId: string;
  lastPinged: string;
  targetProgress: TargetProgress[];
  createdAt: string;
  updatedAt: string;
}
