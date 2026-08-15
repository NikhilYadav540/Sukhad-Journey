from pydantic import BaseModel
from datetime import datetime


class PoliceLoginRequest(BaseModel):
    badge_id: str
    password: str


class PoliceTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    officer_name: str
    precinct: str | None


class SOSAlertOut(BaseModel):
    id: int
    name: str
    did: str
    phone: str
    location: str
    lat: float
    lng: float
    time: str  # relative display string, computed server-side
    status: str
    risk: str

    class Config:
        from_attributes = True
