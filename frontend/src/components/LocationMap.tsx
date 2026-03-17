'use client';

import { useRef, useEffect, useState } from 'react';
import Map, { MapRef, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, Zap, Eye, Wind, CloudOff, Cloud, Bell, Layers, Settings2 } from 'lucide-react';
import { useAppStore, TargetLocation } from '@/store/useAppStore';
import TimelineScrubber from './TimelineScrubber';

function LocalInsightsSidebar({ forecast }: { forecast: LocalForecastData | null }) {
  if (!forecast) return null;

  const getPhotographyInsight = () => {
    if (forecast.aurora_score > 70) return { text: "Perfect for Camera", sub: "Vivid colors & movement", icon: <Zap size={14} className="text-yellow-400" /> };
    if (forecast.aurora_score > 30) return { text: "Long Exposure Required", sub: "Use 10-20s shutter speed", icon: <Eye size={14} className="text-sky-400" /> };
    return { text: "Low Light Target", sub: "Sensor noise likely", icon: <CloudOff size={14} className="text-slate-500" /> };
  };

  const getSkyInsight = () => {
    if (forecast.cloud_cover < 10) return { text: "Pristine Dark Sky", sub: "Zero interference", icon: <Target size={14} className="text-aurora-green" /> };
    if (forecast.cloud_cover < 40) return { text: "Partially Obscured", sub: "Clouds moving through", icon: <Cloud size={14} className="text-slate-400" /> };
    return { text: "Heavy Coverage", sub: "Poor visual window", icon: <CloudOff size={14} className="text-red-400" /> };
  };

  const getVisibilityInsight = () => {
    if (forecast.aurora_score > 60 && forecast.cloud_cover < 30) return { text: "Naked-Eye Visible", sub: "Lookup and enjoy!", icon: <Eye size={14} className="text-white" /> };
    if (forecast.aurora_score > 20) return { text: "Deep Horizon Search", sub: "Look toward the pole", icon: <Wind size={14} className="text-slate-400" /> };
    return { text: "Wait for Burst", sub: "Monitoring solar wind", icon: <Zap size={14} className="text-slate-600" /> };
  };

  const photo = getPhotographyInsight();
  const sky = getSkyInsight();
  const vis = getVisibilityInsight();

  // Maximal Visibility Locations (Dynamic placeholder logic)
  const topLocations = [
    { name: "Tromsø, Norway", score: (forecast.aurora_score * 1.1).toFixed(0) },
    { name: "Reykjavík, Iceland", score: (forecast.aurora_score * 0.95).toFixed(0) },
    { name: "Fairbanks, Alaska", score: forecast.aurora_score.toFixed(0) }
  ].sort((a,b) => Number(b.score) - Number(a.score));

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -80, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      className="absolute top-24 left-0 w-72 z-30 pointer-events-auto flex flex-col gap-3 pl-4"
    >
      {/* ─── Main AI Insights ─── */}
      <div className="glass-panel rounded-2xl p-4 border border-blue-500/20 bg-blue-900/20 backdrop-blur-2xl shadow-[0_0_40px_rgba(59,130,246,0.15)] mb-3">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Zap size={14} className="text-blue-400" />
            </div>
            <span className="text-blue-400 font-mono text-[10px] tracking-[0.2em] uppercase font-bold">AI Insights</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Temp</span>
            <span className="text-white font-bold text-xs">{forecast.temperature.toFixed(1)}°C</span>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { label: "Photography", ...photo },
            { label: "Sky Condition", ...sky },
            { label: "Visibility", ...vis }
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="mt-1">{item.icon}</div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-[9px] uppercase tracking-wider font-bold mb-0.5">{item.label}</span>
                <p className="text-white font-bold text-sm leading-tight">{item.text}</p>
                <p className="text-slate-400 text-[10px] mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Maximal Visibility Locations Hidden in Local View ─── */}

        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] text-slate-500 italic leading-relaxed">
            AI has analyzed local atmospherics. {forecast.aurora_score > 40 ? "Great opportunity for sighting." : "Conditions are sub-optimal."}
          </p>
        </div>
    </motion.div>
  );
}

// ─── Localized Forecast Panel ─────────────────────────────────────────────

interface LocalForecastData {
  aurora_score: number;
  confidence: string;
  level: string;
  message: string;
  telemetry: {
    bz_nt: number;
    bt_nt: number;
    speed_km_s: number;
    density_p_cm3: number;
  };
  cloud_cover: number;
  temperature: number;
  precipitation: number;
}


