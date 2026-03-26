'use client';

import React, { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

/**
 * --- DossierView_Kirkjufell ---
 * Phase 3: Wired to useAppStore.
 * ─ Back nav icon     → closeDossier
 * ─ "COPILOT" button  → openAICopilot with initialBrief tactical report
 * ─ "OBSERVE" button  → openTargetAlert
 * ─ Resource list     → pushToast (Pro tier)
 * ─ Aurora score bar  → reads activeDossier.auroraScore live
 * Zero Destruction: all Stitch classes, layout, and gradients preserved.
 */
const DossierView_Kirkjufell: React.FC = () => {
  const { activeDossier, closeDossier, openAICopilot, openTargetAlert, pushToast } = useAppStore();

  const getTacticalBrief = useCallback(() => {
    if (!activeDossier) return '';
    return (
      `## Tactical Site Brief — ${activeDossier.name}, ${activeDossier.region}\n\n` +
      `**Aurora Score**: ${activeDossier.auroraScore}/100 · **Cloud Cover**: ${activeDossier.cloudCover}% · **Ambient**: ${activeDossier.temperature !== null ? `${activeDossier.temperature}°C` : 'N/A'}\n\n` +
      `### Magnetic Band Convergence\nHigh-density magnetic flux detected at the peak apex, accelerating ion collision probability by 14%.\n\n` +
      `### Deep-Field Optical Clarity\nBortle Class 1 rating. Minimal atmospheric haze with particulate matter below 0.5 PPM.\n\n` +
      `### Elevation Gradient\n463m vertical prominence creates a sharp thermal inversion layer, stabilizing local air currents for long-exposure photography.\n\n` +
      `*Ask me for camera settings optimized for tonight's conditions at Kirkjufell.*`
    );
  }, [activeDossier]);

  const handleCopilot = useCallback(() => {
    openAICopilot({
      locationName: activeDossier?.name ?? 'Kirkjufell, Iceland',
      auroraScore:  activeDossier?.auroraScore ?? 82,
      temperature:  activeDossier?.temperature ?? -2,
      initialBrief: getTacticalBrief(),
    });
  }, [openAICopilot, activeDossier, getTacticalBrief]);

  const handleObserve = useCallback(() => {
    openTargetAlert();
  }, [openTargetAlert]);

  const handleProResource = useCallback(() => {
    pushToast('Feature unlocking in Pro Tier.', 'info');
  }, [pushToast]);

  const score = activeDossier?.auroraScore ?? 82;
  const scoreLabel = score >= 80 ? 'High Intensity' : score >= 60 ? 'Moderate' : 'Low Activity';

  return (
    <div className="relative min-h-screen bg-[#10131a] text-[#e0e2eb] font-['Inter',_sans-serif] selection:bg-[#00e5ff] selection:text-[#00626e] overflow-x-hidden">
      {/* 
        NOTE: Styles ported directly from Stitch source.
        'glass-panel', 'aurora-glow' included.
      */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Manrope:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .stitch-glass-panel {
          background: rgba(8, 11, 17, 0.4);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .aurora-glow {
          background: radial-gradient(circle at center, rgba(0, 229, 255, 0.15) 0%, transparent 70%);
        }
      `}</style>

      {/* Top Navigation */}
      <nav className="bg-[#080B11]/40 backdrop-blur-2xl fixed top-0 w-full z-50 border-b border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Back → closeDossier */}
          <span
            onClick={closeDossier}
            className="material-symbols-outlined text-[#00E5FF] cursor-pointer active:scale-95 transition-transform hover:opacity-70"
          >
            arrow_back
          </span>
          <span className="text-lg font-bold tracking-widest uppercase text-[#00E5FF] font-['Manrope']">
            {activeDossier?.name ?? 'Kirkjufell'}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="material-symbols-outlined text-[#bac9cc] hover:bg-white/5 transition-colors duration-300 p-2 rounded-full cursor-pointer">
            location_on
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen w-full flex flex-col justify-end items-center pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Cinematic wide shot of Kirkjufell"
            className="w-full h-full object-cover scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdhVAGG6MIWUfVCaC0XxIJQ5vG7uCAwirX4rQWgREm8oUOw11JcHzz-4_2E5_qafmYuXv2SLVLLdZpNlWZJ6E_0dqJoOqwgIC2tHNso1MCgUuY6WuOcfGhAenzxjF4NKMcv0vceYMmCaXp5QOKInxgQ91CQxKEn6DsGZko39UA6VAdqT-gH0s3C4yWXP0yZNuN5YDlcV4vhNfiOjRrcjZrWFerNDSfChnSAHZ0jtIddXx5Z8C961dCwUCyECZAGKuWpPBDRuo2UMs"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10131a] via-transparent to-black/40"></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-7xl">
          <p className="text-[#c3f5ff] tracking-[0.4em] uppercase text-sm mb-4">THE CHURCH MOUNTAIN</p>
          <h1 className="font-['Manrope'] text-8xl md:text-9xl font-extrabold tracking-tighter text-white leading-[0.8] mb-12">
            {activeDossier?.name ?? 'Kirkjufell'}
          </h1>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <div className="stitch-glass-panel px-4 py-3 rounded-full flex items-center gap-4">
            {/* Observe → openTargetAlert */}
            <button
              onClick={handleObserve}
              className="bg-[#44e2cd] text-[#003731] px-8 py-3 rounded-full font-['Manrope'] font-bold text-sm tracking-widest uppercase flex items-center gap-2 hover:shadow-[0_0_20px_rgba(68,226,205,0.4)] transition-all"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              OBSERVE
            </button>
            {/* Copilot → openAICopilot with initialBrief */}
            <button
              onClick={handleCopilot}
              className="text-white hover:bg-white/5 px-8 py-3 rounded-full font-['Manrope'] font-bold text-sm tracking-widest uppercase flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-sm">smart_toy</span>
              COPILOT
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 space-y-32 py-20">
        {/* Vitals Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Peak Season',     val: 'Sep — Mar' },
            { label: 'Avg Winter Temp', val: activeDossier?.temperature !== null && activeDossier?.temperature !== undefined ? `${activeDossier.temperature}°C` : '-2°C' },
            { label: 'Accessibility',   val: 'KEF Airport' },
          ].map((vital, i) => (
            <div key={i} className="stitch-glass-panel p-10 rounded-xl space-y-2">
              <span className="text-[#bac9cc] text-xs uppercase tracking-widest">{vital.label}</span>
              <p className="text-3xl font-['Manrope'] font-semibold text-[#c3f5ff]">{vital.val}</p>
            </div>
          ))}
        </section>

        {/* Content Area */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <h2 className="font-['Manrope'] text-5xl font-bold tracking-tight">The Lore</h2>
              <div className="h-1 w-24 bg-[#c3f5ff] rounded-full"></div>
            </div>
            <div className="space-y-8 text-xl leading-relaxed font-light text-[#849396]">
              {activeDossier?.lore?.map((loreParagraph, i) => (
                <p key={i}>{loreParagraph}</p>
              )) ?? (
                <>
                  <p>
                    Beyond the basalt columns and the rhythmic crash of the Atlantic lies a landmark forged in fire and sculpted by ice. Kirkjufell stands not merely as a mountain, but as a <span className="text-[#44e2cd] font-medium mx-1">celestial convergence</span> point where the magnetic pulse of the North reaches its zenith.
                  </p>
                  <p>
                    Ancient seafarers spoke of a "Church" made of stone, a sanctuary where the veil between worlds thins during the equinox. It is here that the <span className="text-[#44e2cd] font-medium mx-1">solar winds</span> are whispered to be caught in the peak's pyramidal grasp, igniting the sky in a bioluminescent symphony of emerald and violet.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            {/* Live Aurora Activity Card */}
            <div className="stitch-glass-panel p-10 rounded-xl space-y-8">
              <div className="flex justify-between items-center">
                <span className="text-[#bac9cc] text-xs uppercase tracking-widest">Aurora Activity</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3cddc7] animate-pulse"></span>
                  <span className="text-xs text-[#44e2cd] uppercase font-bold tracking-tighter">Live Forecast</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-6xl font-['Manrope'] font-bold text-white">
                    {score}<span className="text-2xl text-[#bac9cc]">/100</span>
                  </span>
                  <span className="text-[#3cddc7] font-bold uppercase tracking-widest text-sm mb-2">{scoreLabel}</span>
                </div>
                <div className="h-2 w-full bg-[#1d2026] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#44e2cd] to-[#e4c4ff] transition-all duration-1000"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Resources — Pro tier toast */}
            <div className="stitch-glass-panel p-10 rounded-xl space-y-6">
              <span className="text-[#bac9cc] text-xs uppercase tracking-widest">Official Resources</span>
              <ul className="space-y-4">
                {[
                  { name: 'Snæfellsnes Safety Protocol', icon: 'open_in_new' },
                  { name: 'Digital Navigation Pack',     icon: 'download'    },
                  { name: 'Local Weather Satellite',     icon: 'satellite_alt' },
                ].map((res, i) => (
                  <li
                    key={i}
                    onClick={handleProResource}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <span className="text-white group-hover:text-[#c3f5ff] transition-colors">{res.name}</span>
                    <span className="material-symbols-outlined text-[#bac9cc]">{res.icon}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Technical Analysis Grid — untouched Stitch layout */}
        <section className="space-y-16">
          <div className="flex flex-col items-center space-y-4">
            <span className="text-[#c3f5ff] tracking-[0.5em] uppercase text-xs">Technical Analysis</span>
            <h2 className="font-['Manrope'] text-6xl font-extrabold tracking-tighter">Site Intelligence</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Magnetic Band Convergence', desc: 'High-density magnetic flux detected at the peak apex, accelerating ion collision probability by 14%.', icon: 'wifi_tethering' },
              { title: 'Deep-Field Optical Clarity', desc: 'Bortle Class 1 rating. Minimal atmospheric haze with particulate matter below 0.5 PPM.', icon: 'visibility' },
              { title: 'Acoustic Resonance', desc: 'Unique topographical shielding creates a 35dB noise floor, ideal for focused sensory observation.', icon: 'waves' },
              { title: 'Elevation Gradient', desc: '463m vertical prominence creates a sharp thermal inversion layer, stabilizing local air currents.', icon: 'altitude' },
            ].map((card, i) => (
              <div key={i} className="bg-[#191c22] p-8 rounded-xl border border-white/5 space-y-4 hover:bg-[#1d2026] transition-colors group">
                <span className="material-symbols-outlined text-[#c3f5ff] text-3xl">{card.icon}</span>
                <h3 className="font-['Manrope'] font-bold uppercase tracking-widest text-sm">{card.title}</h3>
                <p className="text-[#bac9cc] text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Curation Gallery — untouched Stitch layout */}
        <section className="space-y-16">
          <div className="flex justify-between items-end">
            <div className="space-y-4">
              <span className="text-[#c3f5ff] tracking-[0.5em] uppercase text-xs">Curation</span>
              <h2 className="font-['Manrope'] text-6xl font-extrabold tracking-tighter text-white">Visual Archives</h2>
            </div>
            <p className="text-[#bac9cc] max-w-xs text-right text-sm italic">"The mountain does not move; only the light changes its character."</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 group relative overflow-hidden rounded-xl">
              <img
                alt="Moody reflection of Kirkjufell"
                className="w-full h-[600px] object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0GI8AeT4uXJVhWIrK1vZ0AnckzpS5wEd1pCbHUo7Q1OZ_7vg-V-FSyxwqRjDP7CmlxG53CxIUUX9m5xGz7Fxx_Kal9VRU0puEsORQEQBMPxY29YroJI4VCNG2vIuB7PGQ5WQwNKEEzj6IF9c3zBn2AAkh07iz-AueVDzBaRQyWwusgomL7JM9ZIVo6rzbOEw8xTFHig3xfRD9lr0bOqbrazWVuEDKEa4V8Rjs9asYSN1RbKM7Nx13-HovWcsoCXsPLqJfpry-HM8"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-10 flex flex-col justify-end">
                <p className="text-[#c3f5ff] font-bold uppercase tracking-widest text-xs">The Reflection Ritual</p>
                <p className="text-[#bac9cc] text-sm">Captured by Elias Thorne, Feb 2024</p>
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-8">
              {[
                { title: 'Cascading Symmetry',    author: 'M. Jónsdóttir',        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANxWcYDusj4iPdomEVD8HlQD1GyUfu7P3EWgBhOKC9JGJuG1HBAZ3RsZygER8Z4eaeBZmBT_qRtGkCcY4fk87qrOfM90VeugucmpLl6jVUJqS_lzAFuf3dMI-ZOnhE-dci2V1j5MveaU91Ku5BTUiqUZVWzpLPieWsLOKXNGi505GHa6gcpnKwkdTQcXfHHLJEI1yTOU_DkQLl4wM3bmPpXJnvsXAQVpYMOB62S4gDdiX_I_s50S_1yZbbfH_uUg-BkRqWtgOcfug' },
                { title: 'Coastal Fracture',      author: 'Atlas Drone Collective', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQquxUMbB_KpJCsz3t7XX8BK3l6Vpn0BzHyTDEi7UFLO0fYdzJk4t-hOBPsBoAJI55yukF1NQXt7uvs_Y7NVHvw7fJgzwA4hNQoI42XJ4tHuxkNtdXVK0I7ji6pUuKAGGh4BiCakH-d2Dwo2QWZ0D8bMZqkClQp1V5nLLPzgYkuFFdnW7kREj_1bNfQenuq7nAzDXDo9G1TQjB2hZt-eRi2t2uclGArgn1PqGHrzcvf_iGm6ooGAe4IGK68o1LCIAW8u1JQNcJJiM' },
              ].map((item, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl h-[284px]">
                  <img alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.img} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <p className="text-[#c3f5ff] font-bold uppercase tracking-widest text-xs">{item.title}</p>
                    <p className="text-[#bac9cc] text-xs">{item.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center space-y-8">
          <span className="text-lg font-bold tracking-widest uppercase text-[#c3f5ff] font-['Manrope']">
            {activeDossier?.name ?? 'Kirkjufell'}
          </span>
          <div className="flex gap-12">
            <button onClick={handleProResource} className="text-[#bac9cc] hover:text-[#c3f5ff] transition-colors text-xs uppercase tracking-widest font-bold">Privacy Protocol</button>
            <button onClick={handleProResource} className="text-[#bac9cc] hover:text-[#c3f5ff] transition-colors text-xs uppercase tracking-widest font-bold">Field Guidelines</button>
            <button onClick={handleProResource} className="text-[#bac9cc] hover:text-[#c3f5ff] transition-colors text-xs uppercase tracking-widest font-bold">Archive Access</button>
          </div>
          <p className="text-[10px] text-[#849396] uppercase tracking-widest">
            © 2024 {activeDossier?.name?.toUpperCase() ?? 'KIRKJUFELL'} DESTINATION DOSSIER. PART OF THE ETHERIS NETWORK.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DossierView_Kirkjufell;
