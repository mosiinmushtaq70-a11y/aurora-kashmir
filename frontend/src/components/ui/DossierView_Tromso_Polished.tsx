'use client';

import React, { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

/**
 * --- DossierView_Tromso_Polished ---
 * Phase 3: Wired to useAppStore.
 * ─ Back nav          → returnToGlobal / closeDossier
 * ─ "Copilot" button  → openAICopilot with live activeDossier context
 * ─ "Observe" button  → openTargetAlert (high-probability alert)
 * ─ Resource links    → pushToast (Pro tier — no external routes yet)
 * Zero Destruction: all glassmorphic wrappers and Stitch classes preserved.
 */
const DossierView_Tromso_Polished: React.FC = () => {
  const { activeDossier, closeDossier, openAICopilot, openTargetAlert, pushToast } = useAppStore();

  // Build the tactical brief that seeds the AI chat via the "View Full Brief" bridge
  const getTacticalBrief = useCallback(() => {
    if (!activeDossier) return '';
    return (
      `## Tactical Site Brief — ${activeDossier.name}, ${activeDossier.region}\n\n` +
      `**Aurora Score**: ${activeDossier.auroraScore}/100 · **Cloud Cover**: ${activeDossier.cloudCover}% · **Ambient**: ${activeDossier.temperature !== null ? `${activeDossier.temperature}°C` : 'N/A'}\n\n` +
      `### Lyngen Alps Weather Shield\nThese coastal alpine peaks act as a massive geographical barrier that physically tears apart incoming maritime cloud cover, facilitating localized micro-climates of pristine clear skies.\n\n` +
      `### Magnetic Band Convergence\nSituated directly beneath the peak geomagnetic band, clear pockets provide a prime target for witnessing high-velocity auroral coronas.\n\n` +
      `*Ask me for camera settings optimized for tonight's conditions.*`
    );
  }, [activeDossier]);

  const handleCopilot = useCallback(() => {
    openAICopilot({
      locationName: activeDossier?.name ?? 'Tromsø, Norway',
      auroraScore:  activeDossier?.auroraScore ?? 72,
      temperature:  activeDossier?.temperature ?? -4,
      initialBrief: getTacticalBrief(),
    });
  }, [openAICopilot, activeDossier, getTacticalBrief]);

  const handleObserve = useCallback(() => {
    openTargetAlert();
  }, [openTargetAlert]);

  const handleProResource = useCallback(() => {
    pushToast('Feature unlocking in Pro Tier.', 'info');
  }, [pushToast]);

  return (
    <div className="relative min-h-screen bg-[#080B11] text-[#e0e2eb] font-['Inter',_sans-serif] selection:bg-[#00e5ff] selection:text-[#00626e] overflow-x-hidden">
      {/* 
        NOTE: Styles ported directly from Stitch source.
        'glass-panel', 'bento-card', 'aurora-button', and custom typography included.
      */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@200;300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }

        .stitch-glass-panel {
          background: rgba(8, 11, 17, 0.4);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .text-glow {
          text-shadow: 0 0 20px rgba(0, 229, 255, 0.4);
        }

        @keyframes aurora-gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .aurora-button {
          background: linear-gradient(270deg, #a855f7, #22d3ee, #10b981, #a855f7);
          background-size: 300% 300%;
          animation: aurora-gradient 6s ease infinite;
        }

        .bento-card {
          position: relative;
          overflow: hidden;
          border-radius: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .bento-card:hover {
          border-color: rgba(0, 229, 255, 0.3);
          box-shadow: 0 0 40px rgba(0, 229, 255, 0.1);
        }

        .bento-image {
          transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .bento-card:hover .bento-image {
          transform: scale(1.05);
        }
      `}</style>

      {/* Hero Background Layer */}
      <div className="fixed inset-0 z-0">
        <img
          alt="Cinematic wide shot of Tromsø"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0F1GPjhp5a00uGn9i-6cr1vRvnepBlGv_NSe89ajHCDLRBKZK-ZIHiOH_EW3im7LeqozpqoRIO4IGbuS09BIeYVASmOHFJYn_bHnMz8QAgacPzDMn43HRx7URR3RmvvFbycEL-WqPLQ85FLLjfdnEH_KAmwjRaKOH9XqlU1lNblppLnoOAuzzlNYSFJ_HljYuocINmxUVAh6Sdl6zmFPvSnoSU2jLyz48rhNWEEtF9cgMpcZQgcm9pW2MbFMtK2OGx0u-avVv1Hk"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/80 to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#080B11]/40 backdrop-blur-2xl transition-all duration-300">
        <div className="flex justify-between items-center px-8 py-6 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Back → closeDossier */}
            <button
              onClick={closeDossier}
              className="group flex items-center gap-2 px-5 py-2 stitch-glass-panel rounded-full hover:bg-white/5 transition-all duration-300 active:scale-95"
            >
              <span className="material-symbols-outlined text-[#00e5ff] text-sm">arrow_back</span>
              <span className="font-['Manrope'] font-light tracking-widest uppercase text-[10px] md:text-xs text-[#00e5ff]">BACK TO EXPLORE</span>
            </button>
          </div>
          <div className="text-right">
            <span className="font-['Manrope'] font-light tracking-widest uppercase text-[10px] md:text-xs text-[#00e5ff] block">
              02 // {activeDossier?.name?.toUpperCase() ?? 'TROMSØ'}, {activeDossier?.region?.toUpperCase() ?? 'NORWAY'}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center pt-32 pb-40 px-6">

        {/* Title Section */}
        <section className="flex flex-col items-center justify-center text-center mt-20 mb-32">
          <h2 className="font-['Inter'] font-light tracking-widest uppercase text-slate-300 text-lg mb-4 tracking-[0.5em]">THE ARCTIC GATEWAY</h2>
          <h1 className="font-['Manrope'] font-bold text-white text-7xl md:text-9xl tracking-tighter drop-shadow-2xl mb-8">
            {activeDossier?.name ?? 'Tromsø'}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent opacity-50"></div>
        </section>

        {/* Vitals Grid */}
        <section className="w-full max-w-5xl mb-16">
          <div className="stitch-glass-panel rounded-xl md:rounded-full py-8 px-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex flex-col gap-1 py-4 md:py-0">
              <span className="font-['Inter'] text-[10px] tracking-[0.2em] text-[#00e5ff]/70 uppercase">Peak Season</span>
              <span className="font-['Manrope'] font-medium text-lg text-white">September - March</span>
            </div>
            <div className="flex flex-col gap-1 py-4 md:py-0">
              <span className="font-['Inter'] text-[10px] tracking-[0.2em] text-[#00e5ff]/70 uppercase">Avg Winter Temp</span>
              <span className="font-['Manrope'] font-medium text-lg text-white">
                {activeDossier?.temperature !== null ? `${activeDossier?.temperature}°C` : '-4°C'}
              </span>
            </div>
            <div className="flex flex-col gap-1 py-4 md:py-0">
              <span className="font-['Inter'] text-[10px] tracking-[0.2em] text-[#00e5ff]/70 uppercase">Accessibility</span>
              <span className="font-['Manrope'] font-medium text-lg text-white">Direct Flights (TOS)</span>
            </div>
          </div>
        </section>

        {/* Floating Actions */}
        <div className="w-full max-w-2xl mb-24 px-4 flex justify-center">
          <div className="flex justify-around items-center bg-[#080B11]/60 backdrop-blur-3xl border border-white/5 w-full rounded-full p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Observe → openTargetAlert */}
            <button
              onClick={handleObserve}
              className="flex flex-col items-center justify-center text-slate-400 px-10 py-4 hover:text-[#c3f5ff] hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] group"
            >
              <span className="material-symbols-outlined mb-1 group-hover:text-[#c3f5ff]">visibility</span>
              <span className="font-['Inter'] font-light tracking-widest uppercase text-[10px]">Observe</span>
            </button>
            <div className="w-px h-8 bg-white/10"></div>
            {/* Copilot → openAICopilot with initialBrief */}
            <button
              onClick={handleCopilot}
              className="flex flex-col items-center justify-center text-slate-400 px-10 py-4 hover:text-[#c3f5ff] hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,229,255,0.2)] group"
            >
              <span className="material-symbols-outlined mb-1 group-hover:text-[#c3f5ff]">auto_awesome</span>
              <span className="font-['Inter'] font-light tracking-widest uppercase text-[10px]">Copilot</span>
            </button>
          </div>
        </div>

        {/* Lore & Resources */}
        <section className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32">
          <div className="lg:col-span-7 flex flex-col gap-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-[#00e5ff]"></div>
              <h3 className="font-['Manrope'] font-semibold text-sm tracking-widest uppercase text-[#00e5ff]">The Lore</h3>
            </div>
            <div className="flex flex-col gap-8">
              <p className="font-['Manrope'] text-5xl font-light leading-tight">
                <span className="text-white">A sanctuary where the</span>
                <span className="text-[#c3f5ff] italic font-serif mx-2">celestial</span>
                <span className="text-white">meets the terrestrial.</span>
              </p>
              {activeDossier?.lore?.map((loreParagraph, i) => (
                <p key={i} className="font-['Inter'] leading-relaxed text-slate-500 text-xl">
                  {loreParagraph}
                </p>
              )) ?? (
                <>
                  <p className="font-['Inter'] leading-relaxed text-slate-500 text-xl">
                    Tromsø maintains a singular dual identity as the <span className="text-cyan-400 italic font-medium">Paris of the North</span>, a sophisticated cosmopolitan hub anchored by the iconic architecture of the Arctic Cathedral.
                  </p>
                  <p className="font-['Inter'] leading-relaxed text-slate-500 text-lg">
                    Historically, this harbor served as the <span className="text-cyan-400 italic font-medium">final outpost</span> for legendary polar explorers launching into the <span className="text-cyan-400 italic font-medium">deep ice</span>.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="stitch-glass-panel p-12 rounded-xl border-white/10 h-fit overflow-hidden">
              <h3 className="font-['Manrope'] text-[10px] tracking-[0.3em] uppercase text-[#00e5ff] mb-10 opacity-70">Official Resources</h3>
              <div className="space-y-8">
                {[
                  { title: 'Arctic Safety Protocol',   desc: 'Winter transit guidelines and weather warnings.' },
                  { title: 'Sami Cultural Center',     desc: 'Indigenous heritage and reindeer sledding excursions.' },
                  { title: 'Observation Points',       desc: 'High-altitude vantage points for celestial viewing.' },
                ].map((res, idx) => (
                  <button
                    key={idx}
                    onClick={handleProResource}
                    className="w-full group cursor-pointer flex justify-between items-center py-5 border-b border-white/5 last:border-0 hover:border-[#c3f5ff]/50 transition-colors text-left"
                  >
                    <div className="pr-4">
                      <p className="font-['Manrope'] text-lg text-white mb-1 group-hover:text-[#c3f5ff] transition-colors">{res.title}</p>
                      <p className="font-['Inter'] text-xs text-[#bac9cc] leading-relaxed">{res.desc}</p>
                    </div>
                    <span className="material-symbols-outlined text-[#bac9cc] group-hover:text-[#c3f5ff] transition-transform group-hover:translate-x-1">open_in_new</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Site Intelligence */}
        <section className="w-full max-w-6xl mx-auto mb-40 px-4">
          <div className="flex items-center gap-4 mb-16 justify-center">
            <div className="w-12 h-[1px] bg-[#00e5ff]/40"></div>
            <h3 className="font-['Manrope'] font-semibold text-xs tracking-[0.5em] uppercase text-[#00e5ff]">WHY THE AURORA IS SO DISTINCT HERE ?</h3>
            <div className="w-12 h-[1px] bg-[#00e5ff]/40"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div className="flex flex-col gap-12">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <span className="material-symbols-outlined text-cyan-400">landscape</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-['Manrope'] font-semibold text-xl text-white tracking-wide">Lyngen Alps Weather Shield</h4>
                  <p className="font-['Inter'] font-light text-slate-400 leading-relaxed text-lg">
                    These coastal alpine peaks act as a massive geographical barrier that physically tears apart incoming maritime cloud cover, facilitating localized micro-climates of pristine clear skies.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-12">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                  <span className="material-symbols-outlined text-cyan-400">explore</span>
                </div>
                <div className="space-y-2">
                  <h4 className="font-['Manrope'] font-semibold text-xl text-white tracking-wide">Magnetic Band Convergence</h4>
                  <p className="font-['Inter'] font-light text-slate-400 leading-relaxed text-lg">
                    Situated directly beneath the peak geomagnetic band, these clear pockets provide a prime target for witnessing high-velocity auroral coronas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Archives — bento grid (untouched) */}
        <section className="w-full max-w-6xl mb-40">
          <div className="flex items-center gap-4 mb-12 justify-center">
            <div className="w-12 h-[1px] bg-[#00e5ff]/40"></div>
            <h3 className="font-['Manrope'] font-semibold text-xs tracking-[0.5em] uppercase text-[#00e5ff]">VISUAL ARCHIVES</h3>
            <div className="w-12 h-[1px] bg-[#00e5ff]/40"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[800px]">
            <div className="md:col-span-2 md:row-span-2 bento-card group">
              <img alt="Harbor" className="absolute inset-0 w-full h-full object-cover bento-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0F1GPjhp5a00uGn9i-6cr1vRvnepBlGv_NSe89ajHCDLRBKZK-ZIHiOH_EW3im7LeqozpqoRIO4IGbuS09BIeYVASmOHFJYn_bHnMz8QAgacPzDMn43HRx7URR3RmvvFbycEL-WqPLQ85FLLjfdnEH_KAmwjRaKOH9XqlU1lNblppLnoOAuzzlNYSFJ_HljYuocINmxUVAh6Sdl6zmFPvSnoSU2jLyz48rhNWEEtF9cgMpcZQgcm9pW2MbFMtK2OGx0u-avVv1Hk" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <p className="text-[#00e5ff] text-[10px] tracking-[0.2em] uppercase font-bold mb-1">Tromsø Harbor</p>
                <div className="flex justify-between items-end">
                  <h4 className="text-white text-2xl font-['Manrope'] font-semibold">Midnight Meridian</h4>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Photo by Lars Nielsen</p>
                </div>
              </div>
            </div>
            <div className="md:col-span-2 bento-card group">
              <img alt="Alps" className="absolute inset-0 w-full h-full object-cover bento-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbBeBxq-6wIpimYCt0yV5-BtFQKLhf5Fni9s_uFKxeCIx37Sb0AOliYeElFtOqPCR3d8E9T-lc5vjJ4e93igyVsP4DKRIThEUOwjRdcpWeCuP50jGIC85OgHS16WSotCC9Wn7c_dZT-o0ShUOugqOsTAXvhvXipNnjYCV_CocmrnKJwY4e_LT-EYmRXuXi-9szTxRUSOvg9nxNWJK1YT5degopyrRlH-q4JNs2XwLOgkOSFXwFiSOhIKmLZj7o_7LCFBHzbxd49Oo" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <p className="text-[#00e5ff] text-[10px] tracking-[0.2em] uppercase font-bold mb-1">Lyngen Alps</p>
                <div className="flex justify-between items-end">
                  <h4 className="text-white text-xl font-['Manrope'] font-semibold">Fractured Peaks</h4>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider">Photo by Elena Rossi</p>
                </div>
              </div>
            </div>
            <div className="bento-card group">
              <img alt="Aurora" className="absolute inset-0 w-full h-full object-cover bento-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdA-DjLnzfEBS-Bsg6X4328LHtwGyITzv4pO4b4-Vc_0wYtlgiycpTMOskQHi2aOFGh_UNrohFDkV6m3GyiEUCaxMKXw0F5wRmZoQ_tz9Hk2gqOUY9_6HjkokmbreMcvFa6-MDaIcrvzDuy-Gn2dqTZAageCRW60A0z47zXWxzl38r6A-FwNhEHInsZbrktv8ol9ZvoBDUyNlyt6rpGFrCZI-zhb0ujo-fYPuU2WOYJjRqfBy8gDVJ_C0C5CrTzurZpHK3awY2pXs" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <p className="text-[#8400ff] text-[10px] tracking-[0.2em] uppercase font-bold mb-1">Ersfjordbotn</p>
                <h4 className="text-white text-lg font-['Manrope'] font-semibold">Neon Specter</h4>
              </div>
            </div>
            <div className="bento-card group">
              <img alt="Forest" className="absolute inset-0 w-full h-full object-cover bento-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqto3V0i87-SjwrkGTRdc7dSxsJ2JNCw4RcOCNqmBhIYihqQTgE_cF31EzcF_QWAgwXw0TO8RdFt1adAhqYYsO3drKZqJM-ZC1R7Zs9SzanElWUSqTXeBdcJrmckxkIomA0rhrd6H3XDspn-4zSycFw1CqNGYHFa6DR9ghIv93j6-Z8mlZFk3vgahr-Rodpd3x5BIb7GTAC16D9YmKXstOR2jQ-yNUj1c4OfhFPbr6dpgS_yjFJqP7DXDMLhbOO5xhKwTFhupGIm8" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <p className="text-[#00e5ff] text-[10px] tracking-[0.2em] uppercase font-bold mb-1">Kvaløya</p>
                <h4 className="text-white text-lg font-['Manrope'] font-semibold">Silent Watcher</h4>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DossierView_Tromso_Polished;
