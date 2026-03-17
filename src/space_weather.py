import requests
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
load_dotenv()

# ─────────────────────────────────────────
# NOAA — Real-Time Telemetry (DSCOVR)
# ─────────────────────────────────────────

def get_solar_wind():
    """Fetch real-time magnetic field data (BT, BZ) from NOAA DSCOVR"""
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

def get_plasma_data():
    """Fetch real-time plasma speed, density, and temperature from NOAA"""
    url = "https://services.swpc.noaa.gov/products/solar-wind/plasma-5-minute.json"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        headers = data[0]
        rows = data[1:]
        df = pd.DataFrame(rows, columns=headers)
        df['time_tag'] = pd.to_datetime(df['time_tag'])
        for col in ['density', 'speed', 'temperature']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        return df
    except Exception as e:
        print(f"Error fetching plasma data: {e}")
        return None

def get_solar_wind_history():
    """Fetch 7 days of magnetic field history"""
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
# NOAA — planetary K-index
# ─────────────────────────────────────────

def get_kp_index():
    """Fetch the current observed planetary K-index (Kp)"""
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

def get_kp_forecast():
    """Fetch 3-day Kp forecast (Observed + Predicted bits)"""
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

def fetch_7day_kp_forecast():
    """Fetch and parse NOAA 27-day Space Weather Outlook Table (27DO.txt)"""
    import data_manager as dm
    
    cached_df, last_updated = dm.load_from_cache("kp_7day_forecast")
    if cached_df is not None and last_updated:
        updated_dt = datetime.fromisoformat(last_updated)
        if datetime.utcnow() - updated_dt < timedelta(hours=6):
            return cached_df

    url = "https://services.swpc.noaa.gov/text/27-day-outlook.txt"
    try:
        response = requests.get(url, timeout=15)
        text = response.text
        lines = text.split('\n')
        
        forecast_data = []
        for line in lines:
            line = line.strip()
            if not line or line.startswith(':') or line.startswith('#'):
                continue
            
            parts = line.split()
            if len(parts) >= 6:
                try:
                    date_str = f"{parts[0]} {parts[1]} {parts[2]}"
                    dt = datetime.strptime(date_str, "%Y %b %d")
                    kp = float(parts[-1])
                    forecast_data.append({"time_tag": dt, "kp": kp})
                except Exception:
                    continue
        
        if not forecast_data:
            return None
            
        df = pd.DataFrame(forecast_data)
        df = df.sort_values('time_tag').reset_index(drop=True)
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        df = df[df['time_tag'] >= today].head(7)
        dm.save_to_cache("kp_7day_forecast", df)
        return df
    except Exception as e:
        print(f"Error fetching 7-day outlook: {e}")
        return None

# ─────────────────────────────────────────
# NASA DONKI — Space Weather Events
# ─────────────────────────────────────────

def get_solar_flares():
    """Fetch recent solar flare events from NASA DONKI"""
    end_date   = datetime.utcnow().strftime('%Y-%m-%d')
    start_date = (datetime.utcnow() - timedelta(days=7)).strftime('%Y-%m-%d')
    nasa_key   = os.getenv("NASA_API_KEY", "DEMO_KEY")
    url = f"https://api.nasa.gov/DONKI/FLR?startDate={start_date}&endDate={end_date}&api_key={nasa_key}"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if not data or not isinstance(data, list):
            return pd.DataFrame()
        df = pd.DataFrame(data)
        return df[['flrID', 'beginTime', 'peakTime', 'classType', 'sourceLocation']]
    except Exception as e:
        print(f"Error fetching flares: {e}")
        return None

if __name__ == "__main__":
    print("Executing AuroraLens Telemetry Ingestion Test...\n")
    sw = get_solar_wind()
    if sw is not None: print(f"MAG Data: BZ={sw.iloc[-1]['bz_gsm']} nT, BT={sw.iloc[-1]['bt']} nT")
    plasma = get_plasma_data()
    if plasma is not None: print(f"PLASMA Data: Speed={plasma.iloc[-1]['speed']} km/s, Density={plasma.iloc[-1]['density']} n/cm3")
    kp = get_kp_index()
    if kp is not None: print(f"Current Kp: {kp.iloc[-1]['kp']}")
