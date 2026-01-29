# Conversation Service

A serverless Lambda function service for managing conversation plans and packages. This service handles CRUD operations for conversation plans and packages with filtering and pagination.

## Overview

The Conversation Service is an AWS Lambda function that processes API Gateway events to manage conversation plans and packages stored in DynamoDB.

### Features

- **Conversation Plans**: Create, update, and list conversation plans with targets
- **Conversation Packages**: Create, update, and list conversation packages
- **Filtering**: Filter plans by packageId and stage, filter packages by category
- **Pagination**: Paginated list responses with configurable page size
- **Sorting**: Sort conversation plans by stage

## Architecture

The service follows a clean architecture pattern:

```
src/
├── domain/           # Domain entities and types
├── app/             # Application layer
│   ├── controllers/ # Request handlers
│   └── usecases/    # Business logic
├── infrastructure/ # Infrastructure layer
│   └── repositories/
│       ├── conversation-plan.repository.ts
│       └── conversation-package.repository.ts
└── handler/         # Lambda handler and API Gateway integration
```

## Environment Variables

The service requires the following environment variables:

### Required

- `CONVERSATION_PLANS_TABLE` - Name of the DynamoDB table storing conversation plans
- `CONVERSATION_PACKAGES_TABLE` - Name of the DynamoDB table storing conversation packages

## API Endpoints

### Conversation Plans

#### POST /conversation-plans
Creates a new conversation plan.

#### PUT /conversation-plans/{id}
Updates an existing conversation plan.

#### GET /conversation-plans
Lists conversation plans with optional filters:
- `packageId` - Filter by package ID
- `stage` - Filter by stage (1-10)
- `page_number` - Page number (default: 1)
- `page_size` - Page size (default: 20)

Results are sorted by stage.

### Conversation Packages

#### POST /conversation-packages
Creates a new conversation package.

#### PUT /conversation-packages/{id}
Updates an existing conversation package.

#### GET /conversation-packages
Lists conversation packages with optional filters:
- `category` - Filter by category
- `page_number` - Page number (default: 1)
- `page_size` - Page size (default: 20)

## Conversation Plan Targets

Conversation plans support various target types:
- **Say Word**: Say a specific word a certain number of times
- **Cover Discussion Points**: Cover a list of discussion points
- **Avoid Word**: Avoid using specific words
- Extensible for additional target types
