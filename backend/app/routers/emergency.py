from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.core.deps import get_current_user_required, get_current_user_optional
from app.models.user import User
from app.models.tourist_pass import EmergencyContact
from app.models.police import SOSAlert
from app.schemas.user import EmergencyContactIn, EmergencyContactOut
from app.config import get_settings

router = APIRouter(prefix="/api/emergency", tags=["emergency"])
settings = get_settings()


class SOSAlertRequest(BaseModel):
    latitude: float
    longitude: float
    location_label: str | None = None
    note: str | None = None


@router.get("/helpline")
def get_helpline_info():
    """Available in guest mode — no login needed to see emergency numbers."""
    return {
        "national_emergency_number": settings.emergency_helpline_number,
        "tourist_police_note": "Dial 112 for police, ambulance, or fire in Maharashtra.",
    }


@router.post("/sos")
def trigger_sos(
    alert: SOSAlertRequest,
    user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    """
    Called when the tourist holds the SOS button. Creates a real SOSAlert row
    that immediately shows up in the police dashboard's live feed, and (in
    production) would also fan out to registered emergency contacts via SMS.
    """
    sos_record = SOSAlert(
        tourist_id=user.id if user else None,
        guest_label=None if user else "Guest Traveler",
        latitude=alert.latitude,
        longitude=alert.longitude,
        location_label=alert.location_label,
        note=alert.note,
        status="ACTIVE EMERGENCY",
        risk="High",
    )
    db.add(sos_record)
    db.commit()
    db.refresh(sos_record)

    contacts_notified = []
    if user:
        contacts_notified = [c.phone_number for c in user.emergency_contacts]
        # TODO: integrate with actual SMS gateway to notify contacts_notified

    return {
        "status": "alert_dispatched",
        "alert_id": sos_record.id,
        "location": {"latitude": alert.latitude, "longitude": alert.longitude},
        "contacts_notified": contacts_notified,
        "helpline": settings.emergency_helpline_number,
    }


@router.get("/contacts", response_model=list[EmergencyContactOut])
def list_contacts(
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    return user.emergency_contacts


@router.post("/contacts", response_model=EmergencyContactOut, status_code=201)
def add_contact(
    payload: EmergencyContactIn,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    contact = EmergencyContact(user_id=user.id, **payload.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/contacts/{contact_id}", status_code=204)
def delete_contact(
    contact_id: int,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id, EmergencyContact.user_id == user.id
    ).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(contact)
    db.commit()
    return None
