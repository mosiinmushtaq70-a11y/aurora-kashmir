from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import math
import time
import sys
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from datetime import datetime, timedelta

# Add src to python path to import our predictor and API tools
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.predictor import calculate_aurora_probability
from src.space_weather import get_kp_index, get_solar_wind, get_plasma_data, fetch_7day_kp_forecast

app = FastAPI()

# Enable CORS so your Next.js frontend can talk to this Python server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Real-world Aurora Viewing Spots Database
SIGHTSEEING_SPOTS = [
    {"id": 1, "name": "Tarsar Lake", "lat": 34.15, "lng": 75.12, "region": "Kashmir", "pollution": "Minimal", "rating": 5},
    {"id": 2, "name": "Sonamarg Valley", "lat": 34.30, "lng": 75.30, "region": "Kashmir", "pollution": "Low", "rating": 4},
    {"id": 3, "name": "Murphy Dome", "lat": 64.95, "lng": -147.41, "region": "Alaska", "pollution": "Minimal", "rating": 5},
    {"id": 4, "name": "Chenna Lakes", "lat": 64.79, "lng": -147.22, "region": "Alaska", "pollution": "Low", "rating": 4},
    {"id": 5, "name": "Thingvellir Park", "lat": 64.25, "lng": -21.12, "region": "Iceland", "pollution": "Minimal", "rating": 5},
]

def get_distance(lat1, lon1, lat2, lon2):
    return math.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)

@app.get("/api/weather/forecast/global")
async def get_forecast(lat: float, lon: float, hour_offset: int = 0):
    try:
        # Base Defaults
        kp, bz, bt, speed, density = 3.0, 0.0, 5.0, 400.0, 5.0
        reliability = "HIGH"

        if hour_offset <= 1:
            try:
                df_kp = get_kp_index()
                if df_kp is not None and not df_kp.empty: kp = float(df_kp['kp'].iloc[-1])
                
                df_sw = get_solar_wind()
                if df_sw is not None and not df_sw.empty:
                    bz = float(df_sw['bz_gsm'].iloc[-1])
                    bt = float(df_sw['bt'].iloc[-1])

                df_plasma = get_plasma_data()
                if df_plasma is not None and not df_plasma.empty:
                    speed = float(df_plasma['speed'].iloc[-1])
                    density = float(df_plasma['density'].iloc[-1])
            except Exception as e:
                print(f"[Forecast] Realtime fetch error: {e}")
                reliability = "MODERATE"
        else:
            decay_factor = max(0.0, 1.0 - (hour_offset / 168.0))
            try:
                df_sw = get_solar_wind()
                if df_sw is not None and not df_sw.empty:
                    bz = float(df_sw['bz_gsm'].iloc[-1]) * decay_factor
                    bt = 5.0 + (float(df_sw['bt'].iloc[-1]) - 5.0) * decay_factor
                
                df_plasma = get_plasma_data()
                if df_plasma is not None and not df_plasma.empty:
                    speed = 400.0 + (float(df_plasma['speed'].iloc[-1]) - 400.0) * decay_factor
                    density = 5.0 + (float(df_plasma['density'].iloc[-1]) - 5.0) * decay_factor
            except:
                pass

            try:
                df_kp_forecast = fetch_7day_kp_forecast()
                if df_kp_forecast is not None and not df_kp_forecast.empty:
                    target_time = datetime.utcnow() + timedelta(hours=hour_offset)
                    df_kp_forecast['diff'] = abs(df_kp_forecast['time_tag'] - target_time)
                    closest_kp = df_kp_forecast.loc[df_kp_forecast['diff'].idxmin()]
                    kp = float(closest_kp['kp'])
                    reliability = "MODERATE" if hour_offset <= 72 else "SIMULATED"
                else:
                    reliability = "SIMULATED"
            except Exception as e:
                print(f"[Forecast] 7-Day outlook fetch error: {e}")
                reliability = "SIMULATED"

        # AI Prediction
        res = calculate_aurora_probability(kp=kp, bz=bz, bt=bt, lat=lat, lon=lon, speed=speed, density=density)

        return {
            "aurora_score": res["score"],
            "confidence": reliability,
            "level": res["level"],
            "message": res["description"],
            "telemetry": {
                "bz_nt": round(bz, 1),
                "bt_nt": round(bt, 1),
                "speed_km_s": round(speed, 0),
                "density_p_cm3": round(density, 1)
            },
            "cloud_cover": 0,
            "temperature": 0
        }
    except Exception as e:
        print(f"[Forecast Error] {e}")
        return {
            "aurora_score": min(100, max(0, abs(lat))),
            "confidence": "SYSTEM ERROR",
            "level": "ERROR",
            "message": f"Engine failure: {str(e)}",
            "telemetry": { "bz_nt": 0, "bt_nt": 0, "speed_km_s": 0, "density_p_cm3": 0 },
            "cloud_cover": 0,
            "temperature": 0
        }

