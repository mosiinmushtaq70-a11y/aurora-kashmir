# ─────────────────────────────────────────
# Aurora Visibility Predictor for Kashmir
# ─────────────────────────────────────────

# Kashmir coordinates
KASHMIR_LAT = 34.0837
KASHMIR_LON = 74.7973

# Geomagnetic latitude of Kashmir (this is what matters for auroras)
KASHMIR_GEO_LAT = 24.5  # roughly

def calculate_aurora_probability(kp, bz, bt, solar_wind_speed=None):
    """
    Calculate aurora visibility probability for Kashmir
    
    Parameters:
        kp    : Current Kp index (0-9)
        bz    : Bz component of solar wind (negative = good)
        bt    : Total magnetic field strength
        solar_wind_speed: Optional solar wind speed
    
    Returns:
        dict with probability, level, description, and tips
    """
    
    score = 0  # We'll build a score out of 100
    
    # ── Factor 1: Kp Index (most important, 50 points) ──
    # For Kashmir (lower latitude), we need higher Kp
    if kp >= 8:
        score += 50
    elif kp >= 7:
        score += 42
    elif kp >= 6:
        score += 32
    elif kp >= 5:
        score += 20
    elif kp >= 4:
        score += 10
    else:
        score += 0

    # ── Factor 2: Bz Component (30 points) ──
    # Negative Bz = magnetic field pointing south = auroras more likely
    if bz <= -20:
        score += 30
    elif bz <= -10:
        score += 25
    elif bz <= -5:
        score += 18
    elif bz <= 0:
        score += 10
    else:
        score += 0  # Positive Bz = bad for auroras

    # ── Factor 3: Bt (total field strength) (20 points) ──
    if bt >= 25:
        score += 20
    elif bt >= 15:
        score += 14
    elif bt >= 10:
        score += 8
    else:
        score += 3

    # ── Classify the result ──
    if score >= 75:
        level = "🔴 EXTREME"
        description = "Exceptional aurora event! Visible across Kashmir even in city areas."
        tips = [
            "Go outside immediately!",
            "Face north and look up",
            "Any open area works — no need to escape city lights",
            "Use your phone camera — it captures aurora better than naked eye"
        ]
    elif score >= 55:
        level = "🟠 HIGH"
        description = "Strong chance of aurora visible from Kashmir tonight."
        tips = [
            "Get away from city lights — Doodhpathri, Gulmarg ideal",
            "Face north, look near horizon first",
            "Camera will show more color than your eyes",
            "Best viewing between 10pm - 2am"
        ]
    elif score >= 35:
        level = "🟡 MODERATE"
        description = "Possible aurora from high altitude dark sky locations."
        tips = [
            "Only visible from very dark high altitude spots",
            "Gulmarg or Sonamarg recommended",
            "Long exposure photography might capture it",
            "Conditions could improve if Bz goes more negative"
        ]
    elif score >= 15:
        level = "🟢 LOW"
        description = "Unlikely to see aurora from Kashmir tonight."
        tips = [
            "Not worth the trip tonight",
            "Monitor conditions — can change fast",
            "Solar activity is building though"
        ]
    else:
        level = "⚪ MINIMAL"
        description = "No aurora activity expected for Kashmir."
        tips = ["Check back tomorrow!", "Subscribe to alerts for sudden changes"]

    return {
        "score": score,
        "level": level,
        "description": description,
        "tips": tips,
        "factors": {
            "kp_index": kp,
            "bz_component": bz,
            "bt_total": bt,
        }
    }


if __name__ == "__main__":
    # Test with current data we just pulled
    # Kp: 4.67, Bz: ~3.5 (positive), Bt: ~11
    result = calculate_aurora_probability(kp=4.67, bz=3.5, bt=11)
    
    print(f"\n🌌 Aurora Visibility for Kashmir")
    print(f"{'─'*40}")
    print(f"Score      : {result['score']}/100")
    print(f"Level      : {result['level']}")
    print(f"Outlook    : {result['description']}")
    print(f"\n📍 Tips:")
    for tip in result['tips']:
        print(f"   • {tip}")