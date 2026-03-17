# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: No code may be written until this spec is marked `FINALIZED`.

## Vision
AuroraLens (Aurora Kashmir) is a premium space weather analytics platform designed specifically for the Kashmir region. It provides real-time atmospheric telemetry and ML-driven aurora visibility predictions through a cinematically rich 3D interface.

## Goals
1. **Interactive 3D Visualization** — High-fidelity 3D globe using Three.js to visualize global aurora hotspots with a dedicated high-fidelity focus on Kashmir.
2. **Real-time Telemetry Acquisition** — Automated ingestion of solar wind parameters (Bz, Bt, Speed, Density) and Kp indices from NOAA SWPC and DSCOVR missions.
3. **ML-Powered Visibility Scoring** — Accurate aurora probability calculations for specific geographic coordinates using a pre-trained XGBoost inference engine.

## Non-Goals (Out of Scope)
- Historical data analysis beyond the last 7 days.
- User authentication and persistent profiles (local-first/anonymous display).
- Mobile application development (prio is Desktop/Web).

## Constraints
- **Technical:** Must use Next.js for frontend and FastAPI for backend. 
- **Performance:** 3D rendering must maintain 60FPS on mid-range hardware.
- **Data:** Relies on external API uptime (NOAA/NASA).

## Success Criteria
- [ ] User can view a 3D globe with real-time aurora intensity overlays.
- [ ] Backend fetched data every 5 minutes and updates the prediction score.
- [ ] The dashboard displays a "Kashmir Vision" probability score between 0-100%.

## Technical Requirements

| Requirement | Priority | Notes |
|-------------|----------|-------|
| FastAPI Backend | Must-have | Handles data ingestion and ML inference |
| Next.js Frontend | Must-have | Handles UI and Three.js rendering |
| XGBoost Predictor | Must-have | Core scoring logic |
| NOAA API Integration | Must-have | Reliable data sourcing |

---

*Last updated: 2026-03-16*
