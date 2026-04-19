/**
 * [useAppStore.ts]
 * 
 * PURPOSE: Central state management for the AuroraLens application. Orchestrates navigation, telemetry caching, and UI state persistence.
 * DATA SOURCE: Synchronizes with localStorage for persistence and useLiveTelemetry for data hydration.
 * DEPENDS ON: Zustand for state orchestration.
 * AUTHOR: Mosin Mushtaq — B.Tech AI/ML, SKUAST 2026
 * NOTE: Sections marked "AI-generated" were produced by agentic AI
 *       and verified for correctness against source documentation.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Type Definitions ────────────────────────────────────────────────────────

export type ViewMode = 'LANDING' | 'MAP_HUD';
export type DialMode = 'GLOBAL' | 'LOCAL' | 'CUSTOM';
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

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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
  /** 'AURORA_GUIDE' (Landing) vs 'PHOTO_ASSISTANT' (Map/Dossier) */
  mode?: 'AURORA_GUIDE' | 'PHOTO_ASSISTANT';
  /** Optional pre-populated message (e.g. from "View Full Brief" button) */
  initialBrief?: string;
  /** Optional pre-populated user query to automatically send on open */
  initialQuery?: string;
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
  /** Number of active hotspots (>50 score, 100km apart) */
  globalHotspots: number;
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

// ── Phase 12.1: Local metadata enrichment for premium lore/images ────────────────
export const DOSSIER_METADATA_MAP: Record<string, { lore: string[], hero?: string }> = {
  'kirkjufell': {
    lore: [
      "Beyond the basalt columns and the rhythmic crash of the Atlantic lies a landmark forged in fire and sculpted by ice.",
      "Kirkjufell stands not merely as a mountain, but as a celestial convergence point where the magnetic pulse of the North reaches its zenith.",
      "High-density magnetic flux detected at the peak apex, accelerating ion collision probability by 14% for deep-field aurora captures."
    ],
    hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdhVAGG6MIWUfVCaC0XxIJQ5vG7uCAwirX4rQWgREm8oUOw11JcHzz-4_2E5_qafmYuXv2SLVLLdZpNlWZJ6E_0dqJoOqwgIC2tHNso1MCgUuY6WuOcfGhAenzxjF4NKMcv0vceYMmCaXp5QOKInxgQ91CQxKEn6DsGZko39UA6VAdqT-gH0s3C4yWXP0yZNuN5YDlcV4vhNfiOjRrcjZrWFerNDSfChnSAHZ0jtIddXx5Z8C961dCwUCyECZAGKuWpPBDRuo2UMs'
  },
  'tromso': {
    lore: [
      "Known as the Gateway to the Arctic, Tromsø is perched on the 69th parallel, perfectly positioned in the auroral oval's inner heart.",
      "The interaction between the arctic fjords and the magnetospheric pulse creates a uniquely resonant visual spectrum.",
      "Bridges of light span the Norwegian Sea, reflecting off the dark waters where the midnight sun surrendered months ago."
    ],
    hero: '/assets/dossier/tromso_hero.png'
  },
  'fairbanks': {
    lore: [
      "In the vast Alaskan Interior, Fairbanks offers an unparalleled stage for the celestial theater, free from coastal cloud interference.",
      "A bastion of gold-rush history, now serving as a primary node for geomagnetic observation in the high sub-arctic.",
      "A theater of deep-field luminescence where the atmosphere burns with the energy of distant solar storms."
    ],
    hero: '/assets/dossier/fairbanks_hero.png'
  }
};

/** Checks if a location has a rich dossier by name (case-insensitive) or ID */
export const isDossierAvailable = (nameOrId: string) => {
  const normalized = nameOrId.toLowerCase();
  return !!DOSSIER_METADATA_MAP[normalized] || 
         Object.keys(DOSSIER_METADATA_MAP).some(id => normalized.includes(id));
};

