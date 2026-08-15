from pydantic import BaseModel, Field


class OTPRequest(BaseModel):
    phone_number: str = Field(..., examples=["+919876543210"])


class OTPVerify(BaseModel):
    phone_number: str
    otp_code: str = Field(..., min_length=4, max_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_new_user: bool


class UserProfileUpdate(BaseModel):
    full_name: str | None = None
    email: str | None = None
    date_of_birth: str | None = None  # ISO date string "YYYY-MM-DD"
    gender: str | None = None
    nationality: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
