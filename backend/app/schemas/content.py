from pydantic import BaseModel
from app.core.storage import public_media_url


class AttractionOut(BaseModel):
    id: int
    name: str
    region: str
    category: str
    rating: float
    distance: str | None
    safetyStatus: str | None
    image: str | None
    websiteUrl: str | None = None
    description: str | None
    mapQuery: str | None
    latitude: float | None = None
    longitude: float | None = None

    class Config:
        from_attributes = True
        populate_by_name = True

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.id, name=obj.name, region=obj.region, category=obj.category,
            rating=obj.rating, distance=obj.distance, safetyStatus=obj.safety_status,
            image=public_media_url(obj.image, "attractions"), websiteUrl=obj.website_url,
            description=obj.description, mapQuery=obj.map_query,
            latitude=getattr(obj, "latitude", None), longitude=getattr(obj, "longitude", None),
        )


class HotelOut(BaseModel):
    id: int
    name: str
    category: str
    rating: float
    priceRange: str | None
    distance: str | None
    description: str | None
    image: str | None = None
    websiteUrl: str | None = None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.id, name=obj.name, category=obj.category, rating=obj.rating,
            priceRange=obj.price_range, distance=obj.distance, description=obj.description,
            image=public_media_url(getattr(obj, "image", None), "hotels"),
            websiteUrl=getattr(obj, "website_url", None),
        )


class FoodSpotOut(BaseModel):
    id: int
    name: str
    cuisine: str
    mustTryDish: str | None
    rating: float
    distance: str | None
    description: str | None
    image: str | None = None
    websiteUrl: str | None = None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.id, name=obj.name, cuisine=obj.cuisine, mustTryDish=obj.must_try_dish,
            rating=obj.rating, distance=obj.distance, description=obj.description,
            image=public_media_url(getattr(obj, "image", None), "food"),
            websiteUrl=getattr(obj, "website_url", None),
        )


class EmergencyServiceItemOut(BaseModel):
    name: str
    phone: str
    distance: str | None
    location: str | None
    websiteUrl: str | None = None
    latitude: float | None = None
    longitude: float | None = None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            name=obj.name, phone=obj.phone, distance=obj.distance,
            location=obj.location, websiteUrl=getattr(obj, "website_url", None),
            latitude=getattr(obj, "latitude", None), longitude=getattr(obj, "longitude", None),
        )


class EmergencyServiceCategoryOut(BaseModel):
    category: str
    icon_key: str
    color: str | None
    list: list[EmergencyServiceItemOut]

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            category=obj.category, icon_key=obj.icon_key, color=obj.color,
            list=[EmergencyServiceItemOut.from_orm_custom(i) for i in obj.items],
        )


class LocalScamOut(BaseModel):
    id: int
    title: str
    location: str | None
    severity: str
    description: str | None
    prevention: str | None
    image: str | None = None
    websiteUrl: str | None = None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.id, title=obj.title, location=obj.location, severity=obj.severity,
            description=obj.description, prevention=obj.prevention,
            image=public_media_url(getattr(obj, "image", None), "scams"),
            websiteUrl=getattr(obj, "website_url", None),
        )


class PhraseOut(BaseModel):
    hindi: str
    translation: str
    phonetic: str | None

    class Config:
        from_attributes = True


class PhraseCategoryOut(BaseModel):
    category: str
    phrases: list[PhraseOut]

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(category=obj.category, phrases=[PhraseOut.model_validate(p) for p in obj.phrases])


class SmartItineraryTimeSlotOut(BaseModel):
    time: str
    activity: str
    note: str | None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(time=obj.time_label, activity=obj.activity, note=obj.note)


class SmartItineraryOut(BaseModel):
    id: str
    title: str
    subtitle: str | None
    image: str | None = None
    timeSlots: list[SmartItineraryTimeSlotOut]

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.slug, title=obj.title, subtitle=obj.subtitle,
            image=public_media_url(getattr(obj, "image", None), "itineraries"),
            timeSlots=[SmartItineraryTimeSlotOut.from_orm_custom(s) for s in obj.time_slots],
        )


class MMRAreaSpotOut(BaseModel):
    title: str
    type: str | None
    desc: str | None
    highlight: str | None
    image: str | None = None
    websiteUrl: str | None = None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            title=obj.title, type=obj.type, desc=obj.description, highlight=obj.highlight,
            image=public_media_url(getattr(obj, "image", None), "areas"),
            websiteUrl=getattr(obj, "website_url", None),
        )


