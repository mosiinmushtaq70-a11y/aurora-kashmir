'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, isDossierAvailable, getDossierId } from '@/store/useAppStore';
import type { ForecastHourPreset } from '@/store/useAppStore';
import SiteIntelligenceCard from './SiteIntelligenceCard';

/**
 * --- LocationHUD_Mobile Component ---
 * Extracted from Stitch: forecast_map_40_60_mobile_split_hud
 *
 * Phase 3: Wired to useAppStore.
 * ─ Forecast footer cards → setTimeScrubber (time-offset, no legacy slider)
 * ─ "Initiate AI" button   → openAICopilot (passes live telemetry context)
 * ─ Map layer toggle       → toggleMapLayer (subtle bottom-right button)
 * ─ "Get Alerts" button    → openTargetAlert
 * ─ Back / Search buttons  → returnToGlobal / openSearch
 * ─ "Pro Telemetry" toggle → local UI state (preserved exactly)
 *
 * Zero Destruction: All glassmorphic wrappers, layout boundaries,
 * z-index stacking, and Stitch Tailwind classes are preserved exactly.
 */

// ─── Forecast Timeline Config ─────────────────────────────────────────────────
interface ForecastNode {
  label: string;
  hours: ForecastHourPreset;
}

const FORECAST_NODES: ForecastNode[] = [
  { label: 'NOW',    hours: 0  },
  { label: '+6H',    hours: 6  },
  { label: '+12H',   hours: 12 },
  { label: '+24H',   hours: 24 },
  { label: '+48H',   hours: 48 },
];

