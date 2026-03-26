'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationMap from '@/components/LocationMap';

import MissionHeader from '@/components/ui/MissionHeader';
import TacticalOmnibar from '@/components/ui/TacticalOmnibar';
import GeomagneticHeatmap from '@/components/ui/GeomagneticHeatmap';
import CommandTerminal from '@/components/ui/CommandTerminal';
import { useAppStore } from '@/store/useAppStore';
import { MapPin, ChevronRight } from 'lucide-react';

// ── Phase 4: Modal Layer Imports ──────────────────────────────────────────────
import AIAssistantOverlay_Clean    from '@/components/ui/AIAssistantOverlay_Clean';
import DossierView_Tromso_Polished from '@/components/ui/DossierView_Tromso_Polished';
import DossierView_Fairbanks_Refined from '@/components/ui/DossierView_Fairbanks_Refined';
import DossierView_Kirkjufell      from '@/components/ui/DossierView_Kirkjufell';
import TargetAlertModal            from '@/components/ui/TargetAlertModal';
import SearchOverlay               from '@/components/ui/SearchOverlay';
import ToastNotifier               from '@/components/ui/ToastNotifier';

// ── Phase 5: Live Telemetry ───────────────────────────────────────────────
import { LiveTelemetryProvider }   from '@/hooks/useLiveTelemetry';

// Modular Dashboard Components
import KpCard from '@/components/dashboard/KpCard';
import SolarWindCard from '@/components/dashboard/SolarWindCard';
import MagneticFieldCard from '@/components/dashboard/MagneticFieldCard';
import KashmirVisionCard from '@/components/dashboard/KashmirVisionCard';

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Hotspot Data ───────────────────────────────────────────────────────────────────

const HOTSPOTS = [
  { 
    id: 'kirkjufell', name: 'Kirkjufell', region: 'Iceland', lat: 64.9228, lng: -23.3071, image: '/images/kirkjufell.jpg',
    lore: [
      "The Arrowhead: A 463m stratovolcano shaped by millions of years of glacial erosion. Its isolation on a northern peninsula provides perfectly unobstructed, dark skies.",
      "Cinematic Legend: Woven deep into Icelandic folklore and featured heavily in global pop culture, it remains the most iconic and photographed peak in the country."
    ]
  },
  { 
    id: 'tromso', name: 'Tromsø', region: 'Norway', lat: 69.6492, lng: 18.9553, image: '/images/tromso.jpg',
    lore: [
      "The Auroral Oval: Positioned exactly 350km north of the Arctic Circle, the city sits directly beneath the peak geomagnetic band for maximum auroral intensity.",
      "Gateway to the Arctic: Since the 19th century, this port has served as the final outpost for legendary polar explorers launching treacherous expeditions into the deep ice."
    ]
  },
  { 
    id: 'abisko', name: 'Abisko', region: 'Sweden', lat: 68.3495, lng: 18.8152, image: '/images/abisko.jpg',
    lore: [
      "The Blue Hole: The surrounding Abisko Alps create a world-famous microclimate that blocks incoming moisture, resulting in a permanent patch of clear sky even during severe storms.",
      "Sámi Heritage: For thousands of years, the indigenous Sámi people have lived under these lights, historically interpreting the auroras as the physical energies of their ancestors."
    ]
  },
  { 
    id: 'fairbanks', name: 'Fairbanks', region: 'Alaska', lat: 64.8378, lng: -147.7164, image: '/images/fairbanks.jpg',
    lore: [
      "Continental Freeze: Located deep in the Alaskan interior, the brutal -30°C winter nights strip all moisture from the air, providing the driest, clearest atmospheres on Earth.",
      "The Gold Rush: Founded by prospectors in 1901, early miners relied on the immense, haunting light of the aurora borealis to navigate the frozen taiga in the dead of night."
    ]
  },
  { 
    id: 'yellowknife', name: 'Yellowknife', region: 'Canada', lat: 62.4540, lng: -114.3718, image: '/images/yellowknife.jpg',
    lore: [
      "The Flat Earth: Situated directly on the Canadian Shield, Yellowknife features zero light pollution and completely flat horizons, allowing the aurora to fill 100% of the visible sky.",
      "Diamond Capital: Built on some of the oldest exposed rock on the planet (2.8 billion years old), this isolated mining city is the ultimate deep-freeze observatory."
    ]
  }
];

