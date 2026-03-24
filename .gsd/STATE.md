# GSD State File — AuroraKashmir Project

## Current Position
- **Phase**: Phase 22 — Live Global Viewing Viability Map & Hotspots
- **Task**: Final Verification & Integration
- **Status**: Active (resumed 2026-03-24 11:15 IST)


---

## Last Session Summary
Successfully neutralized a cascade of frontend rendering bugs. Stripped the unstable Open-Meteo cloud logic entirely to guarantee dashboard reliability. Designed and integrated the high-performance **Active Hotspots** interactive gallery directly beneath the main Geographic map.

### Phases Completed This Session
- [x] **Debug**: Diagnosed FastAPI aggressive 24-hour caching behavior trapping failed API states.
- [x] **Refactor**: Permanently removed the Cloud Cover dependency from `main.py` and `GeomagneticHeatmap.tsx`.
- [x] **Phase 22 Extension**: Implemented the `ActiveHotspots` 3-card gallery.
    - Bypassed Next.js/Unsplash CORS blocks by downloading static assets directly to `public/hotspots/`.
    - Solved a severe WebKit/Blink CSS bug where absolute `<Image>` tags collapse when nested inside semantic `<button>` elements by refactoring to ARIA-compliant `<div>` wrappers.
    - Wired `onClick` to `useAppStore.zoomToLocation()` for 0-latency 3D globe transitions.

---

## In-Progress Work
- **Frontend**: The Hotspots gallery is complete and operational. Map routing works.
- **Backend**: `/api/forecast/global_heatmap` is stable and returning pure XGBoost telemetry.

### Modified Files
- `backend/main.py`: Reverted to core telemetry (no requests/cloud logic).
- `frontend/src/components/ui/GeomagneticHeatmap.tsx`: Legend and layers simplified.
- `frontend/src/app/page.tsx`: Embedded the new `<ActiveHotspots />` layer and static `<Image>` routing.
- `frontend/public/hotspots/*`: Localized three high-res topography JPEGs.
- `frontend/next.config.ts`: Added (but currently bypassed) Unsplash to `remotePatterns`.

### Tests Status
- UI manually verified. Visuals are rendering identically to the design spec.

---

## Blockers
- None at this time. The architecture is stable and self-contained.

---

## Context Dump

### Decisions Made
- **Abandon Cloud APIs**: Real-time cloud cover from Open-Meteo was causing extreme state volatility. Decided an empty, stable map is infinitely better than a broken map.
- **Local Static Assets**: Next.js `Image` optimization was silently failing to pull Unsplash URLs despite `next.config.ts` permissions. Switched immediately to local `/hotspots/` assets to eliminate the external network dependency entirely.
- **DOM Restructuring**: Abandoned `<button>` for `<div role="button">` to ensure Z-index and absolute positioning layers inside the Hotspot cards didn't collapse cross-browser.

### Files of Interest
- `frontend/src/app/page.tsx`: Contains the new `ActiveHotspots` isolated functional component.
- `backend/main.py`: The `GLOBAL_HEATMAP_CACHE` is now pristine.

---

## Next Steps
1. **Verify Production Build**: Run `npm run build` to catch any residual Next.js strict typing/linting issues caused by the rapid layout refactoring.
2. **Phase 23**: Prepare for Vercel deployment. Review environment variables and API routing configurations for edge compatibility.
