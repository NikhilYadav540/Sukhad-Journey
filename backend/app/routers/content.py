from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import (
    Attraction, Hotel, FoodSpot, EmergencyServiceCategory, LocalScam,
    PhraseCategory, SmartItinerary, MMRArea,
)
from app.models.reference import Station
from app.schemas.content import (
    AttractionOut, HotelOut, FoodSpotOut, EmergencyServiceCategoryOut, LocalScamOut,
    PhraseCategoryOut, SmartItineraryOut, MMRAreaOut, StationOut,
)

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
    return db.query(LocalScam).all()


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
