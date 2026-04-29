import os
import json
import re
import boto3
import secrets
import urllib

MAX_FILE_SIZE_BYTES = 524288000
EXPIRATION_SECONDS = "86400"
PREFIX_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{1,32}$")
TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
TAGGING_XML = (
    "<Tagging><TagSet><Tag><Key>expiration</Key>"
    f"<Value>{EXPIRATION_SECONDS}</Value></Tag></TagSet></Tagging>"
)


def get_s3_client():
    region = os.environ.get("AWS_REGION", "ap-southeast-1")
    endpoint_url = f"https://s3.{region}.amazonaws.com"
    return boto3.client("s3", region_name=region, endpoint_url=endpoint_url)


s3_client = get_s3_client()


def error_response(status_code, message):
    return {"statusCode": status_code, "body": message}


def success_response(upload_url, file_id):
    return {
        "statusCode": 200,
        "body": json.dumps({"upload_url": upload_url, "file_id": file_id}),
    }


def parse_body(event):
    return json.loads(event["body"])


def verify_turnstile_token(turnstile_token):
    if not turnstile_token:
        return error_response(400, "Missing CAPTCHA token")

    secret_key = os.environ.get("TURNSTILE_SECRET_KEY")
    if not secret_key:
        print("TURNSTILE_SECRET_KEY is not set")
        return error_response(500, "Server configuration error")

    payload = urllib.parse.urlencode(
        {"secret": secret_key, "response": turnstile_token}
    ).encode()
    request = urllib.request.Request(TURNSTILE_VERIFY_URL, data=payload)

    with urllib.request.urlopen(request) as response:
        result = json.loads(response.read().decode())

    if result.get("success"):
        return None

    return error_response(403, "CAPTCHA verification failed")


def generate_file_id(custom_prefix):
    prefix = custom_prefix.strip()
    hex_code = secrets.token_hex(2)

    if not prefix:
        return hex_code, None

    if not PREFIX_PATTERN.match(prefix):
        return None, error_response(
            400,
            "Invalid prefix. Use only letters, numbers, hyphens, and underscores (max 32 chars).",
        )

    return f"{prefix}-{hex_code}", None


def build_upload_fields(original_filename):
    content_disposition = f'attachment; filename="{original_filename}"'
    return {
        "Content-Disposition": content_disposition,
        "tagging": TAGGING_XML,
    }


def build_upload_conditions(original_filename):
    fields = build_upload_fields(original_filename)
    return [
        ["content-length-range", 1, MAX_FILE_SIZE_BYTES],
        ["eq", "$Content-Disposition", fields["Content-Disposition"]],
        {"tagging": fields["tagging"]},
    ]


def generate_presigned_upload(bucket_name, file_id, original_filename):
    return s3_client.generate_presigned_post(
        Bucket=bucket_name,
        Key=file_id,
        Fields=build_upload_fields(original_filename),
        Conditions=build_upload_conditions(original_filename),
    )


def lambda_handler(event, context):
    try:
        body_data = parse_body(event)

        turnstile_error = verify_turnstile_token(body_data.get("turnstile_token"))
        if turnstile_error:
            return turnstile_error

        file_id, prefix_error = generate_file_id(body_data.get("custom_prefix", ""))
        if prefix_error:
            return prefix_error

        bucket_name = os.environ.get("S3_BUCKET_NAME", "ifs-storage-bucket")
        original_filename = body_data["original_filename"]
        presigned_url = generate_presigned_upload(
            bucket_name, file_id, original_filename
        )

        return success_response(presigned_url, file_id)
    except Exception as error:
        return error_response(
            500, f"Error generating presigned URL: {error}"
        )


if __name__ == "__main__":
    test_event = {
        "headers": {"origin": "https://ifs-app.kenf.dev"},
        "body": json.dumps({"file_name": "1234.txt", "original_filename": "test.txt"}),
    }
    test_context = {}
    response = lambda_handler(test_event, test_context)
    print(response)
