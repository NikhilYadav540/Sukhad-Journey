from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.config import get_settings
import app.models  # noqa: F401 -- ensures all models are registered before create_all

from app.routers import auth, content, trains, fare, itineraries, tourist_pass, emergency, police

settings = get_settings()

# For production, replace with Alembic migrations instead of create_all.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sukhad-Journey API",
    description="Backend for the Smart Tourist Assistance & Safety Platform (MMR)",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(content.router)
app.include_router(trains.router)
app.include_router(fare.router)
app.include_router(itineraries.router)
app.include_router(tourist_pass.router)
app.include_router(emergency.router)
app.include_router(police.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
