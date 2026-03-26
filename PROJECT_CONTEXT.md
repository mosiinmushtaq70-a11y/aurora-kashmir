# Project Context — AuroraLens

This document is a **high-signal map** of the AuroraLens codebase: what exists, where it lives, and how the major pieces connect (frontend ↔ backend ↔ external services). It intentionally **excludes flaws/risks**.

## System overview

AuroraLens is a full-stack aurora forecasting dashboard:

- **Frontend**: Next.js (App Router) UI with a global “mission control” dashboard and a local MapLibre view.
- **Backend**: FastAPI endpoints that aggregate space weather telemetry + run ML inference to produce an “aurora score”.
- **ML / data engine**: Python modules that fetch NOAA/SWPC telemetry and run XGBoost-based inference.
- **Alerts**: A background scheduler that reads subscriptions from Supabase and sends emails via Resend; it also bridges forecast loops into a Prisma database via a Next.js internal API route.

## Repo layout (major directories)

- `frontend/`: Next.js application (UI + Next API routes + server actions + Prisma).
- `api/`: FastAPI application used as the primary backend (`api/main.py`).
- `src/`: ML + telemetry ingestion engine used by FastAPI (`predictor.py`, `space_weather.py`, etc.).
- `backend/`: An additional FastAPI server entry (`backend/main.py`) that includes some legacy/alternate endpoints.
- `docs/`, `.gsd/`: project documentation and GSD workflow state.

## Runtime stack

- **Node.js**: Next.js frontend (`frontend/`).
- **Python**: FastAPI backend (`api/`), ML inference (`src/`).
- **DBs / storage**
  - **Supabase Postgres**: stores alert subscriptions for the scheduler (written by Next server action).
  - **Prisma Postgres**: schema includes `Forecast` and `TargetLock` (written by Next API routes).
  - **SQLite**: `telemetry_alerts.db` used by FastAPI routes in `api/main.py` (local DB setup present).

## Frontend (Next.js) — UI + state

### Global state (Zustand)

File: `frontend/src/store/useAppStore.ts`

- **`viewMode`**: `'GLOBAL' | 'LOCAL'`
- **`targetLocation`**: `{ lat, lng, name, zoom? } | null`
- **`timeScrubber`**: number (0–72 hours)
- **UI flags**: `isProMode`, `scenicMode`, plus scenic lore fields.

Key actions:
- **`zoomToLocation(location)`**: switches to local view and sets `targetLocation`.
- **`returnToGlobal()`**: resets to global view and clears target + scenic mode.
- **`setTimeScrubber(hours)`**: updates the forecast time horizon.

### Main page

File: `frontend/src/app/page.tsx`

- Loads the global dashboard UI and triggers initial data fetch (forecast + telemetry history).
- Renders the global “mission control” layout and conditionally mounts `LocationMap` when the app is in local view.

### Search + view transition

Files:
- `frontend/src/components/ui/TacticalOmnibar.tsx` (global search)
- `frontend/src/components/ui/MapSearchBar.tsx` (local view “search another location”)

Behavior:
- Uses **OpenStreetMap Nominatim** for suggestions (client-side fetch).
- Selecting a suggestion calls `useAppStore().zoomToLocation(...)`, which triggers the **GLOBAL → LOCAL** transition.

### Local map + panels

File: `frontend/src/components/LocationMap.tsx`

What it does:
- Uses **MapLibre** for the map view.
- When `targetLocation` or `timeScrubber` changes, it fetches the localized forecast from the Python backend.
- Fetches “Prime Viewing Spots” from Next.js `GET /api/sightseeing`.
- Shows tactical brief (Next.js `POST /api/tactical-brief`) and provides the AI assistant modal (Next.js `POST /api/chat`).

### Timeline

File: `frontend/src/components/TimelineScrubber.tsx`

- Slider sets `timeScrubber` (0–72 hours), driving forecast refresh in `LocationMap`.

### AI assistant UI

Files:
- `frontend/src/components/ui/AIAssistantModal.tsx` (chat modal)
- `frontend/src/app/api/chat/route.ts` (server route that talks to NVIDIA NIM)

### Other UI modules (selected)

- `frontend/src/components/ui/MissionHeader.tsx`: header telemetry readout.
- `frontend/src/components/ui/GeomagneticHeatmap.tsx`: educational map visualization (client-only).
- `frontend/src/components/ui/CommandTerminal.tsx`: decorative “terminal” section.
- `frontend/src/components/TexturedGlobe.tsx`: react-three-fiber globe canvas (imported on the main page).
- `frontend/src/components/Aurora.tsx`: OGL shader aurora effect (CSS + WebGL fragment shader).

## Next.js API routes (server-side endpoints)

These routes live under `frontend/src/app/api/**/route.ts`.

### Weather bridge routes (proxy to FastAPI)

- `GET /api/weather/forecast/global`
  - File: `frontend/src/app/api/weather/forecast/global/route.ts`
  - Forwards request to Python backend `/api/weather/forecast/global` with query params.

- `GET /api/weather/telemetry/history`
  - File: `frontend/src/app/api/weather/telemetry/history/route.ts`
  - Forwards request to Python backend `/api/weather/telemetry/history`.

### Sightseeing / prime spots (server aggregation)

- `GET /api/sightseeing?lat=...&lon=...`
  - File: `frontend/src/app/api/sightseeing/route.ts`
  - Calls:
    - **Overpass API** for nearby peaks/viewpoints
    - **Open-Meteo** for elevation + cloud cover
  - Returns top-ranked nearby points.

