'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

/**
 * --- SearchOverlay ---
 * Phase 4: New component, built to match the Celestial Lens design language.
 * ─ Wired to useAppStore: isSearchOpen / closeSearch / zoomToLocation / openDossier
 * ─ Searches against our existing location list (HOTSPOTS + free-text geocode)
 * ─ Escape key closes, backdrop click closes
 */

const KNOWN_SPOTS = [
  { id: 'kirkjufell', name: 'Kirkjufell',   region: 'Iceland',  lat: 64.9228,  lng: -23.3071 },
  { id: 'tromso',     name: 'Tromsø',        region: 'Norway',   lat: 69.6492,  lng: 18.9553  },
  { id: 'abisko',     name: 'Abisko',        region: 'Sweden',   lat: 68.3495,  lng: 18.8152  },
  { id: 'fairbanks',  name: 'Fairbanks',     region: 'Alaska',   lat: 64.8378,  lng: -147.7164},
  { id: 'yellowknife',name: 'Yellowknife',   region: 'Canada',   lat: 62.4540,  lng: -114.3718},
];

const SearchOverlay: React.FC = () => {
  const { closeSearch, zoomToLocation, openDossier, pushToast, liveData } = useAppStore();

  const [query, setQuery]     = useState('');
  const [results, setResults] = useState(KNOWN_SPOTS);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Filter known spots — fuzzy match on name + region
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    const q = value.toLowerCase().trim();
    if (!q) { setResults(KNOWN_SPOTS); return; }
    setResults(
      KNOWN_SPOTS.filter(
        s => s.name.toLowerCase().includes(q) || s.region.toLowerCase().includes(q)
      )
    );
  }, []);

  // Navigate to spot — opens Dossier if available, else just zooms
  const handleSelectSpot = useCallback((spot: typeof KNOWN_SPOTS[number]) => {
    // Open the Dossier for known spots that have a dedicated view
    if (['kirkjufell', 'tromso', 'fairbanks'].includes(spot.id)) {
      openDossier({
        id:          spot.id,
        name:        spot.name,
        region:      spot.region,
        lat:         spot.lat,
        lng:         spot.lng,
        // Pass live telemetry if available — falls back to 0 on first load
        auroraScore: liveData?.auroraScore  ?? 0,
        cloudCover:  liveData?.cloudCover   ?? 0,
        temperature: liveData?.temperature  ?? null,
        lore:        [],
      });
    } else {
      zoomToLocation({ lat: spot.lat, lng: spot.lng, name: `${spot.name}, ${spot.region}`, zoom: 11 });
    }
    closeSearch();
  }, [openDossier, zoomToLocation, closeSearch, liveData]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-24 p-4 bg-[#080B11]/70 backdrop-blur-lg font-['Inter',_sans-serif]"
      onClick={closeSearch}
    >
      {/* Search panel — stop propagation */}
      <div
        className="w-full max-w-xl flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Input ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 bg-[#080B11]/90 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-3xl shadow-[0_0_60px_rgba(0,229,255,0.08)]">
          <span
            className="material-symbols-outlined text-[#00e5ff] flex-shrink-0"
            style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search aurora hotspots…"
            className="flex-1 bg-transparent text-[#e0e2eb] placeholder:text-[#bac9cc]/40 outline-none text-base font-light"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="text-[#bac9cc] hover:text-white transition-colors"
            >
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
              >
                close
              </span>
            </button>
          )}
          <span className="text-[10px] uppercase tracking-widest text-[#bac9cc]/40 border border-white/10 px-2 py-1 rounded font-semibold">
            ESC
          </span>
        </div>

        {/* ── Results ────────────────────────────────────── */}
        <div className="bg-[#080B11]/90 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          {results.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-[#bac9cc] text-sm font-light">No hotspots match "<span className="text-[#c3f5ff]">{query}</span>"</p>
              <p className="text-[#bac9cc]/40 text-xs mt-2 uppercase tracking-widest">Try a region name</p>
            </div>
          ) : (
            <ul>
              {results.map((spot, idx) => {
                const hasDossier = ['kirkjufell', 'tromso', 'fairbanks'].includes(spot.id);
                return (
                  <li key={spot.id}>
                    <button
                      onClick={() => handleSelectSpot(spot)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors group text-left border-b border-white/5 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-[#00e5ff]/30 transition-colors">
                        <span
                          className="material-symbols-outlined text-[#bac9cc] group-hover:text-[#00e5ff] transition-colors text-lg"
                          style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                        >
                          {hasDossier ? 'auto_awesome' : 'location_on'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold font-['Manrope',_sans-serif] text-sm group-hover:text-[#c3f5ff] transition-colors">
                          {spot.name}
                        </p>
                        <p className="text-[#bac9cc] text-[10px] uppercase tracking-widest">{spot.region}</p>
                      </div>
                      {hasDossier && (
                        <span className="text-[8px] uppercase tracking-widest text-[#00e5ff] border border-[#00e5ff]/30 rounded-full px-2 py-0.5 bg-[#00e5ff]/5 opacity-0 group-hover:opacity-100 transition-opacity">
                          Dossier
                        </span>
                      )}
                      <span
                        className="material-symbols-outlined text-[#bac9cc]/40 group-hover:text-[#c3f5ff] transition-colors text-base"
                        style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                      >
                        arrow_forward
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* ── Footer hint */}
          <div className="px-6 py-3 border-t border-white/5 flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[#bac9cc]/40 text-sm"
              style={{ fontFamily: 'Material Symbols Outlined', fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              bolt
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#bac9cc]/40">
              Hotspots with a Dossier include Site Intelligence, Visual Archives &amp; AI Briefings
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
