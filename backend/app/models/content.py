from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Attraction(Base):
    """Matches NEARBY_ATTRACTIONS in app/tourist/page.tsx."""
    __tablename__ = "attractions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    region = Column(String(80), nullable=False, index=True)  # "South Mumbai", "Western Suburbs (Borivali)", etc.
    category = Column(String(80), nullable=False)  # "Historical Monument", "Coastal Boulevard", ...
    rating = Column(Float, default=0.0)
    distance = Column(String(40), nullable=True)  # display string e.g. "1.2 km" (kept as text like the mock)
    safety_status = Column(String(60), nullable=True)  # e.g. "Safe Zone ✓"
    image = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    map_query = Column(String(200), nullable=True)  # used to build the Google Maps search URL


class Hotel(Base):
    """Matches NEARBY_HOTELS."""
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)  # "5-Star Luxury Heritage"
    rating = Column(Float, default=0.0)
    price_range = Column(String(60), nullable=True)  # "₹22,000 / night"
    distance = Column(String(40), nullable=True)
    description = Column(Text, nullable=True)


class FoodSpot(Base):
    """Matches MUST_TRY_FOOD."""
    __tablename__ = "food_spots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    cuisine = Column(String(120), nullable=False)
    must_try_dish = Column(String(150), nullable=True)
    rating = Column(Float, default=0.0)
    distance = Column(String(40), nullable=True)
    description = Column(Text, nullable=True)


class EmergencyServiceCategory(Base):
    """Matches EMERGENCY_SERVICES top-level groups (hospitals, tourist police, pharmacies)."""
    __tablename__ = "emergency_service_categories"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)  # "24/7 Hospitals"
    icon_key = Column(String(40), nullable=False)  # "hospital" | "siren" | "pill" -> mapped to lucide icon client-side
    color = Column(String(30), nullable=True)

    items = relationship("EmergencyServiceItem", back_populates="category_ref", cascade="all, delete-orphan")


class EmergencyServiceItem(Base):
    __tablename__ = "emergency_service_items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("emergency_service_categories.id"), nullable=False)
    name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)
    distance = Column(String(40), nullable=True)
    location = Column(String(100), nullable=True)

    category_ref = relationship("EmergencyServiceCategory", back_populates="items")


class LocalScam(Base):
    """Matches LOCAL_SCAMS."""
    __tablename__ = "local_scams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    location = Column(String(150), nullable=True)
    severity = Column(String(30), nullable=False)  # "High Risk" | "Moderate" | "Low Risk"
    description = Column(Text, nullable=True)
    prevention = Column(Text, nullable=True)


class PhraseCategory(Base):
    """Matches LOCAL_PHRASES groups."""
    __tablename__ = "phrase_categories"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(80), nullable=False)

    phrases = relationship("Phrase", back_populates="category_ref", cascade="all, delete-orphan")


class Phrase(Base):
    __tablename__ = "phrases"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("phrase_categories.id"), nullable=False)
    hindi = Column(String(150), nullable=False)
    translation = Column(String(255), nullable=False)
    phonetic = Column(String(150), nullable=True)

    category_ref = relationship("PhraseCategory", back_populates="phrases")


class SmartItinerary(Base):
    """Curated, editorial itineraries (SMART_ITINERARIES) — distinct from user-built Itinerary."""
    __tablename__ = "smart_itineraries"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(60), unique=True, nullable=False)
    title = Column(String(150), nullable=False)
    subtitle = Column(String(255), nullable=True)

    time_slots = relationship("SmartItineraryTimeSlot", back_populates="itinerary", cascade="all, delete-orphan", order_by="SmartItineraryTimeSlot.id")


class SmartItineraryTimeSlot(Base):
    __tablename__ = "smart_itinerary_time_slots"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_id = Column(Integer, ForeignKey("smart_itineraries.id"), nullable=False)
    time_label = Column(String(40), nullable=False)  # "09:00 AM" or "Day 1"
    activity = Column(String(255), nullable=False)
    note = Column(String(255), nullable=True)

    itinerary = relationship("SmartItinerary", back_populates="time_slots")


class MMRArea(Base):
    """Matches MMR_AREAS in components/MMRAreaGuide.tsx."""
    __tablename__ = "mmr_areas"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(60), unique=True, nullable=False)
    name = Column(String(120), nullable=False)
    region = Column(String(40), nullable=False)  # "Western Line" | "Central Line" | "Extended MMR"
    safety_score = Column(Integer, nullable=False)
    safety_tag = Column(String(150), nullable=True)
    vibe = Column(Text, nullable=True)
    transit_and_safety_tip = Column(Text, nullable=True)

    recommended_spots = relationship("MMRAreaSpot", back_populates="area", cascade="all, delete-orphan")
    food_highlights = relationship("MMRAreaFood", back_populates="area", cascade="all, delete-orphan")


class MMRAreaSpot(Base):
    __tablename__ = "mmr_area_spots"

    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("mmr_areas.id"), nullable=False)
    title = Column(String(150), nullable=False)
    type = Column(String(80), nullable=True)
    description = Column(Text, nullable=True)
    highlight = Column(String(120), nullable=True)

    area = relationship("MMRArea", back_populates="recommended_spots")


class MMRAreaFood(Base):
    __tablename__ = "mmr_area_food"

    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("mmr_areas.id"), nullable=False)
    spot = Column(String(150), nullable=False)
    dish = Column(String(200), nullable=True)
    type = Column(String(80), nullable=True)

    area = relationship("MMRArea", back_populates="food_highlights")