function HotspotCarousel() {
  const { zoomToLocation, setScenicMode, setScenicName, setScenicRegion, setScenicLore } = useAppStore();

  const handleHotspotClick = (spot: typeof HOTSPOTS[number]) => {
    setScenicName(spot.name);
    setScenicRegion(spot.region);
    setScenicLore(spot.lore ?? []);
    setScenicMode(true);
    zoomToLocation({ lat: spot.lat, lng: spot.lng, name: `${spot.name}, ${spot.region}`, zoom: 11 });
  };

  return (
    <div className="w-full max-w-4xl mx-auto pointer-events-auto">
      {/* Section Label */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="flex-1 h-px bg-linear-to-r from-transparent via-slate-500/20 to-transparent" />
        <span className="text-xs font-semibold tracking-[0.2em] text-cyan-400/80 uppercase flex items-center gap-1.5">
          <MapPin size={10} className="text-cyan-400" />
          Quick Travel — Featured Hotspots
        </span>
        <div className="flex-1 h-px bg-linear-to-r from-transparent via-slate-500/20 to-transparent" />
      </div>

      {/* Scroll Row */}
      <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        <div className="flex gap-3 min-w-max px-1">
          {HOTSPOTS.map((spot, i) => (
            <motion.button
              key={spot.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => handleHotspotClick(spot)}
              className="group relative w-44 h-28 rounded-4xl overflow-hidden bg-slate-900/20 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-2 hover:bg-slate-900/30 shrink-0 focus:outline-none"
            >
              {/* Background Image */}
              <img
                src={spot.image}
                alt={spot.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Dark overlay - Premium Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent transition-all duration-500 group-hover:via-slate-900/40" />
              {/* Hover glow ring */}
              <div className="absolute inset-0 rounded-4xl ring-1 ring-inset ring-transparent group-hover:ring-white/20 transition-all duration-500" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-slate-100 font-semibold text-sm leading-tight">{spot.name}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-cyan-400/80 text-[10px] font-semibold uppercase tracking-widest">{spot.region}</p>
                  <ChevronRight size={12} className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Scenic mode badge on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 rounded-full px-1.5 py-0.5 text-[8px] font-semibold tracking-widest uppercase backdrop-blur-sm">
                  Scenic
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}


interface ForecastData {
  aurora_score: number;
  confidence: string;
  message: string;
  telemetry: {
    bz_nt: number;
    bt_nt: number;
    speed_km_s: number;
    density_p_cm3: number;
  };
  geomagnetic_storm: boolean;
  cloud_cover: number;
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [kp, setKp] = useState<number>(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const {
    viewMode,
    isAICopilotOpen,
    isDossierOpen,
    activeDossier,
    isTargetAlertOpen,
    isSearchOpen,
    liveData,
  } = useAppStore();

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    const CACHE_KEY_FORECAST = 'auroralens_forecast_cache';
    const CACHE_KEY_HISTORY = 'auroralens_history_cache';
    const CACHE_EXPIRY = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

    const fetchWithCache = async (url: string, cacheKey: string) => {
      const now = Date.now();
      const cachedStr = localStorage.getItem(cacheKey);
      let cachedData = null;
      let cacheTime = 0;

      if (cachedStr) {
        try {
          const parsed = JSON.parse(cachedStr);
          cachedData = parsed.data;
          cacheTime = parsed.timestamp;
        } catch (e) {
          // Handle corrupted cache
          localStorage.removeItem(cacheKey);
        }
      }

      // Return active cache if less than 12 hours old
      if (cachedData && (now - cacheTime < CACHE_EXPIRY)) {
        return cachedData;
      }

      // Cache expired or missing -> Fetch LIVE data
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const json = await res.json();
        
        // Save fresh data to local cache
        localStorage.setItem(cacheKey, JSON.stringify({
          data: json,
          timestamp: now
        }));
        
        return json;
      } catch (err) {
        // Fallback Network Error Logic: Serve expired cache to prevent crash
        if (cachedData) {
          console.warn(`[Network] ${url} fetch failed. Falling back to stale cache to prevent crash.`);
          return cachedData;
        }
        throw err;
      }
    };

    setLoading(true);

    Promise.all([
      fetchWithCache(`${API_BASE_URL}/api/weather/forecast/global`, CACHE_KEY_FORECAST),
      fetchWithCache(`${API_BASE_URL}/api/weather/telemetry/history`, CACHE_KEY_HISTORY)
    ])
    .then(([forecastJson, historyJson]) => {
      setData(forecastJson);
      if (historyJson.data && historyJson.data.length > 0) {
        setHistory(historyJson.data);
        setKp(historyJson.data[historyJson.data.length - 1].kp);
      }
      setLoading(false);
    })
    .catch((err) => {
      console.error('Data Fetch Error:', err);
      setError('Telemetry stream unreachable. Awaiting sync...');
      setLoading(false);
    });

  }, []);

  return (
    <div className="min-h-screen w-full overflow-y-auto overflow-x-hidden p-0 m-0 text-text-primary bg-bg-void">
      
      
      {/* ─── Layer 0: The Optical Satellite Background ─── */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {viewMode === 'GLOBAL' ? (
          <>
            {/* ── Responsive Earth Sizing & Masking ── */}
            <style>{`
              .earth-img {
                width: 180vw;
                height: 180vw;
                object-fit: cover;
                flex-shrink: 0;
                -webkit-mask-image: radial-gradient(circle at center, black 15%, transparent 50%);
                mask-image: radial-gradient(circle at center, black 15%, transparent 50%);
                filter: hue-rotate(180deg) brightness(0.975);
                transform-origin: center center;
                animation: earthSpin 140s linear infinite;
                will-change: transform;
              }
              @media (min-width: 640px) {
                .earth-img {
                  width: 120vmax;
                  height: 120vmax;
                  -webkit-mask-image: radial-gradient(circle at center, black 20%, transparent 70%);
                  mask-image: radial-gradient(circle at center, black 20%, transparent 70%);
                  filter: hue-rotate(180deg) brightness(0.75);
                }
              }
            `}</style>

            {/* ── The Physical Earth Imagery ── */}
            <img
              src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2000&auto=format&fit=crop"
              alt="Top-down satellite feed"
              className="grayscale contrast-125 opacity-30 mix-blend-screen earth-img"
            />

          </>
        ) : (
          <div className="w-[120vmax] h-[120vmax] flex items-center justify-center pointer-events-auto">
            <LocationMap />
          </div>
        )}
      </div>



      {/* ─── Layer 2: Deep space vignette ─── */}
      <AnimatePresence>
        {viewMode === 'GLOBAL' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 pointer-events-none z-10"
            style={{
              background: 'radial-gradient(ellipse 65% 65% at 50% 52%, transparent 20%, rgba(2,4,9,0.88) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ─── Layer 3: Modular Header (hidden in LOCAL/map mode) ─── */}
      <AnimatePresence>
        {viewMode === 'GLOBAL' && (
          <motion.div
            key="mission-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <MissionHeader 
              solarWind={`${(data?.telemetry.speed_km_s ?? 0).toFixed(0)} km/s`}
              kpIndex={kp.toFixed(1)}
              imfBz={`${(data?.telemetry.bz_nt ?? 0).toFixed(1)} nT`}
              auroraKV={data?.aurora_score ? `>${data.aurora_score}%` : '85%'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Dashboard Assembly ─── */}
      <div className="relative z-20 w-full flex flex-col pointer-events-none">
        
        {/* ── Hero Centerpiece ── */}
        <main className={`flex flex-col items-center gap-16 px-8 pointer-events-none transition-all duration-700 ease-in-out ${viewMode === 'GLOBAL' ? 'justify-center min-h-[90vh] py-24 md:py-32' : 'justify-start min-h-0 pt-28 pb-0'}`}>
          <AnimatePresence mode="wait">
            {viewMode === 'GLOBAL' && (
              <motion.div 
                key="hero-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="text-center space-y-8"
              >
                <p className="text-xs md:text-sm text-cyan-400/80 tracking-widest font-semibold uppercase mb-2">
                  ML-DRIVEN NORTHERN LIGHTS FORECASTING
                </p>
                <h1 className="text-5xl md:text-7xl font-semibold tracking-tight font-sans text-transparent bg-clip-text bg-linear-to-b from-white to-slate-400 leading-[1.05]"
                    style={{ textShadow: '0 0 60px rgba(34,211,238,0.2)' }}>
                  TRACK THE AURORA<br />
                  <span className="text-cyan-400">ANYWHERE</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {viewMode === 'GLOBAL' && (
              <motion.div
                key="hero-search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                <TacticalOmnibar />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {viewMode === 'GLOBAL' && (
              <motion.div 
                key="hero-bottom"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="flex flex-col items-center gap-4 w-full"
              >
                {/* ── Plain-English Feature Row ── */}
                <div className="mt-8 flex flex-col items-center">
                  <p className="text-slate-300 md:text-lg font-light leading-relaxed text-center max-w-2xl mb-8">
                    Plan the ultimate aurora hunting adventure. We analyze decades of solar data and real-time weather conditions to pinpoint exactly when and where the Northern Lights will appear, complete with expert camera settings for your location.
                  </p>
                  
                  {/* Feature Badges */}
                  <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base text-slate-300 font-light">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">✦</span> Precision ML Forecast
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">✦</span> Atmospheric Visibility
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">✦</span> AI Photography Chatbot
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">✦</span> Automated Email Alerts
                    </div>
                  </div>
                </div>

                {/* ── Hotspot Carousel ── */}
                <HotspotCarousel />

                {/* ── CSS Animated Orrery ── */}
                <div className="-mt-4 flex flex-col items-center gap-6 mb-4 relative z-10">
                  <div className="relative w-40 h-40 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                    {/* The Sun (Center) */}
                    <div className="absolute w-6 h-6 bg-amber-500 rounded-full drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                    
                    {/* Earth & Its Orbit */}
                    <div className="absolute w-32 h-32 border border-slate-700/50 rounded-full animate-[spin_15s_linear_infinite] flex items-center justify-center">
                      <div className="absolute -top-2 w-4 h-4 bg-cyan-400 rounded-full drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                        {/* The Moon & Its Orbit (Nested inside Earth) */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-slate-600/30 rounded-full animate-[spin_3s_linear_infinite]">
                          <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 bg-slate-200 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm shadow-lg">
                    <div className="bg-amber-500 rounded-full w-2 h-2 animate-pulse shadow-[0_0_8px_#F59E0B]" />
                    <span className="text-[10px] tracking-[0.2em] text-slate-300 uppercase font-semibold">
                      HELIOPHYSIC TELEMETRY ACTIVE
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── Dashboard Lower Sections ── */}
        <AnimatePresence mode="wait">
          {viewMode === 'GLOBAL' && (
            <motion.div
              key="dashboard-lower"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              {/* ── Telemetry Bento Grid ── */}
              <section className="px-4 md:px-16 pb-24 space-y-16 pointer-events-auto">
                <div className="flex flex-col items-center gap-6 mb-12">
                  <div className="w-px h-16 bg-linear-to-b from-transparent to-cyan-400/40" />
                  <h2 className="font-semibold text-xl md:text-2xl tracking-tight text-slate-100 text-center">
                    L1 TELEMETRY DOWNLINK
                  </h2>
                </div>

                {loading ? (
                  <div className="text-center text-[10px] text-cyan-400 tracking-[0.2em] font-semibold opacity-60 uppercase">
                    SYNCHRONIZING WITH DEEP SPACE GATEWAY...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 pointer-events-auto max-w-[1400px] mx-auto animate-[fadeIn_800ms_ease_forwards]">
                    <KpCard kp={kp} history={history} />
                    <SolarWindCard 
                      speed={data?.telemetry.speed_km_s ?? 0} 
                      density={data?.telemetry.density_p_cm3 ?? 0} 
                      history={history}
                    />
                    <MagneticFieldCard 
                      bz={data?.telemetry.bz_nt ?? 0} 
                      history={history}
                    />
                    <KashmirVisionCard score={data?.aurora_score ?? 0} />
                  </div>
                )}
              </section>

              {/* ── Modular Dashboard Sections ── */}
              <GeomagneticHeatmap />
              <CommandTerminal />

              {/* ── Footer ── */}
              <footer className="py-12 border-t border-white/5 text-center">
                 <p className="text-slate-400 text-[10px] font-semibold tracking-[0.4em] uppercase">
                    AURORALENS · GLOBAL INTELLIGENCE NETWORK · {new Date().getFullYear()}
                 </p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 4 — GLOBAL MODAL PORTAL
          All overlays are mounted here, at the root level, so they
          render above every layout layer (z-index: 100+).
          Zero Destruction: the existing layout above is untouched.
      ═══════════════════════════════════════════════════════════════════ */}

      {/* ── Phase 5: Live Telemetry Data Bridge ────────────────────────────
           No UI. Polls /api/weather/forecast/global, writes into store.liveData.
           LocationHUD, Dossiers, and AI Copilot all read from that slice.  */}
      <LiveTelemetryProvider />

      {/* ── 1. AI Co-Pilot Chat (z-100) ────────────────────────────────── */}
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

      {/* ── 2. Destination Dossier Router (z-100) ──────────────────────── */}
      {/* Renders the correct Dossier component based on activeDossier.id   */}
      <AnimatePresence>
        {isDossierOpen && activeDossier && (
          <motion.div
            key={`dossier-${activeDossier.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: 20  }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] overflow-y-auto"
          >
            {activeDossier.id === 'tromso'     && <DossierView_Tromso_Polished />}
            {activeDossier.id === 'fairbanks'  && <DossierView_Fairbanks_Refined />}
            {activeDossier.id === 'kirkjufell' && <DossierView_Kirkjufell />}
            {/* Unknown dossier IDs fall through gracefully — closeDossier() will dismiss it */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. Target Alert Modal (z-150) ──────────────────────────────── */}
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

      {/* ── 4. Search Overlay (z-200) ───────────────────────────────────── */}
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

      {/* ── 5. Toast Notifier (z-9999 — always on top) ─────────────────── */}
      <ToastNotifier />

    </div>
  );
}


