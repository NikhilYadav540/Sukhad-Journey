import secrets
import string
import qrcode
from pathlib import Path
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.tourist_pass import TouristPass
from app.models.user import User

QR_OUTPUT_DIR = Path("static/qr_codes")
QR_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def _utcnow_naive() -> datetime:
    """Stored/compared naive to match SQLite's DateTime round-trip behavior."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _generate_pass_code() -> str:
    """Matches the frontend's display format: DID:SUKHAD-XXXXXX"""
    suffix = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    return f"SUKHAD-{suffix}"


def issue_pass(db: Session, user: User, valid_days: int = 14) -> TouristPass:
    existing = db.query(TouristPass).filter(TouristPass.user_id == user.id).first()
    pass_code = _generate_pass_code()
    valid_until = _utcnow_naive() + timedelta(days=valid_days)

    qr_path = QR_OUTPUT_DIR / f"{pass_code}.png"
    qrcode.make(f"DID:{pass_code}").save(qr_path)

    if existing:
        existing.pass_code = pass_code
        existing.qr_image_path = str(qr_path)
        existing.issued_at = _utcnow_naive()
        existing.valid_until = valid_until
        existing.status = "active"
        db.commit()
        db.refresh(existing)
        return existing

    new_pass = TouristPass(
        user_id=user.id,
        pass_code=pass_code,
        qr_image_path=str(qr_path),
        valid_until=valid_until,
        status="active",
    )
    db.add(new_pass)
    db.commit()
    db.refresh(new_pass)
    return new_pass


def verify_pass(db: Session, pass_code: str) -> TouristPass | None:
    """Used by field staff / check-in kiosks scanning the QR."""
    record = db.query(TouristPass).filter(TouristPass.pass_code == pass_code).first()
    if not record:
        return None
    if record.valid_until < _utcnow_naive():
        record.status = "expired"
        db.commit()
    return record
