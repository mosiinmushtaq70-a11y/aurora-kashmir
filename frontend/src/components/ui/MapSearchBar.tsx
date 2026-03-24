'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Zap, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  boundingbox?: string[];
}

interface MapSearchBarProps {
  onClose: () => void;
}

export default function MapSearchBar({ onClose }: MapSearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { zoomToLocation } = useAppStore();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions([]); return; }
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
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
    setQuery(capitalized);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(capitalized), 350);
  };

  const handleSelect = (suggestion: Suggestion) => {
    const name = suggestion.display_name.split(',')[0];
    setSuggestions([]);

    const bbox = suggestion.boundingbox;
    let zoom = 12;
    if (bbox) {
      const diff = Math.max(
        Math.abs(parseFloat(bbox[1]) - parseFloat(bbox[0])),
        Math.abs(parseFloat(bbox[3]) - parseFloat(bbox[2]))
      );
      if (diff > 5) zoom = 4;
      else if (diff > 1) zoom = 7;
      else if (diff > 0.1) zoom = 10;
      else zoom = 13;
    }

    zoomToLocation({ lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon), name, zoom });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-72 md:w-80"
    >
      {/* Input */}
      <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-aurora-green/40 rounded-full pl-4 pr-2 py-2 shadow-[0_0_20px_rgba(0,220,130,0.15)]">
        <div className="text-slate-400 shrink-0">
          {isSearching ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Zap size={14} className="text-aurora-green" />
            </motion.div>
          ) : (
            <Search size={14} className="text-aurora-green" />
          )}
        </div>
        <input
          ref={inputRef}
          autoFocus
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search another location..."
          className="flex-1 bg-transparent text-white placeholder:text-slate-500 text-xs tracking-wide outline-none font-mono"
        />
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white p-1 transition-colors shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 4 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
          >
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-aurora-green/10 transition-colors group border-b border-white/5 last:border-0"
              >
                <MapPin size={13} className="text-aurora-green mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="text-white text-xs font-mono font-medium truncate group-hover:text-aurora-green transition-colors">
                    {s.display_name.split(',')[0]}
                  </p>
                  <p className="text-slate-500 text-[10px] truncate mt-0.5">
                    {s.display_name.split(',').slice(1, 3).join(',')}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
