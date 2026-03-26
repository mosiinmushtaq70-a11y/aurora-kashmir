'use client';

import React from 'react';

/**
 * --- AIAssistantOverlay_Focus Component ---
 * Extracted from Stitch: ai_photography_copilot_immersive_focus_mode
 * Phase: UI Extraction Only (Zero-Logic)
 * Protocol: Zero Destruction (Preserving all Tailwind classes)
 * Features: Technical Data Cards (ISO/Aperture/Shutter)
 */
const AIAssistantOverlay_Focus: React.FC = () => {
  return (
    <div className="bg-[#080B11] font-['Inter',_sans-serif] text-[#e0e2eb] min-h-screen flex items-center justify-center p-4 md:p-10">
      {/* 
        NOTE: Styles ported directly from Stitch source.
        'pulse-cyan' and custom scrollbar styles included.
      */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .pulse-cyan {
          box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.7);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 229, 255, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 229, 255, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 229, 255, 0); }
        }

        .stitch-custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .stitch-custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .stitch-custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>

      {/* Immersive Overlay Container */}
      <div className="relative w-full h-[921px] max-w-7xl mx-auto bg-[#080B11]/70 backdrop-blur-[64px] border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
        
        {/* Ambient Background Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#44e2cd]/10 blur-[120px] rounded-full -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#e4c4ff]/5 blur-[120px] rounded-full -z-10"></div>

        {/* TopAppBar */}
        <header className="flex justify-between items-center w-full px-8 md:px-12 py-8 z-20">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 bg-[#00e5ff] rounded-full pulse-cyan"></div>
            <h1 className="font-['Manrope',_sans-serif] tracking-widest text-white text-lg font-bold">AI PHOTOGRAPHY COPILOT</h1>
          </div>
          <div className="hidden md:block text-[10px]">
            <p className="font-['Manrope',_sans-serif] tracking-tight font-semibold uppercase text-[10px] leading-relaxed text-[#00e5ff]">
              Live Atmospherics Synchronized
            </p>
          </div>
          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group">
            <span className="material-symbols-outlined text-white group-active:scale-90 transition-transform">close</span>
          </button>
        </header>

        {/* Chat Canvas */}
        <main className="flex-1 overflow-y-auto px-6 md:px-20 py-4 stitch-custom-scrollbar flex flex-col gap-12">
          
          {/* User Message Row */}
          <div className="flex flex-col items-end gap-3 max-w-[85%] self-end">
            <div className="bg-[#272a31]/60 backdrop-blur-md px-8 py-6 rounded-t-[2rem] rounded-bl-[2rem] border border-white/5">
              <p className="text-[#bac9cc] font-light leading-relaxed">
                I'm shooting the Arctic Gateway tonight. Suggest optimal exposure for a fast-moving corona.
              </p>
            </div>
            <span className="font-['Inter',_sans-serif] text-[10px] uppercase tracking-widest text-[#849396] px-4">Local Explorer • 22:41</span>
          </div>

          {/* AI Message Row */}
          <div className="flex flex-col items-start gap-8 max-w-[90%] md:max-w-[70%]">
            <div className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-[#00e5ff]/20 flex items-center justify-center flex-shrink-0 border border-[#00e5ff]/30">
                <span className="material-symbols-outlined text-[#00e5ff] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="space-y-8">
                <div className="bg-white/5 backdrop-blur-sm px-8 py-6 rounded-t-[2.5rem] rounded-br-[2.5rem] border border-white/5">
                  <p className="text-[#e0e2eb] font-light leading-relaxed text-lg text-[#e0e2eb]">
                    I am analyzing Tromsø's current vector. The solar wind speed is high. To freeze the fast-moving pillars, use a faster shutter speed.
                  </p>
                </div>

                {/* Data Card: Technical Recommendation */}
                <div className="bg-[#080B11]/40 backdrop-blur-2xl rounded-xl border border-white/5 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <p className="font-['Inter',_sans-serif] text-[10px] uppercase tracking-[0.2em] text-[#849396]">Configuration Profile</p>
                      <h3 className="font-['Manrope',_sans-serif] text-xl text-white">High-Velocity Auroral Setting</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex flex-col items-center px-6 py-3 bg-[#0b0e14] rounded-lg border border-white/5">
                        <span className="font-['Inter',_sans-serif] text-[9px] text-[#849396] uppercase">ISO</span>
                        <span className="font-['Manrope',_sans-serif] text-[#00e5ff] text-lg">3200</span>
                      </div>
                      <div className="flex flex-col items-center px-6 py-3 bg-[#0b0e14] rounded-lg border border-white/5">
                        <span className="font-['Inter',_sans-serif] text-[9px] text-[#849396] uppercase">Aperture</span>
                        <span className="font-['Manrope',_sans-serif] text-[#00e5ff] text-lg">f/2.8</span>
                      </div>
                      <div className="flex flex-col items-center px-6 py-3 bg-[#00e5ff]/10 rounded-lg border border-[#00e5ff]/20">
                        <span className="font-['Inter',_sans-serif] text-[9px] text-[#00e5ff] uppercase">Shutter</span>
                        <span className="font-['Manrope',_sans-serif] text-[#00e5ff] text-lg">2s to 4s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Context Indicator */}
          <div className="w-full h-64 rounded-[3rem] overflow-hidden relative group">
            <img 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt="Dramatic northern lights" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSQcHjwqc5zQLfhUsF_btk6AqIlu1TMmdg3XihFGb1McK3wJrjbhX6M3F8BnTuKDvmIN_mNSkn4OIlf1HaS6Wf2C2il9Q0GYLQkrdeUQy3WglXkaapMY8SyuxzMKw3QWNecAWUHdlBd1OgX5Xme2Q2eBfJyxYIM31Uxwdacj7G_SL5NY8-fOOlisEop3rQRhTmE_KPns1rXOb9qCg7U_0gIfsxSM0VM1fg-6_MSIQEKp2YMYV1_ZAOirCbFjolcjlq868K7JPKPBg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080B11] via-transparent to-transparent opacity-60"></div>
            <div className="absolute bottom-8 left-10">
              <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <span className="material-symbols-outlined text-[#00e5ff] text-sm">location_on</span>
                <span className="font-['Inter',_sans-serif] text-[10px] tracking-widest uppercase text-white">Live Feed: Tromsø, Norway</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full px-8 md:px-20 py-10 relative z-30">
          <div className="max-w-4xl mx-auto relative group">
            <input 
              className="w-full bg-[#0b0e14]/80 border border-white/10 rounded-full py-6 pl-10 pr-20 text-[#e0e2eb] placeholder:text-[#849396] font-light focus:outline-none focus:ring-2 focus:ring-[#c3f5ff]/30 focus:border-[#c3f5ff]/40 transition-all backdrop-blur-xl shadow-2xl font-['Inter',_sans-serif]" 
              placeholder="Ask for camera settings, composition tips, or atmospheric analysis..." 
              type="text"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#00e5ff] text-[#00363d] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-105 active:scale-95 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button className="px-5 py-2 rounded-full border border-white/5 bg-white/5 text-[11px] font-['Inter',_sans-serif] uppercase tracking-widest text-[#bac9cc] hover:bg-white/10 transition-colors">Star Trails</button>
            <button className="px-5 py-2 rounded-full border border-white/5 bg-white/5 text-[11px] font-['Inter',_sans-serif] uppercase tracking-widest text-[#bac9cc] hover:bg-white/10 transition-colors">Composition Grid</button>
            <button className="px-5 py-2 rounded-full border border-white/5 bg-white/5 text-[11px] font-['Inter',_sans-serif] uppercase tracking-widest text-[#bac9cc] hover:bg-white/10 transition-colors">KP-Index Map</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AIAssistantOverlay_Focus;
