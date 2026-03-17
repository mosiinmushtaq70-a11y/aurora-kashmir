"""
Aurora Lens — Global Aurora Prediction Model
GPU: RTX 3050 6GB (CUDA) | Data: NASA OMNI hourly 1995-2026

Pipeline:
  1. Parse OMNI data, filter post-1995
  2. Feature engineering (lags, rolls, physics, solar cycle)
  3. Two-stage XGBoost: Stage1=quiet/active, Stage2=intensity
  4. SMOTE oversampling for rare Extreme events
  5. Location-aware prediction for any lat/lon on Earth
"""

import pandas as pd
import numpy as np
import joblib
import os
import sys
import warnings
import time
import math
import io

# Enforce UTF-8 to prevent Windows console UnicodeEncodeError
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

DATA_FILE   = "data/omni_data.txt"
MODEL_DIR   = "models"
MIN_YEAR    = 1995
FORECAST_H  = 3
TRAIN_SPLIT = 0.85
USE_GPU     = True

COLUMNS = [
    'year', 'doy', 'hour',
    'imf_spacecraft_id', 'sw_spacecraft_id',
    'scalar_b', 'by_gsm', 'bz_gsm',
    'sw_temperature', 'proton_density', 'sw_speed',
    'flow_pressure', 'e_field',
    'kp', 'dst', 'ap', 'f10_7', 'ae',
    'proton_flux_1mev', 'proton_flux_10mev',
]

OMNI_FLAGS = {
    'scalar_b': 999.9, 'by_gsm': 999.9, 'bz_gsm': 999.9,
    'sw_temperature': 9999999.0, 'proton_density': 999.9,
    'sw_speed': 9999.0, 'flow_pressure': 99.99, 'e_field': 999.99,
    'kp': 999, 'dst': 99999, 'ap': 999, 'f10_7': 999.9,
    'ae': 99999, 'proton_flux_1mev': 9999999.0, 'proton_flux_10mev': 9999999.0,
}

LEAKY      = {'ap', 'ae', 'dst'}
LABELS     = ['None', 'Low', 'Moderate', 'Strong', 'Extreme']
LABEL_BARS = {'None':'⚪','Low':'🟢','Moderate':'🟡','Strong':'🟠','Extreme':'🔴'}


# ─────────────────────────────────────────────────────────────
# UTILITY FUNCTIONS
# ─────────────────────────────────────────────────────────────

def section(title):
    print(f"\n{'═'*65}\n  {title}\n{'═'*65}")

def log(msg):
    print(f"  {msg}")

def kp_to_class(kp):
    if pd.isna(kp): return np.nan
    if kp >= 8.0:   return 4
    if kp >= 6.0:   return 3
    if kp >= 5.0:   return 2
    if kp >= 3.0:   return 1
    return 0

def kp_to_min_lat(kp):
    if kp >= 9: return 25
    if kp >= 8: return 30
    if kp >= 7: return 40
    if kp >= 6: return 45
    if kp >= 5: return 50
    if kp >= 4: return 55
    if kp >= 3: return 60
    return 65

def geo_to_geomagnetic_lat(lat, lon):
    """Geographic → geomagnetic latitude (IGRF dipole approximation)"""
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
    a = abs(geomag_lat)
    if a >= 65: return 0
    if a >= 60: return 1
    if a >= 55: return 2
    if a >= 50: return 3
    if a >= 45: return 4
    if a >= 40: return 5
    if a >= 35: return 6
    if a >= 30: return 7
    if a >= 25: return 8
    return 9

def aurora_quality_for_location(pred_kp, user_lat, user_lon):
    """Aurora visibility quality for any point on Earth"""
    geomag_lat = geo_to_geomagnetic_lat(user_lat, user_lon)
    threshold  = kp_threshold_for_geomag_lat(geomag_lat)
    excess     = pred_kp - threshold
    if excess >= 3:   quality = 'Excellent'
    elif excess >= 2: quality = 'Good'
    elif excess >= 1: quality = 'Fair'
    elif excess >= 0: quality = 'Marginal'
    else:             quality = 'Not visible'
    return {
        'visible':         excess >= 0,
        'quality':         quality,
        'geomagnetic_lat': round(geomag_lat, 1),
        'kp_needed':       threshold,
        'kp_excess':       round(excess, 1),
        'hemisphere':      'Northern' if user_lat >= 0 else 'Southern',
    }


