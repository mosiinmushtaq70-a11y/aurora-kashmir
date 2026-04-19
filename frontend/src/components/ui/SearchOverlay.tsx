/**
 * [SearchOverlay.tsx]
 * 
 * PURPOSE: Immersive geospatial search interface for selecting any coordinate on Earth for aurora tracking.
 * DATA SOURCE: Nominatim OpenStreetMap API for geocoding and reverse geocoding.
 * DEPENDS ON: useAppStore for target coordinate management, Framer Motion for entrance physics.
 * AUTHOR: Mosin Mushtaq — B.Tech AI/ML, SKUAST 2026
 * NOTE: Sections marked "AI-generated" were produced by agentic AI
 *       and verified for correctness against source documentation.
 */

'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import type { TargetLocation } from '@/store/useAppStore';

/**
 * --- SearchOverlay (Phase 7 Rebuild) ---
 *
 * MISSION 1 — Immersive Entrance Physics:
 *   ─ Backdrop: fixed full-screen blur fade-in via AnimatePresence
 *   ─ Panel: spring scale+y entrance (stiffness 300, damping 25)
 *
 * MISSION 2 — API Wiring & Strict Routing:
 *   ─ useDebounce (300ms) → Nominatim geocoding (open, no key)
 *   ─ Result Caching: local Map-based cache to prevent redundant fetches
 *   ─ isLoading spinner, error fallback handled in UI
 *   ─ Zero hardcoded locations. Zero openDossier() calls.
 *   ─ Selection: setTargetLocation → setViewMode('MAP_HUD') → closeSearch()
 *
 * Zero Destruction: all Celestial Lens glassmorphic aesthetics preserved.
 */

// ─── useDebounce Hook ─────────────────────────────────────────────────────────

/**
 * Custom hook to debounce rapid input changes (e.g., typing in a search bar).
 * Prevents overwhelming the Nominatim API with every keystroke.
 * 
 * @template T
 * @param {T} value - The input value to debounce
 * @param {number} delayMs - Delay in milliseconds before updating
 * @returns {T} The debounced value
 */
function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

