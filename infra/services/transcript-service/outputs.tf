output "transcripts_table_name" {
  value       = aws_dynamodb_table.transcripts.name
  description = "Name of the transcripts DynamoDB table"
}

output "transcripts_table_arn" {
  value       = aws_dynamodb_table.transcripts.arn
  description = "ARN of the transcripts DynamoDB table"
}

output "transcript_events_topic_arn" {
  description = "ARN of the SNS topic for transcript events"
  value       = aws_sns_topic.transcript_events.arn
}

output "transcript_events_topic_name" {
  description = "Name of the SNS topic for transcript events"
  value       = aws_sns_topic.transcript_events.name
}
