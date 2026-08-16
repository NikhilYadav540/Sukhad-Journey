from math import asin, cos, radians, sin, sqrt
from time import sleep

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.content import (
    Attraction, Hotel, FoodSpot, EmergencyServiceCategory, LocalScam,
    PhraseCategory, SmartItinerary, MMRArea,
)
from app.models.safety import DangerZone, CrimeReport, NewsItem
from app.models.reference import Station
from app.schemas.content import (
    AttractionOut, HotelOut, FoodSpotOut, EmergencyServiceCategoryOut, LocalScamOut,
    PhraseCategoryOut, SmartItineraryOut, MMRAreaOut, StationOut,
    DangerZoneOut, CrimeReportOut, NewsItemOut, AnalyzedPlaceOut, AreaAnalysisOut,
)
from app.core.storage import public_media_url
from app.place_about import about_for

router = APIRouter(prefix="/api/content", tags=["content"])


@router.get("/attractions", response_model=list[AttractionOut])
def list_attractions(region: str | None = Query(None), db: Session = Depends(get_db)):
    q = db.query(Attraction)
    if region and region != "All":
        q = q.filter(Attraction.region.ilike(f"%{region}%"))
    return [AttractionOut.from_orm_custom(a) for a in q.all()]


@router.get("/hotels", response_model=list[HotelOut])
def list_hotels(db: Session = Depends(get_db)):
    return [HotelOut.from_orm_custom(h) for h in db.query(Hotel).all()]


@router.get("/food", response_model=list[FoodSpotOut])
def list_food(db: Session = Depends(get_db)):
    return [FoodSpotOut.from_orm_custom(f) for f in db.query(FoodSpot).all()]


@router.get("/emergency-services", response_model=list[EmergencyServiceCategoryOut])
def list_emergency_services(db: Session = Depends(get_db)):
    return [EmergencyServiceCategoryOut.from_orm_custom(c) for c in db.query(EmergencyServiceCategory).all()]


@router.get("/scams", response_model=list[LocalScamOut])
def list_scams(db: Session = Depends(get_db)):
    return [LocalScamOut.from_orm_custom(s) for s in db.query(LocalScam).all()]


@router.get("/phrasebook", response_model=list[PhraseCategoryOut])
def list_phrasebook(db: Session = Depends(get_db)):
    return [PhraseCategoryOut.from_orm_custom(c) for c in db.query(PhraseCategory).all()]


@router.get("/smart-itineraries", response_model=list[SmartItineraryOut])
def list_smart_itineraries(db: Session = Depends(get_db)):
    return [SmartItineraryOut.from_orm_custom(i) for i in db.query(SmartItinerary).all()]


@router.get("/mmr-areas", response_model=list[MMRAreaOut])
def list_mmr_areas(db: Session = Depends(get_db)):
    return [MMRAreaOut.from_orm_custom(a) for a in db.query(MMRArea).all()]


@router.get("/stations", response_model=list[StationOut])
def list_stations(db: Session = Depends(get_db)):
    return [StationOut.from_orm_custom(s) for s in db.query(Station).all()]


@router.get("/danger-zones", response_model=list[DangerZoneOut])
def list_danger_zones(db: Session = Depends(get_db)):
    return [DangerZoneOut.from_orm_custom(z) for z in db.query(DangerZone).all()]


@router.get("/crime-reports", response_model=list[CrimeReportOut])
def list_crime_reports(db: Session = Depends(get_db)):
    return [CrimeReportOut.from_orm_custom(r) for r in db.query(CrimeReport).order_by(CrimeReport.occurred_at.desc()).all()]


@router.get("/news", response_model=list[NewsItemOut])
def list_news(db: Session = Depends(get_db)):
    return [NewsItemOut.from_orm_custom(n) for n in db.query(NewsItem).order_by(NewsItem.published_at.desc()).all()]


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * r * asin(sqrt(a))


def _place(
    *,
    name: str,
    kind: str,
    distance_km: float,
    category: str | None = None,
    description: str | None = None,
    image: str | None = None,
    website_url: str | None = None,
    location_label: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
    map_query: str | None = None,
    phone: str | None = None,
) -> AnalyzedPlaceOut:
    query = map_query
    if lat is not None and lng is not None:
        query = f"{lat},{lng}"
    elif not query and name:
        query = name.replace(" ", "+")
    return AnalyzedPlaceOut(
        name=name, kind=kind, category=category, description=description,
        image=image, websiteUrl=website_url, locationLabel=location_label,
        latitude=lat, longitude=lng, distanceKm=round(distance_km, 2),
        mapQuery=query, phone=phone,
    )


@router.get("/analyze", response_model=AreaAnalysisOut)
def analyze_area(
    lat: float = Query(..., description="Pin latitude"),
    lng: float = Query(..., description="Pin longitude"),
    radius_km: float = Query(8, ge=1, le=10),
    db: Session = Depends(get_db),
):
    last_error: OperationalError | None = None
    for attempt in range(2):
        try:
            return _analyze_area(lat, lng, radius_km, db)
        except OperationalError as exc:
            last_error = exc
            db.rollback()
            if attempt == 0:
                sleep(0.4)
                continue
            raise HTTPException(
                status_code=503,
                detail="Could not analyze this area because the database is busy. Please try again.",
            ) from last_error
    raise HTTPException(status_code=503, detail="Could not analyze this area. Please try again.")