# ─────────────────────────────────────────────────────────────
# STEP 1 — PARSE
# ─────────────────────────────────────────────────────────────

def parse_omni_file(filepath):
    section("STEP 1 — PARSING OMNI DATA")
    t0 = time.time()

    df = pd.read_csv(filepath, sep=r'\s+', header=None, names=COLUMNS)
    log(f"Raw rows loaded : {len(df):,}")

    for col, flag in OMNI_FLAGS.items():
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            if flag > 0:
                df[col] = df[col].where(df[col] < flag * 0.99, np.nan)
            else:
                df[col] = df[col].where(df[col] != flag, np.nan)

    df['kp'] = df['kp'] / 10.0

    df = df.dropna(subset=['year', 'doy', 'hour'])
    df['datetime'] = pd.to_datetime(
        df['year'].astype(int).astype(str) + '-' +
        df['doy'].astype(int).astype(str).str.zfill(3),
        format='%Y-%j'
    ) + pd.to_timedelta(df['hour'].astype(int), unit='h')

    df = df.set_index('datetime').sort_index()
    df = df[~df.index.duplicated(keep='first')]
    df = df.drop(columns=['imf_spacecraft_id', 'sw_spacecraft_id',
                           'year', 'doy', 'hour'], errors='ignore')

    before = len(df)
    df = df[df.index.year >= MIN_YEAR]
    log(f"Post-{MIN_YEAR} filter  : {before:,} → {len(df):,} rows")
    log(f"Date range      : {df.index.min().date()} → {df.index.max().date()}")
    log(f"Parse time      : {time.time()-t0:.1f}s")
    log("\nMissing values:")
    for col, cnt in df.isnull().sum().items():
        pct = cnt / len(df) * 100
        bar = '#' * int(pct / 2)
        log(f"  {col:<25} {cnt:>6,}  ({pct:4.1f}%)  {bar}")

    return df


# ─────────────────────────────────────────────────────────────
# STEP 2 — FEATURE ENGINEERING
# ─────────────────────────────────────────────────────────────

