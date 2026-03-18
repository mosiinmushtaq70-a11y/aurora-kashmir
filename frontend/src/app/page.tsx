'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Bell } from 'lucide-react';
import TexturedGlobe from '@/components/TexturedGlobe';
import LocationMap from '@/components/LocationMap';
import LocationSearch from '@/components/LocationSearch';
import LightPillar from '@/components/LightPillar';
import { useAppStore } from '@/store/useAppStore';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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

// ─── HUD Components ────────────────────────────────────────────────────────────

const BentoBrackets = () => (
  <>
    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/20 pointer-events-none" />
    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/20 pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/20 pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/20 pointer-events-none" />
  </>
);

const SystemTerminal = () => {
  const [lines, setLines] = useState<string[]>([]);
  const logs = [
    "> [10:07:22] INGESTING L1 TELEMETRY... SUCCESS",
    "> [10:07:24] BZ SOUTHWARD SHIFT DETECTED (-3.1 NT)",
    "> [10:07:26] UPDATING NEURAL FORECAST MODEL... OK"
  ];
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setLines(prev => {
        if (prev.length >= logs.length) return prev;
        return [...prev, logs[index]];
      });
      index++;
      if (index >= logs.length) clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="bg-black border border-white/10 h-32 w-full max-w-md font-mono text-xs text-emerald-500/70 p-4 flex flex-col justify-end relative shadow-[0_0_15px_rgba(0,0,0,0.8)_inset]">
      <div className="space-y-1">
        {lines.map((l, i) => <div key={i}>{l}</div>)}
        <div><span className="animate-pulse inline-block w-2 bg-emerald-500/70 h-3" /></div>
      </div>
    </div>
  );
};

