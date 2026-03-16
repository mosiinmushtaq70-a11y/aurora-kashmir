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
        model_s1 = joblib.load(os.path.join(MODEL_DIR, 'aurora_model_stage1.pkl'))
        model_s2 = joblib.load(os.path.join(MODEL_DIR, 'aurora_model_stage2.pkl'))
        feature_cols = joblib.load(os.path.join(MODEL_DIR, 'feature_cols.pkl'))
        try:
            feature_medians = joblib.load(os.path.join(MODEL_DIR, 'feature_medians.pkl'))
        except Exception as e:
            print(f"Warning: feature_medians loading failed: {e}. Using zero-fill fallback.")
            # Fallback medians for critical features if pkl fails
            feature_medians = {col: 0.0 for col in (feature_cols if feature_cols else [])}
            # Manually set some sane defaults for standard OMNI features
            defaults = {'kp': 3.0, 'bz_gsm': 0.0, 'bt': 5.0, 'sw_speed': 400.0, 'proton_density': 5.0}
            for k, v in defaults.items():
                if k in feature_medians: feature_medians[k] = v
                
    except Exception as e:
        print(f"Critical error loading primary AI models: {e}")

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

def calculate_aurora_probability(kp, bz, bt, lat=34.08, lon=74.79, speed=None, density=None, temp=None):
    """
    Calculate aurora visibility using trained XGBoost models.
    Default coords: Kashmir (for backward compatibility during migration)
    """
    
    geomag_lat = geo_to_geomagnetic_lat(lat, lon)
    threshold = kp_threshold_for_geomag_lat(geomag_lat)
    
    # If models failed to load, fallback to heuristic
    if model_s1 is None or feature_cols is None or feature_medians is None:
        return fallback_heuristic(kp, bz, bt, threshold)

    # 1. Prepare Features for Model
    # Use the saved medians for all features (including lags and rolls which we don't have for real-time)
    # Note: In production, we should ideally compute lags/rolls from historical buffers.
    # For now, we use medians as a stable baseline for missing high-order features.
    input_vals = feature_medians.copy()
    
    # Update known current telemetry with correct keys as per trained model (feature_cols.pkl)
    input_vals['bz_gsm'] = bz
    input_vals['scalar_b'] = bt
    if speed: input_vals['sw_speed'] = speed
    if density: input_vals['proton_density'] = density
    if temp: input_vals['sw_temperature'] = temp
    
    # Derived features required by the model (mimicking engineer_features in train_model.py)
    input_vals['bz_south'] = abs(min(bz, 0))
    if speed:
        input_vals['ey_merging'] = speed * input_vals['bz_south'] / 1000.0
    
    # Time features
    now = datetime.utcnow()
    input_vals['month'] = now.month
    input_vals['hour_of_day'] = now.hour
    input_vals['year_raw'] = now.year

    # Create DataFrame with correct column order
    # Any missing columns (lags/rolls) remain at their median values
    input_df = pd.DataFrame([input_vals])[feature_cols]

    # 2. Stage 1 Inference: Quiet vs Active
    is_active = model_s1.predict(input_df)[0]
    prob_active = model_s1.predict_proba(input_df)[0][1]
    
    # 3. Stage 2 Inference: Intensity (if active)
    intensity_label = 0 # None
    if is_active:
        intensity_idx = model_s2.predict(input_df)[0] + 1 # +1 to skip 'None' offset
        intensity_label = intensity_idx
    
    # Map index to Kp range for a "Predicted Kp" (Midpoints from train_model.py logic)
    # 0: None (<3), 1: Low (3-5), 2: Mod (5-6.5), 3: Strong (7-8.5), 4: Extreme (9+)
    kp_midpoints = [1.5, 4.0, 5.7, 7.7, 9.0]
    predicted_kp = kp_midpoints[intensity_label]
    
    # AI Score: weighted by how much the predicted Kp exceeds the local threshold
    score_base = (predicted_kp / max(threshold, 1.0)) * 50
    # Add bonus for Bz negativity
    bz_bonus = max(0, -bz * 2) if bz < 0 else 0
    final_score = min(100, int(score_base + bz_bonus + (prob_active * 20)))

    # Classification & Tips
    levels = ["MINIMAL", "LOW", "MODERATE", "HIGH", "EXTREME"]
    
    # Logic: Even if the model predicts a storm, it must meet the location threshold
    if predicted_kp >= threshold:
        level = levels[intensity_label]
    else:
        level = "MINIMAL"
    
    desc_map = {
        "MINIMAL": f"No aurora activity expected. You need Kp >= {threshold} here.",
        "LOW": "Faint aurora possible with long exposure photography.",
        "MODERATE": "Likely visible from dark sky areas with the naked eye.",
        "HIGH": "Strong aurora display expected. Vivid colors visible.",
        "EXTREME": "G5 Storm conditions! Visible even from city centers."
    }
    
    tips_map = {
        "MINIMAL": ["Check back tomorrow", "Kp too low for this latitude"],
        "LOW": ["Use a tripod", "Face the magnetic pole", "15s exposure"],
        "MODERATE": ["Get away from city lights", "Face the horizon", "Wait for Bz dips"],
        "HIGH": ["Charge all batteries", "A once-in-a-year opportunity", "Look up!"],
        "EXTREME": ["Go outside now", "Widespread visibility", "Historical event"]
    }

    return {
        "score": final_score,
        "level": level,
        "description": desc_map[level],
        "tips": tips_map[level],
        "ai_predicted_kp": round(predicted_kp, 1),
        "threshold": threshold,
        "prob_active": round(prob_active, 2)
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
    res = calculate_aurora_probability(kp=4, bz=-10, bt=15, lat=69.6, lon=18.9)
    print(f"Global AI Prediction (Tromso): {res['score']} pts - {res['level']} (Pred Kp: {res['ai_predicted_kp']})")
    
    # Test for Kashmir (threshold 8)
    res_k = calculate_aurora_probability(kp=4, bz=-10, bt=15, lat=34.0, lon=74.7)
    print(f"Global AI Prediction (Kashmir): {res_k['score']} pts - {res_k['level']} (Threshold: {res_k['threshold']})")