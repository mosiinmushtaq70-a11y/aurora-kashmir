# Legacy HUD Inventory (Preserved for later extraction)

This inventory records the old `LocationMap` HUD features that were removed from rendering but intentionally kept in code for future selective reuse.

## Where the legacy code still lives
- `frontend/src/components/LocationMap.tsx`
  - `LocalInsightsSidebar`
  - `LocalDataSidebar`
  - `ScenicLoreSidebar`
  - Legacy top controls (`Back to Global`, old search bar, map-theme toggle) in historical render block (now disabled from runtime path)

## Legacy feature groups to potentially reuse
- **Target lock + alert flow**
  - Target coordinates card
  - "Configure Target Alerts" modal and submit flow
- **AI insights cluster**
  - Photography / sky / visibility recommendation cards
  - AI assistant launch CTA
- **Prime viewing spots**
  - Ranked spot cards
  - Directions link chip
  - Marker label style behavior
- **Telemetry panel**
  - Aurora score and weather grid
  - Optional "Pro telemetry" expanded raw metrics
- **Scenic mode lore**
  - Destination lore cards
  - Scenic-focused left panel layout

## Runtime decision now
- `LocationMap` renders map-only behavior.
- The new single-source HUD is `frontend/src/components/ui/LocationHUD_Mobile.tsx`.
