'use client';

import { useRef, useEffect, useState } from 'react';
import Map, { MapRef, Marker, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { ArrowLeft, Target, Zap, Eye, Wind, CloudOff, Cloud, Bell, Layers, Settings2, LogIn, MapPin, Star } from 'lucide-react';
import { useAppStore, TargetLocation } from '@/store/useAppStore';
import { useSession, signIn } from 'next-auth/react';
import TimelineScrubber from './TimelineScrubber';

function AnimatedNumber({ value, format }: { value: number, format?: (v: number) => string }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => format ? format(current) : current.toFixed(0));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

function LocalInsightsSidebar({ forecast, primeSpots, onSpotClick }: { forecast: LocalForecastData | null; primeSpots: any[]; onSpotClick?: (lat: number, lng: number, id: string) => void }) {
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

  const getTacticalAdvisory = () => {
    const score = forecast.aurora_score;
    if (score > 75) {
      const phrases = [
        'Prime conditions detected. Deployment highly recommended.',
        'Optimal viewing window. Execute observation plans.',
        'High probability of auroral activity. Clear for travel.'
      ];
      return { 
        text: phrases[Math.floor(Math.random() * phrases.length)],
        color: 'border-aurora-green',
        textColor: 'text-aurora-green'
      };
    } else if (score >= 40) {
      const phrases = [
        'Marginal conditions. Keep monitoring telemetry.',
        'Activity possible. Stand by for updated solar wind data.',
        'Moderate probability. Local cloud cover will dictate visibility.'
      ];
      return { 
        text: phrases[Math.floor(Math.random() * phrases.length)],
        color: 'border-amber-500',
        textColor: 'text-amber-500'
      };
    } else {
      const phrases = [
        'Unfavorable conditions. Stand down.',
        'Low probability. Travel not recommended for this sector tonight.',
        'Insufficient solar activity. Abort observation plans.'
      ];
      return { 
        text: phrases[Math.floor(Math.random() * phrases.length)],
        color: 'border-red-500',
        textColor: 'text-red-500'
      };
    }
  };
  
  // Custom hook pattern to avoid hydration mismatch if random varies between server/client, 
  // but since this is fully client-side rendered based on 'forecast' state, it's safe.
  const [advisory] = useState(() => getTacticalAdvisory());

  const pollutionColor: Record<string, string> = {
    Minimal:  'text-aurora-green',
    Low:      'text-sky-400',
    Moderate: 'text-yellow-400',
    High:     'text-red-400',
  };

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -80, opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      className="absolute top-24 left-0 w-72 z-30 pointer-events-auto overflow-y-auto max-h-[calc(100vh-8rem)] block"
      style={{ scrollbarWidth: 'none' }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-3 pl-4 pb-8 pr-2 pt-2">

      {/* ─── Tactical Advisory ─── */}
      <div className={`glass-panel rounded-r-xl p-4 border-l-2 bg-black/60 shadow-xl ${advisory.color}`}>
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className={advisory.textColor} />
          <span className={`font-mono text-[10px] tracking-[0.2em] uppercase font-bold ${advisory.textColor}`}>Tactical Advisory</span>
        </div>
        <p className={`font-mono text-xs leading-relaxed opacity-90 ${advisory.textColor}`}>{advisory.text}</p>
      </div>

      {/* ─── Main AI Insights ─── */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-black/40 backdrop-blur-lg shadow-xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Zap size={14} className="text-blue-400" />
            </div>
            <span className="text-blue-400 font-mono text-[10px] tracking-[0.2em] uppercase font-bold">AI Insights</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Temp</span>
            <span className="text-white font-bold text-xs"><AnimatedNumber value={forecast.temperature} format={(v) => v.toFixed(1)} />°C</span>
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

        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] text-slate-500 italic leading-relaxed">
            AI has analyzed local atmospherics. {forecast.aurora_score > 40 ? "Great opportunity for sighting." : "Conditions are sub-optimal."}
          </p>
        </div>
      </div>

      {/* ─── Prime Viewing Spots ─── */}
      <div className="glass-panel rounded-2xl p-4 border border-aurora-green/20 bg-black/60 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,220,130,0.08)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-aurora-green/15 rounded-lg">
            <MapPin size={14} className="text-aurora-green" />
          </div>
          <span className="text-aurora-green font-mono text-[10px] tracking-[0.2em] uppercase font-bold">Prime Viewing Spots</span>
        </div>

        <div className="flex flex-col gap-2">
          {primeSpots.map((spot, i) => {
            let dynamicName = `Peak @ ${spot.altitude || 0}m`;
            if (spot.altitude > 2000) dynamicName = `High Altitude Peak @ ${spot.altitude}m`;
            else if (spot.cloudCover < 10) dynamicName = `Clear Sky Valley`;

            let reason = "Optimal Conditions";
            if (spot.cloudCover < 15) reason = "Pristine Clarity";
            else if (spot.altitude > 1500) reason = "Above the Mist";
            else if (spot.score > 70) reason = "High Formula Score";

            return (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35 }}
                onClick={() => onSpotClick && onSpotClick(spot.lat, spot.lng, spot.id)}
                className="group relative flex flex-col gap-1 rounded-xl border border-white/8 bg-white/4 hover:bg-aurora-green/5 hover:border-aurora-green/20 px-3 py-2.5 transition-all duration-200 cursor-pointer"
              >
                {/* Rank badge */}
                <span className="absolute top-2.5 right-3 text-[10px] font-black font-mono text-slate-600 group-hover:text-aurora-green/50 transition-colors">#{i + 1}</span>

                <p className="text-white text-xs font-semibold leading-tight pr-6">{dynamicName}</p>
                <p className="text-[9px] text-aurora-green font-mono tracking-tighter uppercase mb-0.5">{reason}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-mono text-slate-500">{spot.distance}</span>
                  <span className="w-px h-3 bg-white/10" />
                  <span className={`text-[9px] font-mono font-bold ${pollutionColor[spot.lightPollution] ?? 'text-slate-400'}`}>
                    {spot.lightPollution} Light
                  </span>
                </div>

                {/* Star rating + action */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={9}
                        className={s < spot.stars ? 'text-aurora-green fill-aurora-green' : 'text-white/15'}
                      />
                    ))}
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-aurora-green font-mono border border-aurora-green/30 bg-aurora-green/10 hover:bg-aurora-green hover:text-black px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
                  >
                    DIRECTIONS
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-[9px] text-slate-600 mt-3 italic text-center font-mono">Distances approx. · Mock data</p>
      </div>
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
  last_updated: string;
}


function LocalDataSidebar({ location, forecast, fetchError }: { location: TargetLocation; forecast: LocalForecastData | null; fetchError: string | null }) {
  const { isProMode, setProMode } = useAppStore();
  const { data: session, status } = useSession();
  
  const [isAlertEnabled, setIsAlertEnabled] = useState(false);
  const [alertEmail, setAlertEmail] = useState(session?.user?.email || '');
  const [minScore, setMinScore] = useState(75);
  const [isSaving, setIsSaving] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.email && !alertEmail) {
      setAlertEmail(session.user.email);
    }
  }, [session?.user?.email]);

  const handleSaveTarget = async () => {
    if (isAlertEnabled && !alertEmail) {
      alert("Please enter an email for alerts.");
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        name: location.name,
        lat: location.lat,
        lon: location.lng,
        email: alertEmail,
        minScore,
        isAlertEnabled
      };
      
      const res = await fetch('/api/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save target");
      
      alert("Target Locked! You will be alerted when activity spikes.");
    } catch (e) {
      console.error(e);
      alert("Error saving target.");
    } finally {
      setIsSaving(false);
    }
  };

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
      className="absolute top-24 right-0 w-72 z-30 pointer-events-auto overflow-y-auto max-h-[calc(100vh-8rem)] block"
      style={{ scrollbarWidth: 'none' }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-3 pr-4 pb-12 pl-2 pt-2">
      {/* Location Header */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-black/40 backdrop-blur-lg flex flex-col gap-3 shadow-xl">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-aurora-green" />
              <span className="text-aurora-green font-mono text-xs tracking-widest uppercase">Target Lock</span>
            </div>
            <p className="text-white font-bold text-lg leading-tight">{location.name}</p>
            <p className="text-slate-400 font-mono text-xs mt-1">
              {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <AnimatePresence mode="wait">
              {status === 'authenticated' || isAlertEnabled ? (
                <motion.button
                  key="saved"
                  onClick={handleSaveTarget}
                  disabled={isSaving}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-aurora-green/10 text-aurora-green border border-aurora-green/30 shadow-lg shadow-aurora-green/10 transition-all font-mono text-[10px] uppercase tracking-tighter disabled:opacity-50"
                  title="Lock Target"
                >
                  <Bell size={12} />
                  <span>{isSaving ? "Saving..." : "Lock Target"}</span>
                </motion.button>
              ) : (
                <motion.button
                  key="login-to-save"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => signIn()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-aurora-green hover:border-aurora-green/30 transition-all text-[10px] font-mono uppercase tracking-tighter"
                >
                  <LogIn size={12} />
                  <span>Sign In to Save</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Active Monitoring Section ─── */}
        <div className="mt-2 pt-3 border-t border-white/10">
          <button 
            type="button"
            onClick={() => setIsAlertModalOpen(true)}
            className="w-full bg-white/5 hover:bg-aurora-green/10 border border-white/10 hover:border-aurora-green/50 text-slate-300 hover:text-aurora-green transition-all rounded-xl py-2.5 font-mono text-[10px] uppercase tracking-widest font-bold shadow-lg flex justify-center items-center gap-2"
          >
            [ CONFIGURE TARGET ALERTS ]
          </button>
        </div>

      </div>

      {/* ─── Alert Configuration Modal ─── */}
      <AnimatePresence>
        {isAlertModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 backdrop-blur-md bg-black/50 overflow-y-auto pointer-events-auto flex justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="mt-[15vh] w-[90%] max-w-lg h-fit bg-[#050B14]/90 border border-white/10 shadow-2xl shadow-aurora-green/20 rounded-2xl overflow-hidden backdrop-blur-xl"
            >
              <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center gap-3">
                <Bell size={18} className="text-aurora-green" />
                <h2 className="font-mono text-xs font-bold tracking-[0.2em] uppercase text-white">Telemetry Watch Alert</h2>
              </div>
              
              <div className="p-6 flex flex-col gap-6">
                {/* Target Sector */}
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Target Sector (Location)</label>
                  <input 
                    type="text" 
                    value={location.name}
                    readOnly
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-aurora-green transition-colors"
                  />
                  {/* Visual Dropdown Mock */}
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#050B14]/90 border border-white/10 rounded-xl backdrop-blur-md hidden opacity-0 pointer-events-none">
                     <p className="p-3 text-xs text-slate-400 font-mono">Suggested matches...</p>
                  </div>
                </div>

                {/* Observation Window */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Start Date</label>
                    <input 
                      type="date"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-aurora-green transition-colors scheme-dark"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">End Date</label>
                    <input 
                      type="date"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-aurora-green transition-colors scheme-dark"
                    />
                  </div>
                </div>

                {/* Comms Link */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Comms Link (Email)</label>
                  <input 
                    type="email" 
                    placeholder="operator@auroralens.ai"
                    defaultValue={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-aurora-green transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono tracking-widest uppercase text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-6 py-2 rounded-xl bg-aurora-green hover:bg-aurora-green/80 text-[#050B14] font-mono font-bold text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(0,220,130,0.4)] transition-all"
                >
                  Initialize Watch
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aurora Score */}
      {forecast ? (
        <>
          <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-black/40 backdrop-blur-lg shadow-xl">
            <p className="text-slate-400 text-xs mb-2 tracking-widest font-mono uppercase">AI Aurora Score</p>
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-white orbitron leading-none"><AnimatedNumber value={forecast.aurora_score} /></span>
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
                <span className="text-white font-bold text-xs tracking-tight"><AnimatedNumber value={forecast.temperature} format={(v) => v.toFixed(1)} />°C</span>
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
            <p className="text-[9px] text-slate-500 font-mono mt-2 mb-1">Last Updated: {forecast.last_updated.replace(' UTC', '')} UTC</p>
            
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

            {/* Predictive Alert Toggle (Phase 9.0) */}
            {status === 'authenticated' && (
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-aurora-green font-mono uppercase tracking-widest flex items-center gap-1.5 shadow-aurora-green/20">
                  <Bell size={12} /> Predictive 12h Alerts
                </span>
                <button 
                  onClick={() => console.log('Predictive Alerts Toggled')}
                  className={`w-8 h-4 rounded-full transition-colors relative bg-aurora-green shadow-[0_0_10px_rgba(0,220,130,0.3)] cursor-pointer`}
                >
                  <motion.div 
                    className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                    animate={{ x: 16 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            )}
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
                <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-black/40 backdrop-blur-lg shadow-xl mt-1">
                  <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                    <p className="text-slate-400 text-xs tracking-widest font-mono uppercase">Live Telemetry</p>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-green opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-aurora-green"></span>
                      </span>
                      <span className="text-[9px] font-mono text-aurora-green uppercase tracking-widest">Live Satellite Feed: ACTIVE</span>
                    </div>
                  </div>
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
      ) : fetchError ? (
        <div className="glass-panel rounded-2xl p-4 border border-red-500/30 bg-red-900/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <CloudOff size={16} />
            <span className="text-xs font-mono font-bold uppercase tracking-widest">Forecast Unavailable</span>
          </div>
          <p className="text-slate-500 text-[10px] leading-relaxed">
            Could not reach the backend. Make sure the FastAPI server is running on port 8000.
          </p>
          <p className="text-red-500/60 text-[9px] font-mono mt-2 break-all">{fetchError}</p>
        </div>
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
      </div>
    </motion.div>
  );
}

// ─── Main LocationMap Component ───────────────────────────────────────────

export default function LocationMap() {
  const mapRef = useRef<MapRef>(null);
  const { viewMode, targetLocation, returnToGlobal, timeScrubber } = useAppStore();
  const [forecast, setForecast] = useState<LocalForecastData | null>(null);
  const [primeSpots, setPrimeSpots] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);
  const [mapStyleUrl, setMapStyleUrl] = useState('https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json');

  // ─── Map Resizing to clear bezels ──────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.getMap().resize();
      }
    };
    window.addEventListener('resize', handleResize);
    // Add a slight delay initial resize to catch late DOM paints
    setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Fetch local forecast when targetLocation changes ─────────────────
  useEffect(() => {
    if (!targetLocation) return;
    setForecast(null);
    setFetchError(null);

    const url = `http://localhost:8000/api/weather/forecast/global?lat=${targetLocation.lat}&lon=${targetLocation.lng}&hour_offset=${timeScrubber}`;
    console.log('[LocationMap] Fetching forecast:', url);

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data: LocalForecastData = await res.json();
        console.log('[LocationMap] Forecast received:', data);
        // Guard: ensure the response looks like a valid forecast object
        if (typeof data?.aurora_score !== 'number') {
          throw new Error('Unexpected response shape from API');
        }
        setForecast(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[LocationMap] Forecast fetch failed:', msg);
        setFetchError(msg);
        setForecast(null);
      }
    })();

    // Fetch prime viewing spots
    fetch(`/api/sightseeing?lat=${targetLocation.lat}&lon=${targetLocation.lng}`)
      .then(r => r.json())
      .then(data => setPrimeSpots(data))
      .catch(err => console.error("Failed to fetch sightseeing spots", err));

  }, [targetLocation, timeScrubber]);

  // Keep a ref that always has the latest targetLocation
  const targetLocationRef = useRef(targetLocation);
  useEffect(() => {
    targetLocationRef.current = targetLocation;
  }, [targetLocation]);

  const doFlyTo = (map: ReturnType<MapRef['getMap']>, overwriteLoc?: { lat: number, lng: number, zoom?: number }) => {
    const loc = overwriteLoc || targetLocationRef.current;
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
            onClick={() => {
              setSelectedSpotId(null);
              returnToGlobal();
            }}
            className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-5 py-2.5 rounded-full hover:bg-aurora-green/20 hover:border-aurora-green/50 hover:text-aurora-green transition-all font-mono text-xs tracking-widest uppercase shadow-2xl group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Global View
          </motion.button>


          {/* ─── Local Sidebar ─── */}
          <LocalInsightsSidebar 
            forecast={forecast} 
            primeSpots={primeSpots} 
            onSpotClick={(lat, lng, id) => {
              setSelectedSpotId(id);
              const map = mapRef.current?.getMap();
              if (map) doFlyTo(map, { lat, lng, zoom: 10 });
            }}
          />
          <LocalDataSidebar location={targetLocation} forecast={forecast} fetchError={fetchError} />

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
                mapStyle={mapStyleUrl}
                maxPitch={85}
                minZoom={0}
              >
                {/* ─── Prime Spots Market Overlays ─── */}
                {primeSpots.map((spot, i) => {
                  const isSelected = selectedSpotId === spot.id;
                  const isHovered = hoveredSpotId === spot.id;
                  
                  const clarity = Math.max(0, 100 - (spot.cloudCover || 0)).toFixed(0);
                  const dynamicName = spot.altitude > 2000 ? `High Ridge @ ${spot.altitude}m` : `Peak @ ${spot.altitude || 0}m`;
                  
                  return (
                    <Marker key={spot.id} longitude={spot.lng} latitude={spot.lat} anchor="bottom">
                      <div 
                        className="relative flex flex-col items-center cursor-pointer group"
                        onMouseEnter={() => setHoveredSpotId(spot.id)}
                        onMouseLeave={() => setHoveredSpotId(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSpotId(spot.id);
                          const map = mapRef.current?.getMap();
                          if (map) doFlyTo(map, { lat: spot.lat, lng: spot.lng, zoom: 10 });
                        }}
                      >
                        {/* Detailed Label (Clicked) */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="absolute bottom-6 flex flex-col items-center pointer-events-none z-70 whitespace-nowrap"
                            >
                              <div className="bg-black/80 backdrop-blur-md border border-aurora-green/50 px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(0,220,130,0.3)] flex flex-col items-center gap-0.5">
                                <span className="text-white text-[11px] font-bold font-mono">{dynamicName}</span>
                                <span className="text-aurora-green text-[9px] font-mono tracking-wider">{clarity}% Clear</span>
                              </div>
                              <div className="w-px h-3 bg-aurora-green/80 mt-0.5" />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Minimal Tooltip (Hover) */}
                        <AnimatePresence>
                          {!isSelected && isHovered && (
                            <motion.div 
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 2 }}
                              className="absolute bottom-4 flex flex-col items-center pointer-events-none z-60 whitespace-nowrap"
                            >
                              <div className="bg-black/60 backdrop-blur-sm border border-white/20 px-2 py-1 rounded text-white text-[9px] font-mono shadow-md">
                                {dynamicName}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Main Point Marker */}
                        <motion.div 
                          animate={{ scale: isSelected ? 1.4 : isHovered ? 1.2 : 1 }}
                          className="relative flex items-center justify-center"
                        >
                          {isSelected && (
                            <div className="absolute inset-0 rounded-full bg-aurora-green/40 animate-ping" />
                          )}
                          <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,220,130,0.8)] ${isSelected ? 'bg-white' : 'bg-aurora-green'}`} />
                        </motion.div>
                      </div>
                    </Marker>
                  );
                })}
              </Map>
              {/* ─── Center Crosshair Overlay (Removed per user request) ─── */}
            </div>

            {/* ─── Floating Action Buttons (Bottom Right) ─── */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute bottom-12 md:bottom-12 right-6 z-40 flex flex-col gap-3 pointer-events-auto shadow-2xl"
            >
              <button 
                onClick={() => setMapStyleUrl(prev => prev.includes('dark-matter') ? 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json' : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json')}
                className={`w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-slate-300 hover:border-aurora-green hover:text-aurora-green transition-all flex items-center justify-center shadow-lg`} 
                title="Toggle Topographic Overlay">
                <Layers size={20} />
              </button>
            </motion.div>

            {/* ─── Timeline Scrubber ─── */}
            <TimelineScrubber />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
