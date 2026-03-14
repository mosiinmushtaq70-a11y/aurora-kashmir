import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import requests
import math

from space_weather import get_solar_wind, get_kp_index
from predictor import calculate_aurora_probability

st.set_page_config(
    page_title="Any Location · Aurora Watch",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="collapsed"
)

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500&display=swap');
    .stApp {
        background: #05080f;
        font-family: 'Inter', sans-serif;
        color: #e2e8f0;
    }
    #MainMenu, footer { visibility: hidden; }
    .stApp::before {
        content: '';
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 35vh;
        background:
            radial-gradient(ellipse 70% 60% at 30% -10%, rgba(32,178,100,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 50% 50% at 80% -5%,  rgba(0,180,180,0.08) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
    }
    .block-container { position: relative; z-index: 1; padding-top: 2rem !important; }
    .page-eyebrow {
        font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
        color: rgba(32,178,100,0.7); margin-bottom: 6px;
    }
    .page-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 42px; font-weight: 300; color: #f0f4f8; margin: 0; line-height: 1.1;
    }
    .section-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 26px; font-weight: 400; color: #e2e8f0;
        margin: 2rem 0 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        padding-bottom: 8px;
    }
    .card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 14px; padding: 24px; text-align: center;
    }
    .score-number {
        font-family: 'Cormorant Garamond', serif;
        font-size: 80px; font-weight: 300; color: #20b264; line-height: 1; margin: 8px 0;
    }
    .card-label {
        font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
        color: rgba(200,210,220,0.5);
    }
    .card-value { font-size: 26px; font-weight: 400; color: #f0f4f8; margin: 10px 0 4px; }
    .card-sub   { font-size: 13px; color: rgba(200,210,220,0.5); line-height: 1.5; }
    .tip-box {
        background: rgba(32,178,100,0.06);
        border-left: 2px solid rgba(32,178,100,0.4);
        padding: 10px 16px; border-radius: 0 8px 8px 0;
        margin: 6px 0; font-size: 14px; color: #c8d8e8;
    }
    .info-box {
        background: rgba(0,180,180,0.06);
        border: 1px solid rgba(0,180,180,0.15);
        border-radius: 10px; padding: 16px 20px;
        font-size: 14px; color: #c8d8e8; margin-bottom: 20px;
    }
    .back-link {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 13px; color: rgba(32,178,100,0.7);
        text-decoration: none; margin-bottom: 20px;
    }
    hr { border-color: rgba(255,255,255,0.06) !important; }
    [data-testid="metric-container"] {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 10px; padding: 16px;
    }
</style>
""", unsafe_allow_html=True)


def geocode_location(query):
    """Use OpenStreetMap Nominatim to geocode a location (no API key needed)"""
    try:
        url = "https://nominatim.openstreetmap.org/search"
        params = {"q": query, "format": "json", "limit": 1}
        headers = {"User-Agent": "AuroraWatch/1.0"}
        r = requests.get(url, params=params, headers=headers, timeout=8)
        data = r.json()
        if data:
            return {
                "name": data[0].get("display_name", query).split(",")[0],
                "lat":  float(data[0]["lat"]),
                "lon":  float(data[0]["lon"])
            }
    except Exception:
        pass
    return None


def geo_to_geomagnetic_lat(lat, lon):
    """Approximate geomagnetic latitude from geographic coordinates"""
    # Dipole pole: 80.9°N, 289.1°E (IGRF approximation)
    pole_lat = math.radians(80.9)
    pole_lon = math.radians(289.1)
    lat_r    = math.radians(lat)
    lon_r    = math.radians(lon)
    geo_lat  = math.asin(
        math.sin(lat_r) * math.sin(pole_lat) +
        math.cos(lat_r) * math.cos(pole_lat) * math.cos(lon_r - pole_lon)
    )
    return math.degrees(geo_lat)


def kp_threshold_for_geomag_lat(geomag_lat):
    """Minimum Kp needed to see aurora at a given geomagnetic latitude"""
    abs_lat = abs(geomag_lat)
    if abs_lat >= 65: return 0
    if abs_lat >= 60: return 1
    if abs_lat >= 55: return 2
    if abs_lat >= 50: return 3
    if abs_lat >= 45: return 4
    if abs_lat >= 40: return 5
    if abs_lat >= 35: return 6
    if abs_lat >= 30: return 7
    if abs_lat >= 25: return 8
    return 9


def calculate_location_aurora(kp, bz, bt, geomag_lat):
    """Calculate aurora probability for any location"""
    threshold = kp_threshold_for_geomag_lat(geomag_lat)
    score = 0

    # Kp vs threshold
    kp_excess = kp - threshold
    if kp_excess >= 3:   score += 50
    elif kp_excess >= 2: score += 40
    elif kp_excess >= 1: score += 28
    elif kp_excess >= 0: score += 15
    else:                score += max(0, int(10 + kp_excess * 5))

    # Bz
    if bz <= -20:   score += 30
    elif bz <= -10: score += 25
    elif bz <= -5:  score += 18
    elif bz <= 0:   score += 10

    # Bt
    if bt >= 25:   score += 20
    elif bt >= 15: score += 14
    elif bt >= 10: score += 8
    else:          score += 3

    score = min(score, 100)

    if score >= 75:
        level = "🔴 EXTREME"
        desc  = "Exceptional aurora event — visible even from lower latitudes."
        tips  = ["Go outside immediately!", "Face toward the poles", "Camera will capture more color than naked eye"]
    elif score >= 55:
        level = "🟠 HIGH"
        desc  = "Strong aurora likely tonight from a dark location."
        tips  = ["Escape city lights", "Face toward the poles", "Best viewing 10pm–2am local time"]
    elif score >= 35:
        level = "🟡 MODERATE"
        desc  = "Possible aurora from very dark sky locations."
        tips  = ["Need a very dark location", "Long camera exposure may capture it", "Conditions could improve"]
    elif score >= 15:
        level = "🟢 LOW"
        desc  = "Unlikely but monitor conditions — can change quickly."
        tips  = ["Check back in a few hours", "Kp is building slowly"]
    else:
        level = "⚪ MINIMAL"
        desc  = "No aurora activity expected for this location."
        tips  = ["Your latitude needs Kp ≥ " + str(threshold) + " to see aurora",
                 "Current Kp: " + str(round(kp, 1))]

    return {"score": score, "level": level, "description": desc, "tips": tips,
            "threshold": threshold}


# ── Page ──
st.markdown("<a class='back-link' href='/' target='_self'>← Back to Aurora Watch</a>", unsafe_allow_html=True)
st.markdown("""
<div style='margin-bottom:2rem'>
    <p class='page-eyebrow'>Worldwide · Location Search</p>
    <h1 class='page-title'>Aurora for Any Location</h1>
</div>
""", unsafe_allow_html=True)

st.markdown("""
<div class='info-box'>
    🌍 Enter any city, region, or landmark. We'll calculate the aurora probability
    based on your geomagnetic latitude and live space weather data.
</div>
""", unsafe_allow_html=True)

# ── Search ──
col_search, col_btn = st.columns([5, 1])
with col_search:
    location_query = st.text_input("", placeholder="e.g. Srinagar, Tromsø, Reykjavik, Ladakh, Helsinki...",
                                   label_visibility="collapsed")
with col_btn:
    search_clicked = st.button("Search", use_container_width=True)

if not location_query:
    st.markdown("""
    <div style='text-align:center; padding: 60px 20px; color: rgba(200,210,220,0.3)'>
        <p style='font-size:48px;margin-bottom:12px'>🌍</p>
        <p style='font-size:16px'>Search a location above to get its aurora forecast</p>
        <p style='font-size:13px;margin-top:8px'>Try: Tromsø · Iceland · Ladakh · Helsinki · Fairbanks</p>
    </div>
    """, unsafe_allow_html=True)
    st.stop()

# ── Geocode ──
with st.spinner(f"Finding {location_query}..."):
    location = geocode_location(location_query)

if location is None:
    st.error(f"Could not find '{location_query}'. Try a different spelling or a nearby city.")
    st.stop()

lat = location['lat']
lon = location['lon']
geo_lat = geo_to_geomagnetic_lat(lat, lon)

# ── Fetch space weather ──
with st.spinner("Fetching live space weather..."):
    sw_df = get_solar_wind()
    kp_df = get_kp_index()

if sw_df is None or kp_df is None:
    st.error("Could not fetch space weather data. Please try again.")
    st.stop()

latest_sw = sw_df.iloc[-1]
bz   = float(latest_sw['bz_gsm'])
bt   = float(latest_sw['bt'])
kp   = float(kp_df.iloc[-1]['kp'])
result = calculate_location_aurora(kp=kp, bz=bz, bt=bt, geomag_lat=geo_lat)

# ── Location info ──
st.markdown("---")
hemi = "Northern" if lat >= 0 else "Southern"
st.markdown(f"""
<div style='background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
            border-radius:12px; padding:18px 24px; margin-bottom:20px;
            display:flex; gap:40px; flex-wrap:wrap'>
    <div>
        <p style='margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(200,210,220,0.4)'>Location</p>
        <p style='margin:4px 0 0;font-size:18px;color:#f0f4f8;font-weight:500'>{location['name']}</p>
    </div>
    <div>
        <p style='margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(200,210,220,0.4)'>Geographic</p>
        <p style='margin:4px 0 0;font-size:18px;color:#f0f4f8'>{lat:.2f}°N, {lon:.2f}°E</p>
    </div>
    <div>
        <p style='margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(200,210,220,0.4)'>Geomagnetic Lat.</p>
        <p style='margin:4px 0 0;font-size:18px;color:#20b264'>{geo_lat:.1f}°</p>
    </div>
    <div>
        <p style='margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(200,210,220,0.4)'>Kp Needed</p>
        <p style='margin:4px 0 0;font-size:18px;color:#f0f4f8'>≥ {result['threshold']}</p>
    </div>
    <div>
        <p style='margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(200,210,220,0.4)'>Hemisphere</p>
        <p style='margin:4px 0 0;font-size:18px;color:#f0f4f8'>{hemi}</p>
    </div>
</div>
""", unsafe_allow_html=True)

# ── Score Cards ──
col1, col2, col3 = st.columns(3)
with col1:
    st.markdown(f"""
    <div class='card'>
        <p class='card-label'>Aurora Score</p>
        <div class='score-number'>{result['score']}</div>
        <p class='card-label'>out of 100</p>
    </div>""", unsafe_allow_html=True)
with col2:
    st.markdown(f"""
    <div class='card'>
        <p class='card-label'>Visibility Level</p>
        <div class='card-value'>{result['level']}</div>
        <p class='card-sub'>{result['description']}</p>
    </div>""", unsafe_allow_html=True)
with col3:
    st.markdown(f"""
    <div class='card'>
        <p class='card-label'>Current Kp</p>
        <div class='score-number' style='font-size:60px'>{round(kp,1)}</div>
        <p class='card-label'>need ≥ {result['threshold']} here</p>
    </div>""", unsafe_allow_html=True)

# ── Live metrics ──
st.markdown("<p class='section-title'>Live Space Weather</p>", unsafe_allow_html=True)
m1, m2, m3 = st.columns(3)
m1.metric("Kp Index",      f"{kp}",     delta=f"Threshold here: {result['threshold']}")
m2.metric("Bz Component",  f"{bz} nT",  delta="Negative = Good")
m3.metric("Bt Total Field", f"{bt} nT", delta="Higher = Stronger")

# ── Tips ──
st.markdown("<p class='section-title'>Viewing Tips</p>", unsafe_allow_html=True)
for tip in result['tips']:
    st.markdown(f"<div class='tip-box'>✦ {tip}</div>", unsafe_allow_html=True)

# ── Map ──
st.markdown("<p class='section-title'>Your Location</p>", unsafe_allow_html=True)
fig_map = go.Figure(go.Scattermapbox(
    lat=[lat], lon=[lon],
    mode='markers+text',
    marker=dict(size=16, color='#20b264'),
    text=[location['name']],
    textposition='top right',
    textfont=dict(color='white', size=13),
    hovertemplate=f"<b>{location['name']}</b><br>Geomag lat: {geo_lat:.1f}°<br>Kp needed: ≥{result['threshold']}<extra></extra>"
))
fig_map.update_layout(
    mapbox=dict(style='carto-darkmatter', center=dict(lat=lat, lon=lon), zoom=5),
    paper_bgcolor='rgba(0,0,0,0)',
    margin=dict(l=0, r=0, t=0, b=0),
    height=380
)
st.plotly_chart(fig_map, use_container_width=True)

# ── Footer ──
st.markdown("""
<div style='text-align:center;color:rgba(255,255,255,0.15);padding:30px 0 10px;font-size:12px;letter-spacing:0.5px'>
    Geocoding · OpenStreetMap Nominatim · Space Weather · NOAA &amp; NASA
</div>""", unsafe_allow_html=True)