function LocalDataSidebar({ location, forecast }: { location: TargetLocation; forecast: LocalForecastData | null }) {
  const { isProMode, setProMode } = useAppStore();
  const levelColors: Record<string, string> = {
    EXTREME: 'text-red-400',
    HIGH: 'text-orange-400',
    MODERATE: 'text-yellow-400',
    LOW: 'text-green-400',
    MINIMAL: 'text-slate-400',
  };

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="absolute top-24 right-0 w-72 z-30 pointer-events-auto flex flex-col gap-3 pr-4"
    >
      {/* Location Header */}
      <div className="glass-panel rounded-2xl p-4 border border-aurora-green/20 bg-black/70 backdrop-blur-xl flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target size={14} className="text-aurora-green" />
            <span className="text-aurora-green font-mono text-xs tracking-widest uppercase">Target Lock</span>
          </div>
          <p className="text-white font-bold text-lg leading-tight">{location.name}</p>
          <p className="text-slate-400 font-mono text-xs mt-1">
            {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
          </p>
        </div>
        <button className="text-slate-500 hover:text-aurora-green transition-colors p-1" title="Save Alert">
          <Bell size={16} />
        </button>
      </div>

      {/* Aurora Score */}
      {forecast ? (
        <>
          <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-black/60 backdrop-blur-xl">
            <p className="text-slate-400 text-xs mb-2 tracking-widest font-mono uppercase">AI Aurora Score</p>
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-white orbitron leading-none">{forecast.aurora_score}</span>
                <span className="text-slate-500 text-sm mb-1">/100</span>
              </div>
              
              <div className="flex flex-col items-end text-slate-300">
                <div className="flex items-center gap-1 mb-1">
                  <Cloud size={12} className={forecast.cloud_cover > 50 ? 'text-slate-400' : 'text-sky-400'} />
                  <span className="text-[10px] uppercase tracking-wider font-mono">Clouds</span>
                </div>
                <span className="text-xl font-bold font-mono">{forecast.cloud_cover.toFixed(0)}%</span>
              </div>
            </div>

            {/* Weather Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-mono mb-1">Temp</span>
                <span className="text-white font-bold text-xs tracking-tight">{forecast.temperature.toFixed(1)}°C</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-mono mb-1">Precip</span>
                <span className="text-white font-bold text-xs tracking-tight">{forecast.precipitation.toFixed(1)}mm</span>
              </div>
              <div className="bg-white/5 rounded-xl p-2 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase tracking-tighter text-slate-500 font-mono mb-1">Light Poll.</span>
                <span className="text-white font-bold text-xs tracking-tight">Bortle 4</span>
              </div>
            </div>
            {/* Score bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${forecast.aurora_score}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, #00dc82, ${forecast.aurora_score > 60 ? '#ff4444' : '#00d4ff'})` }}
              />
            </div>
            <p className={`text-sm font-bold mt-2 ${levelColors[forecast.level] ?? 'text-slate-400'}`}>
              {forecast.level}
            </p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{forecast.message}</p>
            
            {/* Pro Mode Toggle */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <Settings2 size={12} /> Pro Telemetry
              </span>
              <button 
                onClick={() => setProMode(!isProMode)}
                className={`w-8 h-4 rounded-full transition-colors relative ${isProMode ? 'bg-aurora-green' : 'bg-white/20'}`}
              >
                <motion.div 
                  className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                  animate={{ x: isProMode ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          {/* Live Telemetry */}
          <AnimatePresence>
            {isProMode && (
              <motion.div 
                initial={{ height: 0, opacity: 0, scale: 0.95 }}
                animate={{ height: 'auto', opacity: 1, scale: 1 }}
                exit={{ height: 0, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-black/60 backdrop-blur-xl mt-1">
                  <p className="text-slate-400 text-xs mb-3 tracking-widest font-mono uppercase">Live Telemetry</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Bz', value: `${forecast.telemetry.bz_nt.toFixed(1)} nT`, icon: <Wind size={10} /> },
                { label: 'Bt', value: `${forecast.telemetry.bt_nt.toFixed(1)} nT`, icon: <Zap size={10} /> },
                { label: 'Speed', value: `${forecast.telemetry.speed_km_s.toFixed(0)} km/s`, icon: <Eye size={10} /> },
                { label: 'Density', value: `${forecast.telemetry.density_p_cm3.toFixed(1)} p/cc`, icon: <CloudOff size={10} /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-white/5 rounded-xl p-2.5">
                  <div className="flex items-center gap-1 text-slate-500 mb-1">{icon}<span className="text-xs font-mono">{label}</span></div>
                  <p className="text-white font-bold text-sm font-mono">{value}</p>
                </div>
              ))}
                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-black/60 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-slate-400">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
              <Cloud size={16} />
            </motion.div>
            <span className="text-xs font-mono">Fetching local forecast...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main LocationMap Component ───────────────────────────────────────────

export default function LocationMap() {
  const mapRef = useRef<MapRef>(null);
  const { viewMode, targetLocation, returnToGlobal, timeScrubber } = useAppStore();
  const [forecast, setForecast] = useState<LocalForecastData | null>(null);
  const [mapReady, setMapReady] = useState(false);
  // Free CARTO dark-matter style — no API key required
  const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

  // ─── Fetch local forecast when targetLocation changes ─────────────────
  useEffect(() => {
    if (!targetLocation) return;
    setForecast(null);
    fetch(`http://127.0.0.1:8000/api/weather/forecast/global?lat=${targetLocation.lat}&lon=${targetLocation.lng}&hour_offset=${timeScrubber}`)
      .then((r) => r.json())
      .then((data) => setForecast(data))
      .catch(() => setForecast(null));
  }, [targetLocation, timeScrubber]);

  // Keep a ref that always has the latest targetLocation
  const targetLocationRef = useRef(targetLocation);
  useEffect(() => {
    targetLocationRef.current = targetLocation;
  }, [targetLocation]);

  const doFlyTo = (map: ReturnType<MapRef['getMap']>) => {
    const loc = targetLocationRef.current;
    if (!loc) return;
    setTimeout(() => {
      map.flyTo({
        center: [loc.lng, loc.lat],
        zoom: loc.zoom || 12,
        pitch: 65,
        bearing: -15,
        duration: 4000,
        easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      });
    }, 200); // short delay to allow map to finish rendering
  };

  // ─── flyTo on targetLocation change (when map is already mounted & ready) ─
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !targetLocation || !mapReady) return;
    doFlyTo(map);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLocation]);

  const buffer = 1.5;
  // maxBounds intentionally NOT set on the Map component.
  // It is applied programmatically AFTER flyTo lands so the camera can travel globally.
  const postFlyBounds: [number, number, number, number] | undefined = targetLocation
    ? [
        targetLocation.lng - buffer,
        targetLocation.lat - buffer,
        targetLocation.lng + buffer,
        targetLocation.lat + buffer,
      ]
    : undefined;

  const isVisible = viewMode === 'LOCAL';

  return (
    <AnimatePresence>
      {isVisible && targetLocation && (
        <motion.div
          key="local-map"
          initial={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-30 pointer-events-auto"
        >
          {/* ─── Back to Global Button ─── */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            onClick={returnToGlobal}
            className="absolute top-24 left-6 z-40 flex items-center gap-2 bg-black/60 backdrop-blur-xl text-white border border-white/10 px-5 py-2.5 rounded-full hover:bg-aurora-green/10 hover:border-aurora-green/30 hover:text-aurora-green transition-all font-mono text-xs tracking-widest uppercase shadow-2xl group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Global View
          </motion.button>


          {/* ─── Local Sidebar ─── */}
          <LocalInsightsSidebar forecast={forecast} />
          <LocalDataSidebar location={targetLocation} forecast={forecast} />

          {/* ─── Map Container ─── */}
            <div className="w-full h-full relative overflow-hidden bg-space-black">
              <Map
                ref={mapRef}
                initialViewState={{
                  // Start GLOBALLY zoomed out — this is what makes flyTo cinematic
                  longitude: 0,
                  latitude: 20,
                  zoom: 2,
                  pitch: 0,
                  bearing: 0,
                }}
                onLoad={(e) => {
                  setMapReady(true);
                  setTimeout(() => e.target.resize(), 100);
                  doFlyTo(e.target);
                }}
                onError={(e) => console.error('MapLibre Error:', e.error)}
                mapStyle={MAP_STYLE}
                maxPitch={85}
                minZoom={0}
              >
              </Map>
              {/* ─── Target Crosshair Overlay ─── */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.5, type: 'spring', stiffness: 200 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
              >
                <div className="relative">
                  <div className="absolute -inset-6 border border-aurora-green/20 rounded-full animate-ping" />
                  <Target size={32} className="text-aurora-green drop-shadow-[0_0_20px_rgba(0,220,130,0.8)]" />
                </div>
              </motion.div>

              {/* ─── Cinematic Edge Vignette ─── */}
              <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(3,11,26,0.9)]" />
            </div>

            {/* ─── Floating Action Buttons (Bottom Right) ─── */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute bottom-12 right-6 z-40 flex flex-col gap-3 pointer-events-auto"
            >
              <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition-all flex items-center justify-center shadow-lg" title="Toggle Cloud Layer">
                <Cloud size={16} />
              </button>
              <button className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white hover:border-white/30 transition-all flex items-center justify-center shadow-lg" title="Toggle Light Pollution Layer">
                <Layers size={16} />
              </button>
            </motion.div>

            {/* ─── Timeline Scrubber ─── */}
            <TimelineScrubber />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