def engineer_features(df):
    section("STEP 2 — FEATURE ENGINEERING")
    t0   = time.time()
    feat = df.copy()

    SW_CORE  = [c for c in ['bz_gsm','by_gsm','sw_speed','scalar_b','flow_pressure'] if c in feat.columns]
    SW_EXTRA = [c for c in ['sw_temperature','proton_density','e_field','f10_7',
                             'proton_flux_1mev','proton_flux_10mev'] if c in feat.columns]

    # 1. Lag features — extended to 48h
    log("Creating lag features (1–48h)...")
    for col in SW_CORE:
        for lag in [1, 2, 3, 6, 12, 24, 36, 48]:
            feat[f'{col}_lag{lag}h'] = feat[col].shift(lag)
    for col in SW_EXTRA:
        for lag in [1, 3, 6, 12, 24]:
            feat[f'{col}_lag{lag}h'] = feat[col].shift(lag)

    # 2. F10.7 long lags — solar flux memory up to 1 week
    log("Creating F10.7 long lags...")
    if 'f10_7' in feat.columns:
        for lag in [24, 48, 72, 168]:
            feat[f'f10_7_lag{lag}h'] = feat['f10_7'].shift(lag)
        feat['f10_7_roll27d'] = feat['f10_7'].rolling(27*24, min_periods=1).mean()

    # 3. Rolling stats — mean, std, min, max
    log("Creating rolling statistics...")
    for col in ['bz_gsm','sw_speed','scalar_b','flow_pressure','proton_density']:
        if col not in feat.columns: continue
        for w in [3, 6, 12, 24, 48]:
            r = feat[col].rolling(w, min_periods=1)
            feat[f'{col}_roll{w}h_mean'] = r.mean()
            feat[f'{col}_roll{w}h_std']  = r.std()
            feat[f'{col}_roll{w}h_min']  = r.min()
            feat[f'{col}_roll{w}h_max']  = r.max()

    # 4. Rate of change
    log("Creating rate-of-change features...")
    for col in ['bz_gsm','sw_speed','scalar_b','flow_pressure']:
        if col not in feat.columns: continue
        for d in [1, 3, 6, 12, 24]:
            feat[f'{col}_diff{d}h'] = feat[col].diff(d)

    # 5. Southward Bz physics
    log("Computing physics features...")
    if 'bz_gsm' in feat.columns:
        feat['bz_south'] = feat['bz_gsm'].clip(upper=0).abs()
        for w in [3, 6, 12, 24]:
            feat[f'bz_south_roll{w}h'] = feat['bz_south'].rolling(w, min_periods=1).mean()
            feat[f'bz_min_roll{w}h']   = feat['bz_gsm'].rolling(w, min_periods=1).min()

    # 6. Bz southward streak — consecutive hours of southward Bz
    log("Computing Bz southward streak...")
    if 'bz_gsm' in feat.columns:
        is_south = feat['bz_gsm'] < 0
        feat['bz_south_streak'] = (
            is_south.groupby((~is_south).cumsum()).cumsum().where(is_south, 0)
        )

    # 7. Merging electric field
    if 'bz_gsm' in feat.columns and 'sw_speed' in feat.columns:
        feat['ey_merging'] = feat['sw_speed'] * feat['bz_south'] / 1000.0
        for w in [3, 6, 12]:
            feat[f'ey_merging_roll{w}h'] = feat['ey_merging'].rolling(w, min_periods=1).mean()
        for lag in [1, 3, 6]:
            feat[f'ey_merging_lag{lag}h'] = feat['ey_merging'].shift(lag)

    # 8. Solar wind acceleration
    log("Computing solar wind acceleration...")
    if 'sw_speed' in feat.columns:
        feat['sw_speed_accel']    = feat['sw_speed'].diff(1)
        feat['sw_speed_accel_3h'] = feat['sw_speed'].diff(3)
        feat['sw_is_fast']        = (feat['sw_speed'] > 500).astype(int)
        feat['sw_is_very_fast']   = (feat['sw_speed'] > 700).astype(int)

    # 9. Sudden impulse / CME arrival
    log("Computing sudden impulse detector...")
    if 'flow_pressure' in feat.columns and 'sw_speed' in feat.columns:
        feat['pressure_jump_1h']  = feat['flow_pressure'].diff(1)
        feat['pressure_jump_3h']  = feat['flow_pressure'].diff(3)
        feat['is_sudden_impulse'] = (
            (feat['pressure_jump_1h'] > 2.0) & (feat['sw_speed'] > 450)
        ).astype(int)

    # 10. IMF cone angle and clock angle
    log("Computing IMF angles...")
    if all(c in feat.columns for c in ['by_gsm','bz_gsm','scalar_b']):
        feat['imf_cone_angle']  = np.degrees(np.arctan2(
            np.sqrt(feat['by_gsm']**2 + feat['bz_gsm']**2),
            feat['scalar_b'].clip(lower=0.01)
        ))
        feat['imf_clock_angle'] = np.degrees(
            np.arctan2(feat['by_gsm'], -feat['bz_gsm'])
        ) % 360

    # 11. Dynamic pressure proxy
    if 'proton_density' in feat.columns and 'sw_speed' in feat.columns:
        feat['dynamic_pressure'] = feat['proton_density'] * feat['sw_speed']**2 / 1e6

    # 12. Log transform for skewed columns
    log("Log-transforming skewed columns...")
    for col in ['proton_flux_1mev','proton_flux_10mev','sw_temperature']:
        if col in feat.columns:
            feat[col] = np.log1p(feat[col].clip(lower=0))
    for col in ['proton_flux_1mev','proton_flux_10mev']:
        for lag_col in [c for c in feat.columns if c.startswith(f'{col}_lag')]:
            feat[lag_col] = np.log1p(feat[lag_col].clip(lower=0))

    # 13. Time features
    log("Creating time features...")
    feat['month']       = feat.index.month
    feat['hour_of_day'] = feat.index.hour
    feat['year_raw']    = feat.index.year

    # 14. Equinox flag — Russell-McPherron effect
    feat['is_equinox'] = feat.index.month.isin([3, 4, 9, 10]).astype(int)
    if 'bz_south' in feat.columns:
        feat['bz_south_x_equinox'] = feat['bz_south'] * feat['is_equinox']
    if 'ey_merging' in feat.columns:
        feat['ey_x_equinox'] = feat['ey_merging'] * feat['is_equinox']

    # 15. Solar cycle phase (11-year sine/cosine, peak ~2025)
    feat['solar_cycle_sin'] = np.sin(2 * np.pi * (feat.index.year - 1996) / 11.0)
    feat['solar_cycle_cos'] = np.cos(2 * np.pi * (feat.index.year - 1996) / 11.0)

    log(f"\nTotal features  : {len(feat.columns)}")
    log(f"Feature time    : {time.time()-t0:.1f}s")
    return feat


