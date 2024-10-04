provider "aws" {
  region = "ap-southeast-1"
}

provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
}

# provider "cloudflare" {
#   api_token = var.cloudflare_api_token
# }

terraform {
  backend "s3" {
    bucket = "ken-tf-state-bucket"
    key    = "insecure-file-sharing-tf-key"
    region = "ap-southeast-1"
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4"
    }
  }
}

locals {
  s3_origin_id = "IfsS3Origin"

  subdomain_name               = "ifs"
  cloudflare_zone_id           = "47e2c26d25d25ff12cb21a0b2a5e1a4d"
  comment_prefix               = "GENERATED BY TERRAFORM"
  acm_certificate_record       = tolist(aws_acm_certificate.subdomain_cert.domain_validation_options)[0]
  acm_certificate_record_name  = replace(local.acm_certificate_record.resource_record_name, ".kenf.dev.", "")
  acm_certificate_record_type  = local.acm_certificate_record.resource_record_type
  acm_certificate_record_value = substr(local.acm_certificate_record.resource_record_value, 0, length(local.acm_certificate_record.resource_record_value) - 1)
}