class MMRAreaFoodOut(BaseModel):
    spot: str
    dish: str | None
    type: str | None

    class Config:
        from_attributes = True


class MMRAreaOut(BaseModel):
    id: str
    name: str
    region: str
    safetyScore: int
    safetyTag: str | None
    vibe: str | None
    image: str | None = None
    websiteUrl: str | None = None
    highlyRecommended: list[MMRAreaSpotOut]
    foodHighlights: list[MMRAreaFoodOut]
    transitAndSafetyTip: str | None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.slug, name=obj.name, region=obj.region, safetyScore=obj.safety_score,
            safetyTag=obj.safety_tag, vibe=obj.vibe,
            image=public_media_url(getattr(obj, "image", None), "areas"),
            websiteUrl=getattr(obj, "website_url", None),
            highlyRecommended=[MMRAreaSpotOut.from_orm_custom(s) for s in obj.recommended_spots],
            foodHighlights=[MMRAreaFoodOut.model_validate(f) for f in obj.food_highlights],
            transitAndSafetyTip=obj.transit_and_safety_tip,
        )


class DangerZoneOut(BaseModel):
    id: int
    name: str
    riskLevel: str
    crimeRate: float | None
    centerLat: float
    centerLng: float
    radiusMeters: int
    description: str | None
    image: str | None = None
    websiteUrl: str | None = None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.id, name=obj.name, riskLevel=obj.risk_level, crimeRate=obj.crime_rate,
            centerLat=obj.center_lat, centerLng=obj.center_lng, radiusMeters=obj.radius_meters,
            description=obj.description,
            image=public_media_url(getattr(obj, "image", None), "zones"),
            websiteUrl=obj.website_url,
        )


class CrimeReportOut(BaseModel):
    id: int
    crimeType: str
    locationLabel: str | None
    description: str | None
    latitude: float | None
    longitude: float | None
    status: str
    occurredAt: str | None
    image: str | None = None
    websiteUrl: str | None = None
    dangerZoneId: int | None = None

    @classmethod
    def from_orm_custom(cls, obj):
        occurred = obj.occurred_at.isoformat() if obj.occurred_at else None
        return cls(
            id=obj.id, crimeType=obj.crime_type, locationLabel=obj.location_label,
            description=obj.description, latitude=obj.latitude, longitude=obj.longitude,
            status=obj.status, occurredAt=occurred, dangerZoneId=obj.danger_zone_id,
            image=public_media_url(getattr(obj, "image", None), "crime"),
            websiteUrl=obj.website_url,
        )


class NewsItemOut(BaseModel):
    id: int
    title: str
    summary: str | None
    category: str | None
    publishedAt: str | None
    image: str | None = None
    websiteUrl: str | None = None

    @classmethod
    def from_orm_custom(cls, obj):
        published = obj.published_at.isoformat() if obj.published_at else None
        return cls(
            id=obj.id, title=obj.title, summary=obj.summary, category=obj.category,
            publishedAt=published,
            image=public_media_url(getattr(obj, "image", None), "news"),
            websiteUrl=obj.website_url,
        )


class AnalyzedPlaceOut(BaseModel):
    name: str
    kind: str
    category: str | None = None
    description: str | None = None
    image: str | None = None
    websiteUrl: str | None = None
    locationLabel: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    distanceKm: float
    mapQuery: str | None = None
    phone: str | None = None


class AreaAnalysisOut(BaseModel):
    originLat: float
    originLng: float
    radiusKm: float
    zoneName: str | None = None
    zoneRisk: str | None = None
    zoneDescription: str | None = None
    crimes: list[AnalyzedPlaceOut]
    hospitals: list[AnalyzedPlaceOut]
    pharmacies: list[AnalyzedPlaceOut]
    groceries: list[AnalyzedPlaceOut]
    police: list[AnalyzedPlaceOut]
    attractions: list[AnalyzedPlaceOut]
    hotels: list[AnalyzedPlaceOut]
    food: list[AnalyzedPlaceOut]
    malls: list[AnalyzedPlaceOut]
    gaming: list[AnalyzedPlaceOut]


class StationOut(BaseModel):
    name: str
    line: str | None
    hub: bool

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(name=obj.name, line=obj.display_line, hub=bool(obj.is_hub))