const LocationHUD_Mobile: React.FC = () => {
  // ── Store bindings ──────────────────────────────────────────────────────
  const {
    timeScrubber,
    setTimeScrubber,
    targetLocation,
    openTargetAlert,
    openSearch,
    setViewMode,
    liveData,
    openDossier,
    returnToCopilot,
    setReturnToCopilot,
    openPhotoAssistant,
  } = useAppStore();

  // ── Local UI state ──────────────────────────────────────────────────────
  const [proTelemetryOpen, setProTelemetryOpen] = useState(false);
  const [viewingSpots, setViewingSpots] = useState<any[]>([]);
  const [isSpotsLoading, setIsSpotsLoading] = useState(false);

  const toggleTelemetry = useCallback(() => {
    setProTelemetryOpen(prev => !prev);
  }, []);

  // ── Dynamic Viewing Spots Fetch ─────────────────────────────────────────
  useEffect(() => {
    if (!targetLocation) return;
    let isMounted = true;
    setIsSpotsLoading(true);
    const fetchSpots = async () => {
      try {
        const res = await fetch(`/api/sightseeing/spots?lat=${targetLocation.lat}&lon=${targetLocation.lng}`);
        if (!res.ok) throw new Error('Failed to fetch spots');
        const data = await res.json();
        if (isMounted) setViewingSpots(data);
      } catch (err) {
        console.error("Error fetching viewing spots:", err);
      } finally {
        if (isMounted) setIsSpotsLoading(false);
      }
    };
    fetchSpots();
    return () => { isMounted = false; };
  }, [targetLocation]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleForecastClick = useCallback((hours: ForecastHourPreset) => {
    setTimeScrubber(hours);
  }, [setTimeScrubber]);

  const handleOpenAI = useCallback(() => {
    openPhotoAssistant({
      locationName: targetLocation?.name ?? 'Current Location',
      auroraScore:  liveData?.auroraScore  ?? 62,
      temperature:  liveData?.temperature  ?? -2,
    });
  }, [openPhotoAssistant, targetLocation, liveData]);

  const handleGetAlerts = useCallback(() => {
    openTargetAlert();
  }, [openTargetAlert]);

  const handleOpenDossier = useCallback(() => {
    if (!targetLocation) return;
    const dossierId = getDossierId(targetLocation.name);
    if (!dossierId) return;
    openDossier({
      id: dossierId,
      name: targetLocation.name,
      lat: targetLocation.lat,
      lng: targetLocation.lng,
      auroraScore:  liveData?.auroraScore  ?? 62,
      cloudCover:   liveData?.cloudCover   ?? 0,
      temperature:  liveData?.temperature  ?? -2,
      region: 'Discovery Zone'
    });
  }, [openDossier, targetLocation, liveData]);

  const handleSpotDirections = useCallback((lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  }, []);

  const handleBack = useCallback(() => {
    if (returnToCopilot) {
      setReturnToCopilot(false);
      openPhotoAssistant({
        locationName: targetLocation?.name ?? 'Current Location',
        auroraScore:  liveData?.auroraScore  ?? 62,
        temperature:  liveData?.temperature  ?? -2,
      });
    } else {
      setViewMode('LANDING');
    }
  }, [returnToCopilot, setReturnToCopilot, openPhotoAssistant, targetLocation, liveData, setViewMode]);

  return (
    <div className="relative min-h-screen text-[#e0e2eb] font-['Inter',_sans-serif] selection:bg-[#c3f5ff]/30 overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@400;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
        .stitch-glass-panel { background: rgba(8, 11, 17, 0.4); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .aurora-gradient { background: linear-gradient(90deg, #00daf3 0%, #44e2cd 50%, #7e22cc 100%); }
        .stitch-hide-scrollbar::-webkit-scrollbar { display: none; }
        .stitch-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-[65vh] bg-linear-to-t from-[#10131a]/90 via-[#10131a]/50 to-transparent"></div>
      </div>

      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-24 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button onClick={handleBack} className="stitch-glass-panel px-4 py-3 rounded-full flex items-center gap-3 group transition-all active:scale-95">
            <span className="material-symbols-outlined text-[#c3f5ff] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-[10px] uppercase tracking-widest text-[#bac9cc] font-semibold">Back</span>
          </button>
          <button onClick={openSearch} className="stitch-glass-panel px-4 py-3 rounded-full flex items-center gap-4 w-40">
            <span className="material-symbols-outlined text-[#bac9cc] text-sm">search</span>
            <span className="text-[10px] uppercase tracking-widest text-[#bac9cc]/60">Search</span>
          </button>
        </div>

      </header>

      <main className="absolute inset-0 z-10 pointer-events-none flex flex-col p-4 pb-0 md:flex md:flex-row md:justify-between md:p-8 md:items-start">
        <div className="mt-[48vh] h-[52vh] w-full overflow-y-auto flex flex-col gap-4 pointer-events-none stitch-hide-scrollbar md:contents">
          
          {/* RIGHT PANEL (Top on Mobile, Right on Desktop) */}
          <section className="flex flex-col gap-4 w-full flex-shrink-0 pointer-events-auto order-1 md:order-2 md:w-[280px] lg:w-[320px] md:pt-24">
            
            {/* Target Lock Section */}
            <div className="stitch-glass-panel p-6 rounded-xl flex flex-col gap-6 relative overflow-hidden order-2 md:order-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c3f5ff]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#c3f5ff] font-bold mb-2 block">Target Lock</span>
                  <h3 className="font-['Manrope',_sans-serif] text-xl font-bold text-white leading-none">{targetLocation ? `${targetLocation.lat.toFixed(4)}° N` : '34.0837° N'}</h3>
                  <h3 className="font-['Manrope',_sans-serif] text-xl font-bold text-white/40 leading-none mt-1">{targetLocation ? `${targetLocation.lng.toFixed(4)}° E` : '74.7973° E'}</h3>
                </div>
                <span className={`material-symbols-outlined ${liveData?.error ? 'text-red-500' : 'text-[#c3f5ff]'} animate-pulse`}>{liveData?.error ? 'error' : 'target'}</span>
              </div>
              <button onClick={handleGetAlerts} className="bg-[#00e5ff] text-[#001f24] text-[10px] uppercase tracking-widest font-extrabold py-4 rounded-full w-full hover:brightness-110 active:scale-[0.98] transition-all">{liveData?.loading ? 'Syncing...' : 'Get Alerts at High Probability'}</button>
            </div>

            {/* AI Aurora Score & Telemetry */}
            <div className="bg-[#080B11]/60 backdrop-blur-2xl rounded-3xl border border-white/5 p-6 flex flex-col gap-8 transition-all duration-500 overflow-hidden order-1 md:order-2">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#bac9cc] font-bold mb-3 block">Aurora Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-['Manrope',_sans-serif] font-extrabold text-white tracking-tighter">{liveData ? Math.round(liveData.auroraScore) : 62}</span>
                    <span className="text-[#bac9cc] font-['Manrope',_sans-serif] font-medium">/100</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#44e2cd] font-bold">{liveData ? (liveData.auroraScore >= 70 ? 'High' : liveData.auroraScore >= 45 ? 'Moderate' : 'Low') : 'Moderate'}</span>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#44e2cd]/20 bg-[#44e2cd]/5">
                    <span className="material-symbols-outlined text-[#44e2cd]">flare</span>
                  </div>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full aurora-gradient shadow-[0_0_15px_rgba(68,226,205,0.4)] transition-all duration-1000" style={{ width: `${liveData ? Math.round(liveData.auroraScore) : 62}%` }}></div>
              </div>

              {/* Micro-Grid */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Temp', val: liveData ? `${liveData.temperature.toFixed(1)}°C` : '-2.0°C' },
                  { label: 'Precip', val: liveData ? `${liveData.precipitation.toFixed(1)}mm` : '0.0mm' },
                  { label: 'Light Pol', val: liveData ? (liveData.cloudCover < 20 ? 'Min.' : liveData.cloudCover < 60 ? 'Mid.' : 'High') : 'Min.' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-[#0b0e14] p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-[8px] uppercase tracking-widest text-[#bac9cc] mb-1">{item.label}</p>
                    <p className="text-sm font-['Manrope',_sans-serif] font-bold text-white">{item.val}</p>
                  </div>
                ))}
              </div>

              {/* Forecast Timeline */}
              <div className="bg-white/5 rounded-2xl border border-white/5 p-4 flex items-center justify-between overflow-x-auto stitch-hide-scrollbar relative">
                {FORECAST_NODES.map((node, idx) => {
                  const isActive = timeScrubber === node.hours;
                  const isLive = node.hours === 0;
                  return (
                    <React.Fragment key={node.hours}>
                      {idx > 0 && <div className="w-[1px] h-4 bg-white/5 shrink-0 mx-1"></div>}
                      <button onClick={() => handleForecastClick(node.hours)} className={`relative flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 group ${isActive ? 'bg-[#c3f5ff]/10 scale-105' : 'hover:bg-white/5'}`}>
                        <div className="flex flex-col items-center gap-1.5 focus:outline-none">
                          {isLive ? (
                            <div className="relative flex items-center justify-center">
                              <div className={`w-2 h-2 rounded-full bg-[#c3f5ff] ${isActive ? 'animate-ping' : ''} absolute`}></div>
                              <div className="w-2 h-2 rounded-full bg-[#c3f5ff] relative"></div>
                            </div>
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-[#c3f5ff] shadow-[0_0_10px_#00daf3]' : 'bg-[#bac9cc]/30 group-hover:bg-[#c3f5ff]/60'}`}></div>
                          )}
                          <span className={`text-[9px] uppercase tracking-[0.15em] font-extrabold transition-colors ${isActive ? 'text-[#c3f5ff]' : 'text-[#bac9cc] group-hover:text-white'}`}>{node.label}</span>
                        </div>
                        {isActive && <motion.div layoutId="active-pill-right" className="absolute inset-0 bg-[#c3f5ff]/5 border border-[#c3f5ff]/20 rounded-xl z-[-1]" />}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Telemetry Toggle */}
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${proTelemetryOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-2 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
                  {[
                    { label: 'BZ Component', val: liveData ? liveData.bz.toFixed(1) : '6.1', unit: 'nT', color: 'text-[#c3f5ff]' },
                    { label: 'BT Total', val: liveData ? liveData.bt.toFixed(1) : '8.4', unit: 'nT', color: 'text-[#c3f5ff]' },
                    { label: 'Solar Speed', val: liveData ? liveData.solarSpeed.toFixed(0) : '410', unit: 'km/s', color: 'text-[#44e2cd]' },
                    { label: 'Density', val: liveData ? liveData.density.toFixed(1) : '5.2', unit: 'p/cc', color: 'text-[#44e2cd]' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#0b0e14] p-5">
                      <p className="text-[8px] uppercase tracking-[0.2em] text-[#bac9cc] mb-1">{item.label}</p>
                      <p className={`text-lg font-['Manrope',_sans-serif] font-bold ${item.color}`}>{item.val} <span className="text-[10px] font-light text-[#bac9cc]">{item.unit}</span></p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#bac9cc] font-bold">Pro Telemetry</span>
                <button className={`w-10 h-5 rounded-full relative flex items-center px-1 cursor-pointer transition-colors duration-300 ${proTelemetryOpen ? 'bg-[#00e5ff]' : 'bg-white/10'}`} onClick={toggleTelemetry}>
                  <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${proTelemetryOpen ? 'bg-[#001f24] translate-x-5' : 'bg-[#bac9cc] translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </section>

          {/* LEFT PANEL (Bottom on Mobile, Left on Desktop) */}
          <section className="flex flex-col gap-4 w-full flex-shrink-0 pointer-events-auto pb-24 md:pb-0 order-2 md:order-1 md:w-[280px] lg:w-[320px] md:pt-24">
            <SiteIntelligenceCard score={liveData?.auroraScore ?? 62} locationName={targetLocation?.name ?? 'Srinagar District'} cloudCover={liveData?.cloudCover} temperature={liveData?.temperature} />
            
            {targetLocation && isDossierAvailable(targetLocation.name) && (
              <button onClick={handleOpenDossier} className="w-full bg-[#c3f5ff]/10 border border-[#c3f5ff]/30 backdrop-blur-xl p-4 rounded-xl flex items-center justify-between group hover:bg-[#c3f5ff]/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#c3f5ff]/10 flex items-center justify-center group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-[#c3f5ff] text-xl">menu_book</span></div>
                  <div className="text-left"><span className="text-[10px] uppercase tracking-[0.2em] text-[#c3f5ff] font-bold block">Intelligence Alpha</span><span className="text-xs text-white font-medium">VIEW FULL INTELLIGENCE DOSSIER</span></div>
                </div>
                <span className="material-symbols-outlined text-[#c3f5ff] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            )}

            <button onClick={handleOpenAI} className="stitch-glass-panel p-6 rounded-xl text-left group hover:bg-white/5 transition-all bg-[#080B11]/60 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] border border-transparent">
              <div className="flex items-center gap-3 mb-2"><span className="material-symbols-outlined text-[#44e2cd] text-xl group-hover:text-[#00e5ff]">bolt</span><span className="text-[10px] uppercase tracking-[0.2em] text-white font-bold">Initiate AI Photo Assistant</span></div>
              <p className="text-[11px] text-[#bac9cc] font-light group-hover:text-[#c3f5ff] transition-colors">AI has analyzed local atmospherics. Ready for consultation.</p>
            </button>

            <div className={`stitch-glass-panel p-6 rounded-xl flex flex-col gap-6 transition-all ${isSpotsLoading ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex justify-between items-center"><span className="text-[10px] uppercase tracking-[0.3em] text-[#bac9cc] font-bold">Prime Viewing Spots</span>{isSpotsLoading && <div className="w-4 h-4 border-2 border-[#44e2cd]/30 border-t-[#44e2cd] rounded-full animate-spin"></div>}</div>
              <div className="space-y-6">
                {viewingSpots.length > 0 ? viewingSpots.map((spot, idx) => (
                  <div key={idx} className="flex justify-between items-center group cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('flyToSpot', { detail: { lat: spot.lat, lng: spot.lng } }))}>
                    <div className="flex-1">
                      <p className="text-white font-['Manrope',_sans-serif] font-semibold text-sm group-hover:text-[#c3f5ff] transition-colors line-clamp-1">{spot.name}</p>
                      <p className="text-[10px] tracking-widest text-[#bac9cc] uppercase">{spot.rating || 'Calculated Spot'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right"><p className="text-[#c3f5ff] font-['Manrope',_sans-serif] font-bold text-sm">{spot.distance}</p><span className="material-symbols-outlined text-sm text-[#bac9cc]">{spot.stars >= 4 ? 'star' : 'location_on'}</span></div>
                      <button onClick={(e) => { e.stopPropagation(); handleSpotDirections(spot.lat, spot.lng); }} className="p-2.5 rounded-full bg-white/5 border border-white/10 text-[#bac9cc] hover:text-cyan-400 transition-all flex items-center justify-center"><span className="material-symbols-outlined text-lg">directions</span></button>
                    </div>
                  </div>
                )) : !isSpotsLoading && <p className="text-[10px] text-[#bac9cc]/40 italic uppercase tracking-widest text-center py-4">Scanned region empty. Increase range?</p>}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LocationHUD_Mobile;
