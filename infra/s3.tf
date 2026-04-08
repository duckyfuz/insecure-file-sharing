locals {
  web_styles_content = file("${path.module}/../apps/web/styles.css")
  web_app_content    = file("${path.module}/../apps/web/app.js")
  web_styles_hash    = substr(md5(local.web_styles_content), 0, 8)
  web_app_hash       = substr(md5(local.web_app_content), 0, 8)
  web_styles_key     = "styles.${local.web_styles_hash}.css"
  web_app_key        = "app.${local.web_app_hash}.js"
  processed_content = templatefile("${path.module}/../apps/web/index.html", {
    api_url            = aws_lambda_function_url.upload_function_url.function_url
    turnstile_site_key = local.turnstile_site_key
    analytics_script   = var.rybbit_site_id != "" ? "<script src=\"${var.rybbit_src}\" data-site-id=\"${var.rybbit_site_id}\" defer></script>" : ""
    styles_asset_path  = local.web_styles_key
    app_asset_path     = local.web_app_key
  })
}

resource "aws_s3_bucket" "main_bucket" {
  bucket        = local.bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_cors_configuration" "allow_cors" {
  bucket = aws_s3_bucket.main_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST"]
    allowed_origins = [local.app_url]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "one_day_lifetime" {
  bucket = aws_s3_bucket.main_bucket.id
  rule {
    id     = "delete-objects-after-one-day"
    status = "Enabled"
    filter {
      tag {
        key   = "expiration"
        value = "86400"
      }
    }
    expiration {
      days = 1
    }
  }
}


resource "aws_s3_bucket_public_access_block" "allow_public_acl" {
  bucket = aws_s3_bucket.main_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "s3_site_config" {
  bucket = aws_s3_bucket.main_bucket.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_object" "web_index_html" {
  bucket        = aws_s3_bucket.main_bucket.bucket
  key           = "index.html"
  content_type  = "text/html"
  etag          = md5(local.processed_content)
  cache_control = "no-cache, no-store, must-revalidate"

  content = local.processed_content

  depends_on = [
    aws_s3_object.web_styles_css,
    aws_s3_object.web_app_js,
  ]
}

resource "aws_s3_object" "web_styles_css" {
  bucket        = aws_s3_bucket.main_bucket.bucket
  key           = local.web_styles_key
  content_type  = "text/css"
  etag          = md5(local.web_styles_content)
  cache_control = "public, max-age=31536000, immutable"

  content = local.web_styles_content
}

resource "aws_s3_object" "web_app_js" {
  bucket        = aws_s3_bucket.main_bucket.bucket
  key           = local.web_app_key
  content_type  = "application/javascript"
  etag          = md5(local.web_app_content)
  cache_control = "public, max-age=31536000, immutable"

  content = local.web_app_content
}

resource "aws_s3_bucket_policy" "main_bucket_policy" {
  bucket = aws_s3_bucket.main_bucket.bucket

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${aws_cloudfront_origin_access_identity.oai.id}"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.main_bucket.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.allow_public_acl]
}
