from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.police import PoliceOfficer, SOSAlert
from app.models.user import User
from app.schemas.police import PoliceLoginRequest, PoliceTokenResponse, SOSAlertOut
from app.core.security import create_access_token, decode_access_token, verify_password

router = APIRouter(prefix="/api/police", tags=["police"])
police_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/police/login")


def get_current_officer(
    token: str = Depends(police_oauth2_scheme),
    db: Session = Depends(get_db),
) -> PoliceOfficer:
    payload = decode_access_token(token)
    if not payload or payload.get("role") != "police":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid police credentials")
    officer = db.query(PoliceOfficer).filter(PoliceOfficer.id == int(payload["sub"])).first()
    if not officer:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Officer not found")
    return officer


@router.post("/login", response_model=PoliceTokenResponse)
def police_login(payload: PoliceLoginRequest, db: Session = Depends(get_db)):
    officer = db.query(PoliceOfficer).filter(PoliceOfficer.badge_id == payload.badge_id).first()
    if not officer or not verify_password(payload.password, officer.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid badge ID or password")

    token = create_access_token(subject=str(officer.id), extra_claims={"role": "police"})
    return PoliceTokenResponse(access_token=token, officer_name=officer.full_name, precinct=officer.precinct)


def _relative_time(dt: datetime) -> str:
    delta = datetime.utcnow() - dt
    minutes = int(delta.total_seconds() // 60)
    if minutes < 1:
        return "Just now"
    if minutes < 60:
        return f"{minutes} mins ago"
    hours = minutes // 60
    return f"{hours} hr{'s' if hours != 1 else ''} ago"


@router.get("/alerts", response_model=list[SOSAlertOut])
def list_alerts(
    officer: "PoliceOfficer" = Depends(get_current_officer),
    db: Session = Depends(get_db),
):
    alerts = db.query(SOSAlert).order_by(SOSAlert.created_at.desc()).all()
    out = []
    for a in alerts:
        tourist = db.query(User).filter(User.id == a.tourist_id).first() if a.tourist_id else None
        out.append(SOSAlertOut(
            id=a.id,
            name=tourist.full_name if tourist and tourist.full_name else (a.guest_label or "Unknown Tourist"),
            did=f"DID:0x{a.id:04d}" if not tourist else f"DID:SUKHAD-{a.tourist_id:06d}",
            phone=tourist.phone_number if tourist else "Not available (guest)",
            location=a.location_label or f"{a.latitude:.4f}, {a.longitude:.4f}",
            lat=a.latitude,
            lng=a.longitude,
            time=_relative_time(a.created_at),
            status=a.status,
            risk=a.risk,
        ))
    return out


@router.patch("/alerts/{alert_id}/status", response_model=SOSAlertOut)
def update_alert_status(
    alert_id: int,
    new_status: str,
    officer: "PoliceOfficer" = Depends(get_current_officer),
    db: Session = Depends(get_db),
):
    alert = db.query(SOSAlert).filter(SOSAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = new_status
    if new_status == "RESOLVED":
        alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)

    tourist = db.query(User).filter(User.id == alert.tourist_id).first() if alert.tourist_id else None
    return SOSAlertOut(
        id=alert.id,
        name=tourist.full_name if tourist and tourist.full_name else (alert.guest_label or "Unknown Tourist"),
        did=f"DID:0x{alert.id:04d}" if not tourist else f"DID:SUKHAD-{alert.tourist_id:06d}",
        phone=tourist.phone_number if tourist else "Not available (guest)",
        location=alert.location_label or f"{alert.latitude:.4f}, {alert.longitude:.4f}",
        lat=alert.latitude,
        lng=alert.longitude,
        time=_relative_time(alert.created_at),
        status=alert.status,
        risk=alert.risk,
    )
