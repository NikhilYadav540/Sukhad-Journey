from pydantic import BaseModel


class AttractionOut(BaseModel):
    id: int
    name: str
    region: str
    category: str
    rating: float
    distance: str | None
    safetyStatus: str | None
    image: str | None
    description: str | None
    mapQuery: str | None

    class Config:
        from_attributes = True
        populate_by_name = True

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.id, name=obj.name, region=obj.region, category=obj.category,
            rating=obj.rating, distance=obj.distance, safetyStatus=obj.safety_status,
            image=obj.image, description=obj.description, mapQuery=obj.map_query,
        )


class HotelOut(BaseModel):
    id: int
    name: str
    category: str
    rating: float
    priceRange: str | None
    distance: str | None
    description: str | None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.id, name=obj.name, category=obj.category, rating=obj.rating,
            priceRange=obj.price_range, distance=obj.distance, description=obj.description,
        )


class FoodSpotOut(BaseModel):
    id: int
    name: str
    cuisine: str
    mustTryDish: str | None
    rating: float
    distance: str | None
    description: str | None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.id, name=obj.name, cuisine=obj.cuisine, mustTryDish=obj.must_try_dish,
            rating=obj.rating, distance=obj.distance, description=obj.description,
        )


class EmergencyServiceItemOut(BaseModel):
    name: str
    phone: str
    distance: str | None
    location: str | None

    class Config:
        from_attributes = True


class EmergencyServiceCategoryOut(BaseModel):
    category: str
    icon_key: str
    color: str | None
    list: list[EmergencyServiceItemOut]

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            category=obj.category, icon_key=obj.icon_key, color=obj.color,
            list=[EmergencyServiceItemOut.model_validate(i) for i in obj.items],
        )


class LocalScamOut(BaseModel):
    id: int
    title: str
    location: str | None
    severity: str
    description: str | None
    prevention: str | None

    class Config:
        from_attributes = True


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
    timeSlots: list[SmartItineraryTimeSlotOut]

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.slug, title=obj.title, subtitle=obj.subtitle,
            timeSlots=[SmartItineraryTimeSlotOut.from_orm_custom(s) for s in obj.time_slots],
        )


class MMRAreaSpotOut(BaseModel):
    title: str
    type: str | None
    desc: str | None
    highlight: str | None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(title=obj.title, type=obj.type, desc=obj.description, highlight=obj.highlight)


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
    highlyRecommended: list[MMRAreaSpotOut]
    foodHighlights: list[MMRAreaFoodOut]
    transitAndSafetyTip: str | None

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            id=obj.slug, name=obj.name, region=obj.region, safetyScore=obj.safety_score,
            safetyTag=obj.safety_tag, vibe=obj.vibe,
            highlyRecommended=[MMRAreaSpotOut.from_orm_custom(s) for s in obj.recommended_spots],
            foodHighlights=[MMRAreaFoodOut.model_validate(f) for f in obj.food_highlights],
            transitAndSafetyTip=obj.transit_and_safety_tip,
        )


class StationOut(BaseModel):
    name: str
    line: str | None
    hub: bool

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(name=obj.name, line=obj.display_line, hub=bool(obj.is_hub))
