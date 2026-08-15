from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class TouristPass(Base):
    __tablename__ = "tourist_passes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    pass_code = Column(String(64), unique=True, index=True, nullable=False)  # encoded into the QR
    qr_image_path = Column(String(255), nullable=True)
    issued_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    valid_until = Column(DateTime, nullable=False)
    status = Column(String(20), default="active")  # active, expired, revoked

    owner = relationship("User", back_populates="tourist_pass")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(120), nullable=False)
    phone_number = Column(String(15), nullable=False)
    relation = Column(String(60), nullable=True)

    owner = relationship("User", back_populates="emergency_contacts")
