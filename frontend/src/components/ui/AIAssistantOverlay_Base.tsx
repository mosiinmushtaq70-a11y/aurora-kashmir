'use client';

import React from 'react';

/**
 * --- AIAssistantOverlay_Base Component ---
 * Extracted from Stitch: ai_photography_copilot_immersive_size_update
 * Phase: UI Extraction Only (Zero-Logic)
 * Protocol: Zero Destruction (Preserving all Tailwind classes)
 */
const AIAssistantOverlay_Base: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Inter',_sans-serif]">
      {/* 
        NOTE: Styles ported directly from Stitch source.
        Tailwind 'aurora-pulse' and scrollbar hiders are included.
      */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Manrope:wght@600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .stitch-hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .stitch-hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .aurora-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>

      {/* Background Context: Blurred Tromsø Map */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#10131a] z-10"></div>
        <img 
          className="w-full h-full object-cover filter blur-xl scale-110 opacity-40" 
          alt="Blurred night aerial view of Tromso" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2KlV0w_QIMth3I3zJkfybvJSQ-MQo_51HXR_lGBXLPRmhZVLWOUgIx1F5Kg4zFBLOoOWO5nRfkKrQQeFv5uR3H23rWD2NeN94xfDynuWPxqMLbCIh2OGyyWRz0JJMpgJZeON3TSXnIX3mO4kCnQc53V29aQguHoVi05iwqMVHU1zlr6o9aGPJf9lHFNXHvefjVLOf1v2uiXngxcwj_VekDajqt91IXaIP4d8fl-Jo9MIHpJFvj-s_Y8QagyBLf-ooDxwg0QVrBHw"
        />
      </div>

      {/* Main Modal Overlay */}
      <main className="relative w-[85%] h-[90vh] bg-[#080B11]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#080B11]/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            {/* Glowing Avatar */}
            <div className="relative w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#080B11] aurora-pulse"></div>
            </div>
            <div>
              <h1 className="text-base font-semibold text-slate-100 font-['Manrope',_sans-serif] tracking-tight">AuroraLens Guide</h1>
              <p className="text-xs text-cyan-400 font-light flex items-center gap-1.5 mt-0.5">
                Online • Ready to help
              </p>
            </div>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Conversation Canvas */}
        <section className="flex-1 overflow-y-auto p-6 space-y-6 stitch-hide-scrollbar">
          {/* AI Greeting Card */}
          <div className="flex flex-col gap-3">
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[90%] text-sm text-slate-200 font-light leading-relaxed shadow-sm">
              Welcome! I'm your AuroraLens guide. I can explain how our XGBoost predictions work, help you find the best viewing spots, or guide you through the tactical map. How can I assist your journey today?
            </div>
            <span className="text-[10px] text-slate-500 font-['Inter',_sans-serif] tracking-widest uppercase ml-1">10:24 AM</span>
          </div>

          {/* Suggestion Chips */}
          <div className="flex flex-wrap gap-2">
            <button className="text-[11px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 hover:bg-cyan-500/20 transition-all active:scale-95 text-left">
              How accurate is the ML forecast?
            </button>
            <button className="text-[11px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 hover:bg-cyan-500/20 transition-all active:scale-95 text-left">
              Help me plan a trip to Tromsø
            </button>
            <button className="text-[11px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 hover:bg-cyan-500/20 transition-all active:scale-95 text-left">
              What does the Kp-Index mean?
            </button>
          </div>

          {/* Spacer for layout asymmetry */}
          <div className="h-12"></div>

          {/* Atmospheric Background Detail within Modal */}
          <div className="opacity-10 pointer-events-none absolute bottom-32 left-0 w-full flex justify-center">
            <div className="w-64 h-64 bg-cyan-500 rounded-full blur-[100px]"></div>
          </div>
        </section>

        {/* Shared Component: Bottom input area */}
        <footer className="p-5 bg-gradient-to-t from-[#080B11] to-transparent relative z-10">
          <div className="relative group">
            <input 
              className="w-full h-12 rounded-full bg-white/5 border border-white/10 px-6 pr-14 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400/30 focus:border-cyan-400/30 transition-all backdrop-blur-md font-['Inter',_sans-serif]" 
              placeholder="Ask me anything about AuroraLens..." 
              type="text"
            />
            <button className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-cyan-500/20 text-cyan-300 rounded-full p-2.5 flex items-center justify-center hover:bg-cyan-500/30 transition-all active:scale-90">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
          {/* Subtle Branding/Metadata */}
          <div className="flex justify-center mt-3">
            <p className="text-[9px] text-slate-600 font-['Inter',_sans-serif] tracking-widest uppercase text-[9px]">
              Powered by Aurora Intelligence
            </p>
          </div>
        </footer>
      </main>

      {/* Floating Background Decoratives */}
      <div className="fixed top-20 right-[20%] w-[300px] h-[300px] bg-[#44e2cd]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-20 left-[15%] w-[400px] h-[400px] bg-[#00e5ff]/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
    </div>
  );
};

export default AIAssistantOverlay_Base;
