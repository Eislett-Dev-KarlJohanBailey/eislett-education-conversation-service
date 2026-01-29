output "voice_sessions_table_name" {
  value       = aws_dynamodb_table.voice_sessions.name
  description = "Name of the voice sessions DynamoDB table"
}

output "voice_sessions_table_arn" {
  value       = aws_dynamodb_table.voice_sessions.arn
  description = "ARN of the voice sessions DynamoDB table"
}
