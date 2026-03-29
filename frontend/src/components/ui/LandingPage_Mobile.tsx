'use client';

import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import FAQAccordion from './landing/FAQAccordion';

const KPTooltip: React.FC<{ value: number }> = ({ value }) => (
  <div className="group relative inline-block ml-2 align-middle">
    <span className="material-symbols-outlined text-[14px] text-[#00e5ff]/40 cursor-help hover:text-[#00e5ff] transition-colors">info</span>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-3 bg-[#080B11]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50">
      <p className="text-[10px] leading-relaxed text-[#bac9cc] font-normal">
        <strong className="text-[#00F5C4]">KP-index {value}:</strong> Planetary K-index measuring geomagnetic activity. Scale 0â€“9. KP-5+ = visible auroras.
      </p>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#080B11]/95"></div>
    </div>
  </div>
);

/**
 * --- LandingPage_Mobile ---
 * FULLY RESTORED against Stitch blueprint:
 *   stitch_quarantine/auroralens_landing_page_mobile_optimized/page.tsx
 *
 * Zero Destruction: Every CSS class, animation keyframe, layout structure,
 * typography token and visual artifact is preserved exactly.
 *
 * Phase 6 logic injected safely into onClick handlers only:
 *   Tactical Omnibar â†’ openSearch()
 *   Activity Nodes   â†’ openDossier()
 *   "Chat with Aurora" â†’ openAICopilot()
 *   "Forecast Map" nav â†’ setViewMode('MAP_HUD')
 *   "Join Observer"  â†’ openTargetAlert()
 *   "Initiate Tracking Protocol" â†’ openTargetAlert()
 */

import TrustBar from './landing/TrustBar';
import AuroraDial from './AuroraDial';

// â”€â”€â”€ Hotspot data (mirrors the blueprint exactly) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ACTIVITY_NODES = [
  {
    id: 'kirkjufell', name: 'Kirkjufell, Iceland', region: 'Iceland',
    lat: 64.9228, lng: -23.3071,
    coords: '64.9417Â° N, 23.3114Â° W', vis: '92%', update: '2m ago', state: 'High KP-6', storm: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4_5g1-88tEI-V4qkCOyJm_0OEedwBX29IsAZQ40f2zoZxJ8jZaQK0wuRYTbI5X_0e4Aw2MQS_g5tbBHSJGWXIBoO5t_UkRvon7CkfQUyi0zs_hVH1BYFXVlXAgQHzQcilZ1EZSMcSUOIUlJY_D2gt-jd4YUIM6hu2GeZKCd2er6susfRGoy0K41Xik4uFhhvuKhpgFL_QSFTuQ9t73of9O7Vi74iAfJoCXjQEU2631R3Sr10p3zrg4RyKwQAY25KP3LPqDkchhDw',
  },
  {
    id: 'tromso', name: 'TromsÃ¸, Norway', region: 'Norway',
    lat: 69.6492, lng: 18.9553,
    coords: '69.6492Â° N, 18.9553Â° E', vis: '74%', update: '5m ago', state: 'Stable KP-4', storm: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLq_Z0lS6SgE7PILS0ujXhsLbYNP2HB7kVtGztz9U33HrQbpeqV51CKaIT5-HALOH5M50Ob_Kcku9NtjSoEAnMuMNz2b3EJhMO6CSpOwMBARB5B4LnrmQCsexQhVPWg7M9Q_330c_3STDlsyIjj_MO9Kymdn-gZHPqGbf6O5Jkk1P0QMQmEUqr0LCYYfdXLlRcthmbQTOSEmerEMX5COn3aNFNA1BgOQJjY-DPR_7bAF1daEj15PwuTATTUGVWGsPuasuqFfJC2xo',
  },
  {
    id: 'fairbanks', name: 'Fairbanks, Alaska', region: 'Alaska',
    lat: 64.8378, lng: -147.7164,
    coords: '64.8401Â° N, 147.7200Â° W', vis: '100%', update: '1m ago', state: 'Storm KP-8', storm: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjBH3b7ZU54K55odGnMFw_QWpbHAZD3b7Gaj5xs-RTgLR-2m5Rds6Q-nGHjLtJ89BE7UFBKj4W6UGHmFeunoa836Qk65ml59U1eoVTi-KJAidQizsN7_CV2A4VG2Wru-JPTDszUEUCIQ5uCcoYhNdGWb5RUct9Gy_yHo5MyLgYzBeo-JUb0p82mxY1jUwsIFovHXyIWMddpvSEAkcsVDX8xcVLKbuDsYlbWgroYSbyXTW-8DiW1efkUbd5iNVUTURWgc4Dw_r8eOs',
  },
];

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const LandingPage_Mobile: React.FC = () => {
  // â”€â”€ Store bindings â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { openSearch, openDossier, openAICopilot, openTargetAlert, setViewMode, liveData } = useAppStore();

  // â”€â”€ Scroll reveal (exactly matches Stitch JS logic) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
    }, observerOptions);
    document.querySelectorAll('.reveal-on-scroll, .reveal-left, .reveal-right, .reveal-bottom')
      .forEach(el => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  }, []);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleNodeClick = useCallback((node: typeof ACTIVITY_NODES[number]) => {
    if (['kirkjufell', 'tromso', 'fairbanks'].includes(node.id)) {
      openDossier({
        id: node.id, name: node.name.split(',')[0], region: node.region,
        lat: node.lat, lng: node.lng,
        auroraScore: liveData?.auroraScore ?? 0,
        cloudCover:  liveData?.cloudCover  ?? 0,
        temperature: liveData?.temperature ?? null,
        lore: [],
      });
    } else {
      openSearch();
    }
  }, [openDossier, openSearch, liveData]);

  const handleChatWithAurora = useCallback(() => {
    openAICopilot({
      locationName: 'Global Aurora Network',
      auroraScore:  liveData?.auroraScore ?? 0,
      temperature:  liveData?.temperature ?? null,
    });
  }, [openAICopilot, liveData]);

  return (
    <div className="relative min-h-screen bg-[#10131a] text-[#e0e2eb] font-['Inter',sans-serif] selection:bg-[#44e2cd]/30 overflow-x-hidden w-full">

      {/* â”€â”€ Stitch Global Styles (Zero Destruction â€” byte-matched from blueprint) */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        /* Glass card â€” matches .glass-card in blueprint */
        .stitch-glass-card {
          background: rgba(8, 11, 17, 0.4);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .aurora-glow {
          background: radial-gradient(circle at center, rgba(68, 226, 205, 0.15) 0%, transparent 70%);
        }

        .text-gradient {
          background: linear-gradient(to right, #c3f5ff, #44e2cd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* â”€â”€ Orrery Simulation (exact blueprint keyframes) */
        .orrery-container { position: relative; width: 400px; height: 400px; }
        .sun { width: 60px; height: 60px; background: radial-gradient(circle, #fff700, #ff8c00); border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 60px rgba(255, 140, 0, 0.6); z-index: 10; }
        .earth-orbit { position: absolute; top: 50%; left: 50%; width: 300px; height: 300px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 50%; transform: translate(-50%, -50%); animation: orbit-rotate 20s linear infinite; }
        .earth-container { position: absolute; top: 0; left: 50%; width: 24px; height: 24px; transform: translate(-50%, -50%); }
        .earth { width: 24px; height: 24px; background: #00e5ff; border-radius: 50%; box-shadow: 0 0 20px rgba(0, 229, 255, 0.4); position: relative; }
        .moon-orbit { position: absolute; width: 56px; height: 56px; border: 1px dashed rgba(255,255,255,0.08); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: orbit-rotate 4s linear infinite; }
        .moon { width: 8px; height: 8px; background: #bac9cc; border-radius: 50%; position: absolute; top: 0; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
        @keyframes orbit-rotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }

        /* â”€â”€ Scroll reveal (exact blueprint CSS) */
        .reveal-on-scroll { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-on-scroll.active { opacity: 1; transform: translateY(0); }
        .reveal-left  { opacity: 0; transform: translateX(-50px); transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-right { opacity: 0; transform: translateX(50px);  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-bottom{ opacity: 0; transform: translateY(50px);  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
        .reveal-left.active, .reveal-right.active, .reveal-bottom.active { opacity: 1; transform: translate(0, 0); }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* â”€â”€ Border Glow Card (exact blueprint CSS) */
        .border-glow-card { position: relative; padding: 1px; border-radius: var(--border-radius, 1rem); background: transparent; overflow: hidden; isolation: isolate; }
        .border-glow-card::before { content: ""; position: absolute; inset: 0; padding: 1px; border-radius: var(--border-radius, 1rem); background: var(--glow-color-20); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .border-glow-card::after { content: ""; position: absolute; inset: -50%; background: conic-gradient(from 0deg, transparent 0deg, transparent calc(180deg - var(--cone-spread, 20) * 1deg), var(--glow-color) 180deg, transparent calc(180deg + var(--cone-spread, 20) * 1deg), transparent 360deg); animation: rotate-glow 4s linear infinite; pointer-events: none; z-index: -1; }
        .border-glow-card > .edge-light { position: absolute; inset: 0; border-radius: var(--border-radius, 1rem); pointer-events: none; overflow: hidden; }
        .border-glow-card > .edge-light::before { content: ""; position: absolute; inset: -150%; background: conic-gradient(from 0deg, transparent 0deg, transparent calc(180deg - var(--cone-spread, 20) * 1deg), var(--glow-color) 180deg, transparent calc(180deg + var(--cone-spread, 20) * 1deg), transparent 360deg); filter: blur(var(--glow-padding, 20px)); animation: rotate-glow 4s linear infinite; }
        .border-glow-inner { position: relative; border-radius: calc(var(--border-radius, 1rem) - 1px); background: var(--card-bg, #000); height: 100%; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 1; }
        @keyframes rotate-glow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          TOP NAV BAR (exact blueprint structure)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <header className="fixed top-0 w-full z-50 bg-[#080B11]/40 backdrop-blur-2xl border-b border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-center px-6 md:px-12 py-6 w-full max-w-screen-2xl mx-auto">
          <div className="text-2xl font-bold tracking-tighter text-white font-heading">AuroraLens</div>
          <nav className="hidden md:flex gap-12 items-center">
            {/* "Forecast Map" â†’ MAP_HUD â€” the only entry point to the live map */}
            <button
              onClick={() => setViewMode('MAP_HUD')}
              className="font-heading font-semibold tracking-tight text-[#00E5FF] border-b-2 border-[#00E5FF] pb-1 hover:opacity-80 transition-opacity"
            >
              Forecast Map
            </button>
            <button
              onClick={handleChatWithAurora}
              className="font-heading font-semibold tracking-tight text-white/70 hover:text-[#00E5FF] transition-colors duration-300"
            >
              AI Assistant
            </button>
          </nav>
          <div className="flex items-center gap-6">
            <button
              onClick={() => openTargetAlert()}
              className="bg-[#44e2cd] text-[#003731] px-6 py-2 rounded-full font-semibold hover:opacity-90 transition-all active:scale-95"
            >
              Join Observer
            </button>
          </div>
        </div>
      </header>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          MAIN CONTENT
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <main className="relative pt-[76px] overflow-x-hidden w-full">

        {/* Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] aurora-glow blur-3xl pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] aurora-glow opacity-30 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(126, 34, 204, 0.1) 0%, transparent 70%)' }}></div>

        {/* â”€â”€ HERO SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="relative max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between min-h-[90vh] md:min-h-[700px] pt-10 md:pt-0 gap-4 md:gap-20">
          
          {/* Lightweight CSS Aurora Shimmer Background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <div className="absolute inset-0 bg-linear-to-tr from-[#00F5C4]/10 via-transparent to-purple-500/5 animate-pulse"></div>
          </div>

          {/* Left: Copy + Omnibar */}
          <div className="w-full md:w-1/2 space-y-6 md:space-y-10 z-10 text-center md:text-left pt-2 md:pt-0">
            <div className="space-y-4">
              <span className="font-copy tracking-widest text-[#00F5C4] font-bold uppercase text-[10px] md:text-xs reveal-on-scroll">Celestial Monitoring System</span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[7.5rem] font-heading font-extrabold tracking-tighter leading-[0.9] text-white reveal-on-scroll">
                TRACK THE <span className="text-gradient">AURORA</span> ANYWHERE.
              </h1>
            </div>
            <p className="font-copy text-base md:text-xl text-[#bac9cc] font-light leading-relaxed max-w-xl mx-auto md:mx-0 px-4 md:px-0 opacity-80 reveal-on-scroll">
              Real-time atmospheric telemetry processed by neural networks to predict celestial events with 98.4% precision.
            </p>

            {/* Tactical Omnibar â€” opens Search Overlay */}
            <div className="reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
              <button
                onClick={() => openSearch()}
                className="stitch-glass-card rounded-full p-2 flex items-center max-w-lg shadow-2xl mx-auto md:mx-0 w-full text-left hover:border-[#00F5C4]/30 transition-all group"
              >
                <div className="flex items-center flex-1 px-4 md:px-6 gap-3">
                  <span className="material-symbols-outlined text-[#00F5C4] text-lg md:text-2xl">explore</span>
                  <span className="text-white/30 py-4 text-sm md:text-base group-hover:text-white/50 transition-colors">
                    Enter coordinates or city...
                  </span>
                </div>
                <div className="relative bg-[#00F5C4] text-[#080B11] p-3 md:p-4 rounded-full flex items-center justify-center hover:shadow-[0_0_30px_rgba(0,245,196,0.4)] transition-all group/btn">
                  <span className="material-symbols-outlined text-sm md:text-base">satellite_alt</span>
                </div>
              </button>
            </div>
          </div>

          {/* Right: AuroraDial â€” Cinematic Animated Telemetry Visual */}
          <div className="w-full md:w-1/2 flex justify-center items-center relative py-12 md:py-0 z-10">
            <AuroraDial
              data={{
                kp: liveData?.kp ?? 6.2,
                solarWindSpeed: liveData?.solarSpeed ?? 620,
                bz: liveData?.bz ?? -8.4,
                cloudCover: liveData?.cloudCover ?? 15,
                stormClass: 'G2',
              }}
            />
          </div>
        </section>
        <TrustBar />

        {/* â”€â”€ MISSION FLOW SECTION (How It Works â€” Moved Up to Section 03) â”€â”€â”€â”€â”€â”€ */}
        <section className="w-full py-24 md:py-36 relative overflow-hidden bg-[#080B11]" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 md:mb-24 space-y-4 reveal-on-scroll">
              <span className="font-copy tracking-widest text-[#00e5ff] font-medium uppercase text-[10px] md:text-xs">HOW IT WORKS</span>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tighter text-white">From Any Location to Accurate Prediction â€” in Seconds</h2>
            </div>

            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-[60%] left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00e5ff]/20 to-transparent -z-10"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center relative z-10">

              {/* 01 TARGET â€” Radar Ping / Satellite Lock */}
              <div className="group relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] hover:bg-white/[0.05] transition-all duration-500 hover:border-[#00e5ff]/30">
                <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-[#00e5ff]/30 animate-ping"></div>
                  <div className="relative z-10 w-8 h-8 flex items-center justify-center">
                    <div className="absolute w-full h-px bg-[#00e5ff]/60"></div>
                    <div className="absolute h-full w-px bg-[#00e5ff]/60"></div>
                    <div className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]"></div>
                  </div>
                </div>
                <div className="text-[10px] tracking-[0.3em] font-bold text-[#00e5ff]/50 mb-4 uppercase">01</div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-white tracking-tight mb-3">TARGET</h3>
                <p className="font-copy text-[#bac9cc] font-light text-sm md:text-base leading-relaxed">Search any global vector.</p>
              </div>

              {/* 02 ANALYZE â€” Spinning neural network data rings */}
              <div className="group relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] hover:bg-white/[0.05] transition-all duration-500 hover:border-[#00e5ff]/30">
                <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#00e5ff]/30 animate-[spin_6s_linear_infinite_reverse]"></div>
                  <div className="absolute inset-2 rounded-full border-[3px] border-t-[#00e5ff] border-r-transparent border-b-[#00e5ff]/50 border-l-transparent animate-[spin_3s_linear_infinite]"></div>
                  <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_15px_#fff] animate-pulse"></div>
                </div>
                <div className="text-[10px] tracking-[0.3em] font-bold text-[#00e5ff]/50 mb-4 uppercase">02</div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-white tracking-tight mb-3">ANALYZE</h3>
                <p className="font-copy text-[#bac9cc] font-light text-sm md:text-base leading-relaxed">Let the ML model predict visibility and weather.</p>
              </div>

              {/* 03 DEPLOY â€” Glowing aurora flow bell */}
              <div className="group relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] hover:bg-white/[0.05] transition-all duration-500 hover:border-[#00e5ff]/30">
                <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-[#00e5ff] to-emerald-400 blur-md opacity-60 animate-pulse"></div>
                  <div className="absolute inset-1 rounded-full bg-[#080B11]/80 backdrop-blur-sm border border-white/20"></div>
                  <svg className="relative z-10 w-6 h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <div className="text-[10px] tracking-[0.3em] font-bold text-[#00e5ff]/50 mb-4 uppercase">03</div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-white tracking-tight mb-3">DEPLOY</h3>
                <p className="font-copy text-[#bac9cc] font-light text-sm md:text-base leading-relaxed">Get instant alerts when the probability spikes.</p>
              </div>

            </div>
          </div>
        </section>

        {/* â”€â”€ LIVE ACTIVITY NODES CAROUSEL (Moved Down to Section 04) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="py-24 md:py-36 px-6 md:px-12 max-w-screen-2xl mx-auto" id="live-nodes">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 md:gap-0 reveal-on-scroll">
            <div>
              <span className="font-copy tracking-widest text-[#00e5ff] font-medium uppercase text-[10px] md:text-xs">PROVEN PERFORMANCE</span>
              <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tighter text-white mt-2">Live Activity Nodes</h2>
              <p className="font-copy text-[#bac9cc] font-light text-sm md:text-base mt-2">Global observational hotspots with active luminescence.</p>
            </div>
            <div className="flex gap-4">
              <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-white">chevron_left</span>
              </button>
              <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-white">chevron_right</span>
              </button>
            </div>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-3 gap-6">
            {ACTIVITY_NODES.map((node, i) => (
              <button
                key={i}
                onClick={() => handleNodeClick(node)}
                className="stitch-glass-card rounded-[2rem] overflow-hidden group cursor-pointer hover:shadow-2xl transition-all min-w-[85vw] md:min-w-0 snap-center text-left border-white/5 hover:border-[#00e5ff]/30"
              >
                <div className="h-56 md:h-72 overflow-hidden relative">
                  <img alt={node.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src={node.img} />
                  <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <span className={`w-2 h-2 rounded-full ${node.storm ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.5)]'} animate-pulse`}></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center">
                      {node.state}
                      <KPTooltip value={parseFloat(node.state.match(/\d+(\.\d+)?/)?.[0] ?? '0')} />
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity"></div>
                  <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <span className="bg-[#00e5ff] text-[#00626e] rounded-full px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase shadow-xl">Detailed Intelligence</span>
                  </div>
                </div>
                <div className="p-8 md:p-10 bg-gradient-to-b from-transparent to-white/[0.02]">
                  <h3 className="text-xl md:text-2xl font-['Manrope'] font-extrabold text-white mb-1 group-hover:text-[#00e5ff] transition-colors">{node.name}</h3>
                  <p className="text-[#bac9cc] text-[10px] md:text-xs mb-8 font-medium tracking-wider opacity-60 uppercase">{node.coords}</p>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[#00e5ff] uppercase tracking-widest">{node.vis} Visibility</span>
                    <span className="text-white/20 uppercase tracking-widest">Updated {node.update}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* â”€â”€ BENTO BOX â€” "Scientific Precision. Consumer Elegance." â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="py-24 md:py-36 px-6 md:px-12 max-w-screen-2xl mx-auto" id="engineering-excellence">
          <div className="text-center mb-12 md:mb-20 space-y-4 reveal-on-scroll">
            <span className="font-copy tracking-widest text-[#00e5ff] font-medium uppercase text-xs">Engineering Excellence</span>
            <h2 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tighter text-white">Scientific Precision. Consumer Elegance.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-auto md:auto-rows-[300px]">

            {/* CARD 1: 60 Years of Telemetry (md:col-span-2) */}
            <div
              className="md:col-span-2 stitch-glass-card rounded-xl p-6 md:p-10 flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(68,226,205,0.15)] hover:border-[#44e2cd]/30 reveal-left"
              style={{ transitionDelay: '100ms' }}
            >
              <div className="transition-transform duration-500 group-hover:translate-x-1">
                <span className="material-symbols-outlined text-4xl text-[#44e2cd] mb-6 block transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">analytics</span>
                <h3 className="text-2xl md:text-3xl font-heading font-bold tracking-tight text-white mb-4 transition-colors group-hover:text-[#44e2cd]">60 Years of Telemetry</h3>
                <p className="font-copy text-[#bac9cc] font-light text-sm md:text-base max-w-md">Our models are trained on six decades of solar wind data and geomagnetic records, ensuring historical accuracy in every forecast.</p>
              </div>
              <div className="flex gap-2 mt-8 md:mt-0">
                <div className="h-1 w-12 bg-[#44e2cd] rounded-full shadow-[0_0_10px_#44e2cd]"></div>
                <div className="h-1 w-1 bg-white/10 rounded-full"></div>
                <div className="h-1 w-1 bg-white/10 rounded-full"></div>
              </div>
            </div>

            {/* CARD 2: 24/7 Live Satellite Uplink */}
            <div
              className="stitch-glass-card rounded-xl p-6 md:p-10 flex flex-col items-center justify-center text-center overflow-hidden relative group transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(195,245,255,0.2)] hover:border-[#c3f5ff]/40 reveal-bottom h-[300px] md:h-auto"
              style={{ transitionDelay: '200ms' }}
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none transition-transform duration-1000 group-hover:scale-125">
                <img alt="Data Stream" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMTvX-rMx3n1LVy3MOg2hygtR_LAMbnGLVHf6-WK2Uwo68v0LiKDpeuEFHlCj6-qmcUfohnL4yLKLICXhiVIPrcbJv55_2zRk2LAuUM12w29OH9F8rGCENScIA4BqS0lYv5PeAkZVy6sgxDbyidbigeO4bLDgY9d1HdN91ASdK3kzr55PaOrvjIJYgMX4y_XSm4_3EI3pAUEXMtaRsQ9BEKUzdw2nwn2beGT5jMKucfNsHcOjweJQ4Gh-dqd8vQ80LTaGSm3f850" />
              </div>
              <div className="relative z-10 w-24 h-24 mb-4 flex items-center justify-center">
                <div className="absolute inset-0 border border-[#c3f5ff]/20 rounded-full animate-[spin_8s_linear_infinite]"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#c3f5ff] w-1.5 h-1.5 rounded-full shadow-[0_0_10px_#c3f5ff]"></div>
                <span className="material-symbols-outlined text-4xl text-[#c3f5ff] animate-pulse">satellite_alt</span>
              </div>
              <h3 className="text-5xl md:text-6xl font-heading font-extrabold tracking-tighter text-[#c3f5ff] mb-2 transition-transform duration-500 group-hover:scale-110">24/7</h3>
              <p className="font-copy tracking-widest text-[#bac9cc] text-xs uppercase group-hover:text-[#c3f5ff] transition-colors">Live Satellite Uplink</p>
            </div>

            {/* CARD 3: XGBoost ML Engine */}
            <div
              className="stitch-glass-card rounded-xl p-6 md:p-10 overflow-hidden relative group transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(68,226,205,0.2)] hover:border-[#44e2cd]/40 reveal-right h-[300px] md:h-auto"
              style={{ transitionDelay: '300ms' }}
            >
              <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
                <h3 className="text-xl md:text-2xl font-heading font-bold tracking-tight text-white mb-2 group-hover:text-[#44e2cd] transition-colors">XGBoost ML Engine</h3>
                <p className="font-copy text-[#bac9cc] text-sm font-light">Proprietary gradient boosting algorithms for local-node prediction.</p>
              </div>
              <div className="absolute bottom-[-20%] right-[-10%] opacity-20 group-hover:opacity-40 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12">
                <svg className="w-[150px] h-[150px] text-[#44e2cd]" fill="none" stroke="currentColor" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="2" fill="currentColor" />
                  <path d="M50 50 L80 20 M50 50 L80 50 M50 50 L80 80 M50 50 L20 20" stroke="currentColor" strokeDasharray="4 4" strokeWidth="0.5" />
                  <circle cx="80" cy="20" r="1.5" stroke="currentColor" />
                  <circle cx="80" cy="50" r="1.5" stroke="currentColor" />
                  <circle cx="80" cy="80" r="1.5" stroke="currentColor" />
                  <circle cx="20" cy="20" r="1.5" stroke="currentColor" />
                </svg>
              </div>
            </div>

            {/* CARD 4: Hyper-Local Atmosphere Density (md:col-span-2, with bar chart) */}
            <div
              className="md:col-span-2 stitch-glass-card rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-10 group transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(68,226,205,0.15)] hover:border-[#44e2cd]/30 reveal-bottom"
              style={{ transitionDelay: '400ms' }}
            >
              <div className="flex-1 transition-transform duration-500 group-hover:translate-x-1">
                <h3 className="text-xl md:text-2xl font-heading font-bold tracking-tight text-white mb-4 group-hover:text-[#44e2cd] transition-colors">Hyper-Local Atmosphere Density</h3>
                <p className="font-copy text-[#bac9cc] text-sm font-light">We don't just track the sun; we track the clouds between you and the stars.</p>
              </div>
              {/* Green bar chart visualization (exact blueprint) */}
              <div className="w-full md:w-48 h-32 flex gap-1 items-end">
                <div className="bg-[#44e2cd]/40 h-[40%] w-full rounded-t-lg transition-all duration-500 group-hover:h-[50%]"></div>
                <div className="bg-[#44e2cd]/60 h-[70%] w-full rounded-t-lg transition-all duration-700 group-hover:h-[85%]"></div>
                <div className="bg-[#44e2cd] h-full w-full rounded-t-lg transition-all duration-300 group-hover:scale-y-110 origin-bottom"></div>
                <div className="bg-[#44e2cd]/50 h-[60%] w-full rounded-t-lg transition-all duration-500 group-hover:h-[75%]"></div>
                <div className="bg-[#44e2cd]/80 h-[90%] w-full rounded-t-lg transition-all duration-1000 group-hover:h-full"></div>
              </div>
            </div>

          </div>
        </section>

        {/* â”€â”€ AI ASSISTANT TEASER â€” "Don't just track it. Capture it." â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="py-24 md:py-36 relative">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="stitch-glass-card rounded-4xl md:rounded-[3rem] p-8 md:p-24 flex flex-col md:flex-row items-center gap-12 md:gap-20 overflow-hidden relative">

              {/* Gradient overlay (exact blueprint) */}
              <div className="absolute top-0 right-0 w-[50%] h-full bg-linear-to-l from-[#c3f5ff]/10 to-transparent pointer-events-none"></div>

              {/* Left: Copy + CTAs */}
              <div className="w-full md:w-1/2 space-y-6 md:space-y-8 z-10 text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tighter text-white leading-tight">
                  Don't just track it. <br/>
                  <span className="text-gradient">Capture it.</span>
                </h2>
                {/* Restored full subtext (blueprint line 352-354) */}
                <p className="font-copy text-base md:text-xl text-[#bac9cc] font-light leading-relaxed">
                  Meet Aura, your personal astrophotography assistant. From camera settings to local weather windows, Aura ensures you never miss a shutter opportunity.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-4 justify-center md:justify-start">
                  {/* Primary CTA */}
                  <button
                    onClick={handleChatWithAurora}
                    className="bg-[#00e5ff] text-[#00626e] px-8 py-4 rounded-full font-bold hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] transition-all active:scale-[0.98]"
                  >
                    Chat with Aurora
                  </button>
                  {/* Watch Preview â€” second button (restored from blueprint) */}
                  <button className="text-white font-semibold flex items-center justify-center gap-2 px-6 py-4 hover:bg-white/5 rounded-full transition-all">
                    Watch Preview <span className="material-symbols-outlined">play_circle</span>
                  </button>
                </div>
              </div>

              {/* Right: Visual Artifacts (exact blueprint layout) */}
              <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px]">
                {/* AI chat bubble â€” top right, rotated (blueprint line 363-366) */}
                <div className="absolute top-0 md:top-10 right-0 bg-[#080B11]/80 backdrop-blur-2xl border border-[#00F5C4]/30 p-4 md:p-6 rounded-2xl w-48 md:w-64 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-2 z-20">
                  <p className="text-[10px] md:text-xs text-[#00F5C4] font-bold uppercase mb-2">Aura AI</p>
                  <p className="text-xs md:text-sm text-white font-medium leading-relaxed">Recommended ISO for tonight: 1600. Shutter 15s. f/2.8.</p>
                </div>
                {/* Typing Indicator â€” middle right */}
                <div className="absolute top-24 md:top-40 right-4 bg-[#080B11]/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex gap-1.5 z-30 shadow-xl transform rotate-1">
                  <span className="w-1 h-1 bg-[#00F5C4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1 h-1 bg-[#00F5C4] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1 h-1 bg-[#00F5C4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                {/* User chat bubble â€” bottom left, counter-rotated (blueprint line 367-370) */}
                <div className="absolute bottom-10 left-0 bg-white/10 backdrop-blur-2xl border border-white/20 p-4 md:p-6 rounded-2xl w-48 md:w-64 shadow-2xl transform -rotate-3 z-10">
                  <p className="text-[10px] md:text-xs text-white/60 font-bold uppercase mb-2">You</p>
                  <p className="text-xs md:text-sm text-white font-medium">What's the best spot near TromsÃ¸ for tonight?</p>
                </div>
                {/* Aurora glow blob (blueprint line 371) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 md:w-80 h-64 md:h-80 bg-[#44e2cd]/10 rounded-full blur-3xl"></div>
                {/* Faded robot icon background (blueprint line 372-374) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="material-symbols-outlined text-[120px] md:text-[180px] text-white/5" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* â”€â”€ PRE-FOOTER CTA â€” "The aurora is shifting." â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <section className="w-full py-24 md:py-36 max-w-5xl mx-auto px-6 relative z-10">
          <div
            className="border-glow-card w-full"
            style={{
              '--card-bg': '#060010',
              '--border-radius': '47px',
              '--glow-padding': '80px',
              '--cone-spread': '28',
              '--glow-color': 'hsl(40deg 80% 80% / 100%)',
              '--glow-color-20': 'hsl(40deg 80% 80% / 20%)',
            } as React.CSSProperties}
          >
            <div className="edge-light"></div>
            <div className="border-glow-inner p-8 md:p-32 text-center shadow-[0_0_80px_rgba(0,229,255,0.1)]">
              <h2 className="text-3xl md:text-5xl font-heading font-semibold tracking-tighter text-white mb-4 relative z-10">The aurora is shifting.</h2>
              <p className="font-copy text-lg md:text-2xl text-cyan-400 font-light italic mb-10 md:mb-12 relative z-10">Don't miss the next peak.</p>
              <button
                onClick={() => openSearch()}
                className="w-full md:w-auto text-xs md:text-sm px-6 py-4 md:px-10 md:py-5 bg-[#44e2cd] text-[#003731] rounded-full font-bold uppercase tracking-widest hover:opacity-90 hover:shadow-[0_0_40px_rgba(68,226,205,0.4)] active:scale-[0.98] transition-all relative z-10"
              >
                Initiate Tracking Protocol
              </button>
            </div>
          </div>
        </section>

        {/* â”€â”€ SECTION 09: FAQ ACCORDION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <FAQAccordion />

      </main>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FOOTER (full 4-column layout â€” exact blueprint)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="bg-[#10131a] w-full py-16 md:py-20 px-6 md:px-12 mt-auto border-t border-white/5">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-16 md:mb-20">
            <div className="space-y-6">
              <div className="text-lg font-heading font-black tracking-tight text-white">AuroraLens</div>
              <p className="font-copy font-light leading-relaxed text-[#bac9cc] text-sm">
                Decoding the celestial dance through precision telemetry and ethical AI.
              </p>
            </div>
            <div className="space-y-4 md:space-y-6">
              <h4 className="text-white font-semibold">Observatory</h4>
              <nav className="flex flex-col gap-3 md:gap-4">
                <a className="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Scientific Data</a>
                <a className="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Forecast Engine</a>
                <a className="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Satellite Network</a>
              </nav>
            </div>
            <div className="space-y-4 md:space-y-6">
              <h4 className="text-white font-semibold">Company</h4>
              <nav className="flex flex-col gap-3 md:gap-4">
                <a className="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Privacy Policy</a>
                <a className="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Terms of Service</a>
                <a className="text-[#bac9cc]/60 hover:text-[#00E5FF] transition-colors text-sm" href="#">Contact</a>
              </nav>
            </div>
            <div className="space-y-4 md:space-y-6">
              <h4 className="text-white font-semibold">Updates</h4>
              <div className="flex gap-2">
                <input className="bg-[#0b0e14] border border-white/5 rounded-full px-4 py-2 w-full text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#44e2cd]/30" placeholder="Email address" type="email" />
                <button className="bg-[#44e2cd] text-[#003731] px-4 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-all">Join</button>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center w-full pt-10 border-t border-white/5 gap-6 md:gap-0">
            <p className="font-light leading-relaxed text-[#bac9cc] text-xs md:text-sm text-center">Â© {new Date().getFullYear()} AuroraLens. The Celestial Lens.</p>
            <div className="flex gap-8">
              <span className="material-symbols-outlined text-[#bac9cc]/40 hover:text-white cursor-pointer transition-colors">public</span>
              <span className="material-symbols-outlined text-[#bac9cc]/40 hover:text-white cursor-pointer transition-colors">hub</span>
              <span className="material-symbols-outlined text-[#bac9cc]/40 hover:text-white cursor-pointer transition-colors">radar</span>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[#bac9cc]/40 text-xs font-light">
              Joined by 12,000+ aurora observers across 47 countries.
            </p>
            <div className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
              Â© 2026 AuroraLens. Orbital Data Protocol v4.2.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage_Mobile;

