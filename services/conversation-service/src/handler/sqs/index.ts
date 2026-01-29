import {
  SQSEvent,
  SQSBatchResponse,
  SQSBatchItemFailure,
} from "aws-lambda";
import { parseSqsEvent } from "./parse-event";
import { bootstrap } from "../../bootstrap";

export const handler = async (
  event: SQSEvent
): Promise<SQSBatchResponse> => {
  const { processTranscriptUseCase } = bootstrap();
  const batchItemFailures: SQSBatchItemFailure[] = [];

  try {
    // Process each SQS record
    for (let i = 0; i < event.Records.length; i++) {
      const sqsRecord = event.Records[i];

      try {
        // Parse the SQS record
        const transcriptEvent = parseSqsEvent({ Records: [sqsRecord] })[0];

        // Filter: only process user messages
        if (transcriptEvent.payload.sentBy !== "user") {
          console.log(`Skipping non-user transcript: ${transcriptEvent.payload.transcriptId} (sentBy=${transcriptEvent.payload.sentBy})`);
          continue;
        }

        await processTranscriptUseCase.execute({
          transcriptEvent,
        });

        console.log(
          `Processed transcript: ${transcriptEvent.payload.transcriptId} for conversation ${transcriptEvent.payload.conversationId}`
        );
      } catch (error) {
        console.error(
          `Failed to process transcript record ${sqsRecord.messageId}:`,
          error
        );

        // Add to batch failures so SQS can retry
        batchItemFailures.push({
          itemIdentifier: sqsRecord.messageId,
        });
      }
    }

    return {
      batchItemFailures,
    };
  } catch (error) {
    console.error("Fatal error processing SQS batch:", error);
    return {
      batchItemFailures: event.Records.map((record) => ({
        itemIdentifier: record.messageId,
      })),
    };
  }
};
