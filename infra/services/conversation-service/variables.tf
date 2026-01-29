variable "state_bucket_name" {
  type = string
}

variable "state_region" {
  type = string
}

variable "state_bucket_key" {
  type = string
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "project_name" {
  type        = string
  description = "Project name prefix for resource naming"
  default     = "eislett-education"
}

variable "usage_event_queue_url" {
  type        = string
  description = "SQS queue URL for usage events (e.g. from GitHub secret USAGE_EVENT_QUEUE_URL). Used by POST /conversations/:id/usage to send usage to the queue."
  default     = ""
  sensitive   = true
}

variable "usage_event_queue_arn" {
  type        = string
  description = "SQS queue ARN for usage events (for IAM SendMessage). If not set, defaults to arn:aws:sqs:{region}:{account}:{project}-{env}-usage-event-queue."
  default     = ""
  sensitive   = true
}
