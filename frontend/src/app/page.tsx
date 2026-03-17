'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [kp, setKp] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { viewMode } = useAppStore();

  const API_BASE_URL = 'http://127.0.0.1:8000';

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
    <div className="w-full h-full text-slate-200 relative">

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
      <section className="relative w-full h-screen flex flex-col items-center justify-between overflow-hidden">

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
              className="relative z-10 text-center pt-0 pointer-events-none"
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
              <motion.p className="text-slate-300 text-xl md:text-2xl tracking-[0.4em] font-extralight uppercase">
                Cosmic Weather & Aurora Forecast
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
                <hr className="border-t border-white/5 opacity-50" />

                {/* Live Space Weather Status */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 orbitron">
                    <span>📡</span> Live Space Weather Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-panel p-6 rounded-xl border-l-4 border-l-white bg-aurora-green/10 shadow-[0_0_30px_rgba(0,220,130,0.2)]">
                      <p className="text-aurora-green text-sm mb-1 font-bold uppercase tracking-wider">AI Aurora Score</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-black text-white orbitron">{data.aurora_score}</p>
                        <p className="text-slate-500 text-sm">/100</p>
                      </div>
                      <p className="text-xs text-aurora-green/80 mt-2 font-mono uppercase tracking-tighter">Probabilistic Observability</p>
                    </div>
                    <div className="glass-panel p-6 rounded-xl border-l-4 border-l-aurora-green">
                      <p className="text-slate-400 text-sm mb-1">Kp Index</p>
                      <p className="text-3xl font-bold text-white">{kp.toFixed(1)}</p>
                      <p className="text-xs text-slate-500 mt-2">Storm Strength (0-9). Higher = stronger auroras.</p>
                    </div>
                    <div className="glass-panel p-6 rounded-xl border-l-4 border-l-[#00d4ff]">
                      <p className="text-slate-400 text-sm mb-1">Bz Component (GSM)</p>
                      <p className="text-3xl font-bold text-white">{data.telemetry.bz_nt.toFixed(1)} <span className="text-lg text-slate-400">nT</span></p>
                      <p className="text-xs text-slate-500 mt-2">Shield Status. Negative opens Earth&apos;s magnetic shield.</p>
                    </div>
                    <div className="glass-panel p-6 rounded-xl border-l-4 border-l-[#ff8c00]">
                      <p className="text-slate-400 text-sm mb-1">Bt Total Field</p>
                      <p className="text-3xl font-bold text-white">{data.telemetry.bt_nt.toFixed(1)} <span className="text-lg text-slate-400">nT</span></p>
                      <p className="text-xs text-slate-500 mt-2">Energy Potential of the solar wind flow.</p>
                    </div>
                  </div>
                </div>

                <hr className="border-t border-white/10" />

                {/* Cosmic History Chart */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 orbitron">Cosmic History (Neon Pulse Rendering)</h3>
                  <h4 className="text-aurora-green text-xl font-semibold mb-4 orbitron">I. Geomagnetic Activity (Storm Strength)</h4>
                  <div className="w-full h-[350px] bg-black/40 rounded-xl p-4 border border-white/5">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { time: '12:00', value: 2 }, { time: '14:00', value: 3 }, { time: '16:00', value: 5 },
                        { time: '18:00', value: 7 }, { time: '20:00', value: Math.max(0, kp - 1) }, { time: 'Now', value: kp }
                      ]}>
                        <defs>
                          <linearGradient id="colorKp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-aurora-green)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-aurora-green)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(10,5,25,0.9)', border: '1px solid #00dc82', borderRadius: '8px' }} />
                        <ReferenceLine y={5} stroke="var(--color-aurora-green)" strokeDasharray="3 3" label={{ position: 'top', value: 'Kp 5: G1 Storm', fill: 'var(--color-aurora-green)', fontSize: 12 }} />
                        <Area type="monotone" dataKey="value" stroke="var(--color-aurora-green)" strokeWidth={3} fillOpacity={1} fill="url(#colorKp)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Solar Flares */}
                <hr className="border-t border-white/10" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 orbitron">☀️ Recent Solar Flare Events</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['X1.2', 'M4.5', 'X2.0', 'M8.1'].map((flare, i) => (
                      <div key={i} className="glass-panel p-4 rounded-xl text-center hover:bg-white/5 transition-colors duration-300">
                        <p className="text-red-500 text-3xl font-black orbitron mb-2">{flare}</p>
                        <p className="text-slate-400 text-xs">Today, {12 - i}:00 UTC</p>
                        <p className="text-slate-500 text-[10px] mt-1">Region AR3615</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aurora Gallery */}
                <hr className="border-t border-white/10" />
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 orbitron">📸 Aurora Gallery</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="aspect-square bg-white/5 rounded-xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent z-10" />
                        <div className="absolute inset-0 flex items-end justify-center pb-4 z-20">
                          <p className="text-white text-sm font-semibold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">AURORA OBSERVED</p>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://picsum.photos/seed/${i + 15}/400/400`} alt="Aurora" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
