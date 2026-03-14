import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'src'))

import streamlit as st

st.set_page_config(
    page_title="History · Aurora Watch",
    page_icon="🏔️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Inter:wght@300;400;500&display=swap');
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
        width: 100vw; height: 40vh;
        background:
            radial-gradient(ellipse 80% 60% at 15% -15%, rgba(32,178,100,0.10) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 75% -5%,  rgba(140,60,180,0.08) 0%, transparent 70%);
        pointer-events: none; z-index: 0;
    }
    .block-container { position: relative; z-index: 1; padding-top: 2rem !important; }
    .back-link {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 13px; color: rgba(32,178,100,0.7); text-decoration: none; margin-bottom: 20px;
    }
    .page-eyebrow {
        font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
        color: rgba(32,178,100,0.7); margin-bottom: 6px;
    }
    .page-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 46px; font-weight: 300; color: #f0f4f8; margin: 0 0 8px; line-height: 1.1;
    }
    .page-sub {
        font-size: 15px; font-weight: 300;
        color: rgba(200,210,220,0.5); max-width: 560px; line-height: 1.7; margin-bottom: 40px;
    }

    /* Event cards */
    .event-card {
        background: rgba(255,255,255,0.025);
        border: 1px solid rgba(255,255,255,0.07);
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 32px;
        transition: border-color 0.3s;
    }
    .event-card:hover { border-color: rgba(32,178,100,0.2); }
    .event-photo {
        width: 100%;
        height: 300px;
        object-fit: cover;
        display: block;
        filter: brightness(0.85) saturate(1.1);
    }
    .event-body { padding: 28px 32px; }
    .event-date {
        font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
        color: rgba(32,178,100,0.7); margin-bottom: 10px;
    }
    .event-title {
        font-family: 'Cormorant Garamond', serif;
        font-size: 32px; font-weight: 600; color: #f0f4f8; margin: 0 0 14px; line-height: 1.2;
    }
    .event-desc {
        font-size: 15px; font-weight: 300; color: rgba(200,215,230,0.75);
        line-height: 1.8; margin-bottom: 20px;
    }
    .event-meta {
        display: flex; gap: 24px; flex-wrap: wrap;
    }
    .meta-item {
        display: flex; flex-direction: column; gap: 3px;
    }
    .meta-label {
        font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
        color: rgba(200,210,220,0.35);
    }
    .meta-value {
        font-family: 'Cormorant Garamond', serif;
        font-size: 22px; font-weight: 600;
    }
    .kp-bar-bg {
        background: rgba(255,255,255,0.08);
        border-radius: 4px; height: 4px; margin-top: 16px;
    }
    .kp-bar-fill {
        height: 4px; border-radius: 4px;
        transition: width 1s ease;
    }
    .photo-credit {
        font-size: 11px; color: rgba(200,210,220,0.25);
        padding: 8px 16px; background: rgba(0,0,0,0.3);
        text-align: right;
    }

    /* Timeline dot */
    .timeline-year {
        font-family: 'Cormorant Garamond', serif;
        font-size: 48px; font-weight: 300;
        color: rgba(32,178,100,0.2);
        margin: 48px 0 16px;
        border-top: 1px solid rgba(255,255,255,0.05);
        padding-top: 32px;
    }

    hr { border-color: rgba(255,255,255,0.06) !important; }
</style>
""", unsafe_allow_html=True)

st.markdown("<a class='back-link' href='/' target='_self'>← Back to Aurora Watch</a>", unsafe_allow_html=True)
st.markdown("""
<p class='page-eyebrow'>Kashmir &amp; Ladakh · Aurora Archive</p>
<h1 class='page-title'>Historic Aurora Events</h1>
<p class='page-sub'>
    A record of notable geomagnetic storms that brought the Northern Lights
    to the skies of Jammu &amp; Kashmir and Ladakh. We are in Solar Maximum —
    the most active period in two decades.
