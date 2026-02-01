import type { TranscriptAnalysisResult, TranscriptFeedbackItem } from "../types/package.types";

/**
 * Validates that the parsed AI response matches the expected schema.
 * Throws with a clear message if invalid.
 */
export function validateTranscriptAnalysisSchema(value: unknown): TranscriptAnalysisResult {
  if (value === null || typeof value !== "object") {
    throw new Error("Analysis response must be an object");
  }

  const obj = value as Record<string, unknown>;

  if (!Array.isArray(obj.feedback)) {
    throw new Error("Analysis response must have a 'feedback' array");
  }

  const feedback: TranscriptFeedbackItem[] = [];
  const arr = obj.feedback as unknown[];

  if (arr.length < 1 || arr.length > 10) {
    throw new Error("Analysis response 'feedback' must contain between 1 and 10 items");
  }

  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (item === null || typeof item !== "object") {
      throw new Error(`Analysis feedback[${i}] must be an object`);
    }
    const row = item as Record<string, unknown>;

    if (typeof row.content !== "string") {
      throw new Error(`Analysis feedback[${i}].content must be a string`);
    }
    if (typeof row.isPositive !== "boolean") {
      throw new Error(`Analysis feedback[${i}].isPositive must be a boolean`);
    }
    if (!Array.isArray(row.targets)) {
      throw new Error(`Analysis feedback[${i}].targets must be an array`);
    }
    const targetsArr = row.targets as unknown[];
    const targets: string[] = [];
    for (let j = 0; j < targetsArr.length; j++) {
      if (typeof targetsArr[j] !== "string") {
        throw new Error(`Analysis feedback[${i}].targets[${j}] must be a string (target key)`);
      }
      targets.push(targetsArr[j] as string);
    }

    feedback.push({
      content: row.content as string,
      isPositive: row.isPositive as boolean,
      targets,
    });
  }

  return { feedback };
}
