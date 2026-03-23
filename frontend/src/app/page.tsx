'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Bell, Wind } from 'lucide-react';
import TexturedGlobe from '@/components/TexturedGlobe';
import LocationMap from '@/components/LocationMap';
import LocationSearch from '@/components/LocationSearch';
import LightPillar from '@/components/LightPillar';
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

// ─── HUD Components ────────────────────────────────────────────────────────────

/** Animated mission terminal log — IBM Plex Mono output */
const SystemTerminal = () => {
  const [lines, setLines] = useState<string[]>([]);
  const logs = [
    "> [11:15:30] INGESTING L1 TELEMETRY... SUCCESS",
    "> [11:15:32] BZ SOUTHWARD SHIFT DETECTED (-4.2 NT)",
    "> [11:15:34] UPDATING NEURAL FORECAST MODEL... OK"
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
  }, []);
  return (
    <div className="bg-bg-void border border-white/10 h-32 w-full max-w-md font-mono text-xs text-aurora-primary/70 p-4 flex flex-col justify-end relative shadow-[0_0_15px_rgba(0,0,0,0.8)_inset] scan-line-active">
      <div className="space-y-1">
        {lines.map((l, i) => <div key={i} className="text-text-secondary font-mono text-[10px] tracking-wide">{l}</div>)}
        <div><span className="animate-pulse inline-block w-2 bg-aurora-primary/70 h-3" /></div>
      </div>
    </div>
  );
};

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
        setError('Space Weather API unreachable.');
        setLoading(false);
      });

    fetch(`${API_BASE_URL}/api/weather/telemetry/history`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (json.data && json.data.length > 0) {
          setHistory(json.data);
          setKp(json.data[json.data.length - 1].kp);
        }
      })
      .catch((err) => console.error('History Fetch Error:', err));
  }, []);

  return (
    <div className="min-h-screen w-screen overflow-y-auto p-0 m-0 text-text-primary relative overflow-x-hidden bg-bg-void">

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

      {/* ─── Layout Layer ─── */}
      <div className="relative z-10 w-full flex flex-col pt-24">
        
        {/* ─── Main Mission Control Content ─── */}
        <div className="max-w-(--breakpoint-2xl) mx-auto w-full px-6 lg:px-12 pb-24 space-y-24">
          
          {/* ══════════════════════════════════════
              HERO SECTION — Status & Primary Globe
              ══════════════════════════════════════ */}
          <section className="relative flex flex-col items-center justify-center min-h-[70vh]">
            
            {/* Status Batch */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-aurora-primary animate-pulse shadow-[0_0_6px_rgba(0,220,130,0.9)]" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-text-secondary">System Normal / Global Telemetry Active</span>
              </div>
            </motion.div>
            {/* Title HUD Header */}
            <div className="text-center space-y-4 mb-32 relative z-10">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl md:text-8xl font-bold tracking-tighter text-white"
                style={{ 
                  fontFamily: 'Orbitron, sans-serif',
                  textShadow: '0 0 50px rgba(0,220,130,0.4)'
                }}
              >
                AURORA<span className="text-aurora-primary">KASHMIR</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-xs md:text-sm uppercase tracking-[0.5em] text-text-secondary"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                L1 Lagrange Point &amp; Region Specific Forecasting
              </motion.p>
            </div>

            {/* Globe / Map Viewport - Extreme Left Alignment */}
            <div className="absolute left-[-5%] top-[12%] w-[85vh] aspect-square flex items-center justify-start pointer-events-none transition-all duration-1000">
              {viewMode === 'GLOBAL' ? (
                <Suspense fallback={<div className="text-white opacity-20">Loading 3D Engine...</div>}>
                  <div className="w-full h-full opacity-80">
                    <TexturedGlobe kp={kp} />
                  </div>
                </Suspense>
              ) : (
                <LocationMap />
              )}
              
              {/* Location Target UI Surround */}
              <div className="absolute inset-0 border border-white/5 rounded-full scale-110 pointer-events-none" />
              <div className="absolute inset-0 border border-white/5 rounded-full scale-125 opacity-50 pointer-events-none" />
            </div>

            {/* Search Overlay */}
            <div className="mt-16 w-full max-w-xl">
              <LocationSearch />
            </div>

            {/* Scroll Indicator (Global only) */}
            <AnimatePresence>
              {viewMode === 'GLOBAL' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-16 flex flex-col items-center"
                >
                  <span className="text-[10px] uppercase tracking-[0.4em] text-text-secondary mb-4 opacity-40 font-mono">
                    Explore Telemetry
                  </span>
                  <div className="w-px h-12 bg-linear-to-b from-aurora-primary to-transparent" />
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ══════════════════════════════════════
              TICKER SECTION — Live Stream Feed
              ══════════════════════════════════════ */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-20 w-full border-t border-b border-white/6 glass-panel-sm py-3 px-8 overflow-visible scan-line-active"
          >
            <div className="flex items-center gap-10 justify-center flex-wrap">
              <div className="flex items-center gap-4">
                <span className="section-label text-[9px]! opacity-60">KP-GEOMAG</span>
                <span className={`font-mono text-sm font-bold ${kp >= 5 ? 'text-accent-solar animate-pulse' : 'text-aurora-primary'}`}>
                  {kp.toFixed(1)}
                </span>
                <div className="flex gap-[2px] h-3 items-end opacity-40">
                  {[8, 12, 10, 16, 12].map((h, i) => <div key={i} className="w-1 bg-white" style={{ height: `${h}px` }} />)}
                </div>
              </div>

              <div className="h-4 w-px bg-white/10" />

              <div className="flex items-center gap-4">
                <span className="section-label text-[9px]! opacity-60">IMF BZ</span>
                <span className={`font-mono text-sm font-bold ${(data?.telemetry.bz_nt ?? 0) < 0 ? 'text-accent-danger' : 'text-text-primary'}`}>
                  {(data?.telemetry.bz_nt ?? 0).toFixed(1)} nT
                </span>
              </div>

              <div className="h-4 w-px bg-white/10" />

              <div className="flex items-center gap-4">
                <span className="section-label text-[9px]! opacity-60">Solar Wind</span>
                <span className="font-mono text-sm font-bold text-accent-ice">{(data?.telemetry.speed_km_s ?? 0).toFixed(0)} <span className="opacity-40">km/s</span></span>
              </div>
            </div>
          </motion.section>

          {/* ══════════════════════════════════════
              DASHBOARD SECTION — Bento Telemetry
              ══════════════════════════════════════ */}
          <section id="telemetry-grid" className="relative min-h-[400px]">
             {/* Background Grid Overlay */}
             <div className="absolute inset-x-0 top-0 bottom-0 z-[-1] pointer-events-none bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_120%_120%_at_50%_0%,#000_70%,transparent_100%)]" />

            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-aurora-primary font-mono text-xs animate-pulse tracking-[0.3em]">
                  SYNCHRONIZING WITH DEEP SPACE GATEWAY...
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                
                {/* KP Index Indicator */}
                <KpCard kp={kp} history={history} />

                {/* Solar Wind Telemetry */}
                <SolarWindCard 
                  speed={data?.telemetry.speed_km_s ?? 0} 
                  density={data?.telemetry.density_p_cm3 ?? 0} 
                  history={history}
                />

                {/* IMF Magnetic Component */}
                <MagneticFieldCard 
                  bz={data?.telemetry.bz_nt ?? 0} 
                  history={history}
                />

                {/* Kashmir Region Projection */}
                <KashmirVisionCard score={data?.aurora_score ?? 0} />

              </div>
            )}
          </section>

          {/* ══════════════════════════════════════
              SECTION 02 — Mission Command
              ══════════════════════════════════════ */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 border-b border-white/6 pb-4">
              <span className="section-label">[01] Mission Command & AI Architecture</span>
              <div className="flex-1 h-px bg-linear-to-r from-aurora-primary/20 to-transparent" />
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-stretch border border-white/6 glass-panel p-8 md:p-12 relative overflow-hidden group rounded-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-aurora-primary/5 blur-[120px] pointer-events-none" />
              
              <div className="flex-1 space-y-6">
                <div className="inline-flex px-3 py-1 rounded-sm bg-aurora-primary/10 border border-aurora-primary/20 text-aurora-primary font-mono text-[9px] tracking-widest">
                  L1 LAGRANGE POINT DEPLOYMENT
                </div>
                <h2 className="font-display text-4xl lg:text-5xl font-bold tracking-tighter text-white">
                  Predictive Space Weather <br/><span className="text-aurora-primary">Neural Engine V4.0</span>
                </h2>
                <p className="text-text-secondary leading-relaxed font-body text-sm max-w-xl">
                  Leveraging real-time telemetry from the DSCOVR and ACE spacecraft, AuroraLens provides sub-minute accuracy for geomagnetic storm onset. Our custom XGBoost models analyze solar wind speed, density, and IMF vectors to calculate visibility for the Kashmir region.
                </p>
                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative px-8 py-3 text-[10px] uppercase tracking-widest font-bold text-white border border-white/10 bg-white/5 hover:border-aurora-primary hover:bg-aurora-primary/5 transition-all overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.5)] cursor-pointer"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    Launch System Diagnostics
                  </motion.button>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-8 py-10 lg:py-0 border-l border-white/5 pl-0 lg:pl-10">
                <SystemTerminal />
                <div className="relative w-full max-w-xs aspect-square border border-white/5 bg-white/1.5 flex items-center justify-center rounded-lg overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,220,130,0.06)_0,transparent_70%)]" />
                   <div className="text-center z-10 font-mono">
                      <p className="text-[10px] text-aurora-primary mb-6">[ L1 SECTOR SCAN ]</p>
                      <div className="w-24 h-24 border border-aurora-primary/20 rounded-full flex items-center justify-center animate-spin-slow">
                        <div className="w-12 h-12 border-t border-white/20 rounded-full" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════
              SECTION 03 — Global Targets
              ══════════════════════════════════════ */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 border-b border-white/6 pb-4">
              <span className="section-label">[02] Verified Observational Targets</span>
              <div className="flex-1 h-px bg-linear-to-r from-aurora-primary/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/6 border border-white/6 overflow-hidden rounded-sm">
              {[
                { id: 101, loc: "TROMSØ, NORWAY",    img: "https://images.unsplash.com/photo-1531366936337-779c643e1150?q=80&w=800" },
                { id: 102, loc: "FAIRBANKS, AK",     img: "https://images.unsplash.com/photo-1579033461387-adaa06db995b?q=80&w=800" },
                { id: 103, loc: "REYKJAVÍK, IS",     img: "https://images.unsplash.com/photo-1520796338006-03f6f9662b66?q=80&w=800" },
                { id: 104, loc: "YELLOWKNIFE, CA",   img: "https://images.unsplash.com/photo-1533215206306-0ce0fcc68593?q=80&w=800" }
              ].map((spot) => (
                <div key={spot.id} className="relative aspect-3/4 group overflow-hidden bg-bg-deep cursor-pointer">
                  <img src={spot.img} alt={spot.loc} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 select-none" />
                  <div className="absolute inset-0 bg-linear-to-t from-bg-void via-bg-void/40 to-transparent opacity-90 group-hover:opacity-50 transition-all duration-700" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <p className="section-label text-[8px] text-aurora-primary mb-1">STATION ACTIVE</p>
                      <h3 className="font-display text-lg text-white font-bold">{spot.loc}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center py-20 border-t border-white/5">
             <p className="text-text-dim font-mono text-[9px] uppercase tracking-[0.5em]">
                AURORALENS · SPACE KASHMIR INITIATIVE · {new Date().getFullYear()}
             </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
