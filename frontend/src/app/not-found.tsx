'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Custom 404 Page for AuroraLens.
 * Matches the dark, tactical aesthetic of the main dashboard.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080B11] flex flex-col items-center justify-center p-6 text-center font-['Inter',_sans-serif]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#00f5c4]/5 to-transparent pointer-events-none" />
      
      <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
        <span className="material-symbols-outlined text-[#00f5c4] text-4xl">radar</span>
      </div>

      <h1 className="text-4xl font-heading font-black text-white tracking-tighter mb-4">
        404 &mdash; SIGNAL LOST
      </h1>
      
      <p className="text-[#bac9cc] text-lg font-light leading-relaxed max-w-md mb-12">
        The coordinates you're tracking don't exist in our current orbital sweep.
      </p>

      <Link
        href="/"
        className="px-10 py-4 rounded-full bg-[#00f5c4] text-[#003731] text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-[0_0_40px_rgba(0,245,196,0.2)]"
      >
        Re-establish Uplink
      </Link>

      <div className="mt-16 text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">
        Coordinates: 0.0000° N, 0.0000° E
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
      `}</style>
    </div>
  );
}
