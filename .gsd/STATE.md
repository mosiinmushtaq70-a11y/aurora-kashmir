## Current Position
- **Phase**: 2 - Immersive UI & Location Intelligence (Polish)
- **Task**: Calibrating AI Scoring & Finalizing UI Transitions
- **Status**: Active (resumed 2026-03-17 17:35)

## Last Session Summary
Significant progress made on Phase 2 immersive features and backend performance.
- **Cinematic Transition**: Fixed `flyTo` animation using a ref-based trigger; map now swoops from Global (zoom 2) to Local (zoom 12) over 4 seconds.
- **Map Reliability**: Switched to CARTO Dark-Matter tiles to resolve 403 Forbidden errors from MapTiler.
- **Backend Performance**: Parallelized NOAA telemetry fetches using `asyncio.gather`, reducing forecast latency from ~18s to ~5s.
- **AI Scoring Logic**: Refined `calculate_aurora_probability` to distinguish between "Closed Shield" (Bz+) and true planetary activity.

## In-Progress Work
- **Scoring Calibration**: High-latitude stations (Alaska) are currently under-reporting. Plan in place to decouple high-latitude sensitivity from global planetary filters.
- **Hydration Fix**: Identified `antigravity-scroll-lock` as a hydration mismatch source; `suppressHydrationWarning` fix ready for implementation.
- Files modified: `predictor.py`, `weather.py`, `LocationMap.tsx`, `task.md`.

## Context Dump
The map occasionally required a forced `resize()` call after loading to prevent a black canvas. The AI "0 score" in Fairbanks during moderate solar wind is because the global model thinks it's "Quiet," but Fairbanks should have a baseline due to its location.

### Decisions Made
- Parallelized telemetry ingestion to prioritize snappy UI feel.
- Preferred CARTO over MapTiler to simplify dependency on API keys that might expire/block.

### Files of Interest
- `predictor.py`: Contains the logic for the high-latitude calibration.
- `LocationMap.tsx`: Handles the cinematic animation and map initialization.

## Next Steps
1. Apply `suppressHydrationWarning` to `layout.tsx`.
2. Implement high-latitude sensitivity boost in `predictor.py`.
3. Verify local forecast shows non-zero scores for Fairbanks when solar wind is >450km/s.
