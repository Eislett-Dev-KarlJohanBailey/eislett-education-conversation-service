output "conversation_packages_table_name" {
  value       = aws_dynamodb_table.conversation_packages.name
  description = "Name of the conversation packages DynamoDB table"
}

output "conversation_packages_table_arn" {
  value       = aws_dynamodb_table.conversation_packages.arn
  description = "ARN of the conversation packages DynamoDB table"
}

output "analysis_results_table_name" {
  value       = aws_dynamodb_table.analysis_results.name
  description = "Name of the transcript analysis results DynamoDB table"
}

output "analysis_results_table_arn" {
  value       = aws_dynamodb_table.analysis_results.arn
  description = "ARN of the transcript analysis results DynamoDB table"
}
