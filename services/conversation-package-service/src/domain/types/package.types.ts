export interface ConversationTarget {
  key: string;
  description: string;
  check: string;
  amount?: number;
}

export interface PackageConversation {
  name: string;
  instruction: string;
  targets: ConversationTarget[];
}

export interface ConversationPackage {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  conversations: PackageConversation[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationPackageFilters {
  category?: string;
}

/** One feedback item from transcript analysis (AI returns ~3 of these). */
export interface TranscriptFeedbackItem {
  content: string;
  isPositive: boolean;
  /** Target keys that met their check requirements in this feedback context. */
  targets: string[];
}

/** Validated response from the analyze-transcript endpoint / OpenAI. */
export interface TranscriptAnalysisResult {
  feedback: TranscriptFeedbackItem[];
}