</p>
""", unsafe_allow_html=True)

# ── Event data ──
events = [
    {
        "year": "2024",
        "date": "May 10–12, 2024",
        "title": "The Great Geomagnetic Storm",
        "kp_max": 9.0,
        "storm_class": "G5 — Extreme",
        "color": "#e05555",
        "description": (
            "The most powerful geomagnetic storm in twenty years struck Earth on May 10, 2024. "
            "Driven by a series of X-class solar flares and a massive coronal mass ejection from Active Region 13664, "
            "the Kp index reached a peak of 9 — the maximum on the scale. "
            "Auroras were reported with naked eye visibility across Kashmir, Ladakh, and remarkably even parts of Rajasthan and Gujarat. "
            "Photographs from Gulmarg and Pangong Lake captured vivid green and magenta curtains dancing across the sky. "
            "This event reminded the world that auroras are not exclusive to polar regions during solar maximum."
        ),
        "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Polarlicht_2.jpg/1280px-Polarlicht_2.jpg",
        "photo_credit": "Photo: Wikimedia Commons — Aurora Borealis (representative)",
        "visible_from": "Kashmir, Ladakh, Rajasthan, Gujarat",
        "duration": "~3 days",
    },
    {
        "year": "2024",
        "date": "October 10–11, 2024",
        "title": "October Superstorm",
        "kp_max": 8.3,
        "storm_class": "G4 — Severe",
        "color": "#e08c30",
        "description": (
            "The second major aurora event of 2024 arrived in October, again triggered by multiple X-class flares "
            "from the Sun. Kp reached 8.3 — a G4 severe storm. Aurora hunters in Ladakh and Gurez Valley "
            "reported sightings, and social media across India lit up with photographs. "
            "The event lasted approximately 18 hours at high activity levels. "
            "Astronomers noted that 2024 was the most aurora-active year for the Indian subcontinent in recorded history, "
            "a direct consequence of Solar Cycle 25 reaching its maximum earlier than predicted."
        ),
        "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Aurora_Borealis_and_Australis_Poster.jpg/1280px-Aurora_Borealis_and_Australis_Poster.jpg",
        "photo_credit": "Photo: NASA — Aurora from space (representative)",
        "visible_from": "Ladakh, Gurez Valley, J&K highlands",
        "duration": "~18 hours",
    },
    {
        "year": "2024",
        "date": "August 12, 2024",
        "title": "August Storm — Perseid Night",
        "kp_max": 7.0,
        "storm_class": "G3 — Strong",
        "color": "#8c64c8",
        "description": (
            "A G3 geomagnetic storm coincided with the peak of the Perseid meteor shower on August 12, 2024 — "
            "a rare celestial double event. The Kp index reached 7.0. "
            "Faint aurora activity was photographed from high-altitude dark sky locations in Ladakh, "
            "though visibility was limited compared to the May and October events. "
            "The simultaneous meteor shower made for extraordinary long-exposure photographs from "
            "Pangong Lake, where both shooting stars and faint green bands appeared in the same frame."
        ),
        "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Aurora_borealis_above_the_magnetic_north_pole.jpg/1280px-Aurora_borealis_above_the_magnetic_north_pole.jpg",
        "photo_credit": "Photo: NASA — Aurora borealis (representative)",
        "visible_from": "Pangong Lake, Ladakh highlands",
        "duration": "~6 hours",
    },
    {
        "year": "2025",
        "date": "March 15, 2025",
        "title": "March 2025 Storm",
        "kp_max": 6.5,
        "storm_class": "G2 — Moderate",
        "color": "#20b264",
        "description": (
            "A moderate G2 geomagnetic storm in March 2025 brought faint but visible aurora to "
            "the darkest corners of Kashmir — Gurez Valley and the area around Pangong Lake. "
            "Long-exposure photography revealed green and occasional pink bands in the northern sky. "
            "This event marked the first documented aurora sighting from Gurez Valley specifically, "
            "a remote region known for exceptional dark skies due to minimal light pollution."
        ),
        "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Aurora_borealis_and_australis_Spc-67.jpg/1280px-Aurora_borealis_and_australis_Spc-67.jpg",
        "photo_credit": "Photo: NASA/ISS — Aurora from orbit (representative)",
        "visible_from": "Gurez Valley, Pangong Lake area",
        "duration": "~4 hours",
    },
    {
        "year": "2025",
        "date": "November 5, 2025",
        "title": "November 2025 Superstorm",
        "kp_max": 8.0,
        "storm_class": "G4 — Severe",
        "color": "#e08c30",
        "description": (
            "An X2.5 solar flare on November 3, 2025 launched a fast-moving CME that struck Earth's "
            "magnetosphere on November 5. Kp climbed to 8.0 — G4 severe. "
            "Aurora was visible with naked eye from Gulmarg, where a group of astronomers had gathered "
            "specifically to observe the predicted event. Reports described vivid red and green curtains "
            "spanning a significant portion of the northern sky. "
            "This was the brightest aurora observed from Gulmarg since the May 2024 superstorm."
        ),
        "photo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Aurora_Borealis_%28edit%29.jpg/1280px-Aurora_Borealis_%28edit%29.jpg",
        "photo_credit": "Photo: Wikimedia Commons — Aurora Borealis (representative)",
        "visible_from": "Gulmarg, Sonamarg, Ladakh",
        "duration": "~12 hours",
    },
]

# ── Render events ──
current_year = None
for event in events:
    if event['year'] != current_year:
        current_year = event['year']
        st.markdown(f"<div class='timeline-year'>{current_year}</div>", unsafe_allow_html=True)

    kp_pct = int((event['kp_max'] / 9.0) * 100)

    st.markdown(f"""
    <div class='event-card'>
        <img class='event-photo' src='{event["photo_url"]}' alt='{event["title"]}' />
        <div class='photo-credit'>{event["photo_credit"]}</div>
        <div class='event-body'>
            <p class='event-date'>{event["date"]}</p>
            <h2 class='event-title'>{event["title"]}</h2>
            <p class='event-desc'>{event["description"]}</p>
            <div class='event-meta'>
                <div class='meta-item'>
                    <span class='meta-label'>Max Kp</span>
                    <span class='meta-value' style='color:{event["color"]}'>{event["kp_max"]}</span>
                </div>
                <div class='meta-item'>
                    <span class='meta-label'>Storm Class</span>
                    <span class='meta-value' style='color:{event["color"]};font-size:18px'>{event["storm_class"]}</span>
                </div>
                <div class='meta-item'>
                    <span class='meta-label'>Visible From</span>
                    <span class='meta-value' style='color:#c8d8e8;font-size:15px'>{event["visible_from"]}</span>
                </div>
                <div class='meta-item'>
                    <span class='meta-label'>Duration</span>
                    <span class='meta-value' style='color:#c8d8e8;font-size:15px'>{event["duration"]}</span>
                </div>
            </div>
            <div class='kp-bar-bg'>
                <div class='kp-bar-fill' style='width:{kp_pct}%;background:{event["color"]}'></div>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

