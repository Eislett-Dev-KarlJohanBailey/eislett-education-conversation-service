# Talk to Me

A serverless voice-conversation platform built with AWS Lambda, API Gateway, DynamoDB, SNS, and SQS. It provides OpenAI Realtime API voice sessions, transcript storage with event publishing, and conversation plans/packages with progress tracking.

## Overview

**Talk to Me** consists of three services that work together:

| Service | Purpose |
|--------|--------|
| **voice-session-service** | Creates OpenAI Realtime API voice sessions and stores session metadata (30-day TTL). |
| **transcript-service** | Stores transcript entries from voice conversations and publishes `TRANSCRIPT_CREATED` events to SNS. |
| **conversation-service** | Manages conversation plans, packages, and conversations; consumes transcript events to update progress; records usage via SQS. |

---

## Architecture

### High-level flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Client / Frontend                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
    │                    │                    │
    │ POST /voice-session│ POST /transcripts  │ CRUD + POST /conversations/:id/usage
    ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────────┐   ┌─────────────────────────┐
│   Voice      │   │   Transcript     │   │   Conversation          │
│   Session    │   │   Service        │   │   Service                │
│   Service    │   │   (Lambda)       │   │   (Lambda)               │
└──────┬───────┘   └────────┬─────────┘   └───────────┬─────────────┘
       │                    │                          │
       │                    │ SNS                      │ SQS (usage events)
       │                    ▼                          │
       │             ┌──────────────┐                  │
       │             │ SNS Topic    │                  │
       │             │ (transcript  │                  │
       │             │  events)     │                  │
       │             └──────┬───────┘                  │
       │                    │ SQS (user messages)      │
       │                    ▼                          ▼
       │             ┌──────────────────────────────────────┐
       │             │ Conversation Service (SQS Handler)    │
       │             │ ProcessTranscriptUseCase → progress   │
       │             └──────────────────────────────────────┘
       │
       ▼                    ▼                          ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────────────────────────┐
│ DynamoDB     │   │ DynamoDB     │   │ DynamoDB (plans, packages,        │
│ voice_sessions│   │ transcripts  │   │ conversations) + Secrets Manager │
└──────────────┘   └──────────────┘   └──────────────────────────────────┘
```

### Components

- **API Gateway** – HTTP API per service; each service has its own Lambda and route set.
- **Voice Session Service** – Creates sessions via OpenAI Realtime API; reads `OPENAI_API_KEY` from Secrets Manager; writes session records to DynamoDB with TTL.
- **Transcript Service** – Writes transcripts to DynamoDB; publishes `TRANSCRIPT_CREATED` to SNS (with attributes for filtering).
- **Conversation Service** – Two entry points:
  - **API** – CRUD for conversation plans, conversation packages, and conversations; `POST /conversations/:id/usage` pings a conversation (updates `lastPinged`, sends usage to SQS).
  - **SQS** – Subscribed to transcript-service SNS; processes only **user** transcripts: finds conversation by `conversationId`, loads plan, updates target progress (say word count, avoid-word checks, discussion-point coverage via OpenAI), saves conversation.
- **Usage events** – `POST /conversations/:id/usage` sends usage (e.g. seconds elapsed) to an external SQS queue (`USAGE_EVENT_QUEUE_URL` / `USAGE_EVENT_QUEUE_ARN` from GitHub secrets).

### Deploy order

1. **voice-session-service** and **transcript-service** (no cross-service infra dependencies).
2. **conversation-service** (depends on transcript-service remote state for SNS topic ARN; requires `USAGE_EVENT_QUEUE_URL` and `USAGE_EVENT_QUEUE_ARN` for usage SQS).

---

## How to Use

### Prerequisites

- Node.js 20
- npm (workspaces)
- AWS account and credentials for Terraform
- Terraform 1.7+ (for deploy)
- GitHub secrets (for CI): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `TF_STATE_*`, `USAGE_EVENT_QUEUE_URL`, `USAGE_EVENT_QUEUE_ARN` (for conversation-service)

### Build and package

From the repo root:

```bash
npm install
npx turbo run build --filter=@services/conversation-service --filter=@services/transcript-service --filter=@services/voice-session-service
npx turbo run package --filter=@services/conversation-service --filter=@services/transcript-service --filter=@services/voice-session-service
```

Artifacts: `services/<service>/function.zip` for each service.

### Deploy (CI)

On push/PR, the GitHub Actions workflow:

1. Builds and packages the three services.
2. Bootstraps Terraform backends (S3 + DynamoDB locking) per service.
3. Deploys **voice-session-service** and **transcript-service**.
4. Deploys **conversation-service** with transcript-service remote state and usage-queue vars.

Required GitHub secrets/vars: `PROJECT_NAME` (or default), `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `TF_STATE_BUCKET_NAME`, `TF_STATE_REGION`, `TF_STATE_BUCKET_KEY`, `USAGE_EVENT_QUEUE_URL`, `USAGE_EVENT_QUEUE_ARN`.

