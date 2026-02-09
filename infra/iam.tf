resource "aws_iam_role" "lambda_role" {
  name = "lambda_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "allow_s3_access" {
  name        = "allow_s3_policy"
  description = "Grant access to S3"

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Action" : [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:PutObjectTagging"
        ],
        "Resource" : [
          "arn:aws:s3:::ifs-storage-bucket",
          "arn:aws:s3:::ifs-storage-bucket/*",
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "combined_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.allow_s3_access.arn
}
