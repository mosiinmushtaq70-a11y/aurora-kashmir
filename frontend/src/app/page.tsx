'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AuroraGlobe from '@/components/AuroraGlobe';
import Aurora from '@/components/Aurora';
import LightPillar from '@/components/LightPillar';
import LocationMap from '@/components/LocationMap';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

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
}

export default function Home() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [kp, setKp] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    // Fetch global forecast data
    fetch('http://127.0.0.1:8000/api/weather/forecast/global')
      .then((res) => {
        if (!res.ok) throw new Error('API connecting...');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
      
    // Fetch historical data to get current Kp
    fetch('http://127.0.0.1:8000/api/weather/telemetry/history')
      .then((res) => res.json())
      .then((json) => {
         if (json.data && json.data.length > 0) {
             setKp(json.data[json.data.length - 1].kp);
         }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="w-full h-full text-slate-200 relative">
      {/* Fixed WebGL LightPillar background */}
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

      {/* All page content sits above the background */}
      <div className="relative z-10">
      <header className="mb-12 text-center mt-2">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2 orbitron" style={{textShadow: '0 0 30px rgba(0,220,130,0.5)'}}>
          AuroraLens
        </h1>
        <p className="text-slate-400 text-lg md:text-xl tracking-[0.2em] font-light">
          COSMIC WEATHER &amp; AURORA FORECAST
        </p>
      </header>

      {loading ? (
        <div className="animate-pulse flex space-x-4">
          <div className="glass-panel h-48 w-full rounded-2xl bg-white/5"></div>
        </div>
      ) : error ? (
        <div className="glass-panel p-6 border-red-500/30 rounded-2xl bg-red-500/10 text-red-300 flex items-center justify-center gap-3">
          <p>Please ensure the Python <b>FastAPI</b> backend is running on port 8000.</p>
        </div>
      ) : data ? (
        <div className="max-w-7xl mx-auto space-y-12 pb-12">
          
          {/* Main Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 rounded-2xl text-center group hover:-translate-y-2 transition-transform duration-300 hover:border-[#00dc82] hover:shadow-[0_10px_30px_rgba(0,220,130,0.2)]">
              <h3 className="text-slate-300 text-lg mb-4">Aurora Score</h3>
              <div className="text-5xl lg:text-7xl font-black mb-2 orbitron bg-gradient-to-r from-[#00d4ff] to-[#00dc82] text-transparent bg-clip-text">
                {Math.round(data.aurora_score)}
              </div>
              <p className="text-slate-400">out of 100</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-8 rounded-2xl text-center group hover:-translate-y-2 transition-transform duration-300 hover:border-[#00dc82] hover:shadow-[0_10px_30px_rgba(0,220,130,0.2)]">
              <h3 className="text-slate-300 text-lg mb-4">Visibility Level</h3>
              <div className="text-2xl lg:text-3xl font-bold mb-4 orbitron text-[#00dc82] mt-4">
                {data.geomagnetic_storm ? "🔴 HIGH" : "🟢 LOW"}
              </div>
              <p className="text-slate-400 text-sm">
                {data.message}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-8 rounded-2xl text-center group hover:-translate-y-2 transition-transform duration-300 hover:border-[#00dc82] hover:shadow-[0_10px_30px_rgba(0,220,130,0.2)]">
              <h3 className="text-slate-300 text-lg mb-4">Confidence</h3>
              <div className="text-5xl font-black mb-2 orbitron bg-gradient-to-r from-[#00d4ff] to-[#00dc82] text-transparent bg-clip-text pt-2">
                {data.confidence}
              </div>
              <p className="text-slate-400">AI Prediction Certainty</p>
            </motion.div>
          </div>

          <hr className="border-t border-white/10" />

          {/* Globe Component */}
          <AuroraGlobe kp={kp} onZoomComplete={() => setShowMap(true)} />

          <hr className="border-t border-white/10" />

          {/* Live Space Weather Status */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 orbitron">
              <span>📡</span> Live Space Weather Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="glass-panel p-6 rounded-xl border-l-4 border-l-[#00dc82]">
                 <p className="text-slate-400 text-sm mb-1">Kp Index</p>
                 <p className="text-3xl font-bold text-white">{kp.toFixed(1)}</p>
                 <p className="text-xs text-slate-500 mt-2">Storm Strength (0-9). High values required for Kashmir.</p>
               </div>
               <div className="glass-panel p-6 rounded-xl border-l-4 border-l-[#00d4ff]">
                 <p className="text-slate-400 text-sm mb-1">Bz Component (GSM)</p>
                 <p className="text-3xl font-bold text-white">{data.telemetry.bz_nt.toFixed(1)} <span className="text-lg text-slate-400">nT</span></p>
                 <p className="text-xs text-slate-500 mt-2">Shield Status. Negative opens Earth's magnetic shield.</p>
               </div>
               <div className="glass-panel p-6 rounded-xl border-l-4 border-l-[#ff8c00]">
                 <p className="text-slate-400 text-sm mb-1">Bt Total Field</p>
                 <p className="text-3xl font-bold text-white">{data.telemetry.bt_nt.toFixed(1)} <span className="text-lg text-slate-400">nT</span></p>
                 <p className="text-xs text-slate-500 mt-2">Energy Potential of the solar wind flow.</p>
               </div>
            </div>
          </div>

          <hr className="border-t border-white/10" />

          {/* Cosmic History (Neon Pulse Rendering) */}
          <div>
             <h3 className="text-2xl font-bold text-white mb-6 orbitron">Cosmic History (Neon Pulse Rendering)</h3>
             <h4 className="text-[#00dc82] text-xl font-semibold mb-4 orbitron">I. Geomagnetic Activity (Storm Strength)</h4>
             <div className="w-full h-[350px] bg-black/40 rounded-xl p-4 border border-white/5">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { time: '12:00', value: 2 }, { time: '14:00', value: 3 }, { time: '16:00', value: 5 },
                    { time: '18:00', value: 7 }, { time: '20:00', value: Math.max(0, kp - 1) }, { time: 'Now', value: kp }
                  ]}>
                    <defs>
                      <linearGradient id="colorKp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00dc82" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00dc82" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(10,5,25,0.9)', border: '1px solid #00dc82', borderRadius: '8px' }} />
                    <ReferenceLine y={5} stroke="#00dc82" strokeDasharray="3 3" label={{ position: 'top', value: 'Kp 5: G1 Storm (Target)', fill: '#00dc82', fontSize: 12 }} />
                    <Area type="monotone" dataKey="value" stroke="#00dc82" strokeWidth={3} fillOpacity={1} fill="url(#colorKp)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Solar Flares Section */}
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
               {[1,2,3,4].map((i) => (
                 <div key={i} className="aspect-square bg-white/5 rounded-xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                    <div className="absolute inset-0 flex items-end justify-center pb-4 z-20">
                      <p className="text-white text-sm font-semibold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">KASHMIR OBSERVED</p>
                    </div>
                    {/* Placeholder image generator */}
                    <img src={`https://picsum.photos/seed/${i + 15}/400/400`} alt="Aurora" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 </div>
               ))}
            </div>
          </div>

        </div>
      ) : null}

      {/* Google Maps 3D Overlay */}
      {data && (
        <LocationMap
          isVisible={showMap}
          targetLocation={{ lat: 34.0837, lng: 74.7973 }} // Kashmir target
          auroraScore={Math.round(data.aurora_score)}
          onClose={() => setShowMap(false)}
        />
      )}
      
        {/* Footer */}
        <div className="text-center text-slate-600 p-12 text-xs">
          Built with ❤️ for Kashmir — {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