const MagneticSparkline = () => {
  const heights = [12, 24, 16, 28, 20, 12, 24, 16, 20];
  const liveHeights = [24, 32, 28];
  return (
    <div className="flex items-end gap-[2px] h-8 ml-3">
      {heights.map((h, i) => (
        <div key={i} className="w-1 bg-white/20" style={{ height: `${h}px` }} />
      ))}
      {liveHeights.map((h, i) => (
        <div key={`live-${i}`} className="w-1 bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]" style={{ height: `${h}px` }} />
      ))}
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [kp, setKp] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { viewMode } = useAppStore();

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/weather/forecast/global`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Forecast Fetch Error:', err);
        setError('Space Weather API unreachable. Please ensure the backend is running.');
        setLoading(false);
      });

    fetch(`${API_BASE_URL}/api/weather/telemetry/history`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.data && json.data.length > 0) {
          setKp(json.data[json.data.length - 1].kp);
        }
      })
      .catch((err) => console.error('History Fetch Error:', err));
  }, []);

  return (
    <div className="min-h-screen w-screen overflow-y-auto p-0 m-0 text-slate-200 relative bg-black/50 overflow-x-hidden">

      {/* ─── Fixed WebGL Aurora Background ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LightPillar
          topColor="#2db936"
          bottomColor="#4b13e7"
          intensity={1.3}
          rotationSpeed={0.4}
          glowAmount={0.002}
          pillarWidth={3}
          pillarHeight={0.4}
          noiseIntensity={0}
          pillarRotation={25}
          interactive={false}
          mixBlendMode="screen"
          quality="high"
        />
      </div>

      {/* ─── Hero Section ─── */}
      <section className="relative h-screen w-screen overflow-hidden p-0 m-0 flex flex-col items-center justify-between">

        {/* ─── 3D Globe (GLOBAL mode) ─── */}
        <AnimatePresence>
          {viewMode === 'GLOBAL' && (
            <motion.div
              key="globe-view"
              className="absolute inset-0 z-0"
              initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            >
              <Suspense fallback={null}>
                <TexturedGlobe kp={kp} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── MapLibre 3D Map (LOCAL mode) — overlays entire hero ─── */}
        <LocationMap />

        {/* ─── Hero Header Overlay (only in GLOBAL mode) ─── */}
        <AnimatePresence>
          {viewMode === 'GLOBAL' && (
            <motion.header
              key="hero-header"
              className="relative z-10 text-center pt-16 md:pt-24 pointer-events-none"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h1
                className="text-6xl md:text-8xl font-extrabold text-white mb-4 orbitron"
                style={{ textShadow: '0 0 50px rgba(0,220,130,0.6)' }}
              >
                AuroraLens
              </motion.h1>
              <motion.p className="text-white/60 text-xs md:text-sm tracking-widest font-mono uppercase mt-2">
                COSMIC WEATHER &amp; AURORA FORECAST
              </motion.p>
            </motion.header>
          )}
        </AnimatePresence>

        {/* ─── Search Bar (always visible) ─── */}
        <motion.div
          className="relative z-20 w-full px-6 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <LocationSearch />
          {viewMode === 'GLOBAL' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-slate-600 text-xs font-mono tracking-widest uppercase"
            >
              Search any location on Earth to zoom into local forecast
            </motion.p>
          )}
        </motion.div>

        {/* ─── Scroll Indicator (GLOBAL only) ─── */}
        <AnimatePresence>
          {viewMode === 'GLOBAL' && (
            <motion.div
              key="scroll-indicator"
              className="relative z-10 pb-12 text-slate-400 flex flex-col items-center gap-2 animate-bounce cursor-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.8 }}
            >
              <span className="text-xs tracking-[0.3em] font-light uppercase">Explore Telemetry</span>
              <div className="w-px h-12 bg-linear-to-b from-aurora-green to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─── Phase 1: Live Telemetry Ticker ─── */}
      <AnimatePresence>
        {viewMode === 'GLOBAL' && (
          <motion.div
            key="live-ticker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="relative z-20 w-full border-t border-b border-white/10 bg-black/40 backdrop-blur-md py-2.5 px-6 overflow-hidden"
          >
            <div className="flex items-center gap-6 justify-center flex-wrap">
              {/* Status */}
              <span className="font-mono text-[11px] uppercase tracking-widest text-aurora-green border border-aurora-green/30 px-2.5 py-0.5 rounded-sm">
                SYS: ONLINE
              </span>
              <span className="text-white/20 font-mono text-xs">|</span>
              {/* KP / BT */}
              <div className="flex items-center">
                <span className="font-mono text-[11px] uppercase tracking-widest text-white/70">
                  KP-INDEX:&nbsp;<span className="text-white font-bold">
                    {data?.telemetry ? data.telemetry.bt_nt?.toFixed(1) : '---'}
                  </span>
                </span>
                <MagneticSparkline />
              </div>
              <span className="text-white/20 font-mono text-xs">|</span>
              {/* SW SPEED */}
              <span className="font-mono text-[11px] uppercase tracking-widest text-white/70">
                WIND:&nbsp;<span className="text-white font-bold">
                  {data?.telemetry ? `${(data.telemetry.speed_km_s > 10000 ? data.telemetry.speed_km_s / 1000 : data.telemetry.speed_km_s).toFixed(1)} KM/S` : '--- KM/S'}
                </span>
              </span>
              <span className="text-white/20 font-mono text-xs">|</span>
              {/* BZ */}
              <span className="font-mono text-[11px] uppercase tracking-widest text-white/70">
                BZ:&nbsp;<span className={`font-bold ${
                  (data?.telemetry?.bz_nt ?? 0) < 0 ? 'text-red-400' : 'text-aurora-green'
                }`}>
                  {data?.telemetry ? `${data.telemetry.bz_nt?.toFixed(1)} nT` : '--- nT'}
                </span>
              </span>
              <span className="text-white/20 font-mono text-xs">|</span>
              {/* DENSITY */}
              <span className="font-mono text-[11px] uppercase tracking-widest text-white/70">
                DENSITY:&nbsp;<span className="text-white font-bold">
                  {data?.telemetry ? `${data.telemetry.density_p_cm3?.toFixed(1)} P/CC` : '--- P/CC'}
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Content Below Hero (only in GLOBAL mode) ─── */}
      <AnimatePresence>
        {viewMode === 'GLOBAL' && (
          <motion.div
            key="telemetry-content"
            className="relative z-10 px-4 md:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5 }}
          >
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="glass-panel h-48 w-full rounded-2xl bg-white/5" />
              </div>
            ) : error ? (
              <div className="glass-panel p-6 border-red-500/30 rounded-2xl bg-red-500/10 text-red-300 flex items-center justify-center gap-3">
                <p>Please ensure the Python <b>FastAPI</b> backend is running on port 8000.</p>
              </div>
            ) : data ? (
              <div className="max-w-7xl mx-auto space-y-12 pb-12">
                {/* ─── Phase 2: The Bento Box Data Grid ─── */}
                <div className="pt-8">
                  <h2 className="text-xs font-mono tracking-[0.3em] text-aurora-green uppercase mb-8 border-b border-white/10 pb-4">
                    [01] Core Capabilities
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Bento 1: AI Predictions */}
                    <div className="relative group backdrop-blur-md bg-black/80 border border-white/10 p-8 overflow-hidden hover:bg-white/5 transition-colors duration-500">
                      <BentoBrackets />
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-aurora-green/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="mb-6 p-3 inline-block border border-white/10 bg-white/5 text-white/70">
                        <Zap size={20} className="text-white/80" />
                      </div>
                      <h3 className="text-sm font-mono tracking-widest text-white uppercase mb-3">
                        AI Predictions
                      </h3>
                      <p className="text-white/40 text-[13px] font-light leading-relaxed">
                        Hardware-accelerated XGBoost models ingest NOAA DSCOVR satellite telemetry to probabilistically forecast aurora visibility globally up to 24 hours in absolute advance.
                      </p>
                    </div>

                    {/* Bento 2: Global Targeting */}
                    <div className="relative group backdrop-blur-md bg-black/80 border border-white/10 p-8 overflow-hidden hover:bg-white/5 transition-colors duration-500">
                      <BentoBrackets />
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="mb-6 p-3 inline-block border border-white/10 bg-white/5 text-white/70">
                        <Target size={20} className="text-white/80" />
                      </div>
                      <h3 className="text-sm font-mono tracking-widest text-white uppercase mb-3">
                        Global Targeting
                      </h3>
                      <p className="text-white/40 text-[13px] font-light leading-relaxed">
                        Interactive 3D WebGL projection allowing sub-meter resolution scanning of localized weather patterns, ambient cloud cover, and dark-sky topographic advantages.
                      </p>
                    </div>

                    {/* Bento 3: Sentry Alerts */}
                    <div className="relative group backdrop-blur-md bg-black/80 border border-white/10 p-8 overflow-hidden hover:bg-white/5 transition-colors duration-500">
                      <BentoBrackets />
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      <div className="mb-6 p-3 inline-block border border-white/10 bg-white/5 text-white/70">
                        <Bell size={20} className="text-white/80" />
                      </div>
                      <h3 className="text-sm font-mono tracking-widest text-white uppercase mb-3">
                        Sentry Alerts
                      </h3>
                      <p className="text-white/40 text-[13px] font-light leading-relaxed">
                        Asynchronous active-monitoring loops lock onto specific coordinate targets. Immediate autonomous dispatch triggers via email upon high-probability solar wind shockwave detection.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ─── Phase 3: Mission Command (About Section) ─── */}
                <div className="pt-16 pb-8">
                  <div className="flex flex-col md:flex-row gap-12 items-center border border-white/10 bg-black/80 backdrop-blur-md p-8 md:p-12 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-aurora-green/5 blur-[120px] pointer-events-none group-hover:bg-aurora-green/10 transition-colors duration-1000" />
                    
                    <div className="flex-1 space-y-6 z-10">
                      <h2 className="text-2xl font-mono tracking-widest text-white uppercase">
                        MISSION COMMAND ARCHITECTURE
                      </h2>
                      <div className="w-12 h-px bg-aurora-green/50" />
                      <p className="text-[14px] text-white/60 font-sans leading-relaxed">
                        AuroraLens operates by directly ingesting raw telemetry from the Deep Space Climate Observatory (DSCOVR) satellite, permanently stationed at the Earth-Sun Lagrange Point 1 (L1), approximately 1.5 million kilometers upstream in the solar wind.
                      </p>
                      <p className="text-[14px] text-white/60 font-sans leading-relaxed">
                        This early-warning position allows our custom-trained XGBoost machine learning model to analyze continuous shifts in solar wind speed, density, temperature, and the crucial Interplanetary Magnetic Field (IMF or Bz) vector, providing highly accurate localized aurora probability forecasts.
                      </p>
                    </div>
                    
                    <div className="flex-1 w-full flex flex-col items-center gap-8 justify-center z-10">
                      <SystemTerminal />
                      <div className="relative w-full max-w-sm aspect-square border border-white/5 bg-white/[0.02] flex items-center justify-center overflow-hidden">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,220,130,0.05)_0,transparent_70%)]" />
                         <div className="text-center font-mono opacity-50 z-10 flex flex-col items-center">
                           <p className="text-[9px] tracking-[0.4em] mb-8 text-aurora-green uppercase">[ L1 Telemetry Feed ]</p>
                           <div className="w-32 h-32 border border-aurora-green/20 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                             <div className="w-16 h-16 border-t border-r border-white/20 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── Phase 4: Global Aurora Gallery ─── */}
                <div className="pt-8 border-t border-white/10">
                  <div className="flex justify-between items-end mb-8">
                    <h2 className="text-xs font-mono tracking-[0.3em] text-white/50 uppercase">
                      [02] Global Observational Telemetry
                    </h2>
                    <span className="text-[10px] font-mono tracking-widest text-aurora-green uppercase hidden sm:block">
                      Live Field Captures
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                    {[
                      { id: 101, loc: "TROMSØ, NORWAY", coord: "69.6492° N, 18.95° E", img: "https://images.unsplash.com/photo-1531366936337-779c643e1150?q=80&w=800" },
                      { id: 102, loc: "FAIRBANKS, AK", coord: "64.8378° N, 147.7° W", img: "https://images.unsplash.com/photo-1579033461387-adaa06db995b?q=80&w=800" },
                      { id: 103, loc: "REYKJAVÍK, IS", coord: "64.1466° N, 21.94° W", img: "https://images.unsplash.com/photo-1520796338006-03f6f9662b66?q=80&w=800" },
                      { id: 104, loc: "YELLOWKNIFE, CA", coord: "62.4540° N, 114.3° W", img: "https://images.unsplash.com/photo-1533215206306-0ce0fcc68593?q=80&w=800" }
                    ].map((spot) => (
                      <div key={spot.id} className="relative aspect-[3/4] group overflow-hidden bg-black">
                        {/* Image Layer */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={spot.img} 
                          alt={spot.loc} 
                          className="w-full h-full object-cover opacity-50 select-none group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" 
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-700" />
                        
                        {/* Hover Overlay Tags */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
                          <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,1)]" />
                              <span className="text-[9px] font-mono tracking-[0.2em] text-emerald-400 uppercase">Verified Target</span>
                            </div>
                            <h3 className="text-xs font-mono tracking-widest text-white uppercase mb-1">
                              {spot.loc}
                            </h3>
                            <p className="text-[10px] font-mono text-white/50 tracking-widest">
                              {spot.coord}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Footer */}
            <div className="text-center text-slate-600 p-12 text-xs uppercase tracking-widest font-bold">
              Global Aurora Forecast — {new Date().getFullYear()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
