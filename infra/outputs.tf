output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.s3_distribution.domain_name
}

output "preview_url" {
  value       = local.app_url
  description = "Application URL. For previews this is the CloudFront domain."
}
