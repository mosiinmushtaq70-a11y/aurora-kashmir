'use client';

import React, { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

/**
 * --- DossierView_Fairbanks_Refined ---
 * Phase 3: Wired to useAppStore.
 * ─ Back button       → closeDossier
 * ─ "Copilot" button  → openAICopilot with initialBrief tactical report
 * ─ "Observe" button  → openTargetAlert
 * ─ Resource links    → pushToast (Pro tier)
 * ─ Aurora score bar  → reads activeDossier.auroraScore live
 * Zero Destruction: all Stitch classes, layout, and gradients preserved.
 */
const DossierView_Fairbanks_Refined: React.FC = () => {
  const { activeDossier, closeDossier, openAICopilot, openTargetAlert, pushToast } = useAppStore();

  const getTacticalBrief = useCallback(() => {
    if (!activeDossier) return '';
    return (
      `## Tactical Site Brief — ${activeDossier.name}, ${activeDossier.region}\n\n` +
      `**Aurora Score**: ${activeDossier.auroraScore}/100 · **Cloud Cover**: ${activeDossier.cloudCover}% · **Ambient**: ${activeDossier.temperature !== null ? `${activeDossier.temperature}°C` : 'N/A'}\n\n` +
      `### Continental Freeze\nLocated deep in the Alaskan interior, brutal winter nights strip all moisture from the air, providing the driest, clearest atmospheres on Earth.\n\n` +
      `### Permanent Auroral Oval\nPositioned directly under the auroral oval, geographically shielded from coastal Pacific moisture. Crystal-clear conditions to capture the subtlest crimson and violet nitrogen bands.\n\n` +
      `*Ask me for camera settings optimized for tonight's ${activeDossier.temperature}°C conditions.*`
    );
  }, [activeDossier]);

  const handleCopilot = useCallback(() => {
    openAICopilot({
      locationName: activeDossier?.name ?? 'Fairbanks, Alaska',
      auroraScore:  activeDossier?.auroraScore ?? 75,
      temperature:  activeDossier?.temperature ?? -22,
      initialBrief: getTacticalBrief(),
    });
  }, [openAICopilot, activeDossier, getTacticalBrief]);

  const handleObserve = useCallback(() => {
    openTargetAlert();
  }, [openTargetAlert]);

  const handleProResource = useCallback(() => {
    pushToast('Feature unlocking in Pro Tier.', 'info');
  }, [pushToast]);

  // Drive the aurora score bar from live store data
  const score = activeDossier?.auroraScore ?? 75;
  const scoreLabel = score >= 80 ? 'Storm Alert' : score >= 65 ? 'High Intensity Alert' : score >= 45 ? 'Moderate Activity' : 'Low Activity';

  return (
    <div className="relative min-h-screen bg-[#080B11] text-[#e0e2eb] font-['Inter',_sans-serif] selection:bg-[#00e5ff]/30 overflow-x-hidden">
      {/* 
        NOTE: Styles ported directly from Stitch source.
        'glass-card', 'bg-aurora-gradient', and 'text-glow-cyan' included.
      */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Manrope:wght@200..800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .bg-aurora-gradient {
          background: linear-gradient(to top, #10131a 0%, rgba(16, 19, 26, 0.8) 30%, transparent 100%);
        }

        .text-glow-cyan {
          text-shadow: 0 0 10px rgba(0, 229, 255, 0.4), 0 0 20px rgba(0, 229, 255, 0.2), 0 0 30px rgba(0, 229, 255, 0.1);
        }

        .stitch-glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-10 h-20 bg-[#080B11]/40 backdrop-blur-2xl border-b border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-6">
          {/* Back → closeDossier */}
          <button
            onClick={closeDossier}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-2 rounded-full border border-white/10 transition-all duration-300 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-[11px] tracking-widest uppercase font-light">Back to Explore</span>
          </button>
          <div className="h-4 w-px bg-white/10"></div>
          <span className="text-[11px] tracking-widest uppercase font-light text-[#bac9cc]">
            02 // {activeDossier?.region?.toUpperCase() ?? 'ALASKA, USA'}
          </span>
        </div>
      </header>

      <main className="relative min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[921px] w-full overflow-hidden">
          <img
            alt="Fairbanks Arctic landscape"
            className="absolute inset-0 w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAR5mM1FDzd5ED9lIsaHVgI5HH85msuTQ1i_ABt9X5EdSAlmz7gYFLXCeDBm-9V-ofaeKh_i-5Zzje3tryKh6KiHcnsYyOb_Z6_xIdOYMyfvntCQX9TKy0Kh7m5Vhafczh5Y6fvR9HsJq9HQE3fA-4ED4LHao7WSXtCz1z1BMPAeT1wIF3GB99DbaqKRx7-LOzcpqVL7SSW1LrqClYYUBunfsJUP7n0OkS0ygaeHO9h7NSLiMwFtprp2-jxdPkhweCrK4MbUpQ3F1k"
          />
          <div className="absolute inset-0 bg-aurora-gradient"></div>
          <div className="absolute bottom-24 left-10 md:left-20 max-w-7xl w-full">
            <h2 className="font-['Manrope'] text-[10px] md:text-[12px] tracking-[0.4em] uppercase font-light text-[#3cddc7] mb-4">THE INTERIOR OBSERVATORY</h2>
            <h1 className="font-['Manrope'] text-7xl md:text-9xl font-extrabold tracking-tighter text-white leading-none">
              {activeDossier?.name ?? 'Fairbanks'}
            </h1>
          </div>
        </section>

        {/* Vitals & Actions */}
        <div className="relative z-10 -mt-12 px-10 md:px-20">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Vitals */}
            <div className="bg-[#080B11]/40 backdrop-blur-2xl rounded-xl border border-white/5 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-1">
                <p className="text-[10px] tracking-widest uppercase text-[#bac9cc]">Peak Season</p>
                <p className="font-['Manrope'] text-xl text-[#c3f5ff] font-semibold">August — April</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] tracking-widest uppercase text-[#bac9cc]">Avg Winter Temp</p>
                <p className="font-['Manrope'] text-xl text-[#c3f5ff] font-semibold">
                  {activeDossier?.temperature !== null && activeDossier?.temperature !== undefined ? `${activeDossier.temperature}°C` : '-22°C'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] tracking-widest uppercase text-[#bac9cc]">Accessibility</p>
                <p className="font-['Manrope'] text-xl text-[#c3f5ff] font-semibold">Direct Flights (FAI)</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-center">
              <div className="bg-black/40 backdrop-blur-3xl rounded-full px-4 py-3 flex items-center gap-4 border border-white/10 shadow-2xl">
                {/* Observe → openTargetAlert */}
                <button
                  onClick={handleObserve}
                  className="flex items-center gap-3 text-[#bac9cc] hover:text-[#00e5ff] px-8 py-3 transition-all duration-300 group"
                >
                  <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">visibility</span>
                  <span className="text-[11px] tracking-widest uppercase font-bold">Observe</span>
                </button>
                <div className="h-6 w-px bg-white/10"></div>
                {/* Copilot → openAICopilot with initialBrief */}
                <button
                  onClick={handleCopilot}
                  className="flex items-center gap-3 text-[#bac9cc] hover:text-[#00e5ff] px-8 py-3 transition-all duration-300 group"
                >
                  <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">auto_awesome</span>
                  <span className="text-[11px] tracking-widest uppercase font-bold">Copilot</span>
                </button>
              </div>
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 py-20">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-10">
                <h3 className="font-['Manrope'] text-3xl font-semibold mb-8 text-white">The Lore</h3>
                <div className="space-y-6 text-[#bac9cc]/80 font-light leading-relaxed text-lg">
                  {activeDossier?.lore?.map((loreParagraph, i) => (
                    <p key={i}>{loreParagraph}</p>
                  )) ?? (
                    <>
                      <p>
                        Deep within the Alaskan interior, Fairbanks sits defined by brutal, silent winters and vast, snow-covered taiga forests. From vantage points like Cleary Summit, the unobstructed, 360-degree views offer a profound contrast between the harsh, sub-zero terrestrial environment and the fluid, dancing energy of the sky above.
                      </p>
                      <p className="text-white text-3xl font-['Inter'] leading-tight tracking-tight py-4 font-light">
                        Positioned directly under the permanent Auroral Oval, the city is geographically shielded from coastal Pacific moisture — providing crystal-clear atmospheric conditions to capture the subtlest crimson and violet nitrogen bands during <span className="text-cyan-400 italic font-medium mx-1">Magnetic Midnight</span>.
                      </p>
                    </>
                  )}
                </div>
                <div className="rounded-xl overflow-hidden aspect-[16/9] border border-white/5">
                  <img
                    alt="Arctic cabin"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBAhZ1N2D21wPRnxvYo4R8L1GsypuhphvsFhb-zL9kbI9PPBZozynb4AUL8Be2XuzbWikhz8_JUuuYlzFAvunU8JYPDxY4rYNWbNVAPvU2uyI6L1PGhUO41ZhHekBDH87_SMJWX5rvYwO0KMDFla2My3wturFrTxVaHVRelhjk15tBBpxcGSUJk2ZScucPy-pdxESelDSxObsMkP6OCR3L2mCCHCC9pN0H4r-8r37GD465amuvNGGAJjNKLjCGhLdf_3KdkZUpl_E"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 space-y-8">
                {/* Live Aurora Activity Card — driven by activeDossier */}
                <div className="bg-[#191c22] rounded-xl p-8 border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#44e2cd] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#44e2cd]"></span>
                    </span>
                  </div>
                  <h4 className="text-[10px] tracking-widest uppercase text-[#bac9cc] mb-6">Current Aurora Activity</h4>
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-6xl font-['Manrope'] font-bold text-white tracking-tighter">{score}</p>
                        <p className="text-[#bac9cc] text-sm tracking-widest font-light opacity-60">/ 100</p>
                      </div>
                      <p className="text-[#44e2cd] text-sm font-medium mt-1">{scoreLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#bac9cc] uppercase tracking-widest">Kp-Index</p>
                      <p className="text-3xl font-['Manrope'] font-semibold text-white">
                        {((score / 100) * 9).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#44e2cd] to-[#c3f5ff] h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,229,255,0.4)]"
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Resources — Pro tier toast */}
                <div className="space-y-6">
                  <h4 className="text-[10px] tracking-widest uppercase text-[#bac9cc]">Official Travel Resources</h4>
                  <ul className="space-y-3">
                    {[
                      { name: 'Explore Fairbanks',     desc: 'Official interior Alaska travel and accommodation board.', icon: 'open_in_new' },
                      { name: 'Geophysical Institute', desc: "UAF's real-time aurora forecast and telemetry.",           icon: 'auto_awesome' },
                      { name: 'Cleary Summit',         desc: 'Prime high-altitude vantage points for celestial viewing.', icon: 'visibility' },
                    ].map((item, idx) => (
                      <li key={idx}>
                        <button
                          onClick={handleProResource}
                          className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all group text-left"
                        >
                          <div className="flex flex-col">
                            <span className="font-['Manrope'] font-medium">{item.name}</span>
                            <span className="text-[10px] text-[#bac9cc] font-light mt-0.5">{item.desc}</span>
                          </div>
                          <span className="material-symbols-outlined text-[#bac9cc] group-hover:text-[#c3f5ff] transition-colors">{item.icon}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 px-10 text-center opacity-30">
        <p className="text-[10px] tracking-widest uppercase">Aetheris Destination Dossier // Terminal Access 2024</p>
      </footer>
    </div>
  );
};

export default DossierView_Fairbanks_Refined;
