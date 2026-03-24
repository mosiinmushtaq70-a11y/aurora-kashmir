# AuroraLens Product Requirements Document (v2)

## Purpose
AuroraLens is a real-time aurora borealis telemetry and prediction dashboard. It monitors solar wind data from NOAA and provides location-based aurora visibility scores.

## Core Features
1. **Real-time Telemetry**: Fetches solar wind metrics (Bz, Speed, Density) and Kp Index.
2. **Aurora Prediction**: Calculates visibility scores for specific GPS coordinates.
3. **Telemetry Watch**: Users can register an email to receive alerts when aurora scores exceed a threshold (75%).
4. **Interactive Map**: Displays probability overlays and cloud cover forecasts.

## API Endpoints (Local Port 8001)
- `GET /api/health`: System status.
- `GET /api/weather/solar-wind`: Current solar wind data.
- `GET /api/weather/kp-index`: Latest Kp index.
- `POST /api/alerts/subscribe`: User email subscription for watches.

## Tech Stack
- Frontend: Next.js (Port 3000)
- Backend: FastAPI (Port 8001)
- Database: Supabase (PostgreSQL)
- Email: Resend API
