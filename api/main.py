import os
import sys

# Ensure root and src directories are available for imports immediately
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
SRC_DIR = os.path.join(ROOT_DIR, 'src')
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from api.routers import weather
from api.services import alerts
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

load_dotenv() # Load from root .env 

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

@app.middleware("http")
async def log_requests(request, call_next):
    import time
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    print(f"DEBUG: {request.method} {request.url.path} - {response.status_code} ({duration:.2f}s)")
    return response

app.include_router(weather.router, prefix="/api/weather", tags=["Weather"])

@app.get("/api/health")
def read_health():
    return {"status": "ok", "message": "AuroraLens API is actively monitoring."}

# -----------------
# DATABASE SETUP
# -----------------
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./telemetry_alerts.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TelemetryAlert(Base):
    __tablename__ = "telemetry_alerts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    target_location = Column(String)
    start_date = Column(String)
    end_date = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    min_kp = Column(Float, default=3.0)
    forecast_horizon = Column(Integer, default=72)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AlertSubscription(BaseModel):
    email: EmailStr
    target_location: str
    start_date: str
    end_date: str
    lat: float
    lon: float
    min_kp: Optional[float] = 3.5
    forecast_horizon: Optional[int] = 72

@app.post("/api/alerts/subscribe")
async def subscribe_to_alert(subscription: AlertSubscription, db: Session = Depends(get_db)):
    db_alert = TelemetryAlert(
        email=subscription.email,
        target_location=subscription.target_location,
        start_date=subscription.start_date,
        end_date=subscription.end_date,
        latitude=subscription.lat,
        longitude=subscription.lon,
        min_kp=subscription.min_kp,
        forecast_horizon=subscription.forecast_horizon
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return {"status": "success", "message": "Watch alert registered in cloud database."}


@app.on_event("startup")
async def startup_event():
    # Fire and forget the background alert loop
    import asyncio
    asyncio.create_task(alerts.start_alert_scheduler())

