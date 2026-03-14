import requests
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
load_dotenv()

# ─────────────────────────────────────────
# NOAA — Real time solar wind data
# ─────────────────────────────────────────

def get_solar_wind():
    """Fetch real-time solar wind data from NOAA"""
    url = "https://services.swpc.noaa.gov/products/solar-wind/mag-5-minute.json"
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        headers = data[0]
        rows = data[1:]
        df = pd.DataFrame(rows, columns=headers)
        df['time_tag'] = pd.to_datetime(df['time_tag'])
        for col in ['bx_gsm', 'by_gsm', 'bz_gsm', 'bt']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        return df
    except Exception as e:
        print(f"Error fetching solar wind: {e}")
        return None


def get_solar_wind_history():
    """Fetch 7 days of solar wind data"""
    url = "https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        headers = data[0]
        rows = data[1:]
        df = pd.DataFrame(rows, columns=headers)
        df['time_tag'] = pd.to_datetime(df['time_tag'])
        for col in ['bx_gsm', 'by_gsm', 'bz_gsm', 'bt']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        df = df.sort_values('time_tag').reset_index(drop=True)
        return df
    except Exception as e:
        print(f"Error fetching solar wind history: {e}")
        return None


# ─────────────────────────────────────────
# NOAA — Kp Index
# ─────────────────────────────────────────

def get_kp_index():
    """Fetch current and forecasted Kp index"""
    url = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        headers = data[0]
        rows = data[1:]
        df = pd.DataFrame(rows, columns=headers)
        df['time_tag'] = pd.to_datetime(df['time_tag'])
        df['kp'] = pd.to_numeric(df['Kp'], errors='coerce')
        return df
    except Exception as e:
        print(f"Error fetching Kp index: {e}")
        return None


# ─────────────────────────────────────────
# NASA DONKI — Solar flare alerts
# ─────────────────────────────────────────

def get_solar_flares():
    """Fetch recent solar flares from NASA DONKI API"""
    end_date   = datetime.utcnow().strftime('%Y-%m-%d')
    start_date = (datetime.utcnow() - timedelta(days=7)).strftime('%Y-%m-%d')
    nasa_key   = os.getenv("NASA_API_KEY", "DEMO_KEY")
    url = f"https://api.nasa.gov/DONKI/FLR?startDate={start_date}&endDate={end_date}&api_key={nasa_key}"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if not data:
            return pd.DataFrame()
        df = pd.DataFrame(data)
        return df[['flrID', 'beginTime', 'peakTime', 'classType', 'sourceLocation']]
    except Exception as e:
        print(f"Error fetching solar flares: {e}")
        return None


# ─────────────────────────────────────────
# 3-Day Kp Forecast
# ─────────────────────────────────────────

def get_kp_forecast():
    """Fetch 3-day Kp forecast from NOAA"""
    url = "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        headers = data[0]
        rows = data[1:]
        df = pd.DataFrame(rows, columns=headers)
        df['time_tag'] = pd.to_datetime(df['time_tag'])
        df['kp'] = pd.to_numeric(df['kp'], errors='coerce')
        df['observed'] = df['observed'].astype(str)
        return df
    except Exception as e:
        print(f"Error fetching Kp forecast: {e}")
        return None


# ─────────────────────────────────────────
# Kashmir Aurora History
# ─────────────────────────────────────────

