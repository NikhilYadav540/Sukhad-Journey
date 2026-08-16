import hashlib
import json
import random
import re
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.user import User

settings = get_settings()
FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2"


def _utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


def indian_mobile(phone_number: str) -> str:
    digits = re.sub(r"\D", "", phone_number or "")
    if digits.startswith("91") and len(digits) >= 12:
        digits = digits[-10:]
    if len(digits) != 10:
        raise HTTPException(status_code=400, detail="Enter a valid 10-digit Indian mobile number.")
    return digits


def issue_otp(db: Session, phone_number: str) -> tuple[User, str, str]:
    """Store a new OTP and return (user, otp_code, 10-digit mobile). Does not send SMS."""
    mobile = indian_mobile(phone_number)
    stored = f"+91{mobile}"

    user = db.query(User).filter(User.phone_number.in_([stored, mobile, phone_number])).first()
    if not user:
        user = User(phone_number=stored, is_verified=False)
        db.add(user)

    otp_code = f"{random.randint(0, 999999):06d}"
    user.otp_code_hash = _hash_otp(otp_code)
    user.otp_expires_at = _utcnow_naive() + timedelta(seconds=settings.otp_expire_seconds)
    db.commit()
    db.refresh(user)
    return user, otp_code, mobile


def generate_and_send_otp(db: Session, phone_number: str) -> tuple[User, str, str | None]:
    user, otp_code, mobile = issue_otp(db, phone_number)
    return user, otp_code, _dispatch_sms(mobile, otp_code)


def verify_otp(db: Session, phone_number: str, otp_code: str) -> User | None:
    mobile = indian_mobile(phone_number)
    stored = f"+91{mobile}"
    user = db.query(User).filter(User.phone_number.in_([stored, mobile, phone_number])).first()
    if not user or not user.otp_code_hash or not user.otp_expires_at:
        return None
    if _utcnow_naive() > user.otp_expires_at:
        return None
    if user.otp_code_hash != _hash_otp(otp_code.strip()):
        return None

    user.phone_number = stored
    user.is_verified = True
    user.otp_code_hash = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)
    return user


def _post_fast2sms(payload: dict) -> dict:
    api_key = (settings.sms_provider_api_key or "").strip()
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        FAST2SMS_URL,
        data=data,
        headers={
            "authorization": api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            parsed = {"return": False, "message": raw or f"HTTP {exc.code}"}
        parsed.setdefault("return", False)
        return parsed
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"return": True, "raw": raw}


def _flatten_sms_message(value) -> str:
    if isinstance(value, list):
        return " ".join(str(item) for item in value if item)
    return str(value or "").strip()


def dispatch_sms(mobile: str, otp_code: str) -> str | None:
    """Send OTP SMS. Safe to run after the HTTP response (does not use the DB)."""
    try:
        return _dispatch_sms(mobile, otp_code)
    except Exception as exc:
        print(f"[OTP] SMS dispatch failed: {exc}")
        return str(exc)


def _dispatch_sms(mobile: str, otp_code: str) -> str | None:
    print(f"[OTP] {otp_code} -> +91{mobile}")
    api_key = (settings.sms_provider_api_key or "").strip()
    if not api_key:
        print("[OTP] SMS_PROVIDER_API_KEY missing — OTP logged only.")
        return "SMS_PROVIDER_API_KEY missing"

    attempts = [
        {
            "route": "q",
            "message": f"Your Sukhad-Journey OTP is {otp_code}. Valid for 5 minutes.",
            "language": "english",
            "flash": 0,
            "numbers": mobile,
        },
        {
            "route": "otp",
            "variables_values": otp_code,
            "numbers": mobile,
            "flash": 0,
        },
    ]
    errors: list[str] = []
    for payload in attempts:
        body = _post_fast2sms(payload)
        print(f"[OTP] Fast2SMS {payload['route']}: {body}")
        if body.get("return") is True or str(body.get("status_code")) in {"200", "900"}:
            return None
        errors.append(_flatten_sms_message(body.get("message")) or f"Fast2SMS route {payload['route']} failed")
        # Account/wallet blocks apply to every route — don't wait on a second failed call.
        if str(body.get("status_code")) in {"996", "999"}:
            break

    return " | ".join(dict.fromkeys(errors)) or "Could not send OTP SMS."
