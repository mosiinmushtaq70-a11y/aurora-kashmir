'use client';

import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import TexturedGlobe from '@/components/TexturedGlobe';
import LocationMap from '@/components/LocationMap';

import MissionHeader from '@/components/ui/MissionHeader';
import TacticalOmnibar from '@/components/ui/TacticalOmnibar';
import GeomagneticHeatmap from '@/components/ui/GeomagneticHeatmap';
import CommandTerminal from '@/components/ui/CommandTerminal';
import { useAppStore } from '@/store/useAppStore';

// Modular Dashboard Components
import KpCard from '@/components/dashboard/KpCard';
import SolarWindCard from '@/components/dashboard/SolarWindCard';
import MagneticFieldCard from '@/components/dashboard/MagneticFieldCard';
import KashmirVisionCard from '@/components/dashboard/KashmirVisionCard';

// ─── Types ───────────────────────────────────────────────────────────────────

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
  const { viewMode } = useAppStore();

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
        <main className={`flex flex-col items-center gap-10 px-8 pointer-events-none transition-all duration-700 ease-in-out ${viewMode === 'GLOBAL' ? 'justify-center min-h-[90vh] pt-32 pb-20' : 'justify-start min-h-0 pt-28 pb-0'}`}>
          <AnimatePresence mode="wait">
            {viewMode === 'GLOBAL' && (
              <motion.div 
                key="hero-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="text-center space-y-3"
              >
                <p className="text-xs md:text-sm text-slate-400 tracking-widest uppercase mb-2">
                  ML-DRIVEN NORTHERN LIGHTS FORECASTING
                </p>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-sans text-transparent bg-clip-text bg-linear-to-b from-white to-slate-400 leading-[1.05]"
                    style={{ textShadow: '0 0 60px rgba(0,220,130,0.2)' }}>
                  TRACK THE AURORA<br />
                  <span className="text-[#4af626]">ANYWHERE</span>
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
                  <p className="text-slate-300 md:text-lg font-light text-center max-w-2xl mb-8">
                    Plan the ultimate aurora hunting adventure. We analyze decades of solar data and real-time weather conditions to pinpoint exactly when and where the Northern Lights will appear, complete with expert camera settings for your location.
                  </p>
                  
                  {/* Feature Badges */}
                  <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-[#4af626]">✦</span> Precision ML Forecast
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#4af626]">✦</span> Atmospheric Visibility
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#4af626]">✦</span> AI Photography Chatbot
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#4af626]">✦</span> Automated Email Alerts
                    </div>
                  </div>
                </div>

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
                    <span className="font-mono text-[10px] tracking-[0.2em] text-slate-300 uppercase font-medium">
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
                  <div className="w-px h-16 bg-linear-to-b from-transparent to-aurora-primary/40" />
                  <h2 className="font-orbitron text-xl md:text-2xl tracking-[0.2em] text-white text-center">
                    L1 TELEMETRY DOWNLINK
                  </h2>
                </div>

                {loading ? (
                  <div className="text-center font-mono text-[10px] text-aurora-primary tracking-[0.2em] opacity-60">
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
              <footer className="py-12 border-t border-white/10 text-center">
                 <p className="text-slate-400 font-mono text-[10px] tracking-[0.4em] uppercase">
                    AURORALENS · GLOBAL INTELLIGENCE NETWORK · {new Date().getFullYear()}
                 </p>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}


