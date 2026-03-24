from fastapi import APIRouter, HTTPException
import sys
import os
from pydantic import BaseModel
from datetime import datetime
import pandas as pd

# Ensure src module is properly resolvable
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
SRC_DIR = os.path.join(ROOT_DIR, 'src')
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from src import predictor
import asyncio
import requests
from src import space_weather

router = APIRouter()

class ForecastResponse(BaseModel):
    aurora_score: float
    confidence: str
    level: str = "MINIMAL"
    message: str
    tips: list = []
    telemetry: dict
    geomagnetic_storm: bool
    cloud_cover: float = 0.0
    temperature: float = 0.0
    precipitation: float = 0.0
    last_updated: str = ""

def fetch_weather_data(lat: float, lon: float, hour_offset: int = 0) -> dict:
    """Fetch cloud cover, temperature, and precipitation from Open-Meteo."""
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=cloud_cover,temperature_2m,precipitation&forecast_hours={hour_offset + 1}"
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            hourly = data.get("hourly", {})
            
            def get_val(key):
                vals = hourly.get(key, [])
                if len(vals) > hour_offset: return float(vals[hour_offset])
                return float(vals[-1]) if vals else 0.0

            return {
                "cloud_cover": get_val("cloud_cover"),
                "temperature": get_val("temperature_2m"),
                "precipitation": get_val("precipitation")
            }
    except Exception as e:
        print(f"Error fetching weather from Open-Meteo: {e}")
    return {"cloud_cover": 0.0, "temperature": 0.0, "precipitation": 0.0}

@router.get("/forecast/global", response_model=ForecastResponse)
async def get_global_forecast(lat: float = 64.84, lon: float = -147.72, hour_offset: int = 0):
    """
    Returns the AI prediction for Aurora probability based on current telemetry or future forecasts.
    Optional lat/lon for specific location. `hour_offset` maps to 0-72 hours ahead.
    """
    try:
        weather_task = asyncio.to_thread(fetch_weather_data, lat, lon, hour_offset)
        
        last_updated_time = ""
        
        if hour_offset == 0:
            # Real-time Telemetry
            mag_task = asyncio.to_thread(space_weather.get_solar_wind)
            kp_task = asyncio.to_thread(space_weather.get_kp_index)
            plasma_task = asyncio.to_thread(space_weather.get_plasma_data)
            
            sw_df, kp_df, plasma_df, weather = await asyncio.gather(mag_task, kp_task, plasma_task, weather_task)
            cloud_cover = weather["cloud_cover"]
            # Verify real-time telemetry and use safe fallbacks if NOAA is offline
            if sw_df is not None and not sw_df.empty:
                lat_row = sw_df.iloc[-1]
                last_updated_time = str(lat_row['time_tag']) + " UTC"
                bz = float(lat_row['bz_gsm'])
                bt = float(lat_row['bt'])
            else:
                last_updated_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S') + " UTC (Fallback)"
                bz = -2.5
                bt = 6.0
                
            if kp_df is not None and not kp_df.empty:
                kp_val = float(kp_df.iloc[-1]['kp'])
            else:
                kp_val = 2.0
                
            if plasma_df is not None and not plasma_df.empty:
                speed = float(plasma_df.iloc[-1]['speed']) if not pd.isna(plasma_df.iloc[-1]['speed']) else 400.0
                density = float(plasma_df.iloc[-1]['density']) if not pd.isna(plasma_df.iloc[-1]['density']) else 5.0
                temp = float(plasma_df.iloc[-1]['temperature']) if not pd.isna(plasma_df.iloc[-1]['temperature']) else 100000.0
            else:
                speed = 400.0
                density = 5.0
                temp = 100000.0
        
        else:
            # Future Forecast (Time Scrubber)
            kp_7day_task = asyncio.to_thread(space_weather.fetch_7day_kp_forecast)
            kp_df, weather = await asyncio.gather(kp_7day_task, weather_task)
            cloud_cover = weather["cloud_cover"]
            
            if kp_df is not None and not kp_df.empty:
                day_index = hour_offset // 24
                if day_index >= len(kp_df):
                    day_index = len(kp_df) - 1
                kp_val = float(kp_df.iloc[day_index]['kp'])
                last_updated_time = str(kp_df.iloc[day_index]['time_tag']) + " UTC"
            else:
                kp_val = 3.0
                from datetime import timedelta
                predicted_date = datetime.utcnow() + timedelta(hours=hour_offset)
                last_updated_time = predicted_date.strftime('%Y-%m-%d %H:%M:%S') + " UTC (Fallback)"
            
            bz = -3.0 
            bt = 7.0
            speed = 450.0
            density = 8.0
            temp = 150000.0

        # Calculate heuristics via XGBoost Inference Engine
        res = await asyncio.to_thread(
            predictor.calculate_aurora_probability,
            kp=kp_val, bz=bz, bt=bt, 
            lat=lat, lon=lon,
            speed=speed, density=density, temp=temp,
            cloud_cover=cloud_cover
        )
        
        # Return structured and decoupled data
        import math
        def safe_float(v, default=0.0):
            try:
                f = float(v)
                if math.isnan(f) or math.isinf(f):
                    return default
                return f
            except:
                return default

        return ForecastResponse(
            aurora_score=res.get("score", 0),
            confidence="High" if res.get("prob_active", 0) > 0.5 else "Moderate",
            level=res.get("level", "MINIMAL"),
            message=res.get("description", "Data successfully analyzed by AuroraLens API."),
            tips=res.get("tips", []),
            telemetry={
                "bz_nt": safe_float(bz),
                "bt_nt": safe_float(bt),
                "speed_km_s": safe_float(speed),
                "density_p_cm3": safe_float(density)
            },
            geomagnetic_storm=bool(res.get("level") in ["HIGH", "EXTREME"]),
            cloud_cover=safe_float(cloud_cover),
            temperature=safe_float(weather["temperature"]),
            precipitation=safe_float(weather["precipitation"]),
            last_updated=last_updated_time
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/telemetry/history")
def get_historical_telemetry():
    """Returns the 7-day Kp forecast."""
    try:
        df = space_weather.fetch_7day_kp_forecast()
        if df is None or df.empty:
            return {"error": "No historical data available", "data": []}
        
        df_clean = df.fillna(0.0)
        return {"data": df_clean.to_dict(orient="records")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
