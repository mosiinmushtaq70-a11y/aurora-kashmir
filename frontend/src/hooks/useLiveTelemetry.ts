/**
 * useLiveTelemetry — Phase 5
 *
 * A React hook that polls /api/weather/forecast/global with the current
 * targetLocation + timeScrubber from the store, then writes the result
 * into liveData via setLiveData.
 *
 * Usage: Mount once inside a 'use client' component at the page root.
 *   <LiveTelemetryProvider />  (see bottom of this file)
 *
 * Design decisions:
 * - Fetches on mount and re-fetches whenever lat/lng or timeScrubber changes
 * - Falls back to the last successful data on network error (no blank screens)
 * - 12-minute auto-refresh for "now" (hour_offset=0), no auto-refresh for forecasts
 * - Uses a 12h localStorage cache key identical to the existing page.tsx strategy
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { LiveTelemetryData } from '@/store/useAppStore';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const REFRESH_INTERVAL_MS = 12 * 60 * 1000;   // 12 minutes for live data
const CACHE_EXPIRY_MS     = 12 * 60 * 60 * 1000; // 12 hours for localStorage

// ─── Cache helpers ────────────────────────────────────────────────────────────

function cacheKey(lat: number, lng: number, offset: number) {
  return `aurora_live_${lat.toFixed(3)}_${lng.toFixed(3)}_${offset}`;
}

function readCache(key: string): LiveTelemetryData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data as LiveTelemetryData;
  } catch {
    return null;
  }
}

function writeCache(key: string, data: LiveTelemetryData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* quota exceeded — fail silently */ }
}

// ─── Response → LiveTelemetryData mapper ─────────────────────────────────────

interface ForecastAPIResponse {
  aurora_score: number;
  cloud_cover: number;
  temperature: number;
  precipitation: number;
  level: string;
  last_updated: string;
  telemetry: {
    bz_nt: number;
    bt_nt: number;
    speed_km_s: number;
    density_p_cm3: number;
  };
}

function mapResponse(json: ForecastAPIResponse): LiveTelemetryData {
  const score = json.aurora_score ?? 0;
  return {
    auroraScore:   score,
    cloudCover:    json.cloud_cover   ?? 0,
    temperature:   json.temperature   ?? 0,
    precipitation: json.precipitation ?? 0,
    kp:            parseFloat(((score / 100) * 9).toFixed(2)),
    level:         json.level         ?? 'MINIMAL',
    bz:            json.telemetry?.bz_nt         ?? 0,
    bt:            json.telemetry?.bt_nt         ?? 0,
    solarSpeed:    json.telemetry?.speed_km_s    ?? 0,
    density:       json.telemetry?.density_p_cm3 ?? 0,
    lastUpdated:   json.last_updated ?? '',
    loading:       false,
    error:         false,
  };
}

// ─── The hook ─────────────────────────────────────────────────────────────────

export function useLiveTelemetry() {
  const {
    targetLocation,
    timeScrubber,
    setLiveData,
    liveData,
  } = useAppStore();

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef    = useRef<AbortController | null>(null);
  const isMounted   = useRef(true);

  const lat    = targetLocation?.lat ?? 64.84;   // Default: Fairbanks
  const lng    = targetLocation?.lng ?? -147.72;
  const offset = timeScrubber;

  const fetchData = useCallback(async (skipCache = false) => {
    const key = cacheKey(lat, lng, offset);

    // 1. Serve from cache instantly while network request is in-flight
    if (!skipCache) {
      const cached = readCache(key);
      if (cached) {
        setLiveData({ ...cached, loading: true, error: false });
      } else {
        // Mark loading so components can show a subtle pulse
        setLiveData({
          ...(liveData ?? {} as LiveTelemetryData),
          loading: true,
          error: false,
          auroraScore:   liveData?.auroraScore   ?? 0,
          cloudCover:    liveData?.cloudCover     ?? 0,
          temperature:   liveData?.temperature    ?? 0,
          precipitation: liveData?.precipitation  ?? 0,
          kp:            liveData?.kp             ?? 0,
          level:         liveData?.level          ?? '',
          bz:            liveData?.bz             ?? 0,
          bt:            liveData?.bt             ?? 0,
          solarSpeed:    liveData?.solarSpeed      ?? 0,
          density:       liveData?.density        ?? 0,
          lastUpdated:   liveData?.lastUpdated    ?? '',
        });
      }
    }

    // 2. Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const url = `${API_BASE}/api/weather/forecast/global?lat=${lat}&lon=${lng}&hour_offset=${offset}`;
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ForecastAPIResponse = await res.json();

      if (!isMounted.current) return;

      const data = mapResponse(json);
      writeCache(key, data);
      setLiveData(data);
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      if (!isMounted.current) return;

      // Serve stale cache on error — never blank out the UI
      const cached = readCache(key);
      if (cached) {
        setLiveData({ ...cached, loading: false, error: true });
      } else {
        setLiveData({
          auroraScore: 0, cloudCover: 0, temperature: 0,
          precipitation: 0, kp: 0, level: 'UNKNOWN',
          bz: 0, bt: 0, solarSpeed: 0, density: 0,
          lastUpdated: '', loading: false, error: true,
        });
      }
    }
  }, [lat, lng, offset, setLiveData, liveData]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    // Auto-refresh only for live view (offset = 0)
    if (offset === 0) {
      timerRef.current = setInterval(() => fetchData(true), REFRESH_INTERVAL_MS);
    }

    return () => {
      isMounted.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, offset]);   // Re-run whenever location or time offset changes
}

// ─── Mounting component ───────────────────────────────────────────────────────
// Mount this once in page.tsx. It has no UI — pure data bridge.

export function LiveTelemetryProvider() {
  useLiveTelemetry();
  return null;
}
