from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.deps import get_current_user_required
from app.models.user import User
from app.schemas.tourist_pass import TouristPassOut, TouristPassIssueRequest
from app.services.pass_service import issue_pass, verify_pass

router = APIRouter(prefix="/api/tourist-pass", tags=["tourist-pass"])


@router.post("", response_model=TouristPassOut)
def create_or_renew_pass(
    payload: TouristPassIssueRequest,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    return TouristPassOut.from_orm_custom(issue_pass(db, user, payload.valid_days))


@router.get("/me", response_model=TouristPassOut)
def get_my_pass(
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    if not user.tourist_pass:
        raise HTTPException(status_code=404, detail="No tourist pass issued yet")
    return TouristPassOut.from_orm_custom(user.tourist_pass)


@router.get("/verify/{pass_code}", response_model=TouristPassOut)
def verify_pass_endpoint(pass_code: str, db: Session = Depends(get_db)):
    """Used by kiosks/authorities scanning a tourist's QR code at a check-in point."""
    record = verify_pass(db, pass_code)
    if not record:
        raise HTTPException(status_code=404, detail="Invalid pass code")
    return TouristPassOut.from_orm_custom(record)
