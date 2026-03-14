import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import time

from space_weather import get_solar_wind, get_kp_index, get_solar_flares, get_solar_wind_history, get_kp_forecast
from predictor import calculate_aurora_probability

st.set_page_config(
    page_title="Kashmir · Aurora Watch",
    page_icon="🏔️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ── Auto refresh every 10 minutes ──
st.session_state.setdefault('last_refresh', time.time())
if time.time() - st.session_state.last_refresh > 600:
    st.session_state.last_refresh = time.time()
    st.rerun()

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Inter:wght@300;400;500&display=swap');

    .stApp {
        background: #05080f;
        font-family: 'Inter', sans-serif;
        color: #e2e8f0;
    }
    #MainMenu, footer { visibility: hidden; }

    /* Aurora subtle bg */
    .stApp::before {
        content: '';
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 35vh;
        background:
            radial-gradient(ellipse 80% 60% at 20% -10%, rgba(32,178,100,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 70% -5%,  rgba(0,180,180,0.09) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 90% 0%,   rgba(140,60,180,0.08) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
        animation: subtleShift 20s ease-in-out infinite;
    }
    @keyframes subtleShift {
        0%,100% { opacity: 0.8; transform: scaleX(1); }
        50%      { opacity: 1;   transform: scaleX(1.05); }
    }

    .block-container { position: relative; z-index: 1; padding-top: 2rem !important; }

    /* Page title */
    .page-header {
        margin-bottom: 2rem;
    }
    .page-eyebrow {
        font-size: 11px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: rgba(32,178,100,0.7);
        margin-bottom: 6px;
    }
    .page-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 42px;
        font-weight: 300;
        color: #f0f4f8;
        margin: 0;
        line-height: 1.1;
    }

    /* Cards */
    .card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 14px;
        padding: 24px;
        text-align: center;
        transition: background 0.3s;
    }
    .card:hover { background: rgba(255,255,255,0.05); }

    .score-number {
        font-family: 'Cormorant Garamond', serif;
        font-size: 80px;
        font-weight: 300;
        color: #20b264;
        line-height: 1;
        margin: 8px 0;
    }
    .card-label {
        font-size: 11px;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: rgba(200,210,220,0.5);
    }
    .card-value {
        font-size: 26px;
        font-weight: 400;
        color: #f0f4f8;
        margin: 10px 0 4px;
    }
    .card-sub {
        font-size: 13px;
        color: rgba(200,210,220,0.5);
        line-height: 1.5;
    }

    /* Section headers */
    .section-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 26px;
        font-weight: 400;
        color: #e2e8f0;
        margin: 2rem 0 1rem;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        padding-bottom: 8px;
    }

    /* Tip boxes */
    .tip-box {
        background: rgba(32,178,100,0.06);
        border-left: 2px solid rgba(32,178,100,0.4);
        padding: 10px 16px;
        border-radius: 0 8px 8px 0;
        margin: 6px 0;
        font-size: 14px;
        color: #c8d8e8;
    }

    /* Flare cards */
    .flare-card {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 10px;
        padding: 16px;
        text-align: center;
    }

    /* Slider */
    .stSlider > div > div > div > div {
        background: linear-gradient(90deg, #20b264, #00b4b4) !important;
    }
    .stSlider > div > div > div > div > div {
        background: #20b264 !important;
        border-color: #00b4b4 !important;
    }

    /* Metric overrides */
    [data-testid="metric-container"] {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 10px;
        padding: 16px;
    }

    /* Back link */
    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: rgba(32,178,100,0.7);
        text-decoration: none;
        margin-bottom: 20px;
        letter-spacing: 0.3px;
    }
    .back-link:hover { color: #20b264; }

    /* Divider */
    hr { border-color: rgba(255,255,255,0.06) !important; }
</style>
""", unsafe_allow_html=True)


# ── Back + Header ──
st.markdown("<a class='back-link' href='/' target='_self'>← Back to Aurora Watch</a>", unsafe_allow_html=True)
st.markdown("""
<div class='page-header'>
    <p class='page-eyebrow'>Jammu &amp; Kashmir · 34.08°N</p>
    <h1 class='page-title'>Aurora Forecast</h1>
</div>
""", unsafe_allow_html=True)

# ── Refresh button ──
c1, c2, c3 = st.columns([5, 1, 5])
with c2:
    st.button("↻ Refresh", use_container_width=True)

# ── Fetch Data ──
with st.spinner("Fetching live space weather data..."):
    sw_df     = get_solar_wind()
    kp_df     = get_kp_index()
    flares_df = get_solar_flares()

if sw_df is None or kp_df is None:
    st.error("Could not fetch space weather data. Please try again.")
    st.stop()

latest_sw = sw_df.iloc[-1]
bz   = float(latest_sw['bz_gsm'])
bt   = float(latest_sw['bt'])
kp   = float(kp_df.iloc[-1]['kp'])
result = calculate_aurora_probability(kp=kp, bz=bz, bt=bt)

# ── Score Cards ──
st.markdown("---")
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
    flare_count = len(flares_df) if flares_df is not None and not flares_df.empty else 0
    st.markdown(f"""
    <div class='card'>
        <p class='card-label'>Solar Flares · 7 days</p>
        <div class='score-number' style='font-size:60px'>{flare_count}</div>
        <p class='card-label'>active flare events</p>
    </div>""", unsafe_allow_html=True)

# ── Live Metrics ──
st.markdown("<p class='section-title'>Live Space Weather</p>", unsafe_allow_html=True)
m1, m2, m3 = st.columns(3)
m1.metric("Kp Index",       f"{kp}",     delta="Need ≥5 for Kashmir")
m2.metric("Bz Component",   f"{bz} nT",  delta="Negative = Good")
m3.metric("Bt Total Field",  f"{bt} nT", delta="Higher = Stronger")

# ── Time Range Slider ──
st.markdown("---")
time_range = st.select_slider(
    "Time range:",
    options=["2 hours","6 hours","12 hours","1 day","2 days","3 days","5 days","7 days"],
    value="1 day"
)
range_map  = {"2 hours":2,"6 hours":6,"12 hours":12,"1 day":24,"2 days":48,"3 days":72,"5 days":120,"7 days":168}
hours_back = range_map[time_range]
cutoff     = pd.Timestamp.utcnow().tz_localize(None) - pd.Timedelta(hours=hours_back)
sw_history = get_solar_wind_history()

PLOT_LAYOUT = dict(
    paper_bgcolor='rgba(0,0,0,0)',
    plot_bgcolor='rgba(0,0,0,0)',
    font_color='#a0b0c0',
    xaxis=dict(showgrid=False, color='#4a5568'),
    yaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)', color='#4a5568'),
    margin=dict(l=0, r=0, t=20, b=0)
)

# ── Kp History ──
st.markdown("<p class='section-title'>Kp Index History</p>", unsafe_allow_html=True)
kp_f = kp_df[kp_df['time_tag'] >= cutoff]
fig_kp = go.Figure()
fig_kp.add_trace(go.Scatter(
    x=kp_f['time_tag'], y=kp_f['kp'],
    fill='tozeroy',
    line=dict(color='#20b264', width=2),
    fillcolor='rgba(32,178,100,0.12)',
    name='Kp'
))
fig_kp.add_hline(y=5, line_dash="dash", line_color="rgba(0,180,180,0.5)",
    annotation_text="Aurora threshold (Kp=5)", annotation_font_color="rgba(0,180,180,0.8)")
fig_kp.update_layout(**PLOT_LAYOUT, height=280,
    yaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)', color='#4a5568', range=[0,9]))
st.plotly_chart(fig_kp, use_container_width=True)

# ── 3-Day Forecast ──
st.markdown("<p class='section-title'>3-Day Kp Forecast</p>", unsafe_allow_html=True)
forecast_df = get_kp_forecast()

if forecast_df is not None and not forecast_df.empty:
    observed  = forecast_df[forecast_df['observed'] == 'observed']
    predicted = forecast_df[forecast_df['observed'] == 'predicted']
    estimated = forecast_df[forecast_df['observed'] == 'estimated']

    fig_fc = go.Figure()
    if not observed.empty:
        fig_fc.add_trace(go.Scatter(x=observed['time_tag'], y=observed['kp'],
            name='Observed', line=dict(color='#20b264', width=2),
            fill='tozeroy', fillcolor='rgba(32,178,100,0.1)'))
    if not estimated.empty:
        fig_fc.add_trace(go.Scatter(x=estimated['time_tag'], y=estimated['kp'],
            name='Estimated', line=dict(color='#00b4b4', width=2, dash='dot')))
    if not predicted.empty:
        fig_fc.add_trace(go.Scatter(x=predicted['time_tag'], y=predicted['kp'],
            name='Predicted', line=dict(color='rgba(140,100,200,0.9)', width=2, dash='dash'),
            fill='tozeroy', fillcolor='rgba(140,100,200,0.05)'))

    fig_fc.add_hline(y=5, line_dash="dash", line_color="rgba(220,80,80,0.5)",
        annotation_text="Aurora threshold (Kp=5)", annotation_font_color="rgba(220,80,80,0.8)")

    now = pd.Timestamp.utcnow()
    fig_fc.add_trace(go.Scatter(x=[now,now], y=[0,9], mode='lines',
        line=dict(color='rgba(255,255,255,0.2)', dash='dot', width=1),
        name='Now', showlegend=True))

    fig_fc.update_layout(**PLOT_LAYOUT, height=320,
        yaxis=dict(showgrid=True, gridcolor='rgba(255,255,255,0.05)',
                   color='#4a5568', range=[0,9], title='Kp Index'),
        legend=dict(orientation='h', yanchor='bottom', y=1.02,
                    xanchor='right', x=1, font=dict(color='#a0b0c0')))
    st.plotly_chart(fig_fc, use_container_width=True)

    future_p = predicted[predicted['time_tag'] > pd.Timestamp.utcnow().tz_localize(None)]
    if not future_p.empty:
        max_kp   = future_p['kp'].max()
        max_time = future_p.loc[future_p['kp'].idxmax(), 'time_tag']
        color    = "rgba(32,178,100,0.12)" if max_kp < 5 else "rgba(220,80,80,0.1)"
        border   = "rgba(32,178,100,0.3)"  if max_kp < 5 else "rgba(220,80,80,0.4)"
        icon     = "📊" if max_kp < 5 else "🚨"
        msg      = f"below aurora threshold" if max_kp < 5 else "could be visible from Kashmir!"
        st.markdown(f"""
        <div style='background:{color}; border:1px solid {border};
                    border-radius:10px; padding:14px 18px; margin-top:8px; font-size:14px;'>
            {icon} Peak predicted Kp: <b>{max_kp}</b> around
            <b>{max_time.strftime('%b %d, %H:%M UTC')}</b> — {msg}
        </div>""", unsafe_allow_html=True)
else:
    st.info("Forecast data unavailable right now.")

# ── Bz Chart ──
st.markdown("<p class='section-title'>Bz Component — Solar Wind</p>", unsafe_allow_html=True)
sw_f = sw_history[sw_history['time_tag'] >= cutoff] if sw_history is not None else sw_df
fig_bz = go.Figure()
fig_bz.add_trace(go.Scatter(x=sw_f['time_tag'], y=sw_f['bz_gsm'],
    line=dict(color='#00b4b4', width=1.5), name='Bz'))
fig_bz.add_hline(y=0, line_color='rgba(255,255,255,0.15)')
fig_bz.add_hrect(y0=-30, y1=0, fillcolor="rgba(32,178,100,0.04)",
    annotation_text="Favorable zone", annotation_font_color="rgba(32,178,100,0.6)")
fig_bz.update_layout(**PLOT_LAYOUT, height=260)
st.plotly_chart(fig_bz, use_container_width=True)

# ── Solar Flares ──
if flares_df is not None and not flares_df.empty:
    st.markdown("<p class='section-title'>Recent Solar Flares</p>", unsafe_allow_html=True)
    cols = st.columns(min(len(flares_df), 5))
    for i, (_, flare) in enumerate(flares_df.head(5).iterrows()):
        color = "#e05555" if str(flare['classType']).startswith('X') else \
                "#e08c30" if str(flare['classType']).startswith('M') else "#4caf80"
        with cols[i]:
            st.markdown(f"""
            <div class='flare-card'>
                <p style='font-size:22px;font-weight:700;color:{color};margin:0'>{flare['classType']}</p>
                <p style='color:rgba(200,210,220,0.5);font-size:11px;margin:6px 0'>{str(flare['beginTime'])[:16]}</p>
                <p style='color:#c8d8e8;font-size:12px;margin:0'>📍 {flare['sourceLocation']}</p>
            </div>""", unsafe_allow_html=True)

# ── Viewing Tips ──
st.markdown("<p class='section-title'>Tonight's Viewing Tips</p>", unsafe_allow_html=True)
for tip in result['tips']:
    st.markdown(f"<div class='tip-box'>✦ {tip}</div>", unsafe_allow_html=True)

# ── Map ──
st.markdown("<p class='section-title'>Best Viewing Spots</p>", unsafe_allow_html=True)

spots = pd.DataFrame({
    'name':      ['Gulmarg',   'Sonamarg',  'Doodhpathri', 'Pangong Lake', 'Gurez Valley'],
    'lat':       [34.0484,      34.3091,     33.8542,        33.7782,        34.6537],
    'lon':       [74.3805,      75.2933,     74.5268,        78.6536,        74.8493],
    'altitude':  ['2690m',      '2740m',     '2730m',        '4350m',        '2400m'],
    'darkness':  ['Excellent',  'Excellent', 'Very Good',    'Excellent',    'Good'],
})

fig_map = go.Figure(go.Scattermapbox(
    lat=spots['lat'], lon=spots['lon'],
    mode='markers+text',
    marker=dict(size=14, color='#20b264', opacity=0.85),
    text=spots['name'],
    textposition='top right',
    textfont=dict(color='white', size=12),
    customdata=spots[['altitude','darkness']],
    hovertemplate="<b>%{text}</b><br>Altitude: %{customdata[0]}<br>Dark Sky: %{customdata[1]}<extra></extra>"
))
fig_map.update_layout(
    mapbox=dict(style='carto-darkmatter', center=dict(lat=34.2, lon=75.5), zoom=6.5),
    paper_bgcolor='rgba(0,0,0,0)',
    margin=dict(l=0, r=0, t=0, b=0),
    height=420
)
st.plotly_chart(fig_map, use_container_width=True)

# ── Footer ──
st.markdown("""
<div style='text-align:center;color:rgba(255,255,255,0.15);padding:30px 0 10px;font-size:12px;letter-spacing:0.5px'>
    NOAA Space Weather Prediction Center · NASA DONKI · Built for Kashmir
</div>""", unsafe_allow_html=True)