### AI endpoints (NVIDIA NIM / OpenAI-compatible)

- `POST /api/tactical-brief`
  - File: `frontend/src/app/api/tactical-brief/route.ts`
  - Generates a strict two-sentence tactical brief.

- `POST /api/chat`
  - File: `frontend/src/app/api/chat/route.ts`
  - Multi-turn chat for the “Tactical AI Co-Pilot”.

### Prisma-backed internal endpoints

- `POST /api/internal/forecasts`
  - File: `frontend/src/app/api/internal/forecasts/route.ts`
  - Writes forecast points to Prisma model `Forecast`.

- `POST /api/targets`
  - File: `frontend/src/app/api/targets/route.ts`
  - Writes target lock records to Prisma model `TargetLock`.

## Backend (FastAPI) — API surface

Primary server entry:
- `api/main.py`

Includes router:
- `api/routers/weather.py` (mounted at `/api/weather`)

Endpoints:
- `GET /api/health`
  - File: `api/main.py`

- `POST /api/alerts/subscribe`
  - File: `api/main.py`
  - Writes a subscription record into a local SQLite table `telemetry_alerts`.

- `GET /api/weather/forecast/global`
  - File: `api/routers/weather.py`
  - Returns ML-driven aurora forecast for a given `lat`, `lon`, and `hour_offset` (0–72).
  - Incorporates weather data from Open-Meteo (cloud cover, temperature, precipitation).

- `GET /api/weather/telemetry/history`
  - File: `api/routers/weather.py`
  - Returns the Kp outlook time series (7-day subset).

Background on startup:
- `api/main.py` starts a background scheduler task from `api/services/alerts.py`.

### Additional backend entry (alternate/legacy)

File: `backend/main.py`

Contains additional endpoints (separate FastAPI app) such as sightseeing spots and a global heatmap timeline generator.

## ML + telemetry engine (Python `src/`)

### Telemetry ingestion

File: `src/space_weather.py`

Fetches and parses:
- NOAA solar wind magnetic field (DSCOVR) — `mag-5-minute.json`
- NOAA plasma — `plasma-5-minute.json`
- NOAA planetary K-index — `noaa-planetary-k-index.json`
- NOAA outlook table — `27-day-outlook.txt` (cached via `src/data_manager.py`)
- NASA DONKI flares (optional integration in module)

### Inference engine

File: `src/predictor.py`

- Loads model artifacts from `models/` (joblib):
  - `aurora_model_stage1.pkl`, `aurora_model_stage2.pkl`, `feature_cols.pkl`, `feature_medians.pkl`
- Computes a geomagnetic latitude approximation and a Kp threshold by latitude.
- Produces:
  - `score` (0–100)
  - `level` (e.g. `MINIMAL`, `LOW`, `MODERATE`, `HIGH`, `EXTREME`)
  - descriptive text + tips
  - cloud cover adjustment

## Alerts & notifications

File: `api/services/alerts.py`

What it does:
- Uses **Supabase** credentials from environment to query `telemetry_alerts`.
- Periodically evaluates:
  - **live** aurora conditions at each subscribed coordinate
  - **predictive** 24h score loop (peak within next ~12 hours)
- Sends emails via **Resend**.
- Bridges forecast points into Next.js (Prisma) by POSTing to `POST /api/internal/forecasts`.

## Data flow (end-to-end)

### Global dashboard (initial load)

1. Browser loads `frontend/src/app/page.tsx`
2. Frontend requests a global forecast + telemetry history
3. FastAPI weather router calls:
   - NOAA/SWPC via `src/space_weather.py`
   - ML inference via `src/predictor.py`
   - Open-Meteo for local atmospheric variables
4. Frontend renders dashboard components

### Local map (after selecting a target)

1. User searches (Nominatim) in `TacticalOmnibar`
2. Zustand transitions `GLOBAL → LOCAL`
3. `LocationMap`:
   - fetches localized `/api/weather/forecast/global?lat=...&lon=...&hour_offset=...`
   - fetches `/api/sightseeing?lat=...&lon=...`
   - posts `/api/tactical-brief` for brief text
   - uses `/api/chat` for the assistant modal

### Alert loop

1. Next server action writes subscription to Supabase (`frontend/src/app/actions/alertActions.ts`)
2. FastAPI scheduler reads active subscriptions (Supabase)
3. Scheduler computes scores and emails via Resend
4. Scheduler optionally writes forecast points into Prisma via Next internal route

## Environment variables (by feature area)

### Python (FastAPI + scheduler)
- `RESEND_API_KEY` (Resend email sending)
- `NEXT_PUBLIC_SUPABASE_URL` (Supabase project URL)
- `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (Supabase key for scheduler access)

### Next.js
- `NVIDIA_API_KEY` (NVIDIA NIM / OpenAI-compatible baseURL calls)
- `DATABASE_URL` (Prisma / Neon Postgres connection string)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (Supabase SSR/Browser clients)
- `NEXT_PUBLIC_BACKEND_URL` (FastAPI base URL used by some bridge routes/components)

## “Where to look” quick index

- **Main UI**: `frontend/src/app/page.tsx`
- **Local map + all local UX**: `frontend/src/components/LocationMap.tsx`
- **Search**: `frontend/src/components/ui/TacticalOmnibar.tsx`
- **FastAPI entry**: `api/main.py`
- **Forecast endpoint**: `api/routers/weather.py`
- **NOAA fetch logic**: `src/space_weather.py`
- **ML scoring**: `src/predictor.py`
- **Alert scheduler**: `api/services/alerts.py`

