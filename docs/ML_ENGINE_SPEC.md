# AuroraLens ML Engine Specifications 🧠

This document provides a technical deep-dive into the machine learning infrastructure powering AuroraLens.

## 🏗️ Model Architecture: Dual-Stage XGBoost
The core inference engine utilizes a two-stage Gradient Boosting pipeline implemented via `XGBoost`. 

### Stage 1: Storm Detection (Binary)
- **Objective**: Determine the probability of a geomagnetic disturbance.
- **Output**: P(Activity) ∈ [0, 1]
- **Recall Focus**: Optimized to minimize false negatives (missing a storm).

### Stage 2: Intensity Classification (Multiclass)
- **Objective**: Map detected disturbances to specific planetary KP-indices (0–9).
- **Output**: Discrete KP bin classification.
- **Classes**: Quiet (KP 0-3), Active (KP 4-5), Minor Storm (KP 6), Major Storm (KP 7-9).

---

## 📡 Data & Features

### Training Dataset: NASA OMNI
The models were trained on the **NASA OMNI2 High-Resolution Dataset**, spanning over 40 years of cross-normalized telemetry.
- **Temporal Range**: 1980 – 2020
- **Volume**: 1.2M+ hourly telemetry records.

### Feature Matrix (High-Impact Only)
| Feature | Source | Weight | Description |
|---------|--------|--------|-------------|
| **IMF Bz (GSM)** | DSCOVR | 92% | The Z-component of the Interplanetary Magnetic Field. Negative (Southward) Bz is the primary driver of auroral activity. |
| **Solar Wind Speed** | DSCOVR | 84% | Plasma velocity (km/s). High speeds increase the kinetic energy transfer to the magnetosphere. |
| **Proton Density** | DSCOVR | 76% | Number of particles per cubic centimeter. Influences the magnitude of the auroral oval. |
| **Cloud Cover** | Open-Meteo| 89% | Local tropospheric density. Acts as a critical "visibility filter" for observers. |

---

## 🧪 Training Methodology

### Handling Class Imbalance
Geomagnetic storms are relatively rare events (KP > 5 occurs < 10% of the time). To ensure the model doesn't bias toward "Quiet" states:
- **SMOTE (Synthetic Minority Over-sampling Technique)**: Applied to high-KP historical records during Stage 2 training.
- **Focal Loss**: Implemented to penalize the model more heavily for misclassifying rare, high-intensity storm events.

### Why XGBoost?
- **Sparse Telemetry Handling**: Native support for missing values (common in deep-space satellite uplinks).
- **Non-Linear Relationships**: Excellent at capturing the complex, non-linear interactions between solar wind pressure and magnetic flux.
- **Inference Speed**: Sub-millisecond execution on standard edge nodes, enabling 60s update cycles.

---

## 📈 Validation Metrics
Validated against the 2021–2023 "Sunspot Cycle 25" ramp-up period:
- **Weighted F1-Score**: 81.0%
- **Precision (Major Storms)**: 78.4%
- **Recall (Major Storms)**: 83.2%

---

## 👨‍💻 Builder Note
This engine represents an academic intersection of space weather physics and applied AI. For feedback or collaboration on the model architecture, contact **Mosin Mushtaq**.
