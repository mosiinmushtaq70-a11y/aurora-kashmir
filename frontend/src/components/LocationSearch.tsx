'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Zap, X, Globe } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

// ─── Internal StarBorder Component ──────────────────────────────────────────
const StarBorder = ({
  children,
  color = 'cyan',
  speed = '5s',
  className = '',
}: {
  children: React.ReactNode;
  color?: string;
  speed?: string;
  className?: string;
}) => {
  return (
    <div className={`star-border-container ${className}`}>
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          animationDuration: speed,
        }}
      />
      <div className="inner-content">{children}</div>
    </div>
  );
};

export default function LocationSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { zoomToLocation, viewMode, returnToGlobal } = useAppStore();

  // ─── Nominatim Geocoder ───────────────────────────────────────────────────
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
    // Capitalize first letter
    const capitalized = value.charAt(0).toUpperCase() + value.slice(1);
    setQuery(capitalized);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(capitalized), 350);
  };

  // ─── Select a Location → Trigger Global Store Transition ─────────────────
  const handleSelect = (suggestion: Suggestion) => {
    const name = suggestion.display_name.split(',')[0];
    setQuery(name);
    setSuggestions([]);
    setIsFocused(false);

    // Calculate dynamic zoom based on bounding box
    // bbox format is [minLat, maxLat, minLon, maxLon]
    const bbox = (suggestion as Suggestion & { boundingbox?: string[] }).boundingbox;
    let zoom = 12; // default
    
    if (bbox) {
      const latDiff = Math.abs(parseFloat(bbox[1]) - parseFloat(bbox[0]));
      const lonDiff = Math.abs(parseFloat(bbox[3]) - parseFloat(bbox[2]));
      const diff = Math.max(latDiff, lonDiff);
      
      if (diff > 5) zoom = 4;        // Large state/country
      else if (diff > 1) zoom = 7;   // Small state/region
      else if (diff > 0.1) zoom = 10; // City/Large area
      else zoom = 13;               // Street/Specific location
    }

    zoomToLocation({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      name,
      zoom
    });
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    if (viewMode === 'LOCAL') returnToGlobal();
  };

  return (
    <div className="relative z-50 w-full max-w-md mx-auto">
      {/* Search Input */}
      <StarBorder
        color="#22d3ee"
        speed="6s"
        className="w-full"
      >
        <div className="relative flex items-center bg-transparent backdrop-blur-md rounded-2xl transition-all">
          <div className="pl-4 pr-2 flex items-center text-slate-400">
            {isSearching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Zap size={16} className="text-cyan-400" />
              </motion.div>
            ) : (
              <Search size={16} />
            )}
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search any location on Earth..."
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm tracking-wide py-3 pr-2 outline-none font-medium"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="pr-4 text-slate-500 hover:text-white transition-colors"
              >
                {viewMode === 'LOCAL' ? (
                  <Globe size={16} className="text-cyan-400" />
                ) : (
                  <X size={16} />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </StarBorder>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 bg-[#080B11]/90 backdrop-blur-3xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-cyan-400/10 transition-colors group border-b border-white/5 last:border-0"
              >
                <MapPin size={14} className="text-cyan-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <p className="text-slate-100 text-sm font-semibold truncate group-hover:text-cyan-400 transition-colors">
                    {s.display_name.split(',')[0]}
                  </p>
                  <p className="text-slate-500 text-xs truncate mt-0.5">
                    {s.display_name.split(',').slice(1, 3).join(',')}
                  </p>
                </div>
                <Zap size={12} className="text-cyan-400/50 ml-auto shrink-0 mt-1 group-hover:text-cyan-400 transition-colors" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
