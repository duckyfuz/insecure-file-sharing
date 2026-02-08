provider "aws" {
  region = var.aws_region
}

provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"
}

provider "cloudflare" {}

terraform {
  backend "s3" {
    # NOTE: Backend config cannot use variables - update these values directly.
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
  s3_origin_id = "${var.project_name}-s3-origin"
  fqdn         = "${var.subdomain}.${var.domain}"
}
