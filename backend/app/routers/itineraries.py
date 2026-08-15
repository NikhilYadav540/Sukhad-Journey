from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user_required
from app.models.user import User
from app.models.itinerary import Itinerary, ItineraryDay, ItineraryStop
from app.schemas.itinerary import ItineraryCreate, ItineraryOut

router = APIRouter(prefix="/api/itineraries", tags=["itineraries"])


@router.get("", response_model=list[ItineraryOut])
def list_my_itineraries(
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    return db.query(Itinerary).filter(Itinerary.user_id == user.id).all()


@router.post("", response_model=ItineraryOut, status_code=201)
def create_itinerary(
    payload: ItineraryCreate,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    itinerary = Itinerary(
        user_id=user.id,
        title=payload.title,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(itinerary)
    db.flush()  # get itinerary.id before adding children

    for day_in in payload.days:
        day = ItineraryDay(itinerary_id=itinerary.id, day_number=day_in.day_number, date=day_in.date)
        db.add(day)
        db.flush()
        for stop_in in day_in.stops:
            db.add(ItineraryStop(day_id=day.id, **stop_in.model_dump()))

    db.commit()
    db.refresh(itinerary)
    return itinerary


@router.delete("/{itinerary_id}", status_code=204)
def delete_itinerary(
    itinerary_id: int,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    itinerary = db.query(Itinerary).filter(
        Itinerary.id == itinerary_id, Itinerary.user_id == user.id
    ).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    db.delete(itinerary)
    db.commit()
    return None
