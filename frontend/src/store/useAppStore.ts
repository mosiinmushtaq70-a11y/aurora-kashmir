import { create } from 'zustand';

// ─── Type Definitions ────────────────────────────────────────────────────────

export type ViewMode = 'LANDING' | 'MAP_HUD';
export type MapLayer = 'VECTOR' | 'SATELLITE';
export type DossierTab = 'environmental' | 'tactical' | 'archives' | 'logistics';

export interface TargetLocation {
  lat: number;
  lng: number;
  name: string;
  zoom?: number;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Context payload passed to the AI Copilot when opened from
 * a particular location. Drives the initial greeting message
 * and injects live telemetry into the system prompt.
 */
export interface AICopilotContext {
  locationName: string;
  auroraScore: number;
  temperature: number | null;
  /** Optional pre-populated message (e.g. from "View Full Brief" button) */
  initialBrief?: string;
}

/**
 * The active Dossier target — used to feed live data into any of the
 * three DossierView_*.tsx components.
 */
export interface DossierTarget {
  id: string;           // e.g. 'kirkjufell' | 'tromso' | 'fairbanks'
  name: string;
  region: string;
  lat: number;
  lng: number;
  auroraScore: number;
  cloudCover: number;
  temperature: number | null;
  heroImage?: string;
  lore?: string[];
}

/**
 * Live telemetry payload — written by useLiveTelemetry, read by HUD + Dossiers.
 * Replaces all static placeholder values in wired components.
 */
export interface LiveTelemetryData {
  auroraScore: number;
  cloudCover: number;
  temperature: number;
  precipitation: number;
  /** Kp-index (derived: score/100 * 9) */
  kp: number;
  /** Geo-magnetic level string from the backend (e.g. 'MODERATE', 'HIGH') */
  level: string;
  /** Raw solar wind telemetry from NOAA */
  bz: number;
  bt: number;
  solarSpeed: number;
  density: number;
  lastUpdated: string;
  /** Whether data is being fetched */
  loading: boolean;
  /** Whether the last fetch failed */
  error: boolean;
}

/**
 * Toast notification payload for "Pro Tier" unwired UI elements.
 */
export interface ToastPayload {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// ─── Phase 3 Forecast Hour Presets ──────────────────────────────────────────
// Used by LocationHUD_Mobile forecast cards to jump to specific offsets.
export const FORECAST_HOUR_PRESETS = [0, 6, 12, 24, 48] as const;
export type ForecastHourPreset = typeof FORECAST_HOUR_PRESETS[number];

// ─── Store Interface ──────────────────────────────────────────────────────────

interface AppState {
  // ── Existing: View State ──────────────────────────────────────────────────
  viewMode: ViewMode;
  targetLocation: TargetLocation | null;
  /** Time offset in hours (0 = now, 6/12/24/48 = future forecasts).
   *  Driven by HUD forecast card clicks (no legacy slider). */
  timeScrubber: number;

  // ── Existing: Derived Loading State ──────────────────────────────────────
  isTransitioning: boolean;

  // ── Existing: UI / Scenic Mode ────────────────────────────────────────────
  isProMode: boolean;
  scenicMode: boolean;
  scenicName: string | null;
  scenicRegion: string | null;
  scenicLore: string[];

  // ── Existing: Auth State ──────────────────────────────────────────────────
  user: User | null;

  // ── Phase 3: Modal Orchestration ─────────────────────────────────────────
  /** Primary AI Co-Pilot Chat (AIAssistantOverlay_Clean.tsx) */
  isAICopilotOpen: boolean;
  /** Context injected into the copilot on open */
  aiCopilotContext: AICopilotContext | null;

  /** Target Alert Modal (TargetAlertModal.tsx) */
  isTargetAlertOpen: boolean;

  /** Search Overlay (SearchOverlay.tsx) */
  isSearchOpen: boolean;

  /** Active Dossier — feeds all DossierView_*.tsx components */
  activeDossier: DossierTarget | null;
  isDossierOpen: boolean;

  // ── Phase 3: Map Layer Toggle ─────────────────────────────────────────────
  /** Toggled from the subtle button injected into LocationHUD_Mobile */
  mapLayer: MapLayer;

  // ── Phase 3: Toast System (Pro-tier unwired UI fallback) ─────────────────
  toasts: ToastPayload[];

  // ── Phase 3: Deep Telemetry (Parked)
  /** Historical chart data is held in-state but NOT displayed until the
   *  "Deep Telemetry" modal is built in a future sprint. */
  historicTelemetry: Record<string, unknown>[] | null;

  // ── Phase 5: Live Telemetry Data ─────────────────────────────────────────
  /** Written by useLiveTelemetry hook, read by HUD + Dossier components. */
  liveData: LiveTelemetryData | null;

  // ── Phase 9: Dossier Tab Navigation ───────────────────────────────────────
  dossierTab: DossierTab;

  // ─── Actions ──────────────────────────────────────────────────────────────

  // Existing
  zoomToLocation: (location: TargetLocation) => void;
  returnToGlobal: () => void;
  /** Phase 6: Direct view mode navigation (e.g. Landing → Dashboard) */
  setViewMode: (mode: ViewMode) => void;
  setTimeScrubber: (hours: number) => void;
  setTransitioning: (val: boolean) => void;
  setProMode: (val: boolean) => void;
  setScenicMode: (val: boolean) => void;
  setScenicName: (val: string | null) => void;
  setScenicRegion: (val: string | null) => void;
  setScenicLore: (lore: string[]) => void;
  setUser: (user: User | null) => void;

  // Phase 3: AI Copilot
  openAICopilot: (context: AICopilotContext) => void;
  closeAICopilot: () => void;

  // Phase 3: Target Alert Modal
  openTargetAlert: () => void;
  closeTargetAlert: () => void;

