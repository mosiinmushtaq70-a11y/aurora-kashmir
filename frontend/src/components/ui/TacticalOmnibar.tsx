'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, Search, X, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
  boundingbox?: string[];
}

// ─── Animated Dot Cursor ──────────────────────────────────────────────────────
export function AuroraCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const anim = useRef<number>(0);

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', move);

    const loop = () => {
      if (ref.current) {
        ref.current.style.transform = `translate(${pos.current.x - 8}px, ${pos.current.y - 8}px)`;
      }
      anim.current = requestAnimationFrame(loop);
    };
    anim.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(anim.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-999"
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: 'rgba(0,220,130,0.15)',
        border: '1.5px solid rgba(0,220,130,0.6)',
        boxShadow: '0 0 10px rgba(0,220,130,0.4)',
        willChange: 'transform',
      }}
    />
  );
}

// ─── Typing Placeholder ───────────────────────────────────────────────────────
const BOOT_SEQUENCE = [
  '> INITIALIZING NEURAL ENGINE...',
  '> INGESTING NOAA ARCHIVE [1964-PRESENT]...',
  '> WEIGHTS LOADED. SYSTEM READY.',
  '> Search city or coordinates...'
];

function useTypingPlaceholder(isFocused: boolean) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'erasing' | 'done'>('typing');
  const charIdx = useRef(0);

  useEffect(() => {
    // If the user clicks into the input field, abort the boot sequence 
    // and fast-forward to the final resting state so it reappears correctly on blur.
    if (isFocused) {
      setIdx(BOOT_SEQUENCE.length - 1);
      setDisplayed(BOOT_SEQUENCE[BOOT_SEQUENCE.length - 1]);
      setPhase('done');
      return;
    }

    if (phase === 'done' || idx >= BOOT_SEQUENCE.length) return;

    const target = BOOT_SEQUENCE[idx];

    if (phase === 'typing') {
      if (charIdx.current < target.length) {
        const t = setTimeout(() => {
          setDisplayed(target.slice(0, charIdx.current + 1));
          charIdx.current++;
        }, 30); // Fast cinematic typing
        return () => clearTimeout(t);
      } else {
        // Critical Stop Condition: If it's the last string, halt permanently
        if (idx === BOOT_SEQUENCE.length - 1) {
          setPhase('done');
        } else {
          // Pause 800ms between boot lines
          const t = setTimeout(() => setPhase('pausing'), 800);
          return () => clearTimeout(t);
        }
      }
    }

    if (phase === 'pausing') {
      setPhase('erasing');
      return;
    }

    if (phase === 'erasing') {
      // Clear instantly for that CLI feel, rather than backspacing
      setDisplayed('');
      charIdx.current = 0;
      setIdx(i => i + 1);
      setPhase('typing');
    }
  }, [phase, displayed, idx, isFocused]);

  return displayed;
}

export default function TacticalOmnibar() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Pass 'focused' to the hook so it can abort the boot sequence when interrupted
  const placeholderText = useTypingPlaceholder(focused);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { zoomToLocation, viewMode, returnToGlobal } = useAppStore();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: Suggestion[] = await resp.json();
      setSuggestions(data.slice(0, 5));
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(value), 350);
  };

  const handleSelect = (suggestion: Suggestion) => {
    const name = suggestion.display_name.split(',')[0];
    setQuery(name);
    setSuggestions([]);
    setFocused(false);

    const bbox = suggestion.boundingbox;
    let zoom = 12;
    
    if (bbox) {
      const latDiff = Math.abs(parseFloat(bbox[1]) - parseFloat(bbox[0]));
      const lonDiff = Math.abs(parseFloat(bbox[3]) - parseFloat(bbox[2]));
      const diff = Math.max(latDiff, lonDiff);
      
      if (diff > 5) zoom = 4;
      else if (diff > 1) zoom = 7;
      else if (diff > 0.1) zoom = 10;
      else zoom = 13;
    }

    zoomToLocation({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      name,
      zoom
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery('');
    setSuggestions([]);
    if (viewMode === 'LOCAL') returnToGlobal();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto h-16 md:h-20 pointer-events-auto">
      {/* Outer glow bloom */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: 9999,
          background: 'transparent',
          boxShadow: focused || (suggestions.length > 0 && query)
            ? '0 0 60px rgba(34,211,238,0.15), 0 0 120px rgba(34,211,238,0.08)'
            : '0 0 0 transparent',
          transition: 'box-shadow 400ms ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Input wrapper */}
      <div
        className="relative flex items-center gap-4 px-8 h-full rounded-full bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-2xl transition-all duration-300 z-10"
        style={{
          border: focused ? '1px solid rgba(34,211,238,0.4)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: focused
            ? '0 0 30px rgba(34,211,238,0.1), inset 0 1px 0 rgba(255,255,255,0.02)'
            : 'none',
        }}
      >
        {/* State Icon / Search Icon */}
        <div style={{ width: 20, height: 20, flexShrink: 0 }}>
          {isSearching ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Zap style={{ width: 22, height: 22, color: '#22d3ee' }} />
            </motion.div>
          ) : viewMode === 'LOCAL' ? (
            <Globe onClick={handleClear} style={{ width: 22, height: 22, color: '#22d3ee', cursor: 'pointer' }} />
          ) : (
            <Search style={{ width: 22, height: 22, color: focused ? '#22d3ee' : 'rgba(255,255,255,0.3)' }} />
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={focused ? "Search city or coordinates..." : placeholderText}
          style={{
            flex: 1,
            background: 'transparent',
            outline: 'none',
            border: 'none',
            fontFamily: (!focused && !query) ? 'inherit' : 'inherit',
            fontSize: '1.125rem', // text-lg
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.015em',
            caretColor: '#22d3ee',
          }}
          className={`placeholder:text-white/20 placeholder:transition-all ${(!focused && !query) ? 'uppercase tracking-[0.2em] text-[10px] font-semibold' : 'text-lg'}`}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Action / Shortcut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {query && (
            <button onClick={handleClear} className="text-white/30 hover:text-white/60 transition-colors">
              <X size={16} />
            </button>
          )}
          <div className="h-4 w-px bg-white/10 mx-1" />
          <kbd style={{
            fontFamily: 'inherit',
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            padding: '4px 8px',
          }}>⌘K</kbd>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && focused && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 4,
              right: 4,
              background: 'rgba(6,9,18,0.95)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              zIndex: 100,
            }}
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSelect(s)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  borderBottom: i === suggestions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                  transition: 'background 200ms ease',
                }}
                className="hover:bg-aurora-primary/5 group"
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <MapPin size={14} className="text-white/20 group-hover:text-aurora-primary transition-colors" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'inherit', fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.display_name.split(',')[0]}
                  </p>
                  <p style={{ fontFamily: 'inherit', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.display_name.split(',').slice(1, 4).join(',')}
                  </p>
                </div>
                <Zap size={12} className="text-aurora-primary/30 group-hover:text-aurora-primary opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Underglow bar */}
      {focused && (
        <motion.div
          layoutId="omni-glow"
          style={{
            position: 'absolute',
            bottom: -4,
            left: '15%',
            right: '15%',
            height: 2,
            background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
            borderRadius: 1,
            zIndex: 5,
          }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}
