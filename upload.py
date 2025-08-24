import boto3
import json
import urllib.parse

s3_client = boto3.client("s3")


def lambda_handler(event, context):
    origin = event["headers"].get("origin")

    # Prevent programmatic access, TODO: add authentication to lambda
    if origin != "https://ifs.kenf.dev":
        return {"statusCode": 403, "body": "Forbidden"}

    try:
        bucket_name = "ifs-storage-bucket"
        file_name = json.loads(event["body"])["file_name"]
        original_filename = json.loads(event["body"])["original_filename"]
        
        tags = urllib.parse.urlencode({"expiration": "86400"})

        conditions = [
            # {"acl": "public-read"},
            ["content-length-range", 1, 524288000], # allow 500MiB size
            ["eq", "$Content-Disposition", f"attachment; filename=\"{original_filename}\""],
            ["eq", "$x-amz-tagging", tags]          # Condition to match the tagging
        ]

        presigned_url = s3_client.generate_presigned_post(
            Bucket=bucket_name,
            Key=file_name,
            Fields={
               "Content-Disposition": f"attachment; filename=\"{original_filename}\"",
                "x-amz-tagging": tags
            },
            Conditions=conditions
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"upload_url": presigned_url}),
        }

    except Exception as e:
        return {"statusCode": 500, "body": f"Error generating presigned URL: {e}"}


if __name__ == "__main__":
    test_event = {
        "headers": {"origin": "https://ifs.kenf.dev"},
        "body": json.dumps({
            "file_name": "1234.txt",
            "original_filename": "test.txt"
        })
    }
    test_context = {}
    response = lambda_handler(test_event, test_context)
    print(response)