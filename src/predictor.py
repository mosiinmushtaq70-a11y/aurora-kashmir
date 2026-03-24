import os
import joblib
import pandas as pd
import numpy as np
import math
from datetime import datetime

# ─────────────────────────────────────────
# AuroraLens AI Inference Engine
# ─────────────────────────────────────────

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')

# Load models sequentially for better error isolation
model_s1 = model_s2 = feature_cols = feature_medians = None

def load_ai_assets():
    global model_s1, model_s2, feature_cols, feature_medians
    try:
        # Based on actual filesystem check:
        # aurora_model_stage1.pkl
        # aurora_model_stage2.pkl
        # feature_cols.pkl
        # feature_medians.pkl
        model_s1 = joblib.load(os.path.join(MODEL_DIR, 'aurora_model_stage1.pkl'))
        model_s2 = joblib.load(os.path.join(MODEL_DIR, 'aurora_model_stage2.pkl'))
        feature_cols = joblib.load(os.path.join(MODEL_DIR, 'feature_cols.pkl'))
        feature_medians = joblib.load(os.path.join(MODEL_DIR, 'feature_medians.pkl'))
        print("Success: AI Models and Metadata loaded.")
    except Exception as e:
        print(f"Critical error loading AI models: {e}. Falling back to heuristic mode.")
        # Ensure we have minimum fallback medians so the predictor can still run
        if not feature_medians:
            feature_medians = {'kp': 3.0, 'bz_gsm': 0.0, 'bt': 5.0, 'sw_speed': 400.0, 'proton_density': 5.0}

load_ai_assets()

def geo_to_geomagnetic_lat(lat, lon):
    """Approximate geomagnetic latitude from geographic coordinates (SaaS Global logic)"""
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