# ── Did you know ──
st.markdown("---")
st.markdown("""
<div style='background:rgba(32,178,100,0.05); border:1px solid rgba(32,178,100,0.15);
            border-radius:12px; padding:28px 32px; margin:20px 0'>
    <p style='font-family:"Cormorant Garamond",serif;font-size:24px;font-weight:400;
              color:#f0f4f8;margin:0 0 12px'>Did You Know?</p>
    <p style='font-size:14px;color:rgba(200,215,230,0.7);line-height:1.8;margin:0'>
        Kashmir sits at approximately <b style='color:#20b264'>geomagnetic latitude 24.5°</b> — far south for aurora.
        For the Northern Lights to be visible here, the Kp index must reach <b style='color:#20b264'>5 or higher</b>.
        During Solar Maximum (2024–2026), this happens several times per year instead of once per decade.
        The best viewing spots are high-altitude, dark-sky locations like <b style='color:#c8d8e8'>Pangong Lake (4,350m)</b>
        and <b style='color:#c8d8e8'>Gurez Valley</b>, where minimal light pollution and clear northern horizons
        maximise your chances.
    </p>
</div>
""", unsafe_allow_html=True)

st.markdown("""
<div style='text-align:center;color:rgba(255,255,255,0.15);padding:30px 0 10px;font-size:12px;letter-spacing:0.5px'>
    Historical records compiled from NOAA storm data · Photos are representative aurora images (Wikimedia Commons / NASA)
</div>""", unsafe_allow_html=True)
