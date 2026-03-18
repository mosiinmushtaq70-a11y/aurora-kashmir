import { create } from 'zustand';

// ─── Type Definitions ───────────────────────────────────────────────────────

export type ViewMode = 'GLOBAL' | 'LOCAL';

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

// ─── Store Interface ─────────────────────────────────────────────────────────

interface AppState {
  // View State
  viewMode: ViewMode;
  targetLocation: TargetLocation | null;
  timeScrubber: number; // 0-72 (hours into the future)

  // Derived Loading State
  isTransitioning: boolean;

  // UI State
  isProMode: boolean;

  // Auth State
  user: User | null;

  // Actions
  zoomToLocation: (location: TargetLocation) => void;
  returnToGlobal: () => void;
  setTimeScrubber: (hours: number) => void;
  setTransitioning: (val: boolean) => void;
  setProMode: (val: boolean) => void;
  setUser: (user: User | null) => void;
}

// ─── Zustand Store ───────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set) => ({
  // Initial State
  viewMode: 'GLOBAL',
  targetLocation: null,
  timeScrubber: 0,
  isTransitioning: false,
  isProMode: false,
  user: null,

  // Transition to LOCAL mode for a given location
  zoomToLocation: (location: TargetLocation) => {
    set({ isTransitioning: true });
    // Brief delay allows the exit animation to begin before state change finalizes
    setTimeout(() => {
      set({
        viewMode: 'LOCAL',
        targetLocation: location,
        isTransitioning: false,
      });
    }, 100);
  },

  // Return to global 3D globe view
  returnToGlobal: () => {
    set({ isTransitioning: true });
    setTimeout(() => {
      set({
        viewMode: 'GLOBAL',
        targetLocation: null,
        isTransitioning: false,
      });
    }, 100);
  },

  // Update the time scrubber (0 = now, 72 = 72hrs ahead)
  setTimeScrubber: (hours: number) => set({ timeScrubber: hours }),
  setTransitioning: (val: boolean) => set({ isTransitioning: val }),
  setProMode: (val: boolean) => set({ isProMode: val }),
  setUser: (user: User | null) => set({ user }),
}));