# ─────────────────────────────────────────────────────────────
# STEP 3 — LABELS
# ─────────────────────────────────────────────────────────────

def create_labels(df):
    section("STEP 3 — CREATING LABELS")
    df = df.copy()

    df['intensity_now']           = df['kp'].apply(kp_to_class)
    df[f'kp_{FORECAST_H}h_ahead'] = df['kp'].shift(-FORECAST_H)
    df['kp_6h_ahead']             = df['kp'].shift(-6)
    df['kp_12h_ahead']            = df['kp'].shift(-12)
    df['target']                  = df[f'kp_{FORECAST_H}h_ahead'].apply(kp_to_class)
    df['target_binary']           = (df[f'kp_{FORECAST_H}h_ahead'] >= 3.0).astype(float)

    log(f"{FORECAST_H}-hour ahead label distribution:")
    total = df['target'].notna().sum()
    for k in range(5):
        cnt  = (df['target'] == k).sum()
        pct  = cnt / total * 100
        bar  = '#' * max(1, int(pct / 2))
        icon = LABEL_BARS[LABELS[k]]
        log(f"  {icon} {LABELS[k]:<10} {cnt:>7,}  ({pct:5.1f}%)  {bar}")

    active = (df[f'kp_{FORECAST_H}h_ahead'] >= 5.0).sum()
    log(f"\n  Mid-latitude visible ({FORECAST_H}h ahead, Kp≥5): {active:,} ({active/total*100:.2f}%)")
    return df


# ─────────────────────────────────────────────────────────────
# STEP 4 — DATA PREPARATION
# ─────────────────────────────────────────────────────────────

def get_feature_cols(df):
    DROP = {
        'kp', 'intensity_now', 'target', 'target_binary',
        f'kp_{FORECAST_H}h_ahead', 'kp_6h_ahead', 'kp_12h_ahead',
    }
    for leaky in LEAKY:
        DROP.update([c for c in df.columns if c.startswith(leaky)])
    return [c for c in df.columns if c not in DROP]


def prepare_data(df, feature_cols):
    df_clean = df.dropna(subset=['target'])
    df_clean = df_clean.dropna(subset=['bz_gsm', 'sw_speed', 'scalar_b'])
    df_clean = df_clean.dropna(thresh=int(len(feature_cols) * 0.55))

    X        = df_clean[feature_cols]
    y_full   = df_clean['target'].astype(int)
    y_binary = df_clean['target_binary'].astype(int)

    medians = X.median()
    X       = X.fillna(medians)

    split = int(len(X) * TRAIN_SPLIT)
    X_train, X_test   = X.iloc[:split],      X.iloc[split:]
    y_train, y_test   = y_full.iloc[:split], y_full.iloc[split:]
    yb_train, yb_test = y_binary.iloc[:split], y_binary.iloc[split:]

    log(f"Clean rows      : {len(df_clean):,}")
    log(f"Train           : {X_train.index.min().date()} → {X_train.index.max().date()} ({len(X_train):,})")
    log(f"Test            : {X_test.index.min().date()}  → {X_test.index.max().date()} ({len(X_test):,})")
    return X_train, X_test, y_train, y_test, yb_train, yb_test, medians


# ─────────────────────────────────────────────────────────────
# STEP 5a — STAGE 1: QUIET vs ACTIVE
# ─────────────────────────────────────────────────────────────

