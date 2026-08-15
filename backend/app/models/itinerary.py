from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Time, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="itineraries")
    days = relationship("ItineraryDay", back_populates="itinerary", cascade="all, delete-orphan", order_by="ItineraryDay.day_number")


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("itineraries.id"), nullable=False)
    day_number = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)

    itinerary = relationship("Itinerary", back_populates="days")
    stops = relationship("ItineraryStop", back_populates="day", cascade="all, delete-orphan", order_by="ItineraryStop.order_index")


class ItineraryStop(Base):
    __tablename__ = "itinerary_stops"

    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("itinerary_days.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    attraction_id = Column(Integer, ForeignKey("attractions.id"), nullable=True)
    custom_label = Column(String(150), nullable=True)  # used if not linked to a catalog attraction
    planned_time = Column(Time, nullable=True)
    notes = Column(Text, nullable=True)

    day = relationship("ItineraryDay", back_populates="stops")
    attraction = relationship("Attraction")
