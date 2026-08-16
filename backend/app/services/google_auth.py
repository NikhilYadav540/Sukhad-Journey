import json
import urllib.error
import urllib.parse
import urllib.request

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.user import User

USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"


def _get_json(url: str, headers: dict[str, str] | None = None) -> dict:
    req = urllib.request.Request(url, headers=headers or {"Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            return json.loads(resp.read().decode("utf-8", errors="replace"))
    except urllib.error.HTTPError as exc:
        raise HTTPException(status_code=401, detail="Google token was rejected.") from exc
    except urllib.error.URLError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Google to verify login.") from exc


def google_profile_from_tokens(*, credential: str | None, access_token: str | None) -> dict:
    settings = get_settings()
    client_id = (settings.google_client_id or "").strip()
    if not client_id:
        raise HTTPException(status_code=503, detail="Google login is not configured on the server.")

    if credential:
        data = _get_json(f"{TOKENINFO_URL}?id_token={urllib.parse.quote(credential)}")
        if data.get("aud") != client_id:
            raise HTTPException(status_code=401, detail="Google client ID does not match.")
        if str(data.get("email_verified")).lower() not in {"true", "1"}:
            raise HTTPException(status_code=401, detail="Google email is not verified.")
        return data

    if access_token:
        data = _get_json(USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
        if not data.get("email"):
            raise HTTPException(status_code=401, detail="Google did not return an email.")
        return data

    raise HTTPException(status_code=400, detail="Missing Google credential.")


def upsert_google_user(db: Session, profile: dict) -> tuple[User, bool]:
    sub = str(profile.get("sub") or "").strip()
    email = str(profile.get("email") or "").strip().lower()
    name = str(profile.get("name") or profile.get("given_name") or "").strip() or None
    if not sub or not email:
        raise HTTPException(status_code=401, detail="Google profile is incomplete.")

    user = None
    if sub:
        user = db.query(User).filter(User.google_sub == sub).first()
    if not user:
        user = db.query(User).filter(User.email.ilike(email)).first()

    is_new = user is None or not user.full_name
    if not user:
        user = User(
            phone_number=None,
            email=email,
            full_name=name,
            google_sub=sub,
            is_verified=True,
        )
        db.add(user)
        is_new = True
    else:
        user.google_sub = user.google_sub or sub
        user.email = user.email or email
        if name and not user.full_name:
            user.full_name = name
        user.is_verified = True

    db.commit()
    db.refresh(user)
    return user, is_new
