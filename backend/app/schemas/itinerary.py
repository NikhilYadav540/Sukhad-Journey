from pydantic import BaseModel
from datetime import datetime, time


class ItineraryStopIn(BaseModel):
    order_index: int
    attraction_id: int | None = None
    custom_label: str | None = None
    planned_time: time | None = None
    notes: str | None = None


class ItineraryDayIn(BaseModel):
    day_number: int
    date: datetime
    stops: list[ItineraryStopIn] = []


class ItineraryCreate(BaseModel):
    title: str
    start_date: datetime
    end_date: datetime
    days: list[ItineraryDayIn] = []


class ItineraryStopOut(ItineraryStopIn):
    id: int

    class Config:
        from_attributes = True


class ItineraryDayOut(BaseModel):
    id: int
    day_number: int
    date: datetime
    stops: list[ItineraryStopOut]

    class Config:
        from_attributes = True


class ItineraryOut(BaseModel):
    id: int
    title: str
    start_date: datetime
    end_date: datetime
    days: list[ItineraryDayOut]

    class Config:
        from_attributes = True
