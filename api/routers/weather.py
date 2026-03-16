from fastapi import APIRouter, HTTPException
import sys
import os
from pydantic import BaseModel

# Ensure src module is properly resolvable
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
SRC_DIR = os.path.join(ROOT_DIR, 'src')
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

from src import predictor
from src import space_weather

router = APIRouter()

class ForecastResponse(BaseModel):
    aurora_score: float
    confidence: str
    message: str
    telemetry: dict
    geomagnetic_storm: bool

@router.get("/forecast/global", response_model=ForecastResponse)
def get_global_forecast(lat: float = 34.08, lon: float = 74.79):
    """
    Returns the real-time AI prediction for Aurora probability based on current telemetry.
    Optional lat/lon for specific location (defaults to Kashmir).
    """
    try:
        # Fetch current telemetry from NOAA DSCOVR and SWPC
        sw_df = space_weather.get_solar_wind()
        kp_df = space_weather.get_kp_index()
        plasma_df = space_weather.get_plasma_data()
        
        if sw_df is None or sw_df.empty or kp_df is None or kp_df.empty:
            raise HTTPException(status_code=503, detail="NOAA DSCOVR Telemetry Offline")
            
        lat_row = sw_df.iloc[-1]
        bz = float(lat_row['bz_gsm'])
        bt = float(lat_row['bt'])
        kp_val = float(kp_df.iloc[-1]['kp'])
        
        speed = float(plasma_df.iloc[-1]['speed']) if plasma_df is not None and not plasma_df.empty else None
        density = float(plasma_df.iloc[-1]['density']) if plasma_df is not None and not plasma_df.empty else None
        temp = float(plasma_df.iloc[-1]['temperature']) if plasma_df is not None and not plasma_df.empty else None
        
        # Calculate heuristics via XGBoost Inference Engine
        res = predictor.calculate_aurora_probability(
            kp=kp_val, bz=bz, bt=bt, 
            lat=lat, lon=lon,
            speed=speed, density=density, temp=temp
        )
        
        # Return structured and decoupled data
        return ForecastResponse(
            aurora_score=res.get("score", 0),
            confidence="High" if res.get("prob_active", 0) > 0.5 else "Moderate",
            message=res.get("description", "Data successfully analyzed by AuroraLens API."),
            telemetry={
                "bz_nt": bz,
                "bt_nt": bt,
                "speed_km_s": speed if speed else 0.0,
                "density_p_cm3": density if density else 0.0
            },
            geomagnetic_storm=bool(res.get("level") in ["HIGH", "EXTREME"])
        )
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
