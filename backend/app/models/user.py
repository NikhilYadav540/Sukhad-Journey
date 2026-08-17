from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=True)
    google_sub = Column(String(128), unique=True, index=True, nullable=True)
    full_name = Column(String(120), nullable=True)
    email = Column(String(150), nullable=True, unique=True, index=True)
    password_hash = Column(String(255), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String(30), nullable=True)
    nationality = Column(String(80), nullable=True)
    emergency_contact_name = Column(String(120), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

    otp_code_hash = Column(String(255), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)

    itineraries = relationship("Itinerary", back_populates="owner", cascade="all, delete-orphan")
    tourist_pass = relationship("TouristPass", back_populates="owner", uselist=False, cascade="all, delete-orphan")
    emergency_contacts = relationship("EmergencyContact", back_populates="owner", cascade="all, delete-orphan")
    sos_alerts = relationship("SOSAlert", back_populates="tourist", cascade="all, delete-orphan")