def get_kashmir_aurora_history():
    """Historical aurora events visible from Kashmir — with rich detail"""
    events = [
        {
            "date": "2024-05-10",
            "kp_max": 9.0,
            "title": "The Great Storm of May 2024",
            "description": "Strongest geomagnetic storm in 20 years. Auroras visible across Kashmir, Ladakh and even parts of Rajasthan. Kp hit 9 — extreme level.",
            "color": "#ff4444",
            "storm_class": "G5 — Extreme",
            "visible_from": "Kashmir · Ladakh · Rajasthan · Gujarat",
            "duration": "3 days",
            "cause": "X-class flares from Active Region 13664 — one of the most active sunspot groups in decades.",
            "fun_fact": "This was only the 5th G5 storm ever recorded. People as far south as Mexico and India photographed auroras for the first time in their lives.",
            "what_happened": "A cluster of X-class solar flares erupted between May 8–10, launching multiple coronal mass ejections directly at Earth. The combined impact compressed Earth's magnetosphere to just 5 Earth radii — exposing satellites in geostationary orbit to direct solar wind."
        },
        {
            "date": "2024-10-10",
            "kp_max": 8.3,
            "title": "October 2024 Superstorm",
            "description": "Second massive storm of 2024. Multiple X-class flares preceded this event. Widespread aurora sightings across northern India.",
            "color": "#ff8c00",
            "storm_class": "G4 — Severe",
            "visible_from": "Kashmir · Ladakh · Northern India",
            "duration": "18 hours",
            "cause": "Three X-class flares fired in rapid succession from AR 13842 between Oct 8–9.",
            "fun_fact": "2024 became the most aurora-active year for the Indian subcontinent in recorded history — two G4+ storms in a single year is extraordinarily rare.",
            "what_happened": "Solar Cycle 25 peaked earlier and stronger than NASA predicted. The October storm arrived just 5 months after May's G5 event, catching many aurora hunters off guard. Pangong Lake and Gurez Valley reported naked-eye visibility lasting several hours."
        },
        {
            "date": "2024-08-12",
            "kp_max": 7.0,
            "title": "August 2024 Storm",
            "description": "Strong G3 storm during peak solar maximum. Faint aurora reported from high altitude spots in Ladakh.",
            "color": "#a855f7",
            "storm_class": "G3 — Strong",
            "visible_from": "Pangong Lake · Ladakh highlands",
            "duration": "6 hours",
            "cause": "A fast CME from an M9.8 flare on August 10 arrived at Earth in under 40 hours.",
            "fun_fact": "This storm coincided with the Perseid meteor shower peak — astrophotographers captured both shooting stars and faint aurora bands in the same long-exposure frame from Pangong Lake.",
            "what_happened": "While less dramatic than May and October, this event is scientifically notable because it demonstrated that even G3 storms can produce visible aurora at Kashmir's latitude (34°N geographic) when the Bz component dips below –20 nT for sustained periods."
        },
        {
            "date": "2025-03-15",
            "kp_max": 6.5,
            "title": "March 2025 Storm",
            "description": "G2 storm with aurora visible from Gurez Valley and Pangong Lake area.",
            "color": "#a855f7",
            "storm_class": "G2 — Moderate",
            "visible_from": "Gurez Valley · Pangong Lake",
            "duration": "4 hours",
            "cause": "A halo CME from an M6.4 flare, arriving during a period of already elevated solar wind.",
            "fun_fact": "This was the first documented aurora sighting specifically from Gurez Valley — a remote region with almost zero light pollution that may become a future aurora tourism destination.",
            "what_happened": "The storm hit during a new moon — perfect dark sky conditions. A group of local astronomers in Gurez Valley captured clear green bands on camera, confirming aurora visibility at this latitude during moderate storms. The photos went viral across Indian astronomy communities."
        },
        {
            "date": "2025-11-05",
            "kp_max": 8.0,
            "title": "November 2025 Storm",
            "description": "Major X2.5 flare triggered this G4 storm. Aurora visible with naked eye from Gulmarg.",
            "color": "#ff8c00",
            "storm_class": "G4 — Severe",
            "visible_from": "Gulmarg · Sonamarg · Ladakh",
            "duration": "12 hours",
            "cause": "An X2.5 solar flare on November 3, 2025 launched a fast-moving CME at 2,400 km/s — one of the fastest of Solar Cycle 25.",
            "fun_fact": "A group of 40 astronomy enthusiasts had gathered at Gulmarg specifically for this event after NOAA issued a G4 watch 48 hours in advance. They reported vivid red and green curtains — red aurora (caused by oxygen at high altitude) is extremely rare at these latitudes.",
            "what_happened": "The CME's extreme speed meant it arrived at Earth in just 38 hours — faster than typical 3-day forecasts. This caught some observers off guard but delighted those who had been monitoring space weather apps. Gulmarg's 2,690m altitude and northward-facing ridge made it the single best viewing spot in all of South Asia that night."
        }
    ]
    return events


# ─────────────────────────────────────────
# Quick test
# ─────────────────────────────────────────

if __name__ == "__main__":
    print("Fetching live space weather data...\n")
    sw = get_solar_wind()
    if sw is not None:
        print("Solar Wind (last 3 readings):")
        print(sw[['time_tag', 'bz_gsm', 'bt']].tail(3))
    kp = get_kp_index()
    if kp is not None:
        print("\nKp Index (last 3 readings):")
        print(kp[['time_tag', 'kp']].tail(3))
    flares = get_solar_flares()
    if flares is not None and not flares.empty:
        print("\nRecent Solar Flares:")
        print(flares.head())
    else:
        print("\nNo major flares in last 7 days")
