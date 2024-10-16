import boto3
import json


def lambda_handler(event, context):
    origin = event["headers"].get("origin")

    if origin != "https://ifs.kenf.dev":
        return {"statusCode": 403, "body": "Forbidden"}

    try:
        bucket_name = "ifs-storage-bucket"
        file_name = json.loads(event["body"])["file_name"]

        s3_client = boto3.client("s3")
        presigned_url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": bucket_name,
                "Key": file_name,
                "ContentType": "application/octet-stream",
                "Tagging": "expiration=86400&Content-Disposition=attachment",
            },
            ExpiresIn=3600,  # URL expires in 1 hour
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"upload_url": presigned_url}),
        }
    except Exception as e:
        return {"statusCode": 500, "body": f"Error generating presigned URL: {e}"}
