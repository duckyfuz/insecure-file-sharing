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
}
