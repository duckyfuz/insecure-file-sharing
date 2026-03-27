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
  s3_origin_id         = "${var.project_name}-s3-origin"
  preview_suffix       = var.is_preview ? "-pr-${var.pr_number}" : ""
  resource_name        = "${var.project_name}${local.preview_suffix}"
  bucket_name          = var.is_preview ? "${var.s3_bucket_name}-pr-${var.pr_number}" : var.s3_bucket_name
  production_fqdn      = "${var.subdomain}.${var.domain}"
  app_domain_name      = var.is_preview ? aws_cloudfront_distribution.s3_distribution.domain_name : local.production_fqdn
  app_url              = "https://${local.app_domain_name}"
  turnstile_site_key   = var.is_preview ? cloudflare_turnstile_widget.ifs_widget_preview[0].id : cloudflare_turnstile_widget.ifs_widget[0].id
  turnstile_secret_key = var.is_preview ? cloudflare_turnstile_widget.ifs_widget_preview[0].secret : cloudflare_turnstile_widget.ifs_widget[0].secret
}
