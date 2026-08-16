"""Turn DB image values into public URLs.

Stored values may be:
- a full http(s) URL (Unsplash, Wikimedia, …)
- a Storage object path like ``attractions/gateway-of-india.jpg``
"""

from app.config import get_settings


def public_media_url(value: str | None, default_bucket: str | None = None) -> str | None:
    if not value:
        return None
    if value.startswith("http://") or value.startswith("https://"):
        return value

    settings = get_settings()
    base = (settings.supabase_url or "").rstrip("/")
    path = value.lstrip("/")

    if default_bucket and "/" not in path:
        bucket, object_path = default_bucket, path
    elif "/" in path:
        bucket, object_path = path.split("/", 1)
    else:
        return value

    if not base:
        return value
    return f"{base}/storage/v1/object/public/{bucket}/{object_path}"
