resource "aws_s3_bucket" "main_bucket" {
  bucket        = "ifs-storage-bucket"
  force_destroy = true
}

resource "aws_s3_bucket_cors_configuration" "allow_ifs_cors" {
  bucket = aws_s3_bucket.main_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST"]
    allowed_origins = ["https://ifs.kenf.dev"]
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
        value = "86400"  # Tag value indicating 1 day expiration
      }
    }

    expiration {
      days = 1  # Expire objects after 1 day
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

resource "aws_s3_object" "index_html" {
  bucket       = aws_s3_bucket.main_bucket.bucket
  key          = "index.html"
  content_type = "text/html"
  etag         = filemd5("index.html")

  content = templatefile("index.html", {
    api_url = aws_lambda_function_url.upload_function_url.function_url
  })
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
