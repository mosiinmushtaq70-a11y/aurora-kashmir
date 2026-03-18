import sys
import json
import requests
from datetime import datetime
import os

sys.path.append(r'd:\python_projects\aurora')
from src import space_weather

print("=== TELEMETRY TRACE ===")
sw = space_weather.get_solar_wind()
pl = space_weather.get_plasma_data()

if sw is not None and not sw.empty:
    last_bz = sw.iloc[-1]['bz_gsm']
    last_time = sw.iloc[-1]['time_tag']
    print(f"Latest DSCOVR Magnetic Timestamp: {last_time} UTC")
    
    # Calculate age
    age = datetime.utcnow() - last_time
    minutes_old = age.total_seconds() / 60
    
    status = "FRESH" if minutes_old < 15 else "STALE"
    print(f"Data Age: {minutes_old:.1f} minutes old -> [{status}]")
    print(f"Current Bz: {last_bz} nT")

if pl is not None and not pl.empty:
    last_speed = pl.iloc[-1]['speed']
    print(f"Current Solar Wind Speed: {last_speed} km/s")

print("\n=== BACKEND JSON AUDIT ===")
url = "http://localhost:8000/api/weather/forecast/global?lat=64.4460&lon=-149.6809"
print(f"Fetching from: {url}")
try:
    res = requests.get(url).json()
    print("API Response for Alaska:")
    print(json.dumps(res, indent=2))
except Exception as e:
    print(f"Fetch failed: {e}")
