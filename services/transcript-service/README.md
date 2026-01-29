# Transcript Service

A serverless Lambda function service for storing and publishing transcript data from voice conversations. This service handles the creation of transcript records and publishes events to SNS.

## Overview

The Transcript Service is an AWS Lambda function that processes API Gateway events to store transcript data in DynamoDB and publish transcript creation events to SNS.

### Features

- **Transcript Storage**: Stores transcript records in DynamoDB
- **Event Publishing**: Publishes transcript creation events to SNS
- **User Authentication**: Extracts user ID from JWT token
- **Flexible Timestamps**: Supports optional start and end times

## Architecture

The service follows a clean architecture pattern:

```
src/
├── app/              # Application layer
│   ├── controllers/ # Request handlers
│   └── usecases/    # Business logic
├── infrastructure/  # External integrations
│   ├── event.publisher.ts
│   └── repositories/
│       └── transcript.repository.ts
└── handler/         # Lambda handler and API Gateway integration
```

## Environment Variables

The service requires the following environment variables:

### Required

- `TRANSCRIPTS_TABLE` - Name of the DynamoDB table storing transcript records
- `TRANSCRIPT_EVENTS_TOPIC_ARN` - ARN of the SNS topic for transcript events

## API Endpoints

### POST /transcripts

Creates a new transcript record.

**Request Body:**
```json
{
  "conversationId": "conv-123",
  "sentBy": "user",
  "time": "2026-01-29T12:00:00Z",
  "start": "2026-01-29T12:00:00Z",
  "end": "2026-01-29T12:00:05Z",
  "content": "Hello, how are you?"
}
```

**Note:** `userId` is automatically extracted from the JWT token. `start` and `end` are optional fields.

**Response:**
```json
{
  "transcriptId": "transcript-1234567890",
  "conversationId": "conv-123",
  "userId": "user-123",
  "sentBy": "user",
  "time": "2026-01-29T12:00:00Z",
  "start": "2026-01-29T12:00:00Z",
  "end": "2026-01-29T12:00:05Z",
  "content": "Hello, how are you?",
  "createdAt": "2026-01-29T12:00:00Z"
}
```
