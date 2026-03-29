'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationMap from '@/components/LocationMap';
import { useAppStore } from '@/store/useAppStore';

// ── Phase 6: Primary Stitch UI Components ────────────────────────────────────
import LandingPage_Mobile        from '@/components/ui/LandingPage_Mobile';
import LocationHUD_Mobile        from '@/components/ui/LocationHUD_Mobile';

// ── Phase 4: Global Modal Portal ─────────────────────────────────────────────
import AIAssistantOverlay_Clean  from '@/components/ui/AIAssistantOverlay_Clean';
import DestinationDossier from '@/components/ui/DestinationDossier';
import TargetAlertModal          from '@/components/ui/TargetAlertModal';
import SearchOverlay             from '@/components/ui/SearchOverlay';
import ToastNotifier             from '@/components/ui/ToastNotifier';

// ── Phase 5: Live Telemetry Bridge ───────────────────────────────────────────
import { LiveTelemetryProvider } from '@/hooks/useLiveTelemetry';

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const {
    viewMode,
    isAICopilotOpen,
    isDossierOpen,
    activeDossier,
    isTargetAlertOpen,
    isSearchOpen,
    mapLayer,
  } = useAppStore();

  // ── Map is always mounted (behind everything) so it loads instantly ────────
  // OVERLAY LEGEND:
  //   z-0   → LocationMap canvas (always full-screen, absolute inset-0)
  //   z-10  → Stitch Landing Page (LANDING viewMode)
  //   z-10  → Stitch Location HUD (LOCAL viewMode) — overlays map
  //   z-100 → AI Copilot / Dossier modals
  //   z-150 → Target Alert modal
  //   z-200 → Search Overlay
  //   z-9999→ Toast Notifier

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#10131a]">

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 0: THE MAP CANVAS
          Always mounted, always full-screen, always behind everything.
          The HUD slides over the top on LOCAL view.
          map type driven by store.mapLayer ('VECTOR' | 'SATELLITE').
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0">
        <LocationMap />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 1: STITCH LANDING PAGE
          Shown when viewMode === 'LANDING'.
          Full-screen scroll experience with orrery, hotspot nodes, AI teaser.
          NOTE: bg-[#10131a] covers the map entirely on this layer.
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewMode === 'LANDING' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden hide-scrollbar"
          >
            <LandingPage_Mobile />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 2: LOCATION HUD
          Shown when viewMode === 'MAP_HUD'.
          The HUD is a transparent glass overlay on top of the live MapLibre canvas.
          CSS handles the mobile 40/60 split via Tailwind (mt-[40vh]) — no JS.
          The HUD root div is transparent; the map at z-0 shows through.
      ═══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {viewMode === 'MAP_HUD' && (
          <motion.div
            key="hud"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            <LocationHUD_Mobile />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          LAYER 3+: GLOBAL MODAL PORTAL
          All overlays mount here. Phase 4 architecture — unchanged.
          Render above everything via z-index stacking.
      ═══════════════════════════════════════════════════════════════════════ */}

      {/* Phase 5: Live Telemetry Data Bridge — no UI, pure data */}
      <LiveTelemetryProvider />

      {/* ── 1. AI Co-Pilot Chat (z-100) ──────────────────────────────────── */}
      <AnimatePresence>
        {isAICopilotOpen && (
          <motion.div
            key="ai-copilot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <AIAssistantOverlay_Clean />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. Destination Dossier Router (z-100) ────────────────────────── */}
      <AnimatePresence>
        {isDossierOpen && activeDossier && (
          <motion.div
            key={`dossier-${activeDossier.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: 20  }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-100 overflow-y-auto"
          >
            <DestinationDossier />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. Target Alert Modal (z-150) ────────────────────────────────── */}
      <AnimatePresence>
        {isTargetAlertOpen && (
          <motion.div
            key="target-alert"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1    }}
            exit={{    opacity: 0, scale: 0.97  }}
            transition={{ duration: 0.2 }}
          >
            <TargetAlertModal />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Search Overlay (z-200) ─────────────────────────────────────── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <SearchOverlay />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. Toast Notifier (z-9999 — always on top) ────────────────────── */}
      <ToastNotifier />

    </div>
  );
}
