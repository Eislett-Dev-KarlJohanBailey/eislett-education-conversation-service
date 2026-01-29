import fetch from "node-fetch";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

export interface CheckDiscussionPointsInput {
  content: string;
  points: string[];
}

export interface CheckDiscussionPointsOutput {
  coveredPoints: string[];
}

export class OpenAIClient {
  private apiKey: string | null = null;

  async initialize(projectName: string, environment: string): Promise<void> {
    const secretName = `${projectName}-${environment}-openai-api-key`;
    const secretsClient = new SecretsManagerClient({ region: "us-east-1" });

    try {
      const response = await secretsClient.send(
        new GetSecretValueCommand({ SecretId: secretName })
      );

      const secretString = response.SecretString || "";
      // Handle both JSON and plain string formats
      try {
        const parsed = JSON.parse(secretString);
        this.apiKey = parsed.key || parsed.apiKey || parsed;
      } catch {
        this.apiKey = secretString;
      }
    } catch (error) {
      throw new Error(
        `Failed to load OpenAI API key from Secrets Manager: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async checkDiscussionPoints(
    input: CheckDiscussionPointsInput
  ): Promise<CheckDiscussionPointsOutput> {
    if (!this.apiKey) {
      throw new Error("OpenAIClient not initialized");
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are an assistant that analyzes conversation transcripts to identify which discussion points were covered. 
Return a JSON object with a "coveredPoints" array containing the exact text of the points that were covered in the conversation.
Only include points that were actually discussed or mentioned in the content.`,
            },
            {
              role: "user",
              content: `Analyze this conversation content and identify which of these discussion points were covered:\n\nPoints to check:\n${input.points.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\nConversation content:\n${input.content}\n\nReturn JSON with coveredPoints array.`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    const parsed = JSON.parse(content);
    return {
      coveredPoints: parsed.coveredPoints || [],
    };
  }
}
