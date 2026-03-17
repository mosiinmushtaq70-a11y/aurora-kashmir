# AuroraLens Integrated Master Project Directive v2.0

## Core Directives (Absolute Priority)

1. **Do Not Break Existing UI**: We have a working WebGL Raymarched background, click animations, and a glassmorphic aesthetic (with a refined, extreme left-aligned 130%-scaled 3D globe with inverted vertical shadows). Build ON TOP of this. Do not rip out current CSS, Three.js backgrounds, or Tailwind setups.
2. **Functionality First**: Prioritize data pipelines, state transitions, and API connectivity over aesthetic Framer Motion polish. Make it work flawlessly, then make it beautiful.

## Architecture Override: State Management (Zustand)
Establish a global Zustand store (`useAppStore` in `frontend/src/store/useAppStore.ts`) for:
- `viewMode`: `'GLOBAL'` (spinning 3D globe) or `'LOCAL'` (MapLibre view triggered by search).
- `targetLocation`: `{ lat: number, lng: number, name: string }` (null by default).
- `timeScrubber`: `number` (0 to 12, representing hours into the future, default 0).

---

## Detailed Execution Plan & Mini-Phases

### Phase 1: Core Integration & Model Activation (✅ Complete)
- **Phase 1.1: System Alignment**
  - Connect Next.js frontend to FastAPI backend.
  - Verify health check endpoints and CORS configuration.
- **Phase 1.2: ML Model Activation**
  - Load and serve the pre-trained XGBoost model for aurora prediction.
  - Establish data flow from NOAA telemetry to model inference to API response.

### Phase 2: Immersive UI & Location Intelligence (🔄 Current Focus)
- **Phase 2.1: Navigation & Aesthetic Foundation (✅ Complete)**
  - Establish WebGL Raymarched background, click animations, and glassmorphic UI.
  - Implement and perfect the 130%-scale, extreme left-aligned 3D globe with inverted vertical shadows.
- **Phase 2.2: Global State Architecture (Next Step)**
  - Implement Zustand store (`useAppStore.ts`) for `viewMode` ('GLOBAL'/'LOCAL'), `targetLocation`, and `timeScrubber`.
  - Wire interactive UI elements (Search results, "Focus AI Lens" buttons) to trigger state updates.
- **Phase 2.3: The View State Transition**
  - Conditionally mount/unmount the 3D `<TexturedGlobe />` and `<AuroraMap />` based on `viewMode`.
  - Implement seamless transitions between the macro (global) and micro (local) views.
- **Phase 2.4: MapLibre GL JS 3D Integration**
  - Initialize MapLibre/MapTiler map instance.
  - Use `flyTo` or `fitBounds` to animate the camera to the `targetLocation`.
  - Apply `maxBounds` to restrict panning and tile loading to the focused region for high performance.
- **Phase 2.5: Localized Data Presentation**
  - Dynamically swap data panels/sidebars to display localized XGBoost predictions corresponding to the active `targetLocation`.

### Phase 3: UI Overhaul & Progressive Disclosure (✅ Complete)
- [x] **Micro-Sprint A: The "Pro Mode" Toggle & Telemetry State**
  - Add `isProMode` to Zustand store.
  - Sleek toggle switch in AI Aurora Score box.
  - Slide "Live Telemetry" via Framer Motion.
- [x] **Micro-Sprint B: Compact Environmental Data**
  - Mock Light Pollution (Bortle Scale) data.
  - Add Bortle level next to Temperature/Precipitation.
  - Add "Bell" Save Alert icon to Target Lock header.
- [x] **Micro-Sprint C: Floating Map Layer Controls**
  - Add 2/3 tiny, semi-transparent FABs in bottom right corner.
- [x] **Micro-Sprint D: UI Polish & Cleanup**
  - Minimalist timeline scrubber without heavy background box.
  - Hide "Maximal Visibility" box when in localized view.

### Phase 4: Auth, Database, & Alert Cron Jobs (⬜ Pending)
- **Phase 4.1: Authentication Setup**
  - Integrate user Auth provider (Clerk or NextAuth).
  - Secure API routes and create protected frontend views.
- **Phase 4.2: Database Integration**
  - Setup a PostgreSQL DB (via Prisma/Drizzle or Supabase).
  - Construct schemas for User Profiles and "Saved Campsites".
  - Build API endpoints for users to save and retrieve their pins.
- **Phase 4.3: Backend Worker & Alerts**
  - Set up a background worker task (e.g., APScheduler or Celery in FastAPI).
  - Schedule cron jobs to check the XGBoost model against all active saved campsites.
  - Fire automated Resend/SendGrid email alerts when visibility scores pass a defined threshold.

### Phase 5: Reliability, Polish & Testing (⬜ Pending)
- **Phase 5.1: Automated Testing Foundation**
  - Implement pytest automated data validation for the ML engine to ensure prediction accuracy.
  - Write standard unit tests for critical frontend utilities (e.g., coordinate formatting).
- **Phase 5.2: API Resiliency**
  - Implement robust retry logic for NOAA upstream APIs.
  - Establish fallback caching mechanisms (e.g., Redis or in-memory) to prevent downtime if NOAA goes offline.
- **Phase 5.3: Final UI Polish**
  - Add refined Framer Motion animations to sidebar transitions and component mounting.
  - Build out the interactive "Methodology" bottom-sheet for the Historic Superstorms grid.
  - Conduct full responsive and cross-browser QA.
