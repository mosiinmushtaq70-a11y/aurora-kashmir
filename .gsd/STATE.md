# GSD State File — AuroraKashmir Project

## Current Position
- **Phase**: Phase 7 — Immersive Search Overlay + Responsive HUD Layout
- **Task**: COMPLETE — ChunkLoadError hotfix applied; dev server running clean
- **Status**: Paused at 2026-03-26 23:57 IST

---

## Last Session Summary

This session executed two major deliverables: **Phase 7** (SearchOverlay rewrite + HUD responsive layout fix) and an **emergency ChunkLoadError hotfix** that was blocking the entire app.

### Phase 6 Accomplishments (Previously Completed ✅)
- ViewMode enum collapsed to `'LANDING' | 'MAP_HUD'`
- SPA routing standardized in `page.tsx` (Layer 0: map always mounted; Layer 1: conditional Landing/HUD overlay)
- Landing page fully restored to Stitch blueprint (orrery, bento grid, mission animators, AI teaser, CTA)
- LocationHUD map visibility fixed (removed opaque bg blocking z-0 map canvas)

### Phase 7 Accomplishments (COMPLETE ✅)
- **`useAppStore.ts`**: Added `setTargetLocation(location)` — pure coordinate setter with no viewMode side-effect. Search flow: `setTargetLocation → setViewMode('MAP_HUD') → closeSearch()`.
- **`SearchOverlay.tsx`** (full rewrite):
  - `AnimatePresence` backdrop: `fixed inset-0 bg-[#080B11]/80 backdrop-blur-md`
  - Panel: spring entrance (`stiffness: 300, damping: 25`)
  - `useDebounce` hook (500ms) — no external dependency
  - **Nominatim geocoding** (open API, no key required) — replaces all hardcoded locations
  - Loading skeleton (4-row shimmer), error state, empty-query prompt, no-results state
  - Staggered result animations (0.04s/item); coordinate badge reveals on hover
  - **ZERO hardcoded locations. ZERO `openDossier()` calls.**
- **`LocationHUD_Mobile.tsx`** (responsive fix):
  - `main`: `md:flex-row md:justify-between md:p-8 md:items-start`
  - Inner wrapper: `md:contents` (dissolves into flex parent on desktop)
  - Left/right sections: `md:w-[350px] lg:w-[400px]`
  - **No `mt-[40vh]` on desktop** — mobile stacking preserved untouched
  - `bg-gradient-to-t` → `bg-linear-to-t` lint fix

### Emergency Hotfix — ChunkLoadError (RESOLVED ✅)
- **Root cause**: Turbopack refused to bundle the server chunk due to TypeScript type errors in 3 files still referencing the deprecated `'LOCAL'` ViewMode.
- **Files fixed** (5 references total):
  - `LocationMap.tsx:1000` — `isVisible = viewMode === 'LOCAL'` → `'MAP_HUD'`
  - `LocationSearch.tsx:122,164` — `handleClear` guard + Globe icon conditional
  - `TacticalOmnibar.tsx:195,232` — `handleClear` guard + Globe icon conditional
- **Cache**: `.next` directory cleared → `npm run dev` restarted → `✓ Ready in 16.2s` (clean)
- **Dev server**: Running on `http://localhost:3001` (3000 was still occupied)

---

## In-Progress Work

### Files Modified (Committed — Phase 7 commit pending final git confirm)
- `frontend/src/store/useAppStore.ts`
- `frontend/src/components/ui/SearchOverlay.tsx`
- `frontend/src/components/ui/LocationHUD_Mobile.tsx`
- `frontend/src/components/ui/LandingPage_Mobile.tsx` (lint fixes only)

### Files Fixed (ChunkLoadError hotfix — uncommitted)
- `frontend/src/components/LocationMap.tsx`
- `frontend/src/components/LocationSearch.tsx`
- `frontend/src/components/ui/TacticalOmnibar.tsx`

### Tests Status
- **TypeScript**: Clean — `tsc --noEmit` returns 0 errors after hotfix
- **Dev server**: `✓ Ready in 16.2s` on `localhost:3001`
- **Backend**: FastAPI stable at `localhost:8000` (running 1h35m+)

---

## Blockers
- **None.** Dev server is clean. App is navigable.

---

## Context Dump

### Architecture (Current)
- **State**: `useAppStore.ts` — single source of truth. ViewMode = `'LANDING' | 'MAP_HUD'`.
- **Routing**: `page.tsx` — 3-layer SPA (z-0 map always mounted; z-10 landing/HUD conditional)
- **Design System**: "Celestial Lens" — midnight blue `#080B11`, teal `#00E5FF`/`#44E2CD`, glassmorphism. Zero Destruction protocol active.
- **Search flow**: `openSearch()` → `SearchOverlay` → `setTargetLocation` → `setViewMode('MAP_HUD')` → `closeSearch()`
- **Backend**: FastAPI `http://localhost:8000` — `GET /api/weather/forecast/global?lat&lon&hour_offset`

### Decisions Made
- **Nominatim geocoding**: Used as the open-source geocoder (no API key). Requires `User-Agent` header per ToS.
- **`setTargetLocation` vs `zoomToLocation`**: The new action is a pure setter (no viewMode/timeout side-effect). `zoomToLocation` remains unchanged for backward-compat with map-pan flows.
- **`md:contents`** on the inner HUD wrapper: Allows the `<div>` to dissolve into the flex-row parent on desktop without conflicting `display` values.
- **No JavaScript window-sizing** for mobile/desktop split: Purely CSS-driven breakpoints.

### Approaches Tried
- First attempt at HUD `md:flex md:contents` caused a lint conflict warning → fixed to `md:contents` alone.

### Files of Interest
- `frontend/src/components/ui/SearchOverlay.tsx` — Full Phase 7 rewrite. The geocoding hook, debounce, and routing logic live here.
- `frontend/src/store/useAppStore.ts` — Added `setTargetLocation` at line ~336.
- `frontend/src/components/LocationMap.tsx` — `isVisible` guard at line 1000 fixed.
- `frontend/src/components/LocationSearch.tsx` — Legacy component; still used in landing-page old-UI flows.
- `frontend/src/components/ui/TacticalOmnibar.tsx` — Also still used in old-UI flows.

---

## Next Steps
1. **COMMIT** ChunkLoadError hotfix files: `LocationMap.tsx`, `LocationSearch.tsx`, `TacticalOmnibar.tsx`
2. **SMOKE TEST** full flow: Landing → click "Forecast Map" → MAP_HUD renders → click Search → type city → select → map navigates to coords
3. **VERIFY** SearchOverlay on mobile: backdrop blur, spring animation, result list stagger all visible
4. **PHASE 8 OPTIONS** (to discuss with user):
   - A) Wire `useLiveTelemetry` live polling into the HUD (telemetry cards show real data)
   - B) LocationMap.tsx responsive HUD refactor — convert `isVisible` logic to desktop side-panel layout
   - C) Dossier tab system (Phase 7 roadmap item — historical data in tabs)
