import boto3
import json

s3_client = boto3.client("s3")


def lambda_handler(event, context):
    origin = event["headers"].get("origin")

    # Prevent programmatic access, TODO: add authentication to lambda
    if origin != "https://ifs.kenf.dev":
        return {"statusCode": 403, "body": "Forbidden"}

    try:
        bucket_name = "ifs-storage-bucket"
        
        body_data = json.loads(event["body"])
        file_name = body_data["file_name"]
        original_filename = body_data["original_filename"]

        conditions = [
            ["content-length-range", 1, 524288000],  # allow up to 500MiB size
            ["eq", "$Content-Disposition", f"attachment; filename=\"{original_filename}\""],
            {'tagging': '<Tagging><TagSet><Tag><Key>expiration</Key><Value>86400</Value></Tag></TagSet></Tagging>',}
        ]

        presigned_url = s3_client.generate_presigned_post(
            Bucket=bucket_name,
            Key=file_name,
            Fields={
                "Content-Disposition": f"attachment; filename=\"{original_filename}\"",
                'tagging': '<Tagging><TagSet><Tag><Key>expiration</Key><Value>86400</Value></Tag></TagSet></Tagging>'
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