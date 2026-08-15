from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.auth import OTPRequest, OTPVerify, TokenResponse, UserProfileUpdate
from app.schemas.user import UserOut
from app.services.otp_service import generate_and_send_otp, verify_otp
from app.core.security import create_access_token
from app.core.deps import get_current_user_required
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/request-otp", status_code=status.HTTP_204_NO_CONTENT)
def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    generate_and_send_otp(db, payload.phone_number)
    return None


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp_endpoint(payload: OTPVerify, db: Session = Depends(get_db)):
    was_new = db.query(User).filter(
        User.phone_number == payload.phone_number, User.is_verified == True  # noqa: E712
    ).first() is None

    user = verify_otp(db, payload.phone_number, payload.otp_code)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, is_new_user=was_new)


@router.get("/me", response_model=UserOut)
def get_my_profile(user: User = Depends(get_current_user_required)):
    return user


@router.patch("/me", response_model=UserOut)
def update_my_profile(
    payload: UserProfileUpdate,
    user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db),
):
    from datetime import date as date_cls

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.email is not None:
        user.email = payload.email
    if payload.date_of_birth is not None:
        user.date_of_birth = date_cls.fromisoformat(payload.date_of_birth)
    if payload.gender is not None:
        user.gender = payload.gender
    if payload.nationality is not None:
        user.nationality = payload.nationality
    if payload.emergency_contact_name is not None:
        user.emergency_contact_name = payload.emergency_contact_name
    if payload.emergency_contact_phone is not None:
        user.emergency_contact_phone = payload.emergency_contact_phone
    db.commit()
    db.refresh(user)
    return user
