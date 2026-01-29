import { SQSEvent, SQSRecord } from "aws-lambda";

export interface TranscriptCreatedEvent {
  type: "TRANSCRIPT_CREATED";
  payload: {
    transcriptId: string;
    conversationId: string;
    userId: string;
    sentBy: "user" | "ai";
    time: string;
    start?: string;
    end?: string;
    content: string;
    createdAt: string;
  };
  meta: {
    eventId: string;
    occurredAt: string;
    source: string;
  };
  version: number;
}

export function parseSqsEvent(event: SQSEvent): TranscriptCreatedEvent[] {
  return event.Records.map(record => parseSqsRecord(record));
}

export function parseSqsRecord(record: SQSRecord): TranscriptCreatedEvent {
  // SQS messages from SNS contain the SNS message in the body
  let messageBody: any;
  
  try {
    messageBody = JSON.parse(record.body);
  } catch (error) {
    throw new Error(`Failed to parse SQS record body: ${error instanceof Error ? error.message : String(error)}`);
  }

  // If the message came from SNS, the actual event is in messageBody.Message
  let eventData: TranscriptCreatedEvent;
  
  if (messageBody.Type === "Notification" && messageBody.Message) {
    // Message from SNS - parse the Message field
    try {
      eventData = JSON.parse(messageBody.Message);
    } catch (error) {
      throw new Error(`Failed to parse SNS message: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    // Direct message (not from SNS)
    eventData = messageBody;
  }

  // Validate event structure
  if (!eventData.type || !eventData.payload || !eventData.meta) {
    throw new Error(`Invalid transcript event structure: missing required fields`);
  }

  if (eventData.type !== "TRANSCRIPT_CREATED") {
    throw new Error(`Unexpected event type: ${eventData.type}`);
  }

  return eventData;
}
