from app.schemas.reference import FareEstimateResponse

# Matches the exact formula used client-side in app/tourist/page.tsx's Fare Estimator
# (cabDistance * 18 + 23 for auto, cabDistance * 24 + 50 for taxi) so the backend
# becomes the source of truth instead of the frontend recomputing it.
AUTO_PER_KM = 18.0
AUTO_BASE = 23.0
TAXI_PER_KM = 24.0
TAXI_BASE = 50.0

# Kept for the more detailed /api/fare/estimate breakdown (train + bus + auto + cab)
LOCAL_TRAIN_BASE = 5.0
LOCAL_TRAIN_PER_KM = 0.7
BEST_BUS_BASE = 8.0
BEST_BUS_PER_KM = 1.2


def estimate_fares(distance_km: float) -> FareEstimateResponse:
    distance_km = max(distance_km, 0.5)
    return FareEstimateResponse(
        distance_km=round(distance_km, 2),
        local_train_fare=round(LOCAL_TRAIN_BASE + distance_km * LOCAL_TRAIN_PER_KM, 2),
        best_bus_fare=round(BEST_BUS_BASE + distance_km * BEST_BUS_PER_KM, 2),
        auto_fare=round(AUTO_BASE + distance_km * AUTO_PER_KM, 2),
        cab_fare=round(TAXI_BASE + distance_km * TAXI_PER_KM, 2),
    )
