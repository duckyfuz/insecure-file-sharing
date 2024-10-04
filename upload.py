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
    file_hash = hash_file(file_path)
    file_key = file_hash[:4]

    s3_client = boto3.client("s3")

    try:
        file_extension = file_path.split(".")[-1]
        file_key_with_extension = f"{file_key}.{file_extension}"

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


if __name__ == "__main__":
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("Usage: python upload.py <file_path> [bucket_name]")
        sys.exit(1)

    file_path = sys.argv[1]
    bucket_name = sys.argv[2] if len(sys.argv) == 3 else "ifs-storage-bucket"

    file_key_with_extension = upload_to_s3(file_path, bucket_name)
    print(f"File uploaded successfully with key: {file_key_with_extension}")
    print(f"File URL: https://ifs.kenf.dev/{file_key_with_extension}")
     