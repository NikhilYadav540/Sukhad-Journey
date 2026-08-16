from pydantic import BaseModel, Field


class OTPRequest(BaseModel):
    phone_number: str = Field(..., examples=["+919876543210"])


class OTPSentResponse(BaseModel):
    ok: bool = True
    message: str = "OTP sent"
    sms_sent: bool = True
    dev_otp: str | None = None


class OTPVerify(BaseModel):
    phone_number: str
    otp_code: str = Field(..., min_length=4, max_length=6)


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
