data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.module}/../upload.py"
  output_path = "lambda_function_payload.zip"
}

resource "aws_lambda_function" "upload_function" {
  filename         = "lambda_function_payload.zip"
  function_name    = "upload_function"
  role             = aws_iam_role.lambda_role.arn
  handler          = "upload.lambda_handler"
  runtime          = "python3.11"
  source_code_hash = data.archive_file.lambda.output_base64sha256

  environment {
    variables = {
      TURNSTILE_SECRET_KEY = cloudflare_turnstile_widget.ifs_widget.secret
    }
  }
}

resource "aws_lambda_function_url" "upload_function_url" {
  function_name      = aws_lambda_function.upload_function.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["https://ifs.kenf.dev"]
    allow_methods     = ["*"]
    allow_headers     = ["*"]
    expose_headers    = ["*"]
    max_age           = 86400
  }
}
