# Infrastructure

This directory contains Terraform configuration for deploying IFS to AWS with Cloudflare.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Cloudflare │────▶│  CloudFront  │────▶│     S3      │
│   (DNS/CDN) │     │    (CDN)     │     │  (Storage)  │
└─────────────┘     └──────────────┘     └─────────────┘
                                                │
┌─────────────┐                                 │
│  Turnstile  │     ┌──────────────┐            │
│   (CAPTCHA) │────▶│    Lambda    │◀───────────┘
└─────────────┘     │   (Upload)   │
                    └──────────────┘
```

**Resources created:**

- **S3 Bucket** - File storage with 24-hour auto-deletion
- **CloudFront Distribution** - CDN with SSL
- **Lambda Function** - Handles file uploads with signed URLs
- **ACM Certificate** - SSL certificate for your subdomain
- **Cloudflare DNS** - DNS records pointing to CloudFront
- **Cloudflare Turnstile** - Bot protection widget

## Prerequisites

- [Terraform](https://terraform.io) v1.9+
- AWS account with credentials configured
- Cloudflare account with a domain
- S3 bucket for Terraform state (create manually first)

## Configuration

### For Forkers

1. **Update `terraform.tfvars`** with your values:

   ```hcl
   domain                = "yourdomain.com"
   subdomain             = "ifs"
   cloudflare_account_id = "your-cloudflare-account-id"
   cloudflare_zone_id    = "your-cloudflare-zone-id"
   aws_region            = "us-east-1"  # or your preferred region
   project_name          = "ifs"
   s3_bucket_name        = "your-unique-bucket-name"
   ```

2. **Update `main.tf` backend config** (lines 14-17):

   ```hcl
   backend "s3" {
     bucket = "your-tf-state-bucket"
     key    = "ifs-terraform-state"
     region = "us-east-1"
   }
   ```

3. **Set up credentials:**

   ```bash
   # AWS credentials
   export AWS_ACCESS_KEY_ID="..."
   export AWS_SECRET_ACCESS_KEY="..."

   # Cloudflare API token (with DNS and Turnstile permissions)
   export CLOUDFLARE_API_TOKEN="..."
   ```

### Finding Cloudflare IDs

- **Account ID**: Cloudflare Dashboard → any domain → Overview → right sidebar
- **Zone ID**: Cloudflare Dashboard → your domain → Overview → right sidebar

## Deployment

### Local

```bash
# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply changes
terraform apply

# Destroy (when needed)
terraform destroy
```

### GitHub Actions

**Required Secrets** (add in repo settings):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFLARE_API_TOKEN`

**Deploy:**

1. Push to `main` or open a PR
2. Plan runs automatically and comments on PRs
3. On merge to `main`, approve in `production` environment to apply

**Destroy:**

1. Go to **Actions** → **Destroy Infrastructure**
2. Click **Run workflow**
3. Type `destroy` to confirm
4. Approve in `production` environment

> ⚠️ Destroying will delete all uploaded files and cannot be undone.

## Variables Reference

| Variable                | Required | Default              | Description                              |
| ----------------------- | -------- | -------------------- | ---------------------------------------- |
| `domain`                | ✅       | -                    | Base domain (e.g., `example.com`)        |
| `subdomain`             | ❌       | `ifs`                | Subdomain for the app                    |
| `cloudflare_account_id` | ✅       | -                    | Cloudflare Account ID                    |
| `cloudflare_zone_id`    | ✅       | -                    | Cloudflare Zone ID                       |
| `aws_region`            | ❌       | `ap-southeast-1`     | AWS region for resources                 |
| `project_name`          | ❌       | `ifs`                | Prefix for resource names                |
| `s3_bucket_name`        | ❌       | `ifs-storage-bucket` | S3 bucket name (must be globally unique) |

## File Structure

```
infra/
├── main.tf          # Providers and backend config
├── variables.tf     # Variable definitions
├── terraform.tfvars # Your configuration values
├── cloudflare.tf    # Cloudflare DNS and Turnstile
├── cloudfront.tf    # CloudFront distribution and ACM cert
├── s3.tf            # S3 bucket and policies
├── lambda.tf        # Lambda function for uploads
├── iam.tf           # IAM roles and policies
└── outputs.tf       # Output values
```
