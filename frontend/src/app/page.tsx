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
            {/* ── The Auroral Oval (Pulsing Center Glow) ── */}
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '35vmax',
                height: '35vmax',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,220,130,1) 0%, rgba(0,220,130,0) 65%)',
                animation: 'auroraOvalPulse 4s ease-in-out infinite alternate',
                mixBlendMode: 'screen',
              }}
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
      <div className="relative z-20 w-full flex flex-col">
        
        {/* ── Hero Centerpiece ── */}
        <main className={`flex flex-col items-center gap-10 px-8 pointer-events-none transition-all duration-700 ease-in-out ${viewMode === 'GLOBAL' ? 'justify-center min-h-[90vh] py-20' : 'justify-start min-h-0 pt-8 pb-0'}`}>
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
                <p className="font-mono text-[0.65rem] tracking-[0.45em] text-white/20 uppercase">
                  Geomagnetic Intelligence Platform · Command Interface
                </p>
                <h1 className="font-orbitron font-black text-5xl md:text-[4.8rem] tracking-tight text-white leading-[1.05]"
                    style={{ textShadow: '0 0 60px rgba(0,220,130,0.2)' }}>
                  WHERE IS THE AURORA<br />
                  <span className="text-aurora-primary">TONIGHT?</span>
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
                {/* ── Mission Capability Typography Block ── */}
                <div className="max-w-2xl mx-auto mt-4 mb-4 text-center px-6">
                  <p className="text-slate-400 text-sm md:text-base leading-relaxed font-sans">
                    <span className="text-aurora-primary font-mono text-xs font-bold tracking-widest mr-2">[ MISSION CAPABILITY ]</span>
                    Most forecasts rely on generic planetary averages. We intercept raw solar wind telemetry from the 
                    <span className="text-white font-mono text-xs mx-1">L1 Lagrange point</span>
                    and feed it through a neural network trained on a
                    <span className="text-white font-mono text-xs mx-1">60-year geomagnetic baseline</span>.
                    The result is hyper-localized auroral probability, atmospheric clearance analysis, and tactical photography parameters for your exact coordinates.
                  </p>
                </div>

                {/* ── L1 Orbital Vector Mini-Map ── */}
                <div className="flex flex-col items-center gap-2 opacity-70 mt-2">
                  <span className="font-mono text-[10px] text-white/40 tracking-[0.25em] uppercase">
                    SUN · L1 · EARTH ORBITAL VECTOR
                  </span>
                  <svg width="260" height="26" viewBox="0 0 260 26" className="overflow-visible">
                    {/* Sun */}
                    <circle cx="8" cy="13" r="5" fill="#F59E0B" filter="url(#hero-solar-glow)" />
                    <circle cx="8" cy="13" r="8" fill="none" stroke="#F59E0B" strokeWidth="0.5" strokeOpacity="0.4" />
                    {/* Trajectory */}
                    <line x1="24" y1="13" x2="232" y2="13" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />
                    {/* L1 Point at ~80% */}
                    <g transform="translate(195, 13)">
                      <rect x="-3" y="-3" width="6" height="6" fill="none" stroke="#00DC82" strokeWidth="1" transform="rotate(45)" opacity="0.9" />
                      <text x="0" y="-8" textAnchor="middle" fill="#00DC82" fontSize="8" fontFamily="JetBrains Mono, monospace" letterSpacing="0.1em">L1</text>
                    </g>
                    {/* Earth */}
                    <circle cx="248" cy="13" r="3.5" fill="#38BDF8" opacity="0.9" />
                    <defs>
                      <filter id="hero-solar-glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                      </filter>
                    </defs>
                  </svg>
                </div>

                {/* Neural Net Status */}
                <div className="flex flex-col items-center gap-1 opacity-60">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-aurora-primary animate-pulse shadow-[0_0_8px_#00DC82]" />
                    <p className="font-mono text-[10px] tracking-widest text-white/45 uppercase">
                      NEURAL NET FORECAST: <span className="text-aurora-primary">ACTIVE</span>
                    </p>
                  </div>
                  <p className="font-mono text-[8px] tracking-widest text-white/20 uppercase">
                    CONFIDENCE: {data?.confidence ?? '88.4%'}
                  </p>
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
              <section className="px-16 pb-24 space-y-16">
                <div className="flex flex-col items-center gap-6 mb-12">
                  <div className="w-px h-16 bg-linear-to-b from-transparent to-aurora-primary/40" />
                  <h2 className="font-orbitron text-2xl tracking-[0.2em] text-white text-center">
                    L1 TELEMETRY DOWNLINK
                  </h2>
                </div>

                {loading ? (
                  <div className="text-center font-mono text-[10px] text-aurora-primary tracking-[0.2em] opacity-60">
                    SYNCHRONIZING WITH DEEP SPACE GATEWAY...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pointer-events-auto max-w-[1400px] mx-auto animate-[fadeIn_800ms_ease_forwards]">
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