def _analyze_area(lat: float, lng: float, radius_km: float, db: Session) -> AreaAnalysisOut:
    def near(item_lat, item_lng):
        if item_lat is None or item_lng is None:
            return None
        item_lat_f = float(item_lat)
        item_lng_f = float(item_lng)
        # Pin in Kandivali–Malad–Borivali–Mira Road: never return Vasai/Virar last-mile rows.
        if lat < 19.30 and item_lat_f >= 19.32:
            return None
        d = _haversine_km(lat, lng, item_lat_f, item_lng_f)
        return d if d <= radius_km else None

    zone_name = zone_risk = zone_desc = None
    best_zone_d = None
    for z in db.query(DangerZone).all():
        d = _haversine_km(lat, lng, z.center_lat, z.center_lng)
        inside = d * 1000 <= (z.radius_meters or 500)
        if inside and (best_zone_d is None or d < best_zone_d):
            best_zone_d = d
            zone_name, zone_risk, zone_desc = z.name, z.risk_level, z.description

    crimes: list[AnalyzedPlaceOut] = []
    for c in db.query(CrimeReport).all():
        d = near(c.latitude, c.longitude)
        if d is None:
            continue
        crimes.append(_place(
            name=c.crime_type, kind="crime", category=c.status,
            description=about_for(c.location_label or c.crime_type, c.description, d),
            image=public_media_url(c.image, "crime"),
            website_url=c.website_url, location_label=c.location_label,
            lat=c.latitude, lng=c.longitude, distance_km=d,
        ))
    crimes.sort(key=lambda p: p.distanceKm)

    hospitals, pharmacies, groceries, police = [], [], [], []
    cats = (
        db.query(EmergencyServiceCategory)
        .options(joinedload(EmergencyServiceCategory.items))
        .all()
    )
    for cat in cats:
        icon = (cat.icon_key or "").lower()
        key = (cat.category or "").lower()
        bucket = None
        if icon == "hospital" or "hospital" in key:
            bucket = hospitals
        elif icon == "pill" or "pharm" in key:
            bucket = pharmacies
        elif icon == "grocery" or "groc" in key or "kirana" in key:
            bucket = groceries
        elif icon == "siren" or "police" in key:
            bucket = police
        if bucket is None:
            continue
        for item in cat.items:
            d = near(getattr(item, "latitude", None), getattr(item, "longitude", None))
            if d is None:
                continue
            bucket.append(_place(
                name=item.name, kind=cat.category, category=cat.category,
                description=about_for(item.name, item.location, d),
                image=public_media_url(getattr(item, "image", None), "places"),
                website_url=item.website_url, location_label=item.location,
                lat=item.latitude, lng=item.longitude, distance_km=d, phone=item.phone,
            ))
    for bucket in (hospitals, pharmacies, groceries, police):
        bucket.sort(key=lambda p: p.distanceKm)

    attractions, hotels, food, malls, gaming = [], [], [], [], []
    for a in db.query(Attraction).all():
        d = near(getattr(a, "latitude", None), getattr(a, "longitude", None))
        if d is None:
            continue
        place = _place(
            name=a.name, kind="attraction", category=a.category,
            description=about_for(a.name, a.description, d),
            image=public_media_url(a.image, "attractions"), website_url=a.website_url,
            location_label=a.region, lat=a.latitude, lng=a.longitude, distance_km=d,
            map_query=a.map_query,
        )
        cat = (a.category or "").lower()
        if "mall" in cat or "shopping street" in cat:
            malls.append(place)
        elif "gaming" in cat:
            gaming.append(place)
        else:
            attractions.append(place)
    for h in db.query(Hotel).all():
        d = near(getattr(h, "latitude", None), getattr(h, "longitude", None))
        if d is None:
            continue
        hotels.append(_place(
            name=h.name, kind="hotel", category=h.category,
            description=about_for(h.name, h.description, d),
            image=public_media_url(h.image, "hotels"), website_url=h.website_url,
            location_label=h.price_range, lat=h.latitude, lng=h.longitude, distance_km=d,
        ))
    for f in db.query(FoodSpot).all():
        d = near(getattr(f, "latitude", None), getattr(f, "longitude", None))
        if d is None:
            continue
        food_desc = f.description
        if f.must_try_dish:
            food_desc = f"Must try: {f.must_try_dish}. {f.description or ''}".strip()
        food.append(_place(
            name=f.name, kind="food", category=f.cuisine,
            description=about_for(f.name, food_desc, d),
            image=public_media_url(f.image, "food"), website_url=f.website_url,
            location_label=f.cuisine, lat=f.latitude, lng=f.longitude, distance_km=d,
        ))
    attractions.sort(key=lambda p: p.distanceKm)
    hotels.sort(key=lambda p: p.distanceKm)
    food.sort(key=lambda p: p.distanceKm)
    malls.sort(key=lambda p: p.distanceKm)
    gaming.sort(key=lambda p: p.distanceKm)

    nearest = 3
    return AreaAnalysisOut(
        originLat=lat, originLng=lng, radiusKm=radius_km,
        zoneName=zone_name, zoneRisk=zone_risk, zoneDescription=zone_desc,
        crimes=crimes[:nearest], hospitals=hospitals[:nearest], pharmacies=pharmacies[:nearest],
        groceries=groceries[:nearest], police=police[:nearest], attractions=attractions[:nearest],
        hotels=hotels[:nearest], food=food[:nearest], malls=malls[:nearest], gaming=gaming[:nearest],
    )
