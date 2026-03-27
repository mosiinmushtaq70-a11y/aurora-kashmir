'use client';

import React from 'react';

/**
 * --- SearchOverlay Component ---
 * Extracted from Stitch: search_discovery_simplified_header
 * Phase: UI Extraction Only (Zero-Logic)
 * Protocol: Zero Destruction (Preserving all Tailwind classes)
 */
const SearchOverlay: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-[#10131a] font-['Inter',_sans-serif] text-[#e0e2eb] selection:bg-[#c3f5ff]/30 selection:text-[#c3f5ff] flex items-center justify-center overflow-hidden">
      {/* 
        NOTE: The following styles are ported directly from the Stitch source.
        'glass-panel' and Material Symbols are required global CSS dependencies.
      */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .stitch-glass-panel {
          background: rgba(8, 11, 17, 0.6);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      {/* Main Content Canvas */}
      <main className="relative z-10 w-full max-w-4xl px-6">
        {/* Search Focused Section */}
        <div className="flex flex-col items-center gap-16">
          {/* Hero Heading (Editorial Style) */}
          <div className="text-center space-y-4">
            <h1 className="font-['Manrope',_sans-serif] text-5xl md:text-6xl font-extrabold tracking-tight text-[#e0e2eb]">
              Find your window to the sky.
            </h1>
          </div>

          {/* Massive Pill Search Bar */}
          <div className="w-full group">
            <div className="stitch-glass-panel rounded-full px-8 py-6 flex items-center gap-6 shadow-[0_40px_100px_rgba(0,0,0,0.4)] border-white/10 transition-all duration-500 group-focus-within:border-[#c3f5ff]/40 group-focus-within:shadow-[0_0_80px_rgba(0,229,255,0.15)]">
              <span className="material-symbols-outlined text-[#00e5ff] text-3xl">search</span>
              <input 
                className="bg-transparent border-none outline-none focus:ring-0 text-2xl font-['Inter',_sans-serif] font-light text-[#e0e2eb] placeholder:text-slate-500 w-full" 
                placeholder="Search coordinates, cities, or regions..." 
                type="text"
              />
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                <span className="font-['Inter',_sans-serif] text-[10px] text-slate-400 uppercase tracking-widest text-[10px]">CMD</span>
                <span className="text-slate-600 font-light">+</span>
                <span className="font-['Inter',_sans-serif] text-[10px] text-slate-400 uppercase tracking-widest text-[10px]">K</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle background atmospheric orbs to maintain depth without distracting */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl max-h-[600px] pointer-events-none">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#c3f5ff]/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#44e2cd]/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

export default SearchOverlay;
