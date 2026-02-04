from fastapi import UploadFile
import cloudinary
import cloudinary.uploader
import re
import asyncio


def configure_cloudinary(url: str):
    cloudinary.config(cloudinary_url=url)


async def upload_file(file: UploadFile, folder: str) -> str:
    content = await file.read()

    result = await asyncio.to_thread(cloudinary.uploader.upload, content, resource_type="auto", folder=folder)
    return result["secure_url"]


async def delete_file_by_url(file_url: str) -> None:
    """Given Cloudinary file URL, delete the file from Cloudinary. Keep in mind that it only works if the file was in a single file folder."""
    # URL example: https://res.cloudinary.com/dsukbbn7k/image/upload/v1756847618/expense-reports/jfagjdljlt1jcfesrtfb.png

    # Regex to capture the part between '/upload/' and extension, ingoring versioning (v1756847618)
    match = re.search(r'/upload/(?:v\d+/)?([^\.]+)', file_url)
    if not match:
        return None

    public_id = match.group(1)
    result = await asyncio.to_thread(
        cloudinary.uploader.destroy,
        public_id,
        resource_type="image",
    )

    # logging for debugging, since it'll be running as a background task
    if result.get("result") != "ok":
        print("Failed to delete file:", result)

    return result
