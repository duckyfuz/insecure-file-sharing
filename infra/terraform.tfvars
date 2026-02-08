# ─────────────────────────────────────────────────────────────
# IFS Infrastructure Configuration
# ─────────────────────────────────────────────────────────────
# These values are NOT sensitive - they are identifiers only.
# Sensitive credentials (API tokens) are passed via GitHub Secrets.
# ─────────────────────────────────────────────────────────────

# Domain configuration
domain    = "kenf.dev"
subdomain = "ifs"

# Cloudflare identifiers (NOT credentials - these are public IDs)
cloudflare_account_id = "711893ae9189134e1d258871f2019476"
cloudflare_zone_id    = "47e2c26d25d25ff12cb21a0b2a5e1a4d"

# AWS/Infrastructure settings
aws_region     = "ap-southeast-1"
project_name   = "ifs"
s3_bucket_name = "ifs-storage-bucket"
