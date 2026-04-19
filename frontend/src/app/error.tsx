'use client';

import React, { useEffect } from 'react';

/**
 * Global Error Boundary for AuroraLens.
 * Catches unexpected crashes and provides a graceful "Fail-Safe" UI.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('AuroraLens Global Crash:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#080B11] flex flex-col items-center justify-center p-6 text-center font-['Inter',_sans-serif]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#ff3e3e]/5 to-transparent pointer-events-none" />
      
      <div className="w-20 h-20 rounded-full bg-[#ff3e3e]/10 border border-[#ff3e3e]/30 flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 rounded-full bg-[#ff3e3e]/20 animate-ping opacity-20" />
        <span className="material-symbols-outlined text-[#ff3e3e] text-4xl">warning</span>
      </div>

      <h1 className="text-3xl font-heading font-black text-white tracking-tighter mb-4">
        TELEMETRY DISRUPTED
      </h1>
      
      <p className="text-[#bac9cc] text-lg font-light leading-relaxed max-w-md mb-12">
        A critical error occurred while processing the live stream. We've detected a system instability.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => window.location.href = '/'}
          className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Return to Base
        </button>
        <button
          onClick={() => reset()}
          className="px-8 py-4 rounded-full bg-[#ff3e3e] text-white text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_40px_rgba(255,62,62,0.2)]"
        >
          Reset Systems
        </button>
      </div>

      <div className="mt-16 text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">
        Error Digest: {error.digest || 'Unknown Cluster Failure'}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>
    </div>
  );
}
