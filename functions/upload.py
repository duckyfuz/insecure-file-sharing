import os
import json
import boto3
import secrets
import urllib

s3_client = boto3.client("s3")


def lambda_handler(event, context):
    try:

        body_data = json.loads(event["body"])

        # Verify Turnstile Token
        turnstile_token = body_data.get("turnstile_token")
        if not turnstile_token:
            return {"statusCode": 400, "body": "Missing CAPTCHA token"}

        secret_key = os.environ.get("TURNSTILE_SECRET_KEY")
        if secret_key:
            # Verify with Cloudflare
            url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
            data = urllib.parse.urlencode(
                {"secret": secret_key, "response": turnstile_token}
            ).encode()

            req = urllib.request.Request(url, data=data)
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())
                if not result.get("success"):
                    return {"statusCode": 403, "body": "CAPTCHA verification failed"}

        bucket_name = "ifs-storage-bucket"

        # Generate a random 4-character hex string for the file ID
        file_id = secrets.token_hex(2)

        original_filename = body_data["original_filename"]

        conditions = [
            ["content-length-range", 1, 524288000],  # allow up to 500MiB size
            [
                "eq",
                "$Content-Disposition",
                f'attachment; filename="{original_filename}"',
            ],
            {
                "tagging": "<Tagging><TagSet><Tag><Key>expiration</Key><Value>86400</Value></Tag></TagSet></Tagging>",
            },
        ]

        presigned_url = s3_client.generate_presigned_post(
            Bucket=bucket_name,
            Key=file_id,
            Fields={
                "Content-Disposition": f'attachment; filename="{original_filename}"',
                "tagging": "<Tagging><TagSet><Tag><Key>expiration</Key><Value>86400</Value></Tag></TagSet></Tagging>",
            },
            Conditions=conditions,
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"upload_url": presigned_url, "file_id": file_id}),
        }

    except Exception as e:
        return {"statusCode": 500, "body": f"Error generating presigned URL: {e}"}


if __name__ == "__main__":
    test_event = {
        "headers": {"origin": "https://ifs.kenf.dev"},
        "body": json.dumps({"file_name": "1234.txt", "original_filename": "test.txt"}),
    }
    test_context = {}
    response = lambda_handler(test_event, test_context)
    print(response)
