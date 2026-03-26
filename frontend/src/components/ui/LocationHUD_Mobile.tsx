'use client';

import React, { useState, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { ForecastHourPreset } from '@/store/useAppStore';

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
// Each node maps 1-to-1 to a preset hour offset in the store.
// The LIVE node always = 0 (now). Future nodes drive setTimeScrubber.
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

// ─── Component ────────────────────────────────────────────────────────────────

const LocationHUD_Mobile: React.FC = () => {
  // ── Store bindings ──────────────────────────────────────────────────────
  const {
    timeScrubber,
    setTimeScrubber,
    targetLocation,
    openAICopilot,
    openTargetAlert,
    openSearch,
    returnToGlobal,
    toggleMapLayer,
    mapLayer,
    pushToast,
    liveData,
  } = useAppStore();

  // ── Local UI state (preserved from Stitch extraction) ──────────────────
  const [proTelemetryOpen, setProTelemetryOpen] = useState(false);

  const toggleTelemetry = useCallback(() => {
    setProTelemetryOpen(prev => !prev);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────

  // Forecast card click → updates global time offset (no slider needed)
  const handleForecastClick = useCallback((hours: ForecastHourPreset) => {
    setTimeScrubber(hours);
  }, [setTimeScrubber]);

  // AI Copilot button → opens primary chat overlay with live location context
  const handleOpenAI = useCallback(() => {
    openAICopilot({
      locationName: targetLocation?.name ?? 'Current Location',
      auroraScore:  liveData?.auroraScore  ?? 62,
      temperature:  liveData?.temperature  ?? -2,
    });
  }, [openAICopilot, targetLocation, liveData]);

  // "Get Alerts" → opens the TargetAlertModal
  const handleGetAlerts = useCallback(() => {
    openTargetAlert();
  }, [openTargetAlert]);

  // Spot directions → Pro-tier toast
  const handleSpotDirections = useCallback(() => {
    pushToast('Feature unlocking in Pro Tier.', 'info');
  }, [pushToast]);

  // ─── JSX (Zero Destruction — all original Stitch structure preserved) ──
  return (
    <div className="relative min-h-screen bg-[#10131a] text-[#e0e2eb] font-['Inter',_sans-serif] selection:bg-[#c3f5ff]/30 overflow-x-hidden">
      {/* 
        NOTE: Styles ported directly from Stitch source.
        'glass-panel', 'aurora-gradient', and custom scrollbars included.
      */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@400;600;700;800&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }

        .stitch-glass-panel {
          background: rgba(8, 11, 17, 0.4);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .aurora-gradient {
          background: linear-gradient(90deg, #00daf3 0%, #44e2cd 50%, #7e22cc 100%);
        }

        .stitch-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .stitch-hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#10131a]/20 to-[#10131a] z-10"></div>
        <img
          className="w-full h-full object-cover opacity-60 grayscale brightness-[0.4] contrast-125"
          alt="Atmospheric landscape"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2j6GrWbsdVRrffiPG0UwTD2AWeSGsTyzKHJzuX9_Bm0fOEdWzo-rM-J6E4rJv2zCWWccYs72YO0e2LIB9GFZtLmHxBHVVBEjbDkSRPu52sVgetEgTxXJVoC_59APFj1RP1rMNbDoo_BMKuZQ_y9SE77NBoUoj9pdXVRAmu0f5VPfQ9Yv4Uq22Yuj4g-X9g2vJMbhLLU_wNPI0ggrBg8VnwQmFzWldUED6mR3rkgUk-nfQZWXo2xsq0e8HCx_Uo_bYtOCZ6zbujfA"
        />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[#44e2cd]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#e4c4ff]/5 rounded-full blur-[150px]"></div>
      </div>

      {/* ── MAP LAYER TOGGLE (Injected per Gap Resolution #3) ─────────────────
          Subtle, glassmorphic button injected in the bottom-right corner of the
          map container area. Sits above the map, below the HUD panels. */}
      <div className="fixed bottom-24 right-4 z-40 pointer-events-auto">
        <button
          onClick={toggleMapLayer}
          title={`Switch to ${mapLayer === 'VECTOR' ? 'Satellite' : 'Vector'} view`}
          className="bg-white/5 backdrop-blur border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 text-[#bac9cc] hover:text-[#c3f5ff] hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg"
        >
          <span className="material-symbols-outlined text-base">
            {mapLayer === 'VECTOR' ? 'satellite_alt' : 'map'}
          </span>
          <span className="text-[9px] uppercase tracking-widest font-semibold">
            {mapLayer === 'VECTOR' ? 'Satellite' : 'Vector'}
          </span>
        </button>
      </div>

      {/* Header HUD */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-24 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Back button → returnToGlobal */}
          <button
            onClick={returnToGlobal}
            className="stitch-glass-panel px-4 py-3 rounded-full flex items-center gap-3 group transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[#c3f5ff] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="text-[10px] uppercase tracking-widest text-[#bac9cc] font-semibold">Back</span>
          </button>
          {/* Search button → openSearch overlay */}
          <button
            onClick={openSearch}
            className="stitch-glass-panel px-4 py-3 rounded-full flex items-center gap-4 w-40"
          >
            <span className="material-symbols-outlined text-[#bac9cc] text-sm">search</span>
            <span className="text-[10px] uppercase tracking-widest text-[#bac9cc]/60">Search</span>
          </button>
        </div>
      </header>

      {/* Main Content Areas */}
      <main className="absolute inset-0 z-10 flex flex-col pointer-events-none p-4 pb-0">
        <div className="mt-[40vh] h-[60vh] w-full overflow-y-auto flex flex-col gap-4 pointer-events-none stitch-hide-scrollbar">

          {/* Left/Top Panel: Site Intel */}
          <section className="flex flex-col gap-4 w-full flex-shrink-0 pointer-events-auto">
            <div className="stitch-glass-panel p-6 rounded-xl flex flex-col gap-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#44e2cd] font-bold block">Site Intelligence</span>
                <h2 className="font-['Manrope',_sans-serif] text-2xl font-semibold tracking-tight text-white leading-tight">
                  {targetLocation?.name ?? 'Srinagar District'}
                </h2>
              </div>
            </div>

            {/* AI Copilot Button → wired to openAICopilot */}
            <button
              onClick={handleOpenAI}
              className="stitch-glass-panel p-6 rounded-xl text-left group hover:bg-white/5 transition-all bg-[#080B11]/60 hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:border-cyan-400/50 hover:scale-[1.02] duration-300 border border-transparent"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[#44e2cd] text-xl group-hover:text-[#00e5ff]">bolt</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white font-bold">Initiate AI Photo Assistant</span>
              </div>
              <p className="text-[11px] text-[#bac9cc] font-light group-hover:text-[#c3f5ff] transition-colors">
                AI has analyzed local atmospherics. Ready for consultation.
              </p>
            </button>

            {/* Prime Viewing Spots */}
            <div className="stitch-glass-panel p-6 rounded-xl flex flex-col gap-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#bac9cc] font-bold">Prime Viewing Spots</span>
              <div className="space-y-6">
                {[
                  { name: 'Dal Lake',  loc: 'North-West Quadrant', dist: '2.4 km', dir: 'north_west' },
                  { name: 'Gulmarg',   loc: 'High Altitude Basin',  dist: '51.0 km', dir: 'west' },
                  { name: 'Sonamarg', loc: 'Glacier Plateau',       dist: '82.3 km', dir: 'north_east' },
                ].map((spot, idx) => (
                  <div key={idx} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex-1">
                      <p className="text-white font-['Manrope',_sans-serif] font-semibold text-sm group-hover:text-[#c3f5ff] transition-colors">{spot.name}</p>
                      <p className="text-[10px] tracking-widest text-[#bac9cc] uppercase">{spot.loc}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[#c3f5ff] font-['Manrope',_sans-serif] font-bold text-sm">{spot.dist}</p>
                        <span className="material-symbols-outlined text-sm text-[#bac9cc]">{spot.dir}</span>
                      </div>
                      {/* Directions → Pro-tier toast */}
                      <button
                        onClick={handleSpotDirections}
                        className="p-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[#bac9cc] hover:text-cyan-400 hover:border-cyan-400/30 transition-all flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-lg">directions</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Right/Bottom Panel: Telemetry */}
          <section className="flex flex-col gap-4 w-full flex-shrink-0 pointer-events-auto pb-24">
            <div className="stitch-glass-panel p-6 rounded-xl flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c3f5ff]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#c3f5ff] font-bold mb-2 block">Target Lock</span>
                  <h3 className="font-['Manrope',_sans-serif] text-xl font-bold text-white leading-none">
                    {targetLocation ? `${targetLocation.lat.toFixed(4)}° N` : '34.0837° N'}
                  </h3>
                  <h3 className="font-['Manrope',_sans-serif] text-xl font-bold text-white/40 leading-none mt-1">
                    {targetLocation ? `${targetLocation.lng.toFixed(4)}° E` : '74.7973° E'}
                  </h3>
                </div>
                <span className="material-symbols-outlined text-[#c3f5ff] animate-pulse">target</span>
              </div>
              {/* Get Alerts → opens TargetAlertModal */}
              <button
                onClick={handleGetAlerts}
                className="bg-[#00e5ff] text-[#001f24] text-[10px] uppercase tracking-widest font-extrabold py-4 rounded-full w-full hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Get Alerts at High Probability
              </button>
            </div>

            {/* AI Aurora Score & Telemetry */}
            <div className="bg-[#080B11]/60 backdrop-blur-2xl rounded-3xl border border-white/5 p-6 flex flex-col gap-8 transition-all duration-500 overflow-hidden">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#bac9cc] font-bold mb-3 block">AI Aurora Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-['Manrope',_sans-serif] font-extrabold text-white tracking-tighter">
                      {liveData ? Math.round(liveData.auroraScore) : 62}
                    </span>
                    <span className="text-[#bac9cc] font-['Manrope',_sans-serif] font-medium">/100</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#44e2cd] font-bold">
                    {liveData ? (liveData.auroraScore >= 70 ? 'High' : liveData.auroraScore >= 45 ? 'Moderate' : 'Low') : 'Moderate'}
                  </span>
                  <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#44e2cd]/20 bg-[#44e2cd]/5">
                    <span className="material-symbols-outlined text-[#44e2cd]">flare</span>
                  </div>
                </div>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full aurora-gradient shadow-[0_0_15px_rgba(68,226,205,0.4)] transition-all duration-1000"
                  style={{ width: `${liveData ? Math.round(liveData.auroraScore) : 62}%` }}
                ></div>
              </div>

              {/* Micro-Grid — live values */}
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

              {/* Dynamic Telemetry Toggle Section */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${proTelemetryOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
              >
                <div className="grid grid-cols-2 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
                  {[
                    { label: 'BZ Component', val: liveData ? liveData.bz.toFixed(1)       : '6.1',  unit: 'nT',   color: 'text-[#c3f5ff]' },
                    { label: 'BT Total',     val: liveData ? liveData.bt.toFixed(1)       : '8.4',  unit: 'nT',   color: 'text-[#c3f5ff]' },
                    { label: 'Solar Speed',  val: liveData ? liveData.solarSpeed.toFixed(0) : '410', unit: 'km/s', color: 'text-[#44e2cd]' },
                    { label: 'Density',      val: liveData ? liveData.density.toFixed(1)  : '5.2',  unit: 'p/cc', color: 'text-[#44e2cd]' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#0b0e14] p-5">
                      <p className="text-[8px] uppercase tracking-[0.2em] text-[#bac9cc] mb-1">{item.label}</p>
                      <p className={`text-lg font-['Manrope',_sans-serif] font-bold ${item.color}`}>
                        {item.val} <span className="text-[10px] font-light text-[#bac9cc]">{item.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrated Toggle Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#bac9cc] font-bold">Pro Telemetry</span>
                <button
                  className={`w-10 h-5 rounded-full relative flex items-center px-1 cursor-pointer transition-colors duration-300 ${proTelemetryOpen ? 'bg-[#00e5ff]' : 'bg-white/10'}`}
                  onClick={toggleTelemetry}
                >
                  <div className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${proTelemetryOpen ? 'bg-[#001f24] translate-x-5' : 'bg-[#bac9cc] translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── FORECAST TIMELINE FOOTER ───────────────────────────────────────────
          Each node wired to setTimeScrubber(hours). Active node highlighted.  */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-center items-center px-4 pb-4 pointer-events-none">
        <div className="stitch-glass-panel px-6 h-16 rounded-full flex items-center gap-4 pointer-events-auto border-white/10 shadow-2xl overflow-x-auto stitch-hide-scrollbar">
          <div className="flex items-center gap-2">
            {FORECAST_NODES.map((node, idx) => {
              const isActive = timeScrubber === node.hours;
              const isLive   = node.hours === 0;

              return (
                <React.Fragment key={node.hours}>
                  {idx > 0 && <div className="w-6 h-[1px] bg-white/10 mx-1 shrink-0"></div>}

                  <button
                    onClick={() => handleForecastClick(node.hours)}
                    title={isLive ? 'Current conditions' : `Forecast +${node.hours}h`}
                    className="flex flex-col items-center gap-1 group transition-all duration-300 hover:scale-110 focus:outline-none"
                  >
                    {isLive ? (
                      /* LIVE dot — exactly as original, now interactive */
                      <div className={`relative flex items-center justify-center p-2 rounded-full transition-all duration-300 ${isActive ? 'bg-[#c3f5ff]/20 shadow-[0_0_20px_rgba(0,229,255,0.4)]' : 'bg-transparent'}`}>
                        <div className="w-2 h-2 rounded-full bg-[#c3f5ff] animate-ping absolute inset-2"></div>
                        <div className="w-2 h-2 rounded-full bg-[#c3f5ff] relative"></div>
                      </div>
                    ) : (
                      /* Future forecast dot */
                      <div className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-[#c3f5ff] shadow-[0_0_10px_#00daf3] scale-125' : 'bg-[#bac9cc]/40 group-hover:bg-[#c3f5ff]'}`}></div>
                    )}
                    <span className={`text-[7px] uppercase tracking-tighter transition-colors font-bold ${isActive ? 'text-[#c3f5ff]' : 'text-[#bac9cc] group-hover:text-white'}`}>
                      {node.label}
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LocationHUD_Mobile;
