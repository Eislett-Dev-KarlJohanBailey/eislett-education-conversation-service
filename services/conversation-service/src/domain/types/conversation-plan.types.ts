// Extensible target types for conversation plans
export type ConversationPlanTarget =
  | SayWordTarget
  | CoverDiscussionPointsTarget
  | AvoidWordTarget
  | CustomTarget;

export interface SayWordTarget {
  type: "say_word";
  word: string;
  count: number;
}

export interface CoverDiscussionPointsTarget {
  type: "cover_discussion_points";
  points: string[];
}

export interface AvoidWordTarget {
  type: "avoid_word";
  words: string[];
}

// Extensible custom target type
export interface CustomTarget {
  type: string;
  [key: string]: any;
}

export interface ConversationPlan {
  id: string;
  packageId?: string;
  stage: number; // 1-10
  name: string;
  description?: string;
  targets: ConversationPlanTarget[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationPlanFilters {
  packageId?: string;
  stage?: number; // 1-10
}
