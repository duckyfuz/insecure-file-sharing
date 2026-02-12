# ─────────────────────────────────────────────────────────────
# REQUIRED: Users MUST update these values
# ─────────────────────────────────────────────────────────────

variable "domain" {
  description = "Base domain (e.g., kenf.dev)"
  type        = string
}

variable "subdomain" {
  description = "Subdomain for the app (e.g., ifs)"
  type        = string
  default     = "ifs"
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for your domain"
  type        = string
}

# ─────────────────────────────────────────────────────────────
# OPTIONAL: Sensible defaults, can override
# ─────────────────────────────────────────────────────────────

variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name prefix for resource naming"
  type        = string
  default     = "ifs"
}

variable "s3_bucket_name" {
  description = "Name for the S3 storage bucket"
  type        = string
  default     = "ifs-storage-bucket"
}

variable "vercel_subdomain" {
  description = "Subdomain for the Vercel landing page (e.g., ifs)"
  type        = string
  default     = ""
}

variable "vercel_cname" {
  description = "Vercel DNS target for the landing page (e.g., xxx.vercel-dns-017.com). Leave empty to skip."
  type        = string
  default     = ""
}
