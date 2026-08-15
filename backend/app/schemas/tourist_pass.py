from pydantic import BaseModel
from datetime import datetime


class TouristPassOut(BaseModel):
    did: str  # "DID:SUKHAD-XXXXXX" — matches touristUser.idHash in the frontend
    qrImageUrl: str | None
    issuedAt: datetime
    validTill: datetime
    status: str
    idType: str = "Verified Local Tourist Pass"

    @classmethod
    def from_orm_custom(cls, obj):
        return cls(
            did=f"DID:{obj.pass_code}",
            qrImageUrl=f"/static/qr_codes/{obj.pass_code}.png" if obj.qr_image_path else None,
            issuedAt=obj.issued_at,
            validTill=obj.valid_until,
            status=obj.status,
        )


class TouristPassIssueRequest(BaseModel):
    valid_days: int = 14
