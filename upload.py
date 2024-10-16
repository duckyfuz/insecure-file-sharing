import hashlib
import boto3
import sys
import base64
import os
import json


def hash_file(file_path):
    """Generate SHA-256 hash of the file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def upload_to_s3(file_path, bucket_name):
    """Upload file to S3 with key as 4 characters of the hash."""

    s3_client = boto3.client("s3")

    try:
        file_hash = hash_file(file_path)
        file_extension = file_path.split(".")[-1]

        s3_client = boto3.client("s3")

        # Check if the file key already exists
        exists = True
        index = 0
        while exists:
            try:
                file_key = file_hash[index : index + 4]
                file_key_with_extension = f"{file_key}.{file_extension}"
                index += 1
                s3_client.head_object(Bucket=bucket_name, Key=file_key_with_extension)
            except s3_client.exceptions.ClientError as e:
                if e.response["Error"]["Code"] == "404":
                    exists = False
                else:
                    raise e

        s3_client.upload_file(file_path, bucket_name, file_key_with_extension)

        # Set the file to expire after 3 days (259200 seconds) and be downloadable
        s3_client.put_object_tagging(
            Bucket=bucket_name,
            Key=file_key_with_extension,
            Tagging={
                "TagSet": [
                    {"Key": "expiration", "Value": "259200"},  # 3 days in seconds
                    {"Key": "Content-Disposition", "Value": "attachment"},
                ]
            },
        )
        return file_key_with_extension
    except Exception as e:
        print(f"Error uploading file: {e}")


def lambda_handler(event, context):
    origin = event["headers"].get("origin")

    if origin != "https://ifs.kenf.dev":
        return {"statusCode": 403, "body": "Forbidden"}

    try:
        # Decode the base64 file content
        file_content = base64.b64decode(json.loads(event["body"])["file_content"])
        file_name = json.loads(event["body"])["file_name"]
        bucket_name = "ifs-storage-bucket"

        if len(file_content) > 5 * 1024 * 1024:
            return {"statusCode": 413, "body": "File size exceeds the 5MB limit"}

        # Save the file content to a temporary file
        temp_file_path = f"/tmp/{file_name}"
        with open(temp_file_path, "wb") as temp_file:
            temp_file.write(file_content)

        # Upload the temporary file to S3
        file_key_with_extension = upload_to_s3(temp_file_path, bucket_name)

        # Delete the temporary file after uploading
        os.remove(temp_file_path)

        return {
            "statusCode": 200,
            "body": json.dumps(
                {"file_url": f"https://ifs.kenf.dev/{file_key_with_extension}"}
            ),
        }
    except Exception as e:
        return {"statusCode": 500, "body": f"Error uploading file: {e}"}


if __name__ == "__main__":
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("Usage: python upload.py <file_path> [bucket_name]")
        sys.exit(1)

    file_path = sys.argv[1]
    bucket_name = sys.argv[2] if len(sys.argv) == 3 else "ifs-storage-bucket"

    file_key_with_extension = upload_to_s3(file_path, bucket_name)
    print(f"File uploaded successfully with key: {file_key_with_extension}")
    print(f"File URL: https://ifs.kenf.dev/{file_key_with_extension}")