def train_stage1(X_train, X_test, yb_train, yb_test):
    from xgboost import XGBClassifier
    from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
    from sklearn.utils.class_weight import compute_sample_weight

    section("STEP 5a — STAGE 1: Quiet vs Active Classifier")
    log(f"  0 = Quiet (Kp < 3)   |   1 = Active (Kp ≥ 3)")
    log(f"  Active % in train: {yb_train.mean()*100:.1f}%")
    log(f"  GPU: {'CUDA — RTX 3050' if USE_GPU else 'CPU'}\n")

    sw      = compute_sample_weight('balanced', yb_train)
    device  = 'cuda' if USE_GPU else 'cpu'

    model = XGBClassifier(
        n_estimators=600,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=5,
        gamma=0.05,
        reg_alpha=0.1,
        reg_lambda=1.0,
        eval_metric='logloss',
        random_state=42,
        n_jobs=-1,
        device=device,
        early_stopping_rounds=30,
    )

    print(f"  {'Round':<8} {'Val Loss':<16} {'Train Loss'}")
    print(f"  {'─'*45}")

    model.fit(
        X_train, yb_train,
        sample_weight=sw,
        eval_set=[(X_test, yb_test), (X_train, yb_train)],
        verbose=20,
    )

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    acc    = accuracy_score(yb_test, y_pred)
    auc    = roc_auc_score(yb_test, y_prob)

    log(f"\nStage 1 — Results:")
    log(f"  Accuracy    : {acc*100:.2f}%")
    log(f"  ROC-AUC     : {auc:.4f}  (1.0 = perfect)")
    log(f"  Best round  : {model.best_iteration}")
    print()
    print(classification_report(yb_test, y_pred, target_names=['Quiet', 'Active']))

    return model


# ─────────────────────────────────────────────────────────────
# STEP 5b — STAGE 2: INTENSITY (active periods only)
# ─────────────────────────────────────────────────────────────

def train_stage2(X_train, X_test, y_train, y_test, yb_train, yb_test):
    from xgboost import XGBClassifier
    from sklearn.metrics import accuracy_score, balanced_accuracy_score, classification_report
    from sklearn.utils.class_weight import compute_sample_weight

    section("STEP 5b — STAGE 2: Intensity Classifier (Active Periods Only)")

    # Filter to active periods only
    mask_train = yb_train == 1
    mask_test  = yb_test  == 1

    Xa_train = X_train[mask_train]
    ya_train = y_train[mask_train]
    Xa_test  = X_test[mask_test]
    ya_test  = y_test[mask_test]

    # Remap: 1→0 (Low), 2→1 (Moderate), 3→2 (Strong), 4→3 (Extreme)
    ya_train_m = ya_train - 1
    ya_test_m  = ya_test  - 1

    log(f"Active train: {len(Xa_train):,}  |  Active test: {len(Xa_test):,}")
    log("\nClass distribution (train):")
    for k, name in enumerate(['Low','Moderate','Strong','Extreme']):
        cnt = (ya_train_m == k).sum()
        pct = cnt / len(ya_train_m) * 100
        bar = '#' * max(1, int(pct / 3))
        log(f"  {name:<10} {cnt:>6,}  ({pct:5.1f}%)  {bar}")

    # SMOTE oversampling for Extreme events
    log("\nApplying SMOTE to oversample rare Extreme events...")
    try:
        from imblearn.over_sampling import SMOTE
        min_count = ya_train_m.value_counts().min()
        k_n       = min(3, min_count - 1)
        if k_n >= 1:
            sm = SMOTE(random_state=42, k_neighbors=k_n)
            Xa_res, ya_res = sm.fit_resample(Xa_train, ya_train_m)
            log(f"  Before: {len(Xa_train):,}  →  After: {len(Xa_res):,}")
            for k, name in enumerate(['Low','Moderate','Strong','Extreme']):
                log(f"    {name:<10}: {(ya_res==k).sum():,}")
        else:
            log("  Skipping — too few samples in smallest class")
            Xa_res, ya_res = Xa_train, ya_train_m
    except ImportError:
        log("  imbalanced-learn not installed — run: pip install imbalanced-learn")
        Xa_res, ya_res = Xa_train, ya_train_m

    sw     = compute_sample_weight('balanced', ya_res)
    device = 'cuda' if USE_GPU else 'cpu'

    model = XGBClassifier(
        n_estimators=800,
        max_depth=7,
        learning_rate=0.04,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=3,
        gamma=0.05,
        reg_alpha=0.15,
        reg_lambda=1.2,
        eval_metric='mlogloss',
        random_state=42,
        n_jobs=-1,
        device=device,
        early_stopping_rounds=40,
    )

    log(f"\nTraining Stage 2 (GPU: {device})...")
    print(f"\n  {'Round':<8} {'Val Loss'}")
    print(f"  {'─'*25}")

    model.fit(
        Xa_res, ya_res,
        sample_weight=sw,
        eval_set=[(Xa_test, ya_test_m)],
        verbose=20,
    )

    if len(ya_test_m) > 0:
        y_pred = model.predict(Xa_test)
        acc    = accuracy_score(ya_test_m, y_pred)
        bacc   = balanced_accuracy_score(ya_test_m, y_pred) if len(np.unique(ya_test_m)) > 1 else 0.0

        log(f"\nStage 2 — Results (active periods only):")
        log(f"  Accuracy          : {acc*100:.2f}%")
        log(f"  Balanced Accuracy : {bacc*100:.2f}%")
        log(f"  Best round        : {model.best_iteration}")

        present = sorted(ya_test_m.unique())
        names   = [['Low','Moderate','Strong','Extreme'][i] for i in present]
        print()
        print(classification_report(ya_test_m, y_pred, labels=present, target_names=names))

    return model


