'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import Map, { MapRef, Marker, Source, Layer, AttributionControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { ArrowLeft, Target, Zap, Eye, Wind, CloudOff, Cloud, Bell, Layers, MapPin, Star, Search, Settings2 } from 'lucide-react';
import { useAppStore, TargetLocation } from '@/store/useAppStore';
import { subscribeToAlerts } from '@/app/actions/alertActions';
import TimelineScrubber from './TimelineScrubber';
import AIAssistantModal from './ui/AIAssistantModal';
import MapSearchBar from './ui/MapSearchBar';

const CARTO_DARK = {
  version: 8 as const,
  sources: {
    'carto-dark': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster' as const,
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};
const MAP_STYLE = CARTO_DARK;

function AnimatedNumber({ value, format }: { value: number, format?: (v: number) => string }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => format ? format(current) : current.toFixed(0));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export function getTacticalIntelligence(score: number) {
  if (score < 45) return { title: "MINIMAL ACTIVITY", color: "text-slate-400", border: "border-slate-500/10" };
  if (score <= 55) return { title: "TRANSITIONAL SHIFT", color: "text-amber-500", border: "border-amber-500/20" };
  if (score < 65) return { title: "ACTIVE SUBSTORM", color: "text-cyan-400", border: "border-cyan-400/20" };
  if (score <= 75) return { title: "HIGH INTENSITY", color: "text-sky-400", border: "border-sky-400/20" };
  if (score < 85) return { title: "SEVERE STORM", color: "text-purple-400", border: "border-purple-400" };
  return { title: "HISTORIC ANOMALY", color: "text-rose-500", border: "border-rose-500" };
}

// ─── Scenic Lore Sidebar ───────────────────────────────────────────────────────────────

function ScenicLoreSidebar() {
  const { scenicName, scenicRegion, scenicLore } = useAppStore();

  return (
    <motion.div
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -80, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="absolute top-24 left-8 w-80 z-50 flex flex-col gap-6 pointer-events-auto"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Location Header */}
      <div className="mb-2">
        <p className="text-cyan-400/80 text-xs font-semibold tracking-[0.2em] uppercase mb-1">Scenic Destination</p>
        <h2 className="text-4xl font-semibold text-slate-100 tracking-tight">{scenicName || 'Aurora Hotspot'}</h2>
        <p className="text-slate-300 font-light text-sm">{scenicRegion || 'Unknown Region'}</p>
      </div>

      {/* Dynamic Lore Cards */}
      {scenicLore && scenicLore.length > 0 && (
        <>
          {/* Geographic Anomaly Card */}
          {scenicLore[0] && (
            <div className="glass-panel p-5 bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-cyan-400/20 to-transparent" />
              <p className="font-semibold text-[10px] tracking-[0.2em] text-cyan-400/80 uppercase mb-3 border-b border-white/5 pb-2">Geographic Anomaly</p>
              <p className="text-slate-300 text-sm leading-relaxed font-light">{scenicLore[0]}</p>
            </div>
          )}

          {/* Cultural / Historical Card */}
          {scenicLore[1] && (
            <div className="glass-panel p-5 bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-cyan-400/20 to-transparent" />
              <p className="font-semibold text-[10px] tracking-[0.2em] text-cyan-400/80 uppercase mb-3 border-b border-white/5 pb-2">Cultural & Historical</p>
              <p className="text-slate-300 text-sm leading-relaxed font-light">{scenicLore[1]}</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

function LocalInsightsSidebar({ forecast, primeSpots, onSpotClick, locationName, temperature, scenicMode }: { forecast: LocalForecastData | null; primeSpots: any[]; onSpotClick?: (lat: number, lng: number, id: string) => void; locationName?: string; temperature?: number | null; scenicMode?: boolean }) {
  // ── Scenic Mode: show lore sidebar instead of analytics ──
  if (scenicMode) return <ScenicLoreSidebar />;
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [tacticalBrief, setTacticalBrief] = useState('Awaiting satellite telemetry...');
  const [isBriefLoading, setIsBriefLoading] = useState(true);

  const advisoryColor = useMemo(() => {
    if (!forecast) return { border: 'border-slate-500', color: 'text-slate-500' };
    return getTacticalIntelligence(forecast.aurora_score);
  }, [forecast?.aurora_score]);

  useEffect(() => {
    if (!forecast || !locationName) return;
    
    let isMounted = true;
    setIsBriefLoading(true);
    
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch('/api/tactical-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: forecast.aurora_score,
            location: locationName,
            cloudCover: forecast.cloud_cover,
            temperature: forecast.temperature
          })
        });
        if (!res.ok) throw new Error('Uplink failed');
        const data = await res.json();
        if (isMounted && data.brief) {
          setTacticalBrief(data.brief);
        }
      } catch (e) {
        if (isMounted) setTacticalBrief('Telemetry connection lost. Rely on local radar.');
      } finally {
        if (isMounted) setIsBriefLoading(false);
      }
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [forecast?.aurora_score, locationName]);

  if (!forecast) return null;

  const getPhotographyInsight = () => {
    if (forecast.aurora_score > 70) return { text: "Perfect for Camera", sub: "Vivid colors & movement", icon: <Zap size={14} className="text-yellow-400" /> };
    if (forecast.aurora_score > 30) return { text: "Long Exposure Required", sub: "Use 10-20s shutter speed", icon: <Eye size={14} className="text-sky-400" /> };
    return { text: "Low Light Target", sub: "Sensor noise likely", icon: <CloudOff size={14} className="text-red-400" /> };
  };

  const getSkyInsight = () => {
    if (forecast.cloud_cover < 10) return { text: "Pristine Dark Sky", sub: "Zero interference", icon: <Target size={14} className="text-cyan-400" /> };
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



  const pollutionColor: Record<string, string> = {
    Minimal:  'text-cyan-400',
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
      className="w-full z-30 pointer-events-auto md:absolute md:top-24 md:left-0 md:w-72 md:overflow-y-auto md:max-h-[calc(100vh-8rem)]"
      style={{ scrollbarWidth: 'none' }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-3 pl-4 pb-8 pr-2 pt-2">

      {/* ─── Site Intelligence ─── */}
      <div className={`glass-panel rounded-r-2xl p-4 border-l-2 bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 shadow-2xl ${advisoryColor.border}`}>
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className={advisoryColor.color} />
          <span className={`font-semibold text-[10px] tracking-[0.2em] uppercase ${advisoryColor.color}`}>Site Intelligence</span>
        </div>
        <p className={`font-light text-sm leading-relaxed opacity-100 text-slate-300 ${isBriefLoading ? 'animate-pulse' : ''}`}>{tacticalBrief}</p>
      </div>

      {/* ─── Main AI Insights ─── */}
      <div className="glass-panel rounded-3xl p-4 bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/10 rounded-xl">
              <Zap size={14} className="text-cyan-400" />
            </div>
            <span className="text-cyan-400 font-semibold text-[10px] tracking-[0.2em] uppercase">AI Insights</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-semibold">Temp</span>
            <span className="text-slate-100 font-semibold text-xs"><AnimatedNumber value={forecast.temperature} format={(v) => v.toFixed(1)} />°C</span>
          </div>
        </div>

        {(() => {
          const isVisible = forecast.aurora_score >= 50;

          if (!isVisible) {
            return (
              <div className="flex flex-col items-center justify-center p-6 border border-amber-500/20 bg-amber-500/10 rounded-xl space-y-4 mb-4">
                <Target size={24} className="text-amber-500 opacity-80" />
                <span className="text-amber-500 font-mono text-center text-[10px] leading-relaxed uppercase font-bold tracking-widest">
                  OPTICAL SENSORS STANDBY<br/>
                  <span className="text-amber-500/70 text-[9px] tracking-normal">Conditions sub-optimal for photography.</span>
                </span>
              </div>
            );
          }

          return (
            <>
              <div className="space-y-4">
                {[
                  { label: "Photography", ...photo },
                  { label: "Sky Condition", ...sky },
                  { label: "Visibility", ...vis }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="mt-1">{item.icon}</div>
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[9px] uppercase tracking-[0.2em] font-semibold mb-0.5">{item.label}</span>
                      <p className="text-slate-100 font-semibold text-sm leading-tight">{item.text}</p>
                      <p className="text-slate-400 font-light text-[10px] mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center p-2 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-semibold">Aperture</span>
                  <span className="text-slate-200 font-medium text-xs mt-1">f/2.8</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-semibold">Exposure</span>
                  <span className="text-slate-200 font-medium text-xs mt-1">15s</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[8px] text-slate-500 uppercase tracking-[0.2em] font-semibold">ISO</span>
                  <span className="text-slate-200 font-medium text-xs mt-1">1600+</span>
                </div>
              </div>

              <button 
                onClick={() => setIsAIModalOpen(true)}
                className="w-full py-3 mt-3 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-xl transition-colors group"
              >
                <Zap size={14} className="group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-[9px] tracking-[0.2em] uppercase">INITIATE AI PHOTO ASSISTANT</span>
              </button>
            </>
          );
        })()}

        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[10px] text-slate-500 italic leading-relaxed">
            AI has analyzed local atmospherics. {forecast.aurora_score >= 50 ? "Great opportunity for sighting." : "Conditions are sub-optimal."}
          </p>
        </div>
      </div>

      {/* ─── Prime Viewing Spots ─── */}
      <div className="glass-panel rounded-3xl p-4 bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-cyan-400/15 rounded-xl">
            <MapPin size={14} className="text-cyan-400" />
          </div>
          <span className="text-cyan-400 font-semibold text-[10px] tracking-[0.2em] uppercase">Prime Viewing Spots</span>
        </div>

        <div className="flex flex-col gap-2">
          {forecast && forecast.aurora_score >= 40 ? (
            Array.isArray(primeSpots) && primeSpots.map((spot, i) => {
            let dynamicName = spot.name || `Peak @ ${spot.altitude || 0}m`;
            if (!spot.name) {
              if (spot.altitude > 2000) dynamicName = `High Altitude Peak @ ${spot.altitude}m`;
              else if (spot.cloudCover < 10) dynamicName = `Clear Sky Valley`;
            }

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
                className="group relative flex flex-col gap-1 rounded-2xl border border-white/5 bg-white/5 hover:bg-cyan-400/5 hover:border-cyan-400/20 px-3 py-2.5 transition-all duration-200 cursor-pointer"
              >
                {/* Rank badge */}
                <span className="absolute top-2.5 right-3 text-[10px] font-bold text-slate-600 group-hover:text-cyan-400/50 transition-colors">#{i + 1}</span>

                <p className="text-slate-100 text-xs font-semibold leading-tight pr-6">{dynamicName}</p>
                <p className="text-[9px] text-cyan-400 font-semibold tracking-[0.1em] uppercase mb-0.5">{reason}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-semibold tracking-wider text-slate-500">{spot.distance}</span>
                  <span className="w-px h-3 bg-white/10" />
                  <span className={`text-[9px] font-semibold ${pollutionColor[spot.lightPollution] ?? 'text-slate-400'}`}>
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
                        className={s < spot.stars ? 'text-cyan-400 fill-cyan-400' : 'text-white/15'}
                      />
                    ))}
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] text-cyan-400 font-semibold tracking-[0.1em] border border-cyan-400/30 bg-cyan-400/10 hover:bg-cyan-400 hover:text-black px-2 py-0.5 rounded-full transition-colors flex items-center gap-1"
                  >
                    DIRECTIONS
                  </a>
                </div>
              </motion.div>
            );
          })) : (
            <div className="flex flex-col items-center justify-center p-6 border border-white/5 bg-white/5 rounded-2xl space-y-3 mt-2">
              <CloudOff size={24} className="text-slate-500 opacity-80" />
              <span className="text-slate-400 font-semibold text-center text-[10px] leading-relaxed uppercase tracking-[0.2em]">
                NO PRIME SPOTS AVAILABLE<br/>
                <span className="text-slate-500 text-[9px] tracking-normal">Aurora visibility is too low.</span>
              </span>
            </div>
          )}
        </div>

        <p className="text-[9px] text-slate-600 mt-3 italic text-center font-semibold tracking-wider">Distances approx.</p>
      </div>
      </div>
      <AIAssistantModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        locationName={locationName}
        auroraScore={forecast.aurora_score}
        temperature={temperature}
      />
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


function LocalDataSidebar({ location, forecast, fetchError, scenicMode }: { location: TargetLocation; forecast: LocalForecastData | null; fetchError: string | null; scenicMode?: boolean }) {
  const { isProMode, setProMode } = useAppStore();
  
  const [isAlertEnabled, setIsAlertEnabled] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [startDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    return tom.toISOString().split('T')[0];
  });
  const [maxEndDate] = useState(() => {
    const max = new Date();
    max.setMonth(max.getMonth() + 6);
    return max.toISOString().split('T')[0];
  });
  const [minScore, setMinScore] = useState(75);
  const [isSaving, setIsSaving] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isInitializingWatch, setIsInitializingWatch] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('aurora_target_email');
      if (savedEmail) {
        setAlertEmail(savedEmail);
      }
    }
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInitializeWatch = async () => {
    const errors = [];
    if (!startDate) errors.push('startDate');
    if (!endDate) errors.push('endDate');
    if (!alertEmail) errors.push('alertEmail');
    if (!location?.name) errors.push('location');

    setFormErrors(errors);
    if (errors.length > 0) return;

    setIsInitializingWatch(true);

    try {
      const result = await subscribeToAlerts({
        email: alertEmail,
        target_location: location.name,
        latitude: location.lat,
        longitude: location.lng,
        start_date: startDate,
        end_date: endDate,
      });

      if (result.success) {
        setIsAlertModalOpen(false);
        setFormErrors([]);
        showToast('success', '[ SYSTEM ] Telemetry watch established.');
      } else {
        showToast('error', `[ ERROR ] ${result.error ?? 'Uplink failed. Retry.'}`);
      }
    } catch (err) {
      showToast('error', '[ ERROR ] Could not reach uplink server.');
    } finally {
      setIsInitializingWatch(false);
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
      className="w-full z-30 pointer-events-auto md:absolute md:top-24 md:right-0 md:w-72 md:overflow-y-auto md:max-h-[calc(100vh-8rem)]"
      style={{ scrollbarWidth: 'none' }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-3 p-4 md:pr-4 md:pb-12 md:pl-2 md:pt-2">
      {/* Location Header */}
      <div className="glass-panel rounded-3xl p-4 bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 flex flex-col gap-3 shadow-xl">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} className="text-cyan-400" />
              <span className="text-cyan-400 font-semibold text-[10px] tracking-[0.2em] uppercase">Target Lock</span>
            </div>
            <p className="text-slate-100 font-semibold text-lg leading-tight">{location.name}</p>
            <p className="text-slate-400 font-semibold tracking-wider text-xs mt-1">
              {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
          </div>
        </div>

        {/* ─── Active Monitoring Section ─── */}
        <div className="mt-2 pt-3 border-t border-white/5">
          <button 
            type="button"
            onClick={() => setIsAlertModalOpen(true)}
            className="w-full bg-white/5 hover:bg-cyan-400/10 border border-white/5 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-400 transition-all rounded-2xl py-2.5 font-semibold tracking-[0.2em] text-[10px] uppercase shadow-lg flex justify-center items-center gap-2"
          >
            CONFIGURE TARGET ALERTS
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
              className="mt-[15vh] w-[90%] max-w-lg h-fit bg-[#080B11]/40 border border-white/5 shadow-2xl shadow-cyan-400/10 rounded-3xl overflow-hidden backdrop-blur-2xl"
            >
              <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                <Bell size={18} className="text-cyan-400" />
                <h2 className="font-semibold text-xs tracking-[0.2em] uppercase text-slate-100">Telemetry Watch Alert</h2>
              </div>
              
              <div className="p-6 flex flex-col gap-6">
                {/* Target Sector */}
                <div className="flex flex-col gap-2 relative">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">Target Sector (Location)</label>
                  <input 
                    type="text" 
                    value={location.name}
                    readOnly
                    className="w-full bg-[#080B11]/50 border border-white/5 rounded-2xl px-4 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-cyan-400 transition-colors"
                  />
                  {/* Visual Dropdown Mock */}
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#050B14]/90 border border-white/10 rounded-xl backdrop-blur-md hidden opacity-0 pointer-events-none">
                     <p className="p-3 text-xs text-slate-400 font-medium">Suggested matches...</p>
                  </div>
                </div>

                {/* Observation Window */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">Start Date</label>
                    <input 
                      type="date"
                      value={startDate}
                      readOnly
                      className="w-full bg-black/80 border border-white/5 rounded-2xl px-3 py-2 text-xs text-slate-500 font-medium cursor-not-allowed scheme-dark"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">End Date</label>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      max={maxEndDate}
                      className={`w-full bg-[#080B11]/50 border ${formErrors.includes('endDate') ? 'border-red-500' : 'border-white/5'} rounded-2xl px-3 py-2 text-xs text-slate-300 font-medium focus:outline-none focus:border-cyan-400 transition-colors scheme-dark`}
                    />
                  </div>
                </div>

                {/* Comms Link */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">Comms Link (Email)</label>
                  <input 
                    type="email" 
                    placeholder="operator@auroralens.ai"
                    value={alertEmail}
                    onChange={(e) => {
                      setAlertEmail(e.target.value);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('aurora_target_email', e.target.value);
                      }
                    }}
                    className={`w-full bg-cyan-400/10 border ${formErrors.includes('alertEmail') ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.15)]'} rounded-2xl px-4 py-3 text-sm text-cyan-400 placeholder-cyan-400/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-[#080B11] border-t border-white/5 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsAlertModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold tracking-[0.2em] uppercase text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleInitializeWatch}
                  disabled={isInitializingWatch}
                  className="px-6 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-400/80 text-[#050B14] font-bold text-xs tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50"
                >
                  {isInitializingWatch ? 'INITIATING UPLINK...' : 'INITIALIZE WATCH'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Terminal Toast ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-200 px-6 py-3 rounded-2xl border text-xs tracking-[0.2em] uppercase font-semibold shadow-2xl backdrop-blur-2xl ${
              toast.type === 'success'
                ? 'bg-cyan-400/10 border-cyan-400/40 text-cyan-400 shadow-cyan-400/20'
                : 'bg-red-500/10 border-red-500/40 text-red-400 shadow-red-500/20'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aurora Score */}
      {forecast ? (
        <>
          <div className="glass-panel rounded-3xl p-4 border border-white/5 bg-[#080B11]/40 backdrop-blur-2xl shadow-xl">
            <p className="text-slate-400 text-xs mb-2 tracking-[0.2em] uppercase font-semibold">AI Aurora Score</p>
            <div className="flex justify-between items-end mb-3">
              <div className="flex items-end gap-3">
                <span className="text-5xl font-semibold text-slate-100 leading-none"><AnimatedNumber value={forecast.aurora_score} /></span>
                <span className="text-slate-500 flex items-center justify-center font-semibold text-sm mb-1 pb-1">/100</span>
              </div>
              
              <div className="flex flex-col items-end text-slate-300">
                <div className="flex items-center gap-1 mb-1">
                  <Cloud size={12} className={forecast.cloud_cover > 50 ? 'text-slate-400' : 'text-sky-400'} />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-semibold">Clouds</span>
                </div>
                <span className="text-xl font-semibold tracking-tight">{forecast.cloud_cover.toFixed(0)}%</span>
              </div>
            </div>

            {/* Weather Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white/5 rounded-2xl p-2 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-1">Temp</span>
                <span className="text-slate-200 font-medium text-xs tracking-tight"><AnimatedNumber value={forecast.temperature} format={(v) => v.toFixed(1)} />°C</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-2 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-1">Precip</span>
                <span className="text-slate-200 font-medium text-xs tracking-tight">{forecast.precipitation.toFixed(1)}mm</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-2 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-1">Light Poll.</span>
                <span className="text-slate-200 font-medium text-xs tracking-tight">Bortle 4</span>
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
            {(() => {
              const intel = getTacticalIntelligence(forecast.aurora_score);
              return (
                <p className={`text-sm font-bold mt-2 ${intel.color}`}>
                  {intel.title}
                </p>
              );
            })()}
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-2 mb-1">Last Updated: {forecast.last_updated.replace(' UTC', '')} UTC</p>
            
            {/* Pro Mode Toggle - hidden in scenic mode */}
            {!scenicMode && (
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5">
                <Settings2 size={12} /> Pro Telemetry
              </span>
              <button 
                onClick={() => setProMode(!isProMode)}
                className={`w-8 h-4 rounded-full transition-colors relative ${isProMode ? 'bg-cyan-400' : 'bg-white/20'}`}
              >
                <motion.div 
                  className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-sm"
                  animate={{ x: isProMode ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
            )}

          </div>

          {/* Live Telemetry - hidden in scenic mode */}
          <AnimatePresence>
            {isProMode && !scenicMode && (
              <motion.div 
                initial={{ height: 0, opacity: 0, scale: 0.95 }}
                animate={{ height: 'auto', opacity: 1, scale: 1 }}
                exit={{ height: 0, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="glass-panel rounded-3xl p-4 bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 shadow-xl mt-1">
                  <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                    <p className="text-slate-400 text-xs tracking-[0.2em] uppercase font-semibold">Live Telemetry</p>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                      </span>
                      <span className="text-[9px] font-semibold text-cyan-400 uppercase tracking-[0.2em]">Live Satellite Feed: ACTIVE</span>
                    </div>
                  </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Bz', value: `${forecast.telemetry.bz_nt.toFixed(1)} nT`, icon: <Wind size={10} /> },
                { label: 'Bt', value: `${forecast.telemetry.bt_nt.toFixed(1)} nT`, icon: <Zap size={10} /> },
                { label: 'Speed', value: `${forecast.telemetry.speed_km_s.toFixed(0)} km/s`, icon: <Eye size={10} /> },
                { label: 'Density', value: `${forecast.telemetry.density_p_cm3.toFixed(1)} p/cc`, icon: <CloudOff size={10} /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-white/5 rounded-2xl p-2.5">
                  <div className="flex items-center gap-1 text-slate-500 mb-1">{icon}<span className="text-xs uppercase tracking-[0.2em] font-semibold">{label}</span></div>
                  <p className="text-slate-200 font-medium text-sm">{value}</p>
                </div>
              ))}
                </div>
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : fetchError ? (
        <div className="glass-panel rounded-3xl p-4 border border-red-500/30 bg-red-900/10 backdrop-blur-2xl">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <CloudOff size={16} />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Forecast Unavailable</span>
          </div>
          <p className="text-slate-300 text-[10px] leading-relaxed">
            Could not reach the backend. Make sure the FastAPI server is running on port 8000.
          </p>
          <p className="text-red-500/60 text-[9px] font-medium mt-2 break-all">{fetchError}</p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl p-4 border border-white/5 bg-[#080B11]/40 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-2 text-slate-400">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
              <Cloud size={16} />
            </motion.div>
            <span className="text-xs font-semibold tracking-wider">Fetching local forecast...</span>
          </div>
        </div>
      )}
      </div>
    </motion.div>
  );
}

import { BACKEND_URL } from '@/lib/api-config';

// ─── Main LocationMap Component ───────────────────────────────────────────

export default function LocationMap() {
  const mapRef = useRef<MapRef>(null);
  const { viewMode, targetLocation, returnToGlobal, timeScrubber, scenicMode } = useAppStore();
  const [forecast, setForecast] = useState<LocalForecastData | null>(null);
  const [primeSpots, setPrimeSpots] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);
  const [mapStyleUrl, setMapStyleUrl] = useState<string | any>(MAP_STYLE);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ─── Geographically Bound Aurora (Heatmap) ──────────────────────────────
  const scenicAuroraData = useMemo(() => {
    if (!scenicMode || !targetLocation) return null;
    
    const features = [];
    const count = 12;
    // Generate points slightly randomized around the center to create a spread
    for (let i = 0; i < count; i++) {
      features.push({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [
            targetLocation.lng + (Math.random() - 0.5) * 0.08, // wider spread for atmosphere
            targetLocation.lat + (Math.random() - 0.5) * 0.08
          ]
        },
        properties: {
          intensity: 0.5 + Math.random() * 0.5
        }
      });
    }
    
    return {
      type: 'FeatureCollection' as const,
      features
    };
  }, [scenicMode, targetLocation]);

  const auroraHeatmapLayer: any = {
    id: 'aurora-heatmap',
    type: 'heatmap',
    paint: {
      'heatmap-weight': ['get', 'intensity'],
      'heatmap-intensity': 1,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.4, 'rgba(16, 185, 129, 0.4)', // Emerald
        0.6, 'rgba(6, 182, 212, 0.6)',  // Cyan
        0.8, 'rgba(167, 139, 250, 0.8)' // Deep Purple
      ],
      'heatmap-radius': 150,
      'heatmap-opacity': scenicMode ? 0.7 : 0
    }
  };

  // ─── Sync mapStyleUrl with theme ────────────
  useEffect(() => {
    setMapStyleUrl(MAP_STYLE);
  }, [mapTheme]);

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

    const url = `${BACKEND_URL}/api/weather/forecast/global?lat=${targetLocation.lat}&lon=${targetLocation.lng}&hour_offset=${timeScrubber}`;

    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data: LocalForecastData = await res.json();

        // Guard: ensure the response looks like a valid forecast object
        if (typeof data?.aurora_score !== 'number') {
          throw new Error('Unexpected response shape from API');
        }
        setForecast(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setFetchError(msg);
        setForecast(null);
      }
    })();

    // Fetch prime viewing spots
    fetch(`/api/sightseeing/spots?lat=${targetLocation.lat}&lon=${targetLocation.lng}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPrimeSpots(data);
        } else {
          setPrimeSpots([]);
        }
      })
      .catch(err => {
        setPrimeSpots([]);
      });

  }, [targetLocation, timeScrubber]);

  // Keep a ref that always has the latest targetLocation
  const targetLocationRef = useRef(targetLocation);
  useEffect(() => {
    targetLocationRef.current = targetLocation;
  }, [targetLocation]);

  const doFlyTo = (map: ReturnType<MapRef['getMap']>, overwriteLoc?: { lat: number, lng: number, zoom?: number }) => {
    const loc = overwriteLoc || targetLocationRef.current;
    if (!loc) return;

    // Google Maps Logic: Optical Centering
    // We shift the geographic center to the "visual center" by accounting for UI overlays.
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // On mobile, the HUD is at the bottom (approx 45% of height).
    // On desktop, we have sidebars on left and right (approx 320px each).
    const padding = isMobile 
      ? { top: 60, bottom: window.innerHeight * 0.45, left: 0, right: 0 } 
      : { top: 40, bottom: 40, left: 0, right: 0 };

    setTimeout(() => {
      map.flyTo({
        center: [loc.lng, loc.lat],
        zoom: loc.zoom || 8.5,
        pitch: 45,
        bearing: -15,
        padding: padding,
        duration: 4000,
        easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      });
    }, 200);
  };

  // ─── flyTo on targetLocation change (when map is already mounted & ready) ─
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !targetLocation || !mapReady) return;
    doFlyTo(map);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLocation]);

  const buffer = 1.5;
  const postFlyBounds: [number, number, number, number] | undefined = targetLocation
    ? [
        targetLocation.lng - buffer,
        targetLocation.lat - buffer,
        targetLocation.lng + buffer,
        targetLocation.lat + buffer,
      ]
    : undefined;

  // ─── Cinematic Camera Orbit (scenic mode only) ──────────────────────────────────
  const orbitFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!scenicMode || !mapReady) return;

    // Wait for the flyTo animation to complete (~4s) before starting orbit
    const startDelay = setTimeout(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      const orbit = () => {
        const currentBearing = map.getBearing();
        map.setBearing(currentBearing + 0.04);
        orbitFrameRef.current = requestAnimationFrame(orbit);
      };
      orbitFrameRef.current = requestAnimationFrame(orbit);
    }, 4500); // start after flyTo lands

    return () => {
      clearTimeout(startDelay);
      if (orbitFrameRef.current !== null) {
        cancelAnimationFrame(orbitFrameRef.current);
        orbitFrameRef.current = null;
      }
    };
  }, [scenicMode, mapReady]);

  // Listen to spot list clicks from HUD
  useEffect(() => {
    const handleFlyToSpot = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { lat, lng } = customEvent.detail;
      const map = mapRef.current?.getMap();
      if (map) doFlyTo(map, { lat, lng, zoom: map.getZoom() });
    };
    window.addEventListener('flyToSpot', handleFlyToSpot);
    return () => window.removeEventListener('flyToSpot', handleFlyToSpot);
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      <Map
        ref={mapRef}
        attributionControl={false}
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 2,
          pitch: 45,
          bearing: -15,
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
        maxZoom={20}
        dragPan={true}
        scrollZoom={true}
        doubleClickZoom={true}
      >
        <AttributionControl compact={true} position="bottom-right" customAttribution="" />

        {/* Aurora heatmap effectively removed per user directive */}

        {/* ─── Target Location Marker (Searched / Current Location) ─── */}
        {targetLocation && (
          <Marker longitude={targetLocation.lng} latitude={targetLocation.lat} anchor="center">
            <div className="relative flex items-center justify-center pointer-events-none">
              {/* Outer ping animation */}
              <div className="absolute w-8 h-8 bg-white/30 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
              {/* Inner pulse */}
              <div className="absolute w-4 h-4 bg-white/50 rounded-full animate-pulse" />
              {/* Core white dot */}
              <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] relative z-10" />
            </div>
          </Marker>
        )}

        {Array.isArray(primeSpots) && primeSpots.map((spot) => {
          const isSelected = selectedSpotId === spot.id;
          const isHovered = hoveredSpotId === spot.id;
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
                  if (map) doFlyTo(map, { lat: spot.lat, lng: spot.lng, zoom: map.getZoom() });
                }}
              >
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="absolute bottom-6 flex flex-col items-center pointer-events-none z-70 whitespace-nowrap"
                    >
                      <div className="bg-[#080B11]/80 backdrop-blur-3xl border border-cyan-400/50 px-3 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] flex flex-col items-center gap-0.5">
                        <span className="text-white text-[11px] font-semibold">{dynamicName}</span>
                      </div>
                      <div className="w-px h-3 bg-cyan-400/80 mt-0.5" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {!isSelected && isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 2 }}
                      className="absolute bottom-4 flex flex-col items-center pointer-events-none z-60 whitespace-nowrap"
                    >
                      <div className="bg-[#080B11]/60 backdrop-blur-xl border border-white/10 px-2 py-1 rounded text-white text-[9px] font-medium shadow-md">
                        {dynamicName}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div animate={{ scale: isSelected ? 1.4 : isHovered ? 1.2 : 1 }} className="relative flex items-center justify-center">
                  {isSelected && <div className="absolute inset-0 rounded-full bg-cyan-400/40 animate-ping" />}
                  <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] ${isSelected ? 'bg-white' : 'bg-cyan-400'}`} />
                </motion.div>
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
