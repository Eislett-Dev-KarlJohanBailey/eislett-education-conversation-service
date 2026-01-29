output "conversation_plans_table_name" {
  value       = aws_dynamodb_table.conversation_plans.name
  description = "Name of the conversation plans DynamoDB table"
}

output "conversation_plans_table_arn" {
  value       = aws_dynamodb_table.conversation_plans.arn
  description = "ARN of the conversation plans DynamoDB table"
}

output "conversation_packages_table_name" {
  value       = aws_dynamodb_table.conversation_packages.name
  description = "Name of the conversation packages DynamoDB table"
}

output "conversation_packages_table_arn" {
  value       = aws_dynamodb_table.conversation_packages.arn
  description = "ARN of the conversation packages DynamoDB table"
}

output "conversations_table_name" {
  value       = aws_dynamodb_table.conversations.name
  description = "Name of the conversations DynamoDB table"
}

output "conversations_table_arn" {
  value       = aws_dynamodb_table.conversations.arn
  description = "ARN of the conversations DynamoDB table"
}
