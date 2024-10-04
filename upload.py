import hashlib
import boto3
import sys


def hash_file(file_path):
    """Generate SHA-256 hash of the file."""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def upload_to_s3(file_path, bucket_name):
    """Upload file to S3 with key as first 4 characters of the hash."""
    # Generate file hash
    file_hash = hash_file(file_path)
    file_key = file_hash[:4]

    # Initialize S3 client
    s3_client = boto3.client("s3")

    # Upload file
    try:
        # Upload file with an expiration of 3 days
        s3_client.upload_file(file_path, bucket_name, f"{file_key}")

        # Set the file to expire after 3 days (259200 seconds) and be downloadable
        s3_client.put_object_tagging(
            Bucket=bucket_name,
            Key=file_key,
            Tagging={
            "TagSet": [
                {"Key": "expiration", "Value": "259200"},  # 3 days in seconds
                {"Key": "Content-Disposition", "Value": "attachment"}
            ]
            },
        )
        # Set the file to be publicly readable
        s3_client.put_object_acl(
            Bucket=bucket_name,
            Key=file_key,
            ACL='public-read'
        )
        print(f"File uploaded successfully with key: {file_key}")
    except Exception as e:
        print(f"Error uploading file: {e}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python upload.py <file_path> <bucket_name>")
        sys.exit(1)

    file_path = sys.argv[1]
    bucket_name = sys.argv[2]

    upload_to_s3(file_path, bucket_name)