  // Phase 3: Search Overlay
  openSearch: () => void;
  closeSearch: () => void;

  // Phase 3: Dossier
  openDossier: (target: DossierTarget) => void;
  closeDossier: () => void;

  // Phase 3: Map Layer
  toggleMapLayer: () => void;

  // Phase 3: Toast
  pushToast: (message: string, type?: ToastPayload['type']) => void;
  dismissToast: (id: string) => void;

  // Phase 5: Live Telemetry
  setLiveData: (data: LiveTelemetryData) => void;

  // Phase 9: Dossier Tab Navigation
  setDossierTab: (tab: DossierTab) => void;

  // Phase 3: Parked Historic Data
  setHistoricTelemetry: (data: Record<string, unknown>[]) => void;

  // Phase 7: Direct target coordinate setter (used by SearchOverlay —
  // sets location without touching viewMode, unlike zoomToLocation which also navigates)
  setTargetLocation: (location: TargetLocation | null) => void;
}

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
  // ── Initial State ────────────────────────────────────────────────────────
  viewMode: 'LANDING',
  targetLocation: null,
  timeScrubber: 0,
  isTransitioning: false,
  isProMode: false,
  scenicMode: false,
  scenicName: null,
  scenicRegion: null,
  scenicLore: [],
  user: null,

  // Phase 3 initial
  isAICopilotOpen: false,
  aiCopilotContext: null,
  isTargetAlertOpen: false,
  isSearchOpen: false,
  activeDossier: null,
  isDossierOpen: false,
  mapLayer: 'VECTOR',
  toasts: [],
  historicTelemetry: null,

  // Phase 5 initial
  liveData: null,

  // Phase 9 initial
  dossierTab: 'environmental',

  // ── Existing Actions (Preserved exactly) ────────────────────────────────

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  zoomToLocation: (location: TargetLocation) => {
    set({ isTransitioning: true });
    setTimeout(() => {
      set({
        viewMode: 'MAP_HUD',
        targetLocation: location,
        isTransitioning: false,
      });
    }, 100);
  },

  returnToGlobal: () => {
    set({ isTransitioning: true });
    setTimeout(() => {
      set({
        viewMode: 'LANDING',
        targetLocation: null,
        isTransitioning: false,
        scenicMode: false,
        scenicName: null,
        scenicRegion: null,
        scenicLore: [],
      });
    }, 100);
  },

  setTimeScrubber: (hours: number) => set({ timeScrubber: hours }),
  setTransitioning: (val: boolean) => set({ isTransitioning: val }),
  setProMode: (val: boolean) => set({ isProMode: val }),
  setScenicMode: (val: boolean) => set({ scenicMode: val }),
  setScenicName: (val: string | null) => set({ scenicName: val }),
  setScenicRegion: (val: string | null) => set({ scenicRegion: val }),
  setScenicLore: (lore: string[]) => set({ scenicLore: lore }),
  setUser: (user: User | null) => set({ user }),

  // ── Phase 3: AI Copilot ──────────────────────────────────────────────────

  /**
   * Open the primary AI Copilot (AIAssistantOverlay_Clean.tsx).
   * Pass an optional `initialBrief` string to pre-seed the chat with the
   * truncated tactical brief from the Insight card ("View Full Brief" flow).
   */
  openAICopilot: (context: AICopilotContext) => {
    set({ isAICopilotOpen: true, aiCopilotContext: context });
  },

  closeAICopilot: () => {
    set({ isAICopilotOpen: false, aiCopilotContext: null });
  },

  // ── Phase 3: Target Alert Modal ──────────────────────────────────────────

  openTargetAlert: () => set({ isTargetAlertOpen: true }),
  closeTargetAlert: () => set({ isTargetAlertOpen: false }),

  // ── Phase 3: Search Overlay ──────────────────────────────────────────────

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  // ── Phase 3: Dossier ─────────────────────────────────────────────────────

  openDossier: (target: DossierTarget) => {
    set({ 
      activeDossier: target, 
      isDossierOpen: true,
      targetLocation: { lat: target.lat, lng: target.lng, name: target.name }
    });
  },

  closeDossier: () => {
    set({ isDossierOpen: false, activeDossier: null });
  },

  // ── Phase 3: Map Layer Toggle ────────────────────────────────────────────

  toggleMapLayer: () => {
    const current = get().mapLayer;
    set({ mapLayer: current === 'VECTOR' ? 'SATELLITE' : 'VECTOR' });
  },

  // ── Phase 3: Toast System ────────────────────────────────────────────────

  pushToast: (message: string, type: ToastPayload['type'] = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const toast: ToastPayload = { id, message, type };
    set((state) => ({ toasts: [...state.toasts, toast] }));
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  dismissToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // ── Phase 3: Parked Historic Telemetry ──────────────────────────────────
  // Logic is safe in state. Will surface in "Deep Telemetry" modal (future sprint).
  setHistoricTelemetry: (data: Record<string, unknown>[]) => {
    set({ historicTelemetry: data });
  },

  // ── Phase 5: Live Telemetry ──────────────────────────────────────────────
  setLiveData: (data: LiveTelemetryData) => {
    set({ liveData: data });
  },

  // ── Phase 9: Dossier Tab Navigation ───────────────────────────────────────
  setDossierTab: (tab: DossierTab) => {
    set({ dossierTab: tab });
  },

  // ── Phase 7: Direct target setter (SearchOverlay flow) ──────────────────
  // Sets coordinates on the store WITHOUT changing viewMode.
  // SearchOverlay calls: setTargetLocation → setViewMode('MAP_HUD') → closeSearch()
  setTargetLocation: (location: TargetLocation | null) => {
    set({ targetLocation: location });
  },
}));