/** Get the primary ID for a location name */
export const getDossierId = (name: string): string | null => {
  const normalized = name.toLowerCase();
  if (DOSSIER_METADATA_MAP[normalized]) return normalized;
  return Object.keys(DOSSIER_METADATA_MAP).find(id => normalized.includes(id)) || null;
};

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
  aiCopilotContext: AICopilotContext | null;
  /** Photo Assistant Overlay (PhotoAssistantOverlay.tsx) */
  isPhotoAssistantOpen: boolean;
  photoAssistantContext: AICopilotContext | null;
  photoChatHistory: ChatMessage[];
  photoAssistantSetup: 'general' | 'pro' | null;

  /** Target Alert Modal (TargetAlertModal.tsx) */
  isTargetAlertOpen: boolean;

  /** Search Overlay (SearchOverlay.tsx) */
  isSearchOpen: boolean;

  /** Active Dossier — feeds all DossierView_*.tsx components */
  activeDossier: DossierTarget | null;
  isDossierOpen: boolean;

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

  // ── Phase 5.1: Session Persistence (Chat & Location) ─────────────────────
  aiChatHistory: ChatMessage[];
  aiChatLastUpdated: number;
  /** Flag to re-open AI Copilot on top of the Map when returning via 'Back' */
  returnToCopilot: boolean;

  /** Persistence for the Landing Page Dial Mode */
  dialMode: DialMode;

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

  // Phase 5.1: Chat Session
  setAiChatHistory: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  clearAiChatHistory: () => void;
  setReturnToCopilot: (val: boolean) => void;

  // Phase 5.2: Photo Assistant Actions
  openPhotoAssistant: (context: AICopilotContext) => void;
  closePhotoAssistant: () => void;
  setPhotoChatHistory: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  clearPhotoChatHistory: () => void;
  setPhotoAssistantSetup: (setup: 'general' | 'pro' | null) => void;
}

// ─── Zustand Store ────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
  isPhotoAssistantOpen: false,
  photoAssistantContext: null,
  photoChatHistory: [],
  photoAssistantSetup: null,
  isTargetAlertOpen: false,
  isSearchOpen: false,
  activeDossier: null,
  isDossierOpen: false,
  toasts: [],
  historicTelemetry: null,

  // Phase 5 initial
  liveData: {
    auroraScore: 0,
    cloudCover: 0,
    temperature: 0,
    precipitation: 0,
    kp: 0,
    level: 'INITIALIZING',
    bz: 0,
    bt: 0,
    solarSpeed: 0,
    density: 0,
    lastUpdated: '',
    globalHotspots: 0,
    loading: true,
    error: false,
  },

  // Phase 9 initial
  dossierTab: 'environmental',

  // Phase 5.1 initial
  aiChatHistory: [],
  aiChatLastUpdated: 0,
  dialMode: 'GLOBAL',
  returnToCopilot: false,

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

  // ── Phase 5.2: Photo Assistant ──────────────────────────────────────────

  openPhotoAssistant: (context: AICopilotContext) => {
    set({ isPhotoAssistantOpen: true, photoAssistantContext: context });
  },

  closePhotoAssistant: () => {
    set({ isPhotoAssistantOpen: false, photoAssistantContext: null });
  },

  setPhotoChatHistory: (messagesOrFn) => {
    set((state) => ({
      photoChatHistory: typeof messagesOrFn === 'function' ? messagesOrFn(state.photoChatHistory) : messagesOrFn
    }));
  },

  clearPhotoChatHistory: () => {
    set({ photoChatHistory: [], photoAssistantSetup: null });
  },

  setPhotoAssistantSetup: (setup: 'general' | 'pro' | null) => {
    set({ photoAssistantSetup: setup });
  },

  // ── Phase 3: Target Alert Modal ──────────────────────────────────────────

  openTargetAlert: () => set({ isTargetAlertOpen: true }),
  closeTargetAlert: () => set({ isTargetAlertOpen: false }),

  // ── Phase 3: Search Overlay ──────────────────────────────────────────────

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  // ── Phase 3: Dossier ─────────────────────────────────────────────────────

  openDossier: (target: DossierTarget) => {
    const enrichedTarget = {
      ...target,
      lore: DOSSIER_METADATA_MAP[target.id]?.lore || target.lore || [],
      heroImage: DOSSIER_METADATA_MAP[target.id]?.hero || target.heroImage
    };

    set({ 
      activeDossier: enrichedTarget, 
      isDossierOpen: true,
      targetLocation: { lat: target.lat, lng: target.lng, name: target.name }
    });
  },

  closeDossier: () => {
    set({ isDossierOpen: false, activeDossier: null });
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

  // ── Phase 5.1: Chat Session Actions ─────────────────────────────────────
  setAiChatHistory: (messagesOrFn) => {
    set((state) => ({
      aiChatHistory: typeof messagesOrFn === 'function' ? messagesOrFn(state.aiChatHistory) : messagesOrFn,
      aiChatLastUpdated: Date.now()
    }));
  },
  clearAiChatHistory: () => {
    set({ aiChatHistory: [], aiChatLastUpdated: 0 });
  },
  setReturnToCopilot: (val: boolean) => {
    set({ returnToCopilot: val });
  },
  setDialMode: (mode: DialMode) => set({ dialMode: mode }),
    }),
    {
      name: 'aurora-session-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        aiChatHistory: state.aiChatHistory,
        aiChatLastUpdated: state.aiChatLastUpdated,
        returnToCopilot: state.returnToCopilot,
        photoChatHistory: state.photoChatHistory,
        photoAssistantSetup: state.photoAssistantSetup,
        dialMode: state.dialMode,
      }),
    }
  )
);
