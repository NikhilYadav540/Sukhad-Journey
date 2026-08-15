from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.reference import RouteResponse
from app.services.train_pathfinder import find_route

router = APIRouter(prefix="/api/trains", tags=["trains"])


@router.get("/route", response_model=RouteResponse)
def get_route(
    origin: str = Query(...),
    destination: str = Query(...),
    db: Session = Depends(get_db),
):
    route = find_route(db, origin, destination)
    if not route:
        raise HTTPException(status_code=404, detail="No route found between these stations")
    return route
