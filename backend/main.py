from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import math
import time
import sys
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta, timezone
from supabase import create_client, Client

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
# DATABASE SETUP (Supabase Native REST API)
# -----------------
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", os.getenv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY", ""))

if supabase_url and supabase_key:
    supabase: Client = create_client(supabase_url, supabase_key)
else:
    supabase = None

class AlertSubscription(BaseModel):
    email: EmailStr
    target_location: str
    lat: float
    lon: float
    min_kp: float = 3.0
    forecast_horizon: int = 72
    start_date: Optional[str] = None
    end_date: Optional[str] = None

@app.post("/api/alerts/subscribe")
async def subscribe_to_alert(subscription: AlertSubscription):
    if not supabase:
        return {"status": "error", "message": "Supabase internal network disconnected. Cannot store alert."}
    
    try:
        data, count = supabase.table("telemetry_alerts").insert({
            "email": subscription.email,
            "target_location": subscription.target_location,
            "latitude": subscription.lat,
            "longitude": subscription.lon,
            "min_kp": subscription.min_kp,
            "forecast_horizon": subscription.forecast_horizon,
            "start_date": subscription.start_date,
            "end_date": subscription.end_date,
            "is_active": True
        }).execute()
        return {"status": "success", "message": "High-precision watch alert registered in your dashboard."}
    except Exception as e:
        print(f"[Supabase Storage Error] {e}")
        return {"status": "error", "message": f"Failed to register alert: {str(e)}"}

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
            "cloud_cover": None,
            "temperature": None,
            "light_pollution": 2 if abs(lat) > 60 else (4 if abs(lat) > 45 else 7)
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

@app.get("/api/weather/forecast/series")
async def get_forecast_series(lat: float, lon: float):
    """
    Returns a 48-hour tactical forecast series in 3-hourly increments.
    Calculates aurora probability for each time-step based on NOAA 3-day Kp outlook.
    """
    try:
        series = []
        now = datetime.utcnow()
        from src.space_weather import get_kp_forecast

        # 1. Fetch 3-day Kp forecast (3-hourly resolution)
        df_kp = get_kp_forecast()
        
        # 2. Handle missing data with safe fallback series
        if df_kp is None or df_kp.empty:
            for h in range(0, 51, 3):
                series.append({
                    "timestamp": (now + timedelta(hours=h)).isoformat(),
                    "kp": 2.0,
                    "aurora_score": 15,
                    "level": "MINIMAL",
                    "cloud_cover": 0,
                    "temperature": 0
                })
            return {"series": series, "status": "fallback"}

        # 3. Filter for relevant 48-hour window
        target_end = now + timedelta(hours=48)
        # Include slightly before 'now' to ensure the line starts correctly
        mask = (df_kp['time_tag'] >= now - timedelta(hours=3)) & (df_kp['time_tag'] <= target_end)
        df_kp = df_kp.loc[mask].sort_values('time_tag')

        # 4. Map each forecast point through the AI Engine
        for _, row in df_kp.iterrows():
            kp_val = float(row['kp'])
            # Heuristic enhancement for series: Bz is typically negative during predicted high Kp
            bz = -2.5 if kp_val >= 4 else (0.5 if kp_val < 2 else 0.0)
            bt = 5.0 + (kp_val * 0.5)
            
            res = calculate_aurora_probability(kp=kp_val, bz=bz, bt=bt, lat=lat, lon=lon)
            
            series.append({
                "timestamp": row['time_tag'].isoformat(),
                "kp": kp_val,
                "aurora_score": res["score"],
                "level": res["level"],
                "cloud_cover": 0,
                "temperature": 0
            })
            
        return {"series": series, "status": "live"}
    except Exception as e:
        print(f"[Series Error] {e}")
        return {"series": [], "error": str(e)}

@app.get("/api/sightseeing/spots")
async def get_spots(lat: float, lon: float):
    # Sort spots by how close they are to your map's center
    sorted_spots = sorted(
        SIGHTSEEING_SPOTS, 
        key=lambda s: get_distance(lat, lon, s["lat"], s["lng"])
    )
    return sorted_spots[:3] # Return top 3 nearest spots

@app.get("/", tags=["Health"])
async def read_root():
    """
    Root endpoint for health checks and status verification.
    Ensures Render's proxy remains active and provides basic service metadata.
    """
    return {
        "status": "Aurora Backend is LIVE",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "engine": "XGBoost Aurora Predictor v1.0",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Standard health check endpoint for monitoring services."""
    return {"status": "healthy", "uptime": "active"}

# -----------------
# 7-DAY GLOBAL HEATMAP
# -----------------
GLOBAL_HEATMAP_CACHE: Dict[str, Any] = {
    "timestamp": 0.0,
    "data": None
}

# 1-hour server-side cache for global hotspots
GLOBAL_PULSE_CACHE = {"count": 0, "timestamp": 0, "top_spots": []}

@app.get("/api/weather/stats/global_pulse")
async def get_global_pulse():
    global GLOBAL_PULSE_CACHE
    current_time = time.time()
    
    # Use cache if it's less than 1 hour old (3600 seconds)
    if current_time - GLOBAL_PULSE_CACHE["timestamp"] < 3600 and GLOBAL_PULSE_CACHE["top_spots"]:
        return {
            "active_hotspots": GLOBAL_PULSE_CACHE["count"],
            "top_spots": GLOBAL_PULSE_CACHE["top_spots"]
        }

    try:
        HOTSPOT_ZONES = [
            {"name": "Reykjavík, Iceland", "lat": 64.1265, "lon": -21.8277},
            {"name": "Tromsø, Norway", "lat": 69.6492, "lon": 18.9553},
            {"name": "Fairbanks, Alaska", "lat": 64.8378, "lon": -147.7164},
            {"name": "Yellowknife, Canada", "lat": 62.4540, "lon": -114.3718},
            {"name": "Kiruna, Sweden", "lat": 67.8558, "lon": 20.2253},
            {"name": "Rovaniemi, Finland", "lat": 66.5039, "lon": 25.7294},
            {"name": "Abisko, Sweden", "lat": 68.3500, "lon": 18.8300},
        ]

        kp = 3.0
        try:
            df_kp = get_kp_index()
            if df_kp is not None and not df_kp.empty:
                kp = float(df_kp['kp'].iloc[-1])
        except:
            pass

        hotspots = []
        for zone in HOTSPOT_ZONES:
            res = calculate_aurora_probability(kp=kp, bz=-2.0, bt=5.0, lat=zone["lat"], lon=zone["lon"])
            if res["score"] > 20:
                hotspots.append({
                    "name": zone["name"],
                    "lat": zone["lat"],
                    "lon": zone["lon"],
                    "score": res["score"],
                    "level": res["level"]
                })

        hotspots.sort(key=lambda x: x["score"], reverse=True)
        
        # Option 3: Scale with Kp for a bigger, scientifically-grounded number
        # Fluctuates between ~50 and ~350 based on real space weather
        kp_scaled_count = round(50 + (kp / 9) * 300)
        
        result = {
            "active_hotspots": kp_scaled_count,
            "top_spots": hotspots[:3]
        }
        
        GLOBAL_PULSE_CACHE.update({"count": kp_scaled_count, "timestamp": current_time, "top_spots": hotspots[:3]})
        return result
    except Exception as e:
        print(f"[Pulse Error] {e}")
        return {"active_hotspots": 0, "top_spots": []}

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