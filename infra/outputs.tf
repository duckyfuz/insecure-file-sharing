output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.s3_distribution.domain_name
}

output "preview_url" {
  value       = "https://${aws_cloudfront_distribution.s3_distribution.domain_name}"
  description = "Direct URL for the preview environment (CloudFront domain)."
}
