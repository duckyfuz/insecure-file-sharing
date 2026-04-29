import os
import json
import re
import boto3
import secrets
import urllib

MAX_FILE_SIZE_BYTES = 524288000
EXPIRATION_SECONDS = "86400"
PREFIX_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{1,32}$")
FILENAME_MAX_LENGTH = 255
FILENAME_FORBIDDEN = re.compile(r"[\x00-\x1f\x7f]")
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
ddb_client = boto3.resource("dynamodb")
ddb_table_name = os.environ.get("DDB_TABLE_NAME", "ifs_counters")


def get_counters_table():
    return ddb_client.Table(ddb_table_name)


def increment_counter(counter_name):
    table = get_counters_table()
    table.update_item(
        Key={"counter_name": counter_name},
        UpdateExpression="ADD #c :inc",
        ExpressionAttributeNames={"#c": "count"},
        ExpressionAttributeValues={":inc": 1},
    )


def get_counters():
    table = get_counters_table()
    uploads = table.get_item(Key={"counter_name": "uploads"}).get("Item", {})
    downloads = table.get_item(Key={"counter_name": "downloads"}).get("Item", {})
    return {
        "uploads": int(uploads.get("count", 0)),
        "downloads": int(downloads.get("count", 0)),
    }


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
        return None

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


def validate_filename(filename):
    if not isinstance(filename, str):
        return None, error_response(400, "Invalid filename.")

    name = os.path.basename(filename.replace("\\", "/")).strip()

    if not name:
        return None, error_response(400, "Filename is required.")

    if len(name) > FILENAME_MAX_LENGTH:
        return None, error_response(
            400, f"Filename exceeds {FILENAME_MAX_LENGTH} characters."
        )

    if FILENAME_FORBIDDEN.search(name):
        return None, error_response(400, "Filename contains invalid characters.")

    return name, None


def build_content_disposition(filename):
    ascii_fallback = re.sub(r'[^\x20-\x7e]', "_", filename)
    ascii_fallback = ascii_fallback.replace("\\", "").replace('"', "")
    encoded = urllib.parse.quote(filename, safe="")
    return f'attachment; filename="{ascii_fallback}"; filename*=UTF-8\'\'{encoded}'


def build_upload_fields(original_filename):
    return {
        "Content-Disposition": build_content_disposition(original_filename),
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


def handle_get_counters():
    try:
        counters = get_counters()
        return {
            "statusCode": 200,
            "body": json.dumps(counters),
        }
    except Exception as error:
        return error_response(500, f"Error reading counters: {error}")


def handle_increment_download():
    try:
        increment_counter("downloads")
        return {"statusCode": 200, "body": json.dumps({"ok": True})}
    except Exception as error:
        return error_response(500, f"Error incrementing counter: {error}")


def handle_upload(event):
    body_data = parse_body(event)

    turnstile_error = verify_turnstile_token(body_data.get("turnstile_token"))
    if turnstile_error:
        return turnstile_error

    file_id, prefix_error = generate_file_id(body_data.get("custom_prefix", ""))
    if prefix_error:
        return prefix_error

    bucket_name = os.environ.get("S3_BUCKET_NAME", "ifs-storage-bucket")
    original_filename, filename_error = validate_filename(
        body_data.get("original_filename", "")
    )
    if filename_error:
        return filename_error
    presigned_url = generate_presigned_upload(
        bucket_name, file_id, original_filename
    )

    try:
        increment_counter("uploads")
    except Exception:
        pass

    return success_response(presigned_url, file_id)


def lambda_handler(event, context):
    try:
        http_method = event.get("requestContext", {}).get("http", {}).get("method", "POST")

        if http_method == "GET":
            return handle_get_counters()

        body_data = parse_body(event)

        if body_data.get("action") == "increment_download":
            return handle_increment_download()

        return handle_upload(event)
    except Exception as error:
        return error_response(
            500, f"Error processing request: {error}"
        )


if __name__ == "__main__":
    test_event = {
        "headers": {"origin": "https://ifs-app.kenf.dev"},
        "body": json.dumps({"file_name": "1234.txt", "original_filename": "test.txt"}),
    }
    test_context = {}
    response = lambda_handler(test_event, test_context)
    print(response)
