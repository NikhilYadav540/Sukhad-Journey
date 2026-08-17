from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.schemas.auth import (
    GoogleAuthIn,
    SignupRequest,
    LoginRequest,
    TokenResponse,
    UserProfileUpdate,
)
from app.schemas.user import UserOut
from app.services.google_auth import google_profile_from_tokens, upsert_google_user
from app.core.security import create_access_token, hash_password, verify_password
from app.core.deps import get_current_user_required
from app.models.user import User
from app.models.tourist_pass import EmergencyContact

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Demo fallback accounts that automatically work with login
DEMO_ACCOUNTS = {
    "tourist1": {
        "password": "pass1234",
        "full_name": "Aarav Tourist",
        "phone_number": "+919999900001",
        "email": "tourist1@demo.sukhad.in",
        "nationality": "India",
        "gender": "Male",
    },
}


def _normalize_phone(raw: str | None) -> str | None:
    if not raw:
        return None
    digits = "".join(ch for ch in raw if ch.isdigit())
    if digits.startswith("91") and len(digits) == 12:
        digits = digits[2:]
    if len(digits) == 10:
        return f"+91{digits}"
    return raw.strip() if raw.strip() else None


@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower() if payload.email and payload.email.strip() else None
    phone = _normalize_phone(payload.phone_number)
    
    if not email and not phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either an email or mobile phone number."
        )

    # Check if user with this email or phone already exists
    filters = []
    if email:
        filters.append(User.email == email)
    if phone:
        digits = "".join(ch for ch in phone if ch.isdigit())[-10:]
        filters.append(User.phone_number.in_([phone, digits, f"+91{digits}"]))
    
    existing = db.query(User).filter(or_(*filters)).first()
    if existing:
        if existing.password_hash:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email or mobile number already exists. Please log in."
            )
        # If user existed without password (e.g. guest or old seed), attach password
        existing.password_hash = hash_password(payload.password)
        if payload.full_name and not existing.full_name:
            existing.full_name = payload.full_name.strip()
        if email and not existing.email:
            existing.email = email
        if phone and not existing.phone_number:
            existing.phone_number = phone
        existing.is_verified = True
        db.commit()
        db.refresh(existing)
        token = create_access_token(subject=str(existing.id))
        return TokenResponse(access_token=token, is_new_user=not bool(existing.full_name))

    new_user = User(
        email=email,
        phone_number=phone,
        full_name=payload.full_name.strip() if payload.full_name else None,
        password_hash=hash_password(payload.password),
        is_verified=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(subject=str(new_user.id))
    return TokenResponse(access_token=token, is_new_user=not bool(new_user.full_name))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    ident = payload.identifier.strip()
    
    # Check demo accounts first
    if ident in DEMO_ACCOUNTS and payload.password == DEMO_ACCOUNTS[ident]["password"]:
        demo_info = DEMO_ACCOUNTS[ident]
        user = db.query(User).filter(User.phone_number == demo_info["phone_number"]).first()
        if not user:
            user = User(
                phone_number=demo_info["phone_number"],
                email=demo_info["email"],
                full_name=demo_info["full_name"],
                password_hash=hash_password(demo_info["password"]),
                nationality=demo_info.get("nationality"),
                gender=demo_info.get("gender"),
                is_verified=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        token = create_access_token(subject=str(user.id))
        return TokenResponse(access_token=token, is_new_user=not bool(user.full_name))

    # Match by email or phone
    email_cand = ident.lower()
    phone_cand = _normalize_phone(ident)
    
    filters = [User.email == email_cand]
    if phone_cand:
        digits = "".join(ch for ch in phone_cand if ch.isdigit())[-10:]
        filters.extend([User.phone_number == phone_cand, User.phone_number == digits, User.phone_number == f"+91{digits}"])
    
    user = db.query(User).filter(or_(*filters)).first()
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/mobile number or password."
        )

    token = create_access_token(subject=str(user.id))
    return TokenResponse(access_token=token, is_new_user=not bool(user.full_name))


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
