variable "region" {
  description = "The region to deploy the resources"
  default     = "us-east-1"
}

variable "iac_tag" {
  description = "The tag to identify the resources"
  default     = "terraform"
}