# ─────────────────────────────────────────────────────────────
# STEP 5c — COMBINED EVALUATION
# ─────────────────────────────────────────────────────────────

def evaluate_combined(model_s1, model_s2, X_test, y_test, yb_test):
    from sklearn.metrics import accuracy_score, balanced_accuracy_score, classification_report

    section("STEP 5c — COMBINED PIPELINE EVALUATION")

    active_pred = model_s1.predict(X_test)
    final_pred  = np.zeros(len(X_test), dtype=int)
    active_idx  = np.where(active_pred == 1)[0]

    if len(active_idx) > 0:
        s2_pred = model_s2.predict(X_test.iloc[active_idx])
        final_pred[active_idx] = s2_pred + 1

    acc  = accuracy_score(y_test, final_pred)
    bacc = balanced_accuracy_score(y_test, final_pred)

    log(f"End-to-end accuracy          : {acc*100:.2f}%")
    log(f"End-to-end balanced accuracy : {bacc*100:.2f}%")
    log(f"(Balanced = accounts for class imbalance)\n")

    present = sorted(y_test.unique())
    names   = [LABELS[i] for i in present]
    print(classification_report(y_test, final_pred, labels=present, target_names=names))

    active_mask = y_test >= 2
    if active_mask.sum() > 0:
        active_acc = accuracy_score(y_test[active_mask], final_pred[active_mask])
        log(f"Accuracy on mid-latitude visible events (Kp≥5): {active_acc*100:.2f}%")

    return final_pred


# ─────────────────────────────────────────────────────────────
# FEATURE IMPORTANCE
# ─────────────────────────────────────────────────────────────

def feature_importance_report(model_s1, model_s2, feature_cols):
    section("FEATURE IMPORTANCE")

    for stage_name, model in [('Stage 1 — Quiet vs Active', model_s1),
                               ('Stage 2 — Intensity',       model_s2)]:
        imp = pd.Series(model.feature_importances_, index=feature_cols)
        log(f"Top 15 — {stage_name}:")
        for feat, val in imp.nlargest(15).items():
            bar = '#' * int(val * 300)
            log(f"  {feat:<45} {val:.4f}  {bar}")

        top5       = imp.nlargest(5).index.tolist()
        leaky_found = [f for f in top5 if any(l in f for l in LEAKY)]
        if leaky_found:
            log(f"\n  ⚠️  WARNING: Leaky features in top 5: {leaky_found}")
        else:
            log(f"\n  ✅ No leakage in top 5 features")
        print()


# ─────────────────────────────────────────────────────────────
# PREDICT — Any location on Earth
# ─────────────────────────────────────────────────────────────

