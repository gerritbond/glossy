terraform {
    required_providers {
        aws = {
            source = "hashicorp/aws"
            version = "~> 5.0"
        }
    }
}

provider "aws" {
    region = var.region
    profile = "default"
}

module "api" {
    source = "./api/terraform"

    region = var.region
    iac_tag = var.iac_tag
    account_id = var.account_id
}