# GSD State File — AuroraKashmir Project

## Current Position
- **Phase**: Phase 22 — Live Global Viewing Viability Map
- **Task**: Final Verification & Backend Handover
- **Status**: Paused at 2026-03-24 00:10 IST

---

## Last Session Summary
Successfully transitioned the "Aurora Kashmir" dashboard to a live, data-driven global monitoring system. This session focused on Phase 21 (Backend AI integration) and Phase 22 (Global Heatmap).

### Phases Completed This Session
- [x] **Phase 18-19**: Unified Idea 3 into the production `page.tsx`.
- [x] **Phase 21**: Connected FastAPI to the XGBoost predictor and real satellite telemetry.
- [x] **Phase 22**: Implemented the **Viewing Viability Map**:
    - Procedural visual placeholders replaced with live data.
    - Integrated **Open-Meteo** for real-time global cloud cover (batch-processed).
    - Added **Light Pollution** data nodes for major urban centers.
    - Restructured layout into a 2-column educational dashboard.
    - Hardened frontend with optional chaining to prevent API-sync crashes.

---

## In-Progress Work
- **Backend**: `/api/forecast/global_heatmap` is written but requires a server restart to be reachable (404 issue).
- **Frontend**: The map is ready to receive data; visibility of clouds/aurora depends on the backend reboot.

### Modified Files
- `backend/main.py`: Added XGBoost grid generation, 24h cache, and Open-Meteo cloud fetching.
- `frontend/src/components/ui/GeomagneticHeatmap.tsx`: Full restructure (Layout, Layers, Legend, Context).
- `frontend/src/app/globals.css`: Added custom slider thumb styling.

### Tests Status
- API manually verified via `curl` (pending server restart for full resolution).

---

## Blockers
- **Manual Action Required**: User needs to restart the Python process to load `main.py` changes and `requests` dependency.

---

## Context Dump

### Decisions Made
- **Viewing Viability Pivot**: Shifted from a simple 7-day aurora forecaster to a "Viewing Viability" map. This now accounts for **Clouds** and **Light Pollution**, helping users understand that a high aurora score is useless under heavy clouds or city lights.
- **Efficient Polling**: Chose a 30-degree step for cloud data to cover the globe in exactly one batch request (78 points), minimizing backend latency.
- **Visual Stacking**: Base (z-0) -> Aurora (z-1) -> Clouds (z-10) -> Legend (Overlay).

### Files of Interest
- `backend/main.py`: The heart of the probability and cloud calculation.
- `frontend/src/components/ui/GeomagneticHeatmap.tsx`: The primary visualization engine.

---

## Next Steps
1. **Restart Backend**: Run `pip install requests` and restart the FastAPI server.
2. **Verify Clouds**: Confirm that the blurry cloud markers populate over the map based on current Open-Meteo data.
3. **Verify Aurora**: Confirm the green/amber arcs populate from the XGBoost model.
4. **Final Polish**: Tune the `mix-blend-mode` or `opacity` of the cloud layer if they appear too bright/dim on certain displays.