def predict_aurora(live_data: dict, model_dir: str = MODEL_DIR) -> dict:
    """
    Predict aurora FORECAST_H hours from now for any location.

    live_data keys:
        bz_gsm, by_gsm, sw_speed, scalar_b, proton_density,
        flow_pressure, e_field, f10_7,
        proton_flux_1mev, proton_flux_10mev,
        user_lat (optional), user_lon (optional)
    """
    model_s1     = joblib.load(os.path.join(model_dir, 'aurora_model_stage1.pkl'))
    model_s2     = joblib.load(os.path.join(model_dir, 'aurora_model_stage2.pkl'))
    feature_cols = joblib.load(os.path.join(model_dir, 'feature_cols.pkl'))
    medians      = joblib.load(os.path.join(model_dir, 'feature_medians.pkl'))

    row = medians.copy().to_dict()
    for k, v in live_data.items():
        if k in row:
            row[k] = v

    bz    = live_data.get('bz_gsm', 0)
    speed = live_data.get('sw_speed', 400)

    row['bz_south']              = abs(min(bz, 0))
    row['ey_merging']            = speed * row['bz_south'] / 1000.0
    row['ey_merging_roll3h']     = row['ey_merging']
    row['ey_merging_roll6h']     = row['ey_merging']
    row['ey_merging_roll12h']    = row['ey_merging']
    row['bz_min_roll3h']         = bz
    row['bz_south_streak']       = row['bz_south']
    row['bz_south_roll3h']       = row['bz_south']
    row['sw_speed_accel']        = 0.0
    row['sw_speed_accel_3h']     = 0.0
    row['sw_is_fast']            = int(speed > 500)
    row['sw_is_very_fast']       = int(speed > 700)
    row['pressure_jump_1h']      = 0.0
    row['is_sudden_impulse']     = 0

    for col in ['proton_flux_1mev','proton_flux_10mev','sw_temperature']:
        if col in row:
            row[col] = np.log1p(max(0, float(row.get(col, 0))))

    X_pred    = pd.DataFrame([row]).reindex(columns=feature_cols).fillna(medians)
    is_active = int(model_s1.predict(X_pred)[0])
    s1_probs  = model_s1.predict_proba(X_pred)[0]

    if is_active == 0:
        pred_class = 0
        probs = np.array([s1_probs[0],
                          s1_probs[1] * 0.80,
                          s1_probs[1] * 0.15,
                          s1_probs[1] * 0.04,
                          s1_probs[1] * 0.01])
    else:
        s2_pred  = int(model_s2.predict(X_pred)[0])
        s2_probs = model_s2.predict_proba(X_pred)[0]
        pred_class = s2_pred + 1
        p = [0.0] * 4
        for i in range(len(s2_probs)):
            p[i] = float(s2_probs[i]) * float(s1_probs[1])
        probs = np.array([float(s1_probs[0]), p[0], p[1], p[2], p[3]])

    probs     = probs / probs.sum()
    kp_est    = [1.5, 3.5, 5.5, 6.5, 8.5][pred_class]
    user_lat  = live_data.get('user_lat', None)
    user_lon  = live_data.get('user_lon', None)

    result = {
        'intensity':        LABELS[pred_class],
        'intensity_code':   pred_class,
        'probability':      float(probs[pred_class]),
        'class_probs':      {LABELS[i]: float(p) for i, p in enumerate(probs)},
        'estimated_kp':     kp_est,
        'min_visible_lat':  kp_to_min_lat(kp_est),
        'forecast_horizon': f'{FORECAST_H} hours',
    }

    if user_lat is not None and user_lon is not None:
        result['location'] = aurora_quality_for_location(kp_est, user_lat, user_lon)

    return result


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    total_start = time.time()

    print("\n" + "="*65)
    print("  AURORA LENS — GLOBAL PREDICTION MODEL")
    print("  GPU: RTX 3050 6GB  |  NASA OMNI 1995–2026")
    print("="*65)

    # Check GPU availability
    try:
        import xgboost as xgb
        t = xgb.XGBClassifier(device='cuda', n_estimators=1, verbosity=0)
        t.fit(np.random.rand(10, 3), np.random.randint(0, 2, 10))
        log("GPU (CUDA) — working ✅")
        USE_GPU = True
    except Exception as e:
        log(f"GPU not available ({str(e)[:60]}) — using CPU")
        USE_GPU = False

    try:
        from imblearn.over_sampling import SMOTE
        log("SMOTE (imbalanced-learn) — available ✅")
    except ImportError:
        log("SMOTE not found — run: pip install imbalanced-learn")

    if not os.path.exists(DATA_FILE):
        print(f"\nERROR: {DATA_FILE} not found.")
        sys.exit(1)

    os.makedirs(MODEL_DIR, exist_ok=True)

    # Run full pipeline
    df_raw     = parse_omni_file(DATA_FILE)
    df_feat    = engineer_features(df_raw)
    df_labeled = create_labels(df_feat)

    feature_cols = get_feature_cols(df_labeled)
    log(f"Feature columns : {len(feature_cols)}")

    X_train, X_test, y_train, y_test, yb_train, yb_test, medians = prepare_data(
        df_labeled, feature_cols
    )

    model_s1 = train_stage1(X_train, X_test, yb_train, yb_test)
    model_s2 = train_stage2(X_train, X_test, y_train, y_test, yb_train, yb_test)

    evaluate_combined(model_s1, model_s2, X_test, y_test, yb_test)
    feature_importance_report(model_s1, model_s2, feature_cols)

    # Save
    section("SAVING MODEL ARTIFACTS")
    joblib.dump(model_s1,     os.path.join(MODEL_DIR, 'aurora_model_stage1.pkl'))
    joblib.dump(model_s2,     os.path.join(MODEL_DIR, 'aurora_model_stage2.pkl'))
    joblib.dump(feature_cols, os.path.join(MODEL_DIR, 'feature_cols.pkl'))
    joblib.dump(medians,      os.path.join(MODEL_DIR, 'feature_medians.pkl'))
    log("Saved:")
    log("  aurora_model_stage1.pkl  — quiet vs active")
    log("  aurora_model_stage2.pkl  — intensity level")
    log("  feature_cols.pkl")
    log("  feature_medians.pkl")
    log(f"\nTotal time: {(time.time()-total_start)/60:.1f} minutes")

    # Sanity checks across global locations
    section("SANITY CHECK — GLOBAL LOCATIONS")

    solar_cases = [
        ("Strong storm",   {'bz_gsm':-18,'sw_speed':720,'scalar_b':22,'proton_density':12,'flow_pressure':6,'f10_7':150}),
        ("Moderate event", {'bz_gsm':-8, 'sw_speed':550,'scalar_b':12,'proton_density':7, 'flow_pressure':3,'f10_7':120}),
        ("Quiet sun",      {'bz_gsm':+3, 'sw_speed':350,'scalar_b':5, 'proton_density':4, 'flow_pressure':1.5,'f10_7':80}),
    ]

    locations = [
        ("Tromsø, Norway",      69.6,  18.9),
        ("Reykjavik, Iceland",  64.1, -21.9),
        ("Helsinki, Finland",   60.2,  24.9),
        ("Edinburgh, UK",       55.9,  -3.2),
        ("New York, USA",       40.7, -74.0),
        ("Srinagar, India",     34.1,  74.8),
        ("Mumbai, India",       19.1,  72.9),
        ("Sydney, Australia",  -33.9, 151.2),
        ("Ushuaia, Argentina", -54.8, -68.3),
    ]

    for case_name, solar_data in solar_cases:
        r = predict_aurora(solar_data)
        log(f"\n{'─'*55}")
        log(f"{case_name} → {r['intensity']} (Kp~{r['estimated_kp']})  min_lat=±{r['min_visible_lat']}°")
        log("Probabilities:")
        for level, prob in r['class_probs'].items():
            bar = '#' * int(prob * 30)
            log(f"  {LABEL_BARS[level]} {level:<10} {prob*100:5.1f}%  {bar}")
        log("Visibility by location:")
        for loc_name, lat, lon in locations:
            loc = aurora_quality_for_location(r['estimated_kp'], lat, lon)
            icon = '✅' if loc['visible'] else '❌'
            log(f"  {icon} {loc_name:<26} geomag={loc['geomagnetic_lat']:+.1f}°  "
                f"needs Kp≥{loc['kp_needed']}  → {loc['quality']}")
