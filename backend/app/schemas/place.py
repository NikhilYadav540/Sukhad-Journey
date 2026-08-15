from pydantic import BaseModel
from app.models.place import PlaceCategory, SafetyStatus


class PlaceOut(BaseModel):
    id: int
    name: str
    category: PlaceCategory
    subcategory: str | None
    region: str
    ward: str | None
    address: str | None
    latitude: float
    longitude: float
    rating: float
    price_range: str | None
    safety_status: SafetyStatus
    description: str | None
    image_url: str | None
    nearest_station: str | None
    distance_km: float | None = None  # populated only when user location is supplied

    class Config:
        from_attributes = True
