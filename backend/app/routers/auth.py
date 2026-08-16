from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import threading

from app.database import get_db
from app.schemas.auth import GoogleAuthIn, OTPRequest, OTPSentResponse, OTPVerify, TokenResponse, UserProfileUpdate
from app.schemas.user import UserOut
from app.services.otp_service import dispatch_sms, indian_mobile, issue_otp, verify_otp
from app.services.google_auth import google_profile_from_tokens, upsert_google_user
from app.core.security import create_access_token
from app.core.deps import get_current_user_required
from app.models.user import User
from app.models.tourist_pass import EmergencyContact

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/request-otp", response_model=OTPSentResponse)
def request_otp(
    payload: OTPRequest,
    db: Session = Depends(get_db),
):
    try:
        _user, otp_code, mobile = issue_otp(db, payload.phone_number)
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=503, detail=f"Could not create OTP: {exc}") from exc

    threading.Thread(target=dispatch_sms, args=(mobile, otp_code), daemon=True).start()

    return OTPSentResponse(
        ok=True,
        sms_sent=False,
        message="SMS is blocked on Fast2SMS. Use the on-screen OTP.",
        dev_otp=otp_code,
    )


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp_endpoint(payload: OTPVerify, db: Session = Depends(get_db)):
    mobile = indian_mobile(payload.phone_number)
    stored = f"+91{mobile}"
    existing = db.query(User).filter(
        User.phone_number.in_([stored, mobile, payload.phone_number]),
        User.is_verified.is_(True),
        User.full_name.isnot(None),
    ).first()

    user = verify_otp(db, payload.phone_number, payload.otp_code)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired OTP")

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, is_new_user=existing is None)


@router.post("/google", response_model=TokenResponse)
def google_login(payload: GoogleAuthIn, db: Session = Depends(get_db)):
    profile = google_profile_from_tokens(credential=payload.credential, access_token=payload.access_token)
    user, is_new_user = upsert_google_user(db, profile)
    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, is_new_user=is_new_user)


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

    if payload.friend_contacts is not None:
        filled = [
            c for c in payload.friend_contacts
            if (c.name or "").strip() and (c.phone_number or "").strip()
        ]
        if len(filled) < 2:
            raise HTTPException(status_code=400, detail="Add at least 2 friend contact numbers.")
        if len(filled) > 3:
            raise HTTPException(status_code=400, detail="You can add up to 3 friend contacts.")
        for existing in list(user.emergency_contacts):
            db.delete(existing)
        db.flush()
        for contact in filled:
            digits = "".join(ch for ch in contact.phone_number if ch.isdigit())
            if digits.startswith("91") and len(digits) == 12:
                digits = digits[2:]
            if len(digits) != 10:
                raise HTTPException(status_code=400, detail=f"Friend number for {contact.name} must be 10 digits.")
            db.add(EmergencyContact(
                user_id=user.id,
                name=contact.name.strip(),
                phone_number=f"+91{digits}",
                relation=(contact.relation or "Friend").strip() or "Friend",
            ))
        user.emergency_contact_name = filled[0].name.strip()
        user.emergency_contact_phone = f"+91{''.join(ch for ch in filled[0].phone_number if ch.isdigit())[-10:]}"
    else:
        if payload.emergency_contact_name is not None:
            user.emergency_contact_name = payload.emergency_contact_name
        if payload.emergency_contact_phone is not None:
            user.emergency_contact_phone = payload.emergency_contact_phone

    db.commit()
    db.refresh(user)
    return user
