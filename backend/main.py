from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title = "Tourist safety backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials= True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@app.get("/")
async def root():
    return {"message":"backend is running."}

@app.get("/health")
async def healthcheck():
    return {"messsage":"backend is running smoothly", "PORT":8000 }