def calculate_aurora_probability(kp, bz, bt, lat=34.08, lon=74.79, speed=None, density=None, temp=None, cloud_cover=0):
    """
    Calculate aurora visibility using trained XGBoost models, incorporating environmental factors.
    """
    
    geomag_lat = geo_to_geomagnetic_lat(lat, lon)
    threshold = kp_threshold_for_geomag_lat(geomag_lat)
    
    # If models failed to load, fallback to heuristic
    if model_s1 is None or feature_cols is None or feature_medians is None:
        return fallback_heuristic(kp, bz, bt, threshold)

    # 1. Prepare Features for Model
    # Start with a full set of medians from the training set
    input_vals = feature_medians.copy()
    
    # Override with live/forecast solar wind data
    input_vals['bz_gsm'] = bz
    input_vals['scalar_b'] = bt
    if speed: input_vals['sw_speed'] = speed
    if density: input_vals['proton_density'] = density
    if temp: input_vals['sw_temperature'] = temp
    
    # Calculate derived features
    input_vals['bz_south'] = abs(min(bz, 0))
    if speed:
        input_vals['ey_merging'] = speed * input_vals['bz_south'] / 1000.0
    
    # Add temporal features
    now = datetime.utcnow()
    input_vals['month'] = now.month
    input_vals['hour_of_day'] = now.hour
    input_vals['year_raw'] = now.year
    
    # Approximation for Solar Cycle (11-year cycle)
    # Using 2025 as a peak year (Solar Maximum)
    cycle_days = (now - datetime(2019, 12, 1)).days # Dec 2019 was Solar Minimum
    cycle_phase = (cycle_days % 4017) / 4017.0 * 2 * math.pi
    input_vals['solar_cycle_sin'] = math.sin(cycle_phase)
    input_vals['solar_cycle_cos'] = math.cos(cycle_phase)

    # Ensure ALL columns expected by the model are present (prevents 'not in index' errors)
    # Missing lag features or obscure features will stay at their median values
    for col in feature_cols:
        if col not in input_vals:
            input_vals[col] = feature_medians.get(col, 0.0)

    input_df = pd.DataFrame([input_vals])[feature_cols]

    # 2. Stage 1 Inference: Quiet vs Active
    is_active = model_s1.predict(input_df)[0]
    prob_active = model_s1.predict_proba(input_df)[0][1]
    
    # 3. Stage 2 Inference: Intensity (if active)
    intensity_label = 0 # None
    if is_active:
        intensity_idx = model_s2.predict(input_df)[0] + 1 
        intensity_label = intensity_idx
    
    # Map index to Kp range for a "Predicted Kp"
    kp_midpoints = [1.5, 4.0, 5.7, 7.7, 9.0]
    predicted_kp = kp_midpoints[intensity_label]
    
    # Classification logic
    levels = ["MINIMAL", "LOW", "MODERATE", "HIGH", "EXTREME"]
    
    # Strict check: if model says Quiet OR predicted Kp < threshold, it is MINIMAL
    if is_active and predicted_kp >= threshold:
        level = levels[intensity_label]
    else:
        level = "MINIMAL"

    # AI Score: Reflecting true observability
    if level == "MINIMAL":
        # In high latitudes (Alaska, Scandinavia), even 'Quiet' periods often have active arcs.
        # We boost the score for these regions to ensure the engine feels 'alive'.
        lat_factor = max(0, (abs(geomag_lat) - 45) / 20.0) # 0 at 45deg, 1.0 at 65deg
        lat_bonus = lat_factor * 45 
        final_score = int(prob_active * 30 + lat_bonus) 
    else:
        # Score base: scaled 0-100 based on intensity and threshold
        # Intensity label is 1-5 (after +1 in Stage 2)
        score_base = 40 + (intensity_label * 10) + (max(0, predicted_kp - threshold) / (9 - threshold + 0.1)) * 30
        bz_bonus = min(20, max(0, -bz * 1.5)) if bz < 0 else 0
        final_score = min(100, int(score_base + bz_bonus))

    desc_map = {
        "MINIMAL": "Magnetic shield closed (Bz positive) or activity too low for current latitude." if bz > 0 else f"Sky is quiet. Kp {threshold}+ required here.",
        "LOW": "Faint photographic aurora possible. Look deep north.",
        "MODERATE": "Naked-eye visibility possible in dark sky areas.",
        "HIGH": "Vivid auroras likely with green and purple pillars.",
        "EXTREME": "Major G5 Storm! Visible globally from many regions."
    }
    
    tips_map = {
        "MINIMAL": ["Wait for Bz to drop negative", "Check back in 1-2 hours"],
        "LOW": ["Use a tripod", "10-15s long exposure", "Face the pole"],
        "MODERATE": ["Get away from city lights", "Face the horizon"],
        "HIGH": ["Charge all batteries", "Once-in-a-year event", "Look up!"],
        "EXTREME": ["Go outside now", "Widespread visibility", "Historical event"]
    }

    # 4. Environmental Adjustments (Phase 3)
    # Apply cloud cover penalty: multiplicative reduction
    # Logic: final_score = base_score * (1 - (cloud_cover / 100) * 0.5)
    # A 100% cloud cover reduces score by 50% max.
    cloud_penalty = (cloud_cover / 100.0) * 0.5
    obscured_score = int(final_score * (1 - cloud_penalty))

    return {
        "score": obscured_score,
        "base_score": final_score,
        "level": level,
        "description": desc_map[level],
        "tips": tips_map[level],
        "ai_predicted_kp": round(predicted_kp, 1),
        "threshold": threshold,
        "prob_active": round(prob_active, 2),
        "cloud_cover": cloud_cover
    }

def fallback_heuristic(kp, bz, bt, threshold):
    """Original logic for when AI models aren't available"""
    score = 0
    kp_diff = kp - threshold
    if kp_diff >= 3: score += 60
    elif kp_diff >= 1: score += 40
    elif kp_diff >= 0: score += 20
    
    bz_score = max(0, -bz * 2.5) if bz < 0 else 0
    score = min(100, int(score + bz_score + (bt / 2)))
    
    level = "⚪ MINIMAL"
    if score >= 75: level = "🔴 EXTREME"
    elif score >= 55: level = "🟠 HIGH"
    elif score >= 35: level = "🟡 MODERATE"
    elif score >= 15: level = "🟢 LOW"
    
    return {
        "score": score,
        "level": level,
        "description": "Heuristic fallback active (AI Engine Offline).",
        "tips": ["AI engine offline - Check installation"],
        "ai_predicted_kp": round(kp, 1),
        "threshold": threshold,
        "prob_active": 0.0
    }

if __name__ == "__main__":
    # Test for Tromso (threshold 0)
    res = calculate_aurora_probability(kp=4, bz=-10, bt=15, lat=69.6, lon=18.9, cloud_cover=20)
    print(f"Global AI Prediction (Tromso): {res['score']} pts - {res['level']} (Pred Kp: {res['ai_predicted_kp']})")
    
    # Test for Kashmir (threshold 8)
    res_k = calculate_aurora_probability(kp=4, bz=-10, bt=15, lat=34.0, lon=74.7)
    print(f"Global AI Prediction (Kashmir): {res_k['score']} pts - {res_k['level']} (Threshold: {res_k['threshold']})")