resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${local.resource_name}"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.main_bucket.bucket_regional_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  # Only set a custom alias in production (alias requires a matching ACM cert)
  aliases = var.is_preview ? [] : [local.fqdn]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  # Production: use the ACM cert for the custom domain.
  # Preview: use the default *.cloudfront.net certificate.
  viewer_certificate {
    acm_certificate_arn            = var.is_preview ? null : aws_acm_certificate_validation.cert[0].certificate_arn
    ssl_support_method             = var.is_preview ? null : "sni-only"
    cloudfront_default_certificate = var.is_preview ? true : false
  }
}

resource "aws_acm_certificate" "subdomain_cert" {
  count             = var.is_preview ? 0 : 1
  provider          = aws.us-east-1
  domain_name       = local.fqdn
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cert" {
  count           = var.is_preview ? 0 : 1
  provider        = aws.us-east-1
  certificate_arn = aws_acm_certificate.subdomain_cert[0].arn
}
