'use client';

import React, { useState, useEffect } from 'react';


// ─── HUD Stat Row ─────────────────────────────────────────────────────────────
function HUDStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '0.48rem',
        letterSpacing: '0.2em',
        color: 'rgba(255,255,255,0.3)',
        textTransform: 'uppercase',
        marginBottom: 3,
      }}>{label}</p>
      <p style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.9rem',
        fontWeight: 700,
        color,
        textShadow: `0 0 12px ${color}80`,
        letterSpacing: '0.05em',
      }}>{value}</p>
    </div>
  );
}

interface MissionHeaderProps {
  solarWind: string;
  kpIndex: string;
  imfBz: string;
  auroraKV: string;
}

export default function MissionHeader({ solarWind, kpIndex, imfBz, auroraKV }: MissionHeaderProps) {
  return (
    <header
      className="fixed w-full top-0 z-50 bg-[#0B1015]/70 backdrop-blur-md border-b border-slate-800/50 pointer-events-auto flex items-center justify-between px-6 py-5 sm:px-10"
    >
      {/* Logo */}
      <div className="flex items-center">
        <span style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '0.95rem',
          letterSpacing: '0.12em',
          fontWeight: 700,
          color: '#fff',
        }}>
          AURORA<span style={{ color: '#00DC82' }}>LENS</span>
        </span>
      </div>


      {/* Navigation Links — hidden on mobile */}
      <div className="hidden md:flex items-center gap-8">
        <span className="text-sm font-medium text-slate-400 hover:text-[#4af626] transition-colors cursor-pointer">Forecast Map</span>
        <span className="text-sm font-medium text-slate-400 hover:text-[#4af626] transition-colors cursor-pointer">AI Assistant</span>
        <span className="text-sm font-medium text-slate-400 hover:text-[#4af626] transition-colors cursor-pointer">Alerts</span>
      </div>
    </header>
  );
}
