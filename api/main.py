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
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from datetime import datetime

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

# -----------------
# DATABASE SETUP
# -----------------
engine = create_engine("sqlite:///./telemetry_alerts.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class TelemetryAlert(Base):
    __tablename__ = "telemetry_alerts"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    target_location = Column(String)
    start_date = Column(String)
    end_date = Column(String)
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

@app.post("/api/alerts/subscribe")
async def subscribe_to_alert(subscription: AlertSubscription, db: Session = Depends(get_db)):
    db_alert = TelemetryAlert(
        email=subscription.email,
        target_location=subscription.target_location,
        start_date=subscription.start_date,
        end_date=subscription.end_date
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return {"status": "success", "message": "Watch alert registered in database."}


@app.on_event("startup")
async def startup_event():
    # Fire and forget the background alert loop
    import asyncio
    asyncio.create_task(alerts.start_alert_scheduler())

