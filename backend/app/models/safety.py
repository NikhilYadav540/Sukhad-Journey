from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


def _utcnow_naive():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class DangerZone(Base):
    __tablename__ = "danger_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    risk_level = Column(String(20), nullable=False)  # red | yellow | green
    crime_rate = Column(Float, nullable=True)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    radius_meters = Column(Integer, nullable=False, default=500)
    description = Column(Text, nullable=True)
    image = Column(String(1000), nullable=True)
    website_url = Column(String(1000), nullable=True)

    crime_reports = relationship("CrimeReport", back_populates="zone")


class CrimeReport(Base):
    __tablename__ = "crime_reports"

    id = Column(Integer, primary_key=True, index=True)
    danger_zone_id = Column(Integer, ForeignKey("danger_zones.id"), nullable=True)
    crime_type = Column(String(120), nullable=False)
    location_label = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(30), nullable=False, default="verified")
    occurred_at = Column(DateTime, default=_utcnow_naive)
    image = Column(String(1000), nullable=True)
    website_url = Column(String(1000), nullable=True)

    zone = relationship("DangerZone", back_populates="crime_reports")


class NewsItem(Base):
    """City / safety headlines. website_url is the article to open."""
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    category = Column(String(80), nullable=True)  # Safety, Transit, Weather, Events
    published_at = Column(DateTime, default=_utcnow_naive)
    image = Column(String(1000), nullable=True)
    website_url = Column(String(1000), nullable=True)