// ─── Nominatim Result Type ─────────────────────────────────────────────────

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  address?: {
    country?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

// ─── Helper: derive a short label from Nominatim address ──────────────────────

function buildLocationName(result: NominatimResult): string {
  const parts = result.display_name.split(', ');
  // Take first 2–3 meaningful parts
  return parts.slice(0, 3).join(', ');
}

function buildRegionLabel(result: NominatimResult): string {
  const a = result.address;
  if (!a) return result.type;
  return (a.state || a.country || result.class || 'Region');
}

// ─── Local Lookup Cache (Static) ──────────────────────────────────────────────
const SEARCH_CACHE = new Map<string, NominatimResult[]>();

// ─── Component ────────────────────────────────────────────────────────────────

const SearchOverlay: React.FC = () => {
  const { closeSearch, setTargetLocation, setViewMode } = useAppStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSearch(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeSearch]);

  // Geocoding fetch — fires on debounced query change
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (!q || q.length < 2) {
      setResults([]);
      setFetchError(null);
      return;
    }

    let cancelled = false;

    // Check Cache first
    if (SEARCH_CACHE.has(q)) {
      setResults(SEARCH_CACHE.get(q)!);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', q);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '7');

    fetch(url.toString(), {
      headers: {
        'Accept-Language': 'en',
        // Required by Nominatim ToS (app identifier)
        'User-Agent': 'AuroraLens/1.0 (aurora-lens.app)',
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Geocode HTTP ${r.status}`);
        return r.json() as Promise<NominatimResult[]>;
      })
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          if (data.length > 0) {
            SEARCH_CACHE.set(q, data);
          }
          if (data.length === 0) setFetchError(null); // empty is valid — show empty state
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setFetchError('Satellite uplink error. Check your connection.');
          setResults([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

/**
 * Finalizes the location selection process.
 * Updates the global coordinate state and teleports the user to the Map HUD.
 * 
 * @param {NominatimResult} result - The geocoding result from OpenStreetMap
 * @returns {void}
 * 
 * NOTE: AI-generated section. Core logic verified against store schema.
 */
  const handleSelect = useCallback((result: NominatimResult) => {
    const location: TargetLocation = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: buildLocationName(result),
      zoom: 8.5,
    };
    // Step a: update global coordinates
    setTargetLocation(location);
    // Step b: switch to map view
    setViewMode('MAP_HUD');
    // Step c: close overlay
    closeSearch();
  }, [setTargetLocation, setViewMode, closeSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setFetchError(null);
    inputRef.current?.focus();
  }, []);

  // Icon for result type
  const getResultIcon = (result: NominatimResult): string => {
    const cls = result.class;
    if (cls === 'natural' || cls === 'peak') return 'landscape';
    if (cls === 'place' || cls === 'city') return 'location_city';
    if (cls === 'boundary' || cls === 'admin') return 'map';
    if (cls === 'amenity' || cls === 'tourism') return 'place';
    if (cls === 'waterway' || cls === 'water') return 'water';
    return 'location_on';
  };

  return (
    <AnimatePresence>
      {/* ── Backdrop ─────────────────────────────────────────────────────────── */}
      <motion.div
        key="search-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] bg-[#080B11]/80 backdrop-blur-md"
        onClick={closeSearch}
      />

      {/* ── Search Panel ─────────────────────────────────────────────────────── */}
      <motion.div
        key="search-panel"
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed inset-0 z-[201] flex items-start justify-center pt-24 px-4 pointer-events-none"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div
          className="w-full max-w-xl flex flex-col gap-2 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── INPUT BAR ──────────────────────────────────────────────────── */}
          <div
            className={`
              flex items-center gap-3 rounded-2xl px-6 py-4 transition-all duration-300
              bg-[#080B11]/90 border backdrop-blur-3xl shadow-[0_0_60px_rgba(0,229,255,0.08)]
              ${isFocused
                ? 'border-[#00e5ff]/40 ring-2 ring-[#00e5ff]/20 shadow-[0_0_30px_rgba(0,229,255,0.2)]'
                : 'border-white/10'
              }
            `}
          >
            {/* Scan icon / spinner */}
            {isLoading ? (
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-[#00e5ff]/30 border-t-[#00e5ff] animate-spin" />
            ) : (
              <span
                className="material-symbols-outlined text-[#00e5ff] flex-shrink-0 text-xl"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                search
              </span>
            )}

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Search any location..."
              className="flex-1 bg-transparent text-[#e0e2eb] placeholder:text-[#bac9cc]/40 outline-none text-base font-light"
            />

            {/* Scanning indicator when typing but not yet debounced */}
            {query && !isLoading && query !== debouncedQuery && (
              <span className="text-[9px] uppercase tracking-widest text-[#00e5ff]/50 animate-[pulse_0.8s_infinite] flex-shrink-0">
                Scanning…
              </span>
            )}

            {/* Clear */}
            {query && (
              <button
                onClick={handleClear}
                className="text-[#bac9cc] hover:text-white transition-colors flex-shrink-0"
              >
                <span
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  close
                </span>
              </button>
            )}

            <span className="text-[10px] uppercase tracking-widest text-[#bac9cc]/30 border border-white/10 px-2 py-1 rounded font-semibold flex-shrink-0">
              ESC
            </span>
          </div>

          {/* ── RESULTS / STATES ───────────────────────────────────────────── */}
          <AnimatePresence mode="wait">

            {/* Empty query — show prompt */}
            {!query && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="bg-[#080B11]/90 border border-white/10 rounded-2xl px-6 py-8 text-center backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              >
                <span
                  className="material-symbols-outlined text-4xl text-[#00e5ff]/20 block mb-3"
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
                >
                  satellite_alt
                </span>
                <p className="text-[#bac9cc]/60 text-sm font-light">
                  Enter any city, peak, lake, or coordinates
                </p>
                <p className="text-[#bac9cc]/30 text-xs mt-2 uppercase tracking-widest">
                  e.g. "Tromsø, Norway" or "64.9° N, 23.3° W"
                </p>
              </motion.div>
            )}

            {/* Error state */}
            {query && !isLoading && fetchError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="bg-[#080B11]/90 border border-red-500/20 rounded-2xl px-6 py-8 text-center backdrop-blur-3xl"
              >
                <span
                  className="material-symbols-outlined text-3xl text-red-400/60 block mb-3"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                >
                  signal_disconnected
                </span>
                <p className="text-red-400/80 text-sm">{fetchError}</p>
              </motion.div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#080B11]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              >
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/5 rounded-full animate-pulse w-2/3" />
                      <div className="h-2 bg-white/5 rounded-full animate-pulse w-1/3" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* No results */}
            {query && !isLoading && !fetchError && debouncedQuery === query && results.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="bg-[#080B11]/90 border border-white/10 rounded-2xl px-6 py-10 text-center backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              >
                <p className="text-[#bac9cc] text-sm font-light">
                  No results for <span className="text-[#c3f5ff]">"{query}"</span>
                </p>
                <p className="text-[#bac9cc]/30 text-xs mt-2 uppercase tracking-widest">
                  Try a country, region, or mountain name
                </p>
              </motion.div>
            )}

            {/* Results list */}
            {!isLoading && results.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className="bg-[#080B11]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              >
                <ul>
                  {results.map((result, idx) => {
                    const regionLabel = buildRegionLabel(result);
                    const icon = getResultIcon(result);
                    const name = buildLocationName(result);

                    return (
                      <motion.li
                        key={result.place_id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04, duration: 0.2 }}
                      >
                        <button
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all duration-200 group text-left border-b border-white/5 last:border-0"
                        >
                          {/* Type icon badge */}
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-[#00e5ff]/30 group-hover:bg-[#00e5ff]/5 transition-all">
                            <span
                              className="material-symbols-outlined text-[#bac9cc] group-hover:text-[#00e5ff] transition-colors text-lg"
                              style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                            >
                              {icon}
                            </span>
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm group-hover:text-[#c3f5ff] transition-colors truncate"
                               style={{ fontFamily: 'Manrope, sans-serif' }}>
                              {name}
                            </p>
                            <p className="text-[#bac9cc] text-[10px] uppercase tracking-widest truncate">
                              {regionLabel}
                            </p>
                          </div>

                          {/* Coordinate badge — reveals on hover */}
                          <div className="hidden sm:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <span className="text-[9px] text-[#00e5ff]/60 font-mono">
                              {parseFloat(result.lat).toFixed(3)}°
                            </span>
                            <span className="text-[9px] text-[#00e5ff]/40 font-mono">
                              {parseFloat(result.lon).toFixed(3)}°
                            </span>
                          </div>

                          {/* Arrow */}
                          <span
                            className="material-symbols-outlined text-[#bac9cc]/30 group-hover:text-[#c3f5ff] transition-colors text-base flex-shrink-0"
                            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                          >
                            arrow_forward
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>

                {/* Footer — power line */}
                <div className="px-6 py-3 border-t border-white/5 flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-[#bac9cc]/30 text-sm"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    satellite_alt
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#bac9cc]/30">
                    Powered by global telemetry grid · {results.length} targets acquired
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchOverlay;
