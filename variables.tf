variable "region" {
  description = "The region to deploy the resources"
  default     = "us-east-1"
}

variable "iac_tag" {
  description = "The tag to identify the resources"
  default     = "terraform"
}

variable "account_id" {
  description = "The account id to deploy the resources"
  default     = ""
}
