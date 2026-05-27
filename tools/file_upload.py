"""
File upload tool — handles uploads to Supabase Storage via REST API.

Usage:
    python file_upload.py --file ./script.pdf --bucket contentos-exports
    python file_upload.py --file ./thumbnail.png --bucket contentos-exports --path thumbnails/file.png

Env:
    NEXT_PUBLIC_SUPABASE_URL (required)
    SUPABASE_SERVICE_ROLE_KEY (required)
"""

import os
import json
import argparse
import mimetypes
from typing import Any
from pathlib import Path

import requests


def upload(
    file_path: str,
    bucket: str = "contentos-exports",
    storage_path: str | None = None,
) -> dict[str, Any]:
    supabase_url = os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
    service_key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    dest = storage_path or path.name
    mime_type, _ = mimetypes.guess_type(str(path))
    mime_type = mime_type or "application/octet-stream"

    with open(path, "rb") as f:
        file_bytes = f.read()

    headers = {
        "authorization": f"Bearer {service_key}",
        "content-type": mime_type,
    }

    resp = requests.post(
        f"{supabase_url}/storage/v1/object/{bucket}/{dest}",
        headers=headers,
        data=file_bytes,
        timeout=60,
    )
    resp.raise_for_status()

    public_url = f"{supabase_url}/storage/v1/object/public/{bucket}/{dest}"

    return {
        "path": dest,
        "bucket": bucket,
        "size_bytes": len(file_bytes),
        "mime_type": mime_type,
        "public_url": public_url,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload file to Supabase Storage")
    parser.add_argument("--file", required=True, help="Path to file to upload")
    parser.add_argument("--bucket", default="contentos-exports", help="Storage bucket name")
    parser.add_argument("--path", help="Destination path in bucket (default: filename)")

    args = parser.parse_args()
    result = upload(file_path=args.file, bucket=args.bucket, storage_path=args.path)
    print(json.dumps(result, indent=2))
