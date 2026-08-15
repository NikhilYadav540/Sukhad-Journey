import random
import hashlib
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.user import User
from app.config import get_settings

settings = get_settings()


def _utcnow_naive() -> datetime:
    """SQLite (and MySQL) drop tzinfo on round-trip through a DateTime column,
    so we store and compare naive UTC datetimes consistently everywhere to
    avoid 'can't compare offset-naive and offset-aware datetimes' errors.
    If you move to Postgres with TIMESTAMPTZ columns, this can go back to
    timezone-aware datetimes throughout."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


def generate_and_send_otp(db: Session, phone_number: str) -> User:
    """Creates the user record if new, attaches a fresh hashed OTP, and
    dispatches it via the SMS provider. Returns the (possibly new) user."""
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user:
        user = User(phone_number=phone_number, is_verified=False)
        db.add(user)

    otp_code = f"{random.randint(0, 999999):06d}"
    user.otp_code_hash = _hash_otp(otp_code)
    user.otp_expires_at = _utcnow_naive() + timedelta(seconds=settings.otp_expire_seconds)
    db.commit()
    db.refresh(user)

    _dispatch_sms(phone_number, otp_code)
    return user


def verify_otp(db: Session, phone_number: str, otp_code: str) -> User | None:
    user = db.query(User).filter(User.phone_number == phone_number).first()
    if not user or not user.otp_code_hash or not user.otp_expires_at:
        return None
    if _utcnow_naive() > user.otp_expires_at:
        return None
    if user.otp_code_hash != _hash_otp(otp_code):
        return None

    user.is_verified = True
    user.otp_code_hash = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)
    return user


def _dispatch_sms(phone_number: str, otp_code: str) -> None:
    """Swap this for a real gateway call (e.g. Twilio, MSG91) in production.
    In development we just log it."""
    if settings.environment == "development":
        print(f"[DEV OTP] Sending OTP {otp_code} to {phone_number}")
    else:
        # Example: httpx.post(SMS_PROVIDER_URL, json={...}, headers={"Authorization": settings.sms_provider_api_key})
        pass
