import os
import sys

# Ensure root and src directories are available for imports immediately
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
SRC_DIR = os.path.join(ROOT_DIR, 'src')
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import weather
from api.services import alerts

app = FastAPI(
    title="AuroraLens Prediction API",
    description="Backend API for the AuroraLens web application.",
    version="1.0.0"
)

# Configure CORS to allow the Next.js frontend to communicate securely
origins = [
    "http://localhost:3000",      # Standard React/Next.js port
    "http://127.0.0.1:3000",
    "*"                           # For development purposes; restrict this in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])

@app.get("/api/health")
def read_health():
    return {"status": "ok", "message": "AuroraLens API is actively monitoring."}

@app.on_event("startup")
async def startup_event():
    # Fire and forget the background alert loop
    import asyncio
    asyncio.create_task(alerts.start_alert_scheduler())

