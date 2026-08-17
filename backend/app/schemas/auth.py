from pydantic import BaseModel, Field


class SignupRequest(BaseModel):
    email: str | None = None
    phone_number: str | None = None
    password: str = Field(..., min_length=4)
    full_name: str | None = None


class LoginRequest(BaseModel):
    identifier: str  # email or phone number
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool


class GoogleAuthIn(BaseModel):
    credential: str | None = None
    access_token: str | None = None


class FriendContactIn(BaseModel):
    name: str
    phone_number: str
    relation: str | None = "Friend"


class UserProfileUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    date_of_birth: str | None = None
    gender: str | None = None
    nationality: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    friend_contacts: list[FriendContactIn] | None = None