### Deploy (local Terraform)

After packaging, from repo root:

```bash
# 1. Voice session & transcript (no cross-deps)
for service in voice-session-service transcript-service; do
  terraform -chdir=infra/services/$service init -backend-config=...
  terraform -chdir=infra/services/$service apply -auto-approve -var=...
done

# 2. Conversation (uses transcript-service state + usage queue)
terraform -chdir=infra/services/conversation-service init -backend-config=...
terraform -chdir=infra/services/conversation-service apply -auto-approve \
  -var=usage_event_queue_url=$USAGE_EVENT_QUEUE_URL \
  -var=usage_event_queue_arn=$USAGE_EVENT_QUEUE_ARN \
  ...
```

Use the same `backend-config` and `-var` pattern as in `.github/workflows/ci.yml`.

---

## API Endpoints

Base URLs are the API Gateway invoke URLs for each service (output by Terraform / AWS Console).

### Voice Session Service

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/voice-session` | Create an OpenAI Realtime voice session. |

**Request body (optional):**
```json
{ "instructions": "Optional custom instructions to append" }
```

**Response:** `session_id`, `client_secret`, `expires_at`.

---

### Transcript Service

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/transcripts` | Create a transcript entry (user ID from JWT). |

**Request body:**
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
`start` and `end` are optional. `userId` is taken from the JWT.

**Response:** Created transcript object (e.g. `transcriptId`, `conversationId`, `userId`, `sentBy`, `time`, `content`, `createdAt`, …).

---

### Conversation Service

#### Conversation plans

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/conversation-plans` | Create a plan. |
| `PUT` | `/conversation-plans/{id}` | Update a plan. |
| `GET` | `/conversation-plans` | List plans (optional: `packageId`, `stage`, `page_number`, `page_size`). Sorted by stage. |
| `DELETE` | `/conversation-plans/{id}` | Delete a plan. |

Plans have `packageId`, `stage` (1–10), `name`, `description`, and `targets[]` (e.g. `say_word`, `cover_discussion_points`, `avoid_word`, or custom).

#### Conversation packages

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/conversation-packages` | Create a package. |
| `PUT` | `/conversation-packages/{id}` | Update a package. |
| `GET` | `/conversation-packages` | List packages (optional: `category`, `page_number`, `page_size`). |
| `DELETE` | `/conversation-packages/{id}` | Delete a package. |

Packages have `name`, `description`, `productId?`, `topics[]`, `categories[]`, `tags[]`.

#### Packages (shorter path, same resource)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/packages` | Create a package (body: `name`, `description`, `topics[]`, `categories[]`, etc.). |
| `PUT` | `/packages/{id}` | Update a package. |
| `GET` | `/packages` | List packages (optional: `category`, `page_number`, `page_size`). |
| `DELETE` | `/packages/{id}` | Delete a package. |

#### Conversations

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/conversations` | Create a conversation (body: `conversationPlanId`; user from JWT). |
| `GET` | `/conversations` | List conversations for the user. |
| `GET` | `/conversations/{id}` | Get one conversation. |
| `PUT` | `/conversations/{id}` | Update a conversation. |
| `DELETE` | `/conversations/{id}` | Delete a conversation. |
| `POST` | `/conversations/{id}/usage` | Ping conversation: update `lastPinged`, report usage to SQS. |

**POST /conversations body:** `{ "conversationPlanId": "plan-id" }`  
**POST /conversations/{id}/usage body:** `{ "entitlementKey": "key-for-billing" }`  
**Response (usage):** `{ "conversation", "secondsElapsed" }`.

Conversations track `targetProgress` per plan target (e.g. words said, points covered, avoid-word success). Progress is updated when the conversation-service SQS handler processes **user** transcript events.

---

## Event flow: Transcripts → progress

1. Client sends **POST /transcripts** with `conversationId`, `sentBy`, `content`, etc. (`userId` from JWT).
2. Transcript service saves to DynamoDB and publishes **TRANSCRIPT_CREATED** to SNS.
3. Conversation service is subscribed via SQS (filtered for user messages where applicable). SQS handler:
   - Parses event, ignores non-user transcripts.
   - Loads conversation by `conversationId`, checks `userId`, loads plan.
   - For each target: updates say-word count, avoid-word flag, or discussion-point coverage (OpenAI).
   - Saves updated `targetProgress` on the conversation.

---

## Service READMEs

- [Voice Session Service](services/voice-session-service/README.md) – Session creation, env vars, table.
- [Transcript Service](services/transcript-service/README.md) – Transcript API, SNS, env vars.
- [Conversation Service](services/conversation-service/README.md) – Plans, packages, conversations, targets, env vars, SQS.

---

## Tech stack

- **Runtime:** Node.js 20, TypeScript
- **Orchestration:** Turborepo, npm workspaces
- **Infra:** Terraform (AWS), API Gateway HTTP API, Lambda, DynamoDB, SNS, SQS, Secrets Manager, IAM
