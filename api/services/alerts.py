import os
import resend
import requests
import asyncio
import pandas as pd
from datetime import datetime, timedelta
from src import predictor, space_weather

resend.api_key = os.environ.get("RESEND_API_KEY", "re_placeholder_key_not_set")

def send_aurora_email(user_email: str, score: float, lat: float, lon: float):
    """
    Sends a high-activity alert email to the user using the Resend Python SDK.
    """
    try:
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #333; background-color: #0b0f19; color: #f1f5f9; border-radius: 12px;">
            <h2 style="color: #00dc82; text-align: center; text-transform: uppercase; letter-spacing: 2px;">AuroraLens Alert</h2>
            <p style="font-size: 16px;"><strong>High Activity Detected!</strong></p>
            <p>Your saved target lock at coordinates <strong>{lat}, {lon}</strong> is currently surging with an AI Aurora Score of <strong><span style="color: #00dc82; font-size: 24px;">{score}</span>/100</strong>.</p>
            <p>The solar wind stream has hit specific thresholds making probability exceedingly high.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:3000" style="background-color: #00dc82; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">View on Map</a>
            </div>
        </div>
        """
        
        response = resend.Emails.send({
            "from": "AuroraLens Alerts <alerts@auroralens.app>",
            "to": user_email,
            "subject": f"🚨 High Aurora Probability Spiking at {lat}, {lon}!",
            "html": html_content
        })
        print(f"✅ Email dispatched successfully to {user_email}: {response}")
    except Exception as e:
        print(f"❌ Failed to dispatch Resend email: {e}")

def send_forecast_alert_email(user_email: str, score: float, peak_time: str, lat: float, lon: float):
    """
    Predictive Heads Up Alert for T+12 execution.
    """
    try:
        html_content = f"""
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #333; background-color: #0b0f19; color: #f1f5f9; border-radius: 12px;">
            <h2 style="color: #00dc82; text-align: center; text-transform: uppercase; letter-spacing: 2px;">AuroraLens Alert</h2>
            <p style="font-size: 16px;"><strong>Heads Up: High Aurora Activity predicted in 8 hours!</strong></p>
            <p>Your saved location at coordinates <strong>{lat}, {lon}</strong> is forecasted to peak at an AI Aurora Score of <strong><span style="color: #00dc82; font-size: 24px;">{score}</span>/100</strong> around {peak_time} UTC.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:3000" style="background-color: #00dc82; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">View Predictive Timeline</a>
            </div>
        </div>
        """
        response = resend.Emails.send({
            "from": "AuroraLens Alerts <alerts@auroralens.app>",
            "to": user_email,
            "subject": "Heads Up: High Aurora Activity predicted in 8 hours!",
            "html": html_content
        })
        print(f"✅ Fast-track predictive email dispatched successfully to {user_email}: {response}")
    except Exception as e:
        print(f"❌ Failed to dispatch predictive email: {e}")

def generate_24h_forecast(lat: float, lon: float):
    """
    Loops XGBoost over the T+1 to T+24 blocks using the NOAA Kp Predictor.
    Saves the payload to the Prisma Postgres DB via Next.js REST API Bridge.
    Returns the peak T+12 score and time for predictive alert extraction.
    """
    sw_df = space_weather.get_solar_wind()
    kp_fc = space_weather.get_kp_forecast()
    
    if not isinstance(kp_fc, pd.DataFrame) or kp_fc.empty or sw_df is None:
        return None, None

    lat_row = sw_df.iloc[-1]
    bz = float(lat_row['bz_gsm'])
    bt = float(lat_row['bt'])
    
    now = datetime.utcnow()
    future_24h = now + timedelta(hours=24)
    future_12h = now + timedelta(hours=12)
    
    mask = (kp_fc['time_tag'] > now) & (kp_fc['time_tag'] <= future_24h)
    fc_subset = kp_fc[mask]
    
    forecasts = []
    max_12h_score = 0
    peak_time_str = ""
    
    for idx, row in fc_subset.iterrows():
        t = row['time_tag']
        kp_val = float(row['kp']) if not pd.isna(row['kp']) else 0.0
        
        # Calculate aurora score using predicted Kp and current baseline solar wind
        res = predictor.calculate_aurora_probability(
            kp=kp_val, bz=bz, bt=bt,
            lat=lat, lon=lon,
            speed=400.0, density=5.0, temp=100000.0, cloud_cover=0.0
        )
        score = res.get("score", 0)
        
        forecasts.append({
            "lat": lat,
            "lng": lon,
            "targetTime": t.isoformat() + "Z", # Prisma DateTime compatibility
            "predictedScore": score
        })
        
        # Track highest score peaking within the next 12 hours
        if t <= future_12h and score > max_12h_score:
            max_12h_score = score
            peak_time_str = t.strftime("%H:%M")
            
    # Bridge Python Backend to NextJs/Prisma Database
    try:
        requests.post("http://localhost:3000/api/internal/forecasts", json={"forecasts": forecasts}, timeout=3)
    except Exception:
        pass # Optional log
        
    return max_12h_score, peak_time_str

async def check_alert_conditions(user_lat: float, user_lon: float, user_email: str, min_score: int):
    """
    Evaluates current real-time space weather for a specific location
    and triggers an alert if the aurora probability crosses the user's min_score threshold.
    """
    try:
        sw_df = space_weather.get_solar_wind()
        kp_df = space_weather.get_kp_index()
        
        if sw_df is None or sw_df.empty or kp_df is None or kp_df.empty:
            return

        lat_row = sw_df.iloc[-1]
        bz = float(lat_row['bz_gsm'])
        bt = float(lat_row['bt'])
        kp_val = float(kp_df.iloc[-1]['kp'])

        res = predictor.calculate_aurora_probability(
            kp=kp_val, bz=bz, bt=bt,
            lat=user_lat, lon=user_lon,
            speed=400.0, density=5.0, temp=100000.0,
            cloud_cover=0.0
        )
        aurora_score = res.get("score", 0)
        
        peak_12h_score, peak_time = generate_24h_forecast(user_lat, user_lon)
        
        if peak_12h_score and peak_12h_score >= min_score:
            print(f"🚨 PREDICTIVE ALERT: Aurora Spike ({peak_12h_score}/100) inbound at {peak_time} UTC for {user_email}!")
            send_forecast_alert_email(user_email, peak_12h_score, peak_time, user_lat, user_lon)
        
        elif aurora_score >= min_score:
            print(f"🚨 LIVE ALERT: High Aurora Probability ({aurora_score}/100) detected safely at {user_lat}, {user_lon} for {user_email}!")
            send_aurora_email(user_email, aurora_score, user_lat, user_lon)
            
    except Exception as e:
        print(f"Alert condition check failed for {user_email}: {e}")

async def start_alert_scheduler():
    """Background task to run check_alert_conditions continuously across all active targets."""
    import asyncpg
    db_url = os.environ.get("DATABASE_URL")
    
    while True:
        try:
            if db_url:
                conn = await asyncpg.connect(db_url)
                rows = await conn.fetch('SELECT email, lat, lon, "minScore" FROM "TargetLock" WHERE "isAlertEnabled" = true')
                await conn.close()
                for row in rows:
                    await check_alert_conditions(float(row['lat']), float(row['lon']), row['email'], int(row['minScore']))
            else:
                print("⚠️ DATABASE_URL not set in Sentry backend. Target locks unreachable.")
        except Exception as e:
            print(f"Error checking targets in db loop: {e}")
            
        await asyncio.sleep(305)
