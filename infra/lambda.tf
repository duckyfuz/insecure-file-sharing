data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.module}/../functions/upload.py"
  output_path = "${path.module}/lambda_function_payload.zip"
}

resource "aws_lambda_function" "upload_function" {
  filename         = "${path.module}/lambda_function_payload.zip"
  function_name    = "${local.resource_name}_upload_function"
  role             = aws_iam_role.lambda_role.arn
  handler          = "upload.lambda_handler"
  runtime          = "python3.11"
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      TURNSTILE_SECRET_KEY = local.turnstile_secret_key
      S3_BUCKET_NAME       = local.bucket_name
      DDB_TABLE_NAME       = aws_dynamodb_table.counters.name
    }
  }
}

resource "aws_lambda_function_url" "upload_function_url" {
  function_name      = aws_lambda_function.upload_function.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = [local.app_url]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    expose_headers    = ["*"]
    max_age           = 86400
  }
}

resource "aws_cloudwatch_log_group" "upload_function_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.upload_function.function_name}"
  retention_in_days = 14
}
