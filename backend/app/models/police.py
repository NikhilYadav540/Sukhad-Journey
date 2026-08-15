from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


def _utcnow_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class PoliceOfficer(Base):
    """Separate, simple credential set for the /police dashboard — deliberately not
    part of the tourist User table since it's a different trust boundary."""
    __tablename__ = "police_officers"

    id = Column(Integer, primary_key=True, index=True)
    badge_id = Column(String(40), unique=True, nullable=False, index=True)
    full_name = Column(String(120), nullable=False)
    password_hash = Column(String(255), nullable=False)
    precinct = Column(String(120), nullable=True)


class SOSAlert(Base):
    __tablename__ = "sos_alerts"

    id = Column(Integer, primary_key=True, index=True)
    tourist_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable: guests can also trigger SOS
    guest_label = Column(String(60), nullable=True)  # e.g. "Guest Traveler" when tourist_id is null

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_label = Column(String(150), nullable=True)  # reverse-geocoded or user-supplied
    note = Column(Text, nullable=True)

    status = Column(String(30), default="ACTIVE EMERGENCY")  # ACTIVE EMERGENCY | PENDING INVESTIGATION | RESOLVED
    risk = Column(String(20), default="High")
    created_at = Column(DateTime, default=_utcnow_naive)
    resolved_at = Column(DateTime, nullable=True)

    tourist = relationship("User", back_populates="sos_alerts")
