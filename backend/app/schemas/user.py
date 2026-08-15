from pydantic import BaseModel
from datetime import datetime, date


class UserOut(BaseModel):
    id: int
    phone_number: str
    full_name: str | None
    email: str | None
    date_of_birth: date | None
    gender: str | None
    nationality: str | None
    emergency_contact_name: str | None
    emergency_contact_phone: str | None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class EmergencyContactIn(BaseModel):
    name: str
    phone_number: str
    relation: str | None = None


class EmergencyContactOut(EmergencyContactIn):
    id: int

    class Config:
        from_attributes = True
