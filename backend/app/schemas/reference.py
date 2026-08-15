from pydantic import BaseModel


class RouteLeg(BaseModel):
    line: str
    from_station: str
    to_station: str
    num_stops: int


class RouteResponse(BaseModel):
    origin: str
    destination: str
    line: str  # single display string e.g. "Western Line" or "Western -> Central"
    interchange: str | None  # display message, or null if no interchange — matches frontend's searchedRoute.interchange
    legs: list[RouteLeg]
    estimatedMins: int
    fare: int


class FareEstimateRequest(BaseModel):
    origin: str
    destination: str
    distance_km: float | None = None  # optional override; else derived from station route


class FareEstimateResponse(BaseModel):
    distance_km: float
    local_train_fare: float
    best_bus_fare: float
    auto_fare: float
    cab_fare: float
