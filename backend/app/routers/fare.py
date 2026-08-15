from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.reference import FareEstimateRequest, FareEstimateResponse
from app.services.fare_calculator import estimate_fares
from app.services.train_pathfinder import find_route

router = APIRouter(prefix="/api/fare", tags=["fare"])


@router.post("/estimate", response_model=FareEstimateResponse)
def estimate(payload: FareEstimateRequest, db: Session = Depends(get_db)):
    distance = payload.distance_km
    if distance is None:
        route = find_route(db, payload.origin, payload.destination)
        if not route:
            raise HTTPException(
                status_code=400,
                detail="Could not derive distance automatically; pass distance_km explicitly",
            )
        total_stops = sum(leg.num_stops for leg in route.legs)
        distance = total_stops * 1.2

    return estimate_fares(distance)