@app.get("/api/sightseeing/spots")
async def get_spots(lat: float, lon: float):
    # Sort spots by how close they are to your map's center
    sorted_spots = sorted(
        SIGHTSEEING_SPOTS, 
        key=lambda s: get_distance(lat, lon, s["lat"], s["lng"])
    )
    return sorted_spots[:3] # Return top 3 nearest spots

@app.get("/")
def read_root():
    return {"status": "Aurora Backend is LIVE"}

# -----------------
# 7-DAY GLOBAL HEATMAP
# -----------------
GLOBAL_HEATMAP_CACHE: Dict[str, Any] = {
    "timestamp": 0.0,
    "data": None
}

@app.get("/api/forecast/global_heatmap")
async def get_global_heatmap():
    current_time = time.time()
    # Serve 60-second cache (Allows rapid refresh while protecting against spam)
    if GLOBAL_HEATMAP_CACHE["data"] is not None and (current_time - GLOBAL_HEATMAP_CACHE["timestamp"]) < 60:
        return GLOBAL_HEATMAP_CACHE["data"]

    # Cache expired or empty. Regenerate blocking 7-day grid.
    print("[SYSTEM] Regenerating 7-Day Global Heatmap grid (XGBoost). This may take several seconds...")
    try:
        df_kp = get_kp_index()
        base_kp = float(df_kp['kp'].iloc[-1]) if df_kp is not None and not df_kp.empty else 3.0
        
        df_sw = get_solar_wind()
        base_bz = float(df_sw['bz_gsm'].iloc[-1]) if df_sw is not None and not df_sw.empty else 0.0
        base_bt = float(df_sw['bt'].iloc[-1]) if df_sw is not None and not df_sw.empty else 5.0

        df_plasma = get_plasma_data()
        base_speed = float(df_plasma['speed'].iloc[-1]) if df_plasma is not None and not df_plasma.empty else 400.0
        base_density = float(df_plasma['density'].iloc[-1]) if df_plasma is not None and not df_plasma.empty else 5.0
    except Exception as e:
        print(f"[ERROR] Failed to fetch live base telemetry: {e}")
        base_kp, base_bz, base_bt, base_speed, base_density = 3.0, 0.0, 5.0, 400.0, 5.0

    forecasts = []
    
    # 14 intervals roughly == 7 days stepping by 12 hours
    for interval in range(14):
        # Simulate decay: extreme baseline conditions drift back to normal over 7 days
        decay_factor = max(0.0, 1.0 - (interval * 0.07))
        
        kp = 3.0 + (float(base_kp) - 3.0) * decay_factor
        bz = float(base_bz) * decay_factor
        bt = 5.0 + (float(base_bt) - 5.0) * decay_factor
        speed = 400.0 + (float(base_speed) - 400.0) * decay_factor
        density = 5.0 + (float(base_density) - 5.0) * decay_factor

        grid_points = []
        # Low resolution grid (10-deg steps), skip equatorial belt (-30 to 30)
        for lat in range(-90, 91, 10):
            if -30 <= lat <= 30:
                continue
            for lon in range(-180, 181, 10):
                score = calculate_aurora_probability(
                    kp=kp, bz=bz, bt=bt, lat=lat, lon=lon, 
                    speed=speed, density=density
                )
                
                # Sparsify payload: Only include points with actual probabilities
                if score > 5:
                    grid_points.append({
                        "lat": lat,
                        "lon": lon,
                        "score": score
                    })
        
        forecasts.append({
            "interval": interval,
            "points": grid_points
        })

    GLOBAL_HEATMAP_CACHE["data"] = {"timeline": forecasts}
    GLOBAL_HEATMAP_CACHE["timestamp"] = current_time
    print("[SYSTEM] Grid regeneration complete. 24-hour cache locked.")

    return GLOBAL_HEATMAP_CACHE["data"]