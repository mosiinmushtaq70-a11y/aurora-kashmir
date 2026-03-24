'use client';

import React from 'react';

const CAMERAS = [
  { id: 'CAM_01', label: 'TROMSØ OBSERVATORY',  lat: '69.6°N', lon: '18.9°E', tint: 'rgba(0,220,130,0.06)' },
  { id: 'CAM_02', label: 'KIRUNA RADAR',         lat: '67.8°N', lon: '20.2°E', tint: 'rgba(245,158,11,0.05)' },
  { id: 'CAM_03', label: 'REYKJAVIK CAM',        lat: '64.1°N', lon: '21.9°W', tint: 'rgba(167,139,250,0.05)' },
] as const;

export default function OpticalNetworkGrid() {
  return (
    <section style={{ position: 'relative', zIndex: 10, padding: '0 4rem 8rem 4rem' }}>
      {/* Section Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,220,130,0.2))' }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(0,220,130,0.7)', textTransform: 'uppercase' }}>LIVE OPTICAL NETWORK</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(0,220,130,0.2), transparent)' }} />
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CAMERAS.map((cam) => (
          <div
            key={cam.id}
            style={{
              position: 'relative',
              height: 240,
              background: `linear-gradient(135deg, rgba(6,9,18,0.95) 0%, rgba(10,14,28,0.92) 100%)`,
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            {/* Dark noisy background texture */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay',
              opacity: 0.4,
            }} />

            {/* Subtle tinted radial glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at 50% 40%, ${cam.tint} 0%, transparent 70%)`,
            }} />

            {/* Scan-line overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)',
              pointerEvents: 'none',
            }} />

            {/* ── Top-left: site label + coordinates ── */}
            <div style={{ position: 'absolute', top: 10, left: 12 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(0,220,130,0.9)', textTransform: 'uppercase', marginBottom: 2 }}>
                {cam.label}
              </p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.45rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)' }}>
                {cam.lat} / {cam.lon}
              </p>
            </div>

            {/* ── Top-right: REC indicator ── */}
            <div style={{ position: 'absolute', top: 10, right: 12, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.45rem', letterSpacing: '0.15em', color: 'rgba(239,68,68,0.8)' }}>REC</span>
              <span style={{
                display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                background: '#EF4444',
                boxShadow: '0 0 6px #EF4444',
                animation: 'pulseGlow 1.5s ease-in-out infinite',
              }} />
            </div>

            {/* ── Center: AI Targeting Reticle ── */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="80" height="80" viewBox="0 0 80 80" style={{ opacity: 0.5 }}>
                {/* Outer bracket TL */}
                <path d="M8 22 L8 8 L22 8" fill="none" stroke="#00DC82" strokeWidth="1.2" />
                {/* Outer bracket TR */}
                <path d="M58 8 L72 8 L72 22" fill="none" stroke="#00DC82" strokeWidth="1.2" />
                {/* Outer bracket BL */}
                <path d="M8 58 L8 72 L22 72" fill="none" stroke="#00DC82" strokeWidth="1.2" />
                {/* Outer bracket BR */}
                <path d="M72 58 L72 72 L58 72" fill="none" stroke="#00DC82" strokeWidth="1.2" />
                {/* Center crosshair */}
                <line x1="40" y1="34" x2="40" y2="46" stroke="#00DC82" strokeWidth="0.8" />
                <line x1="34" y1="40" x2="46" y2="40" stroke="#00DC82" strokeWidth="0.8" />
                <circle cx="40" cy="40" r="4" fill="none" stroke="#00DC82" strokeWidth="0.8" />
                {/* Detection confidence box */}
                <rect x="28" y="28" width="24" height="24" fill="none" stroke="rgba(0,220,130,0.35)" strokeWidth="0.6" strokeDasharray="2 2" />
              </svg>
              {/* DETECTION label */}
              <div style={{ position: 'absolute', top: '62%', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.42rem', letterSpacing: '0.2em', color: 'rgba(0,220,130,0.6)' }}>
                AURORA_DETECT · 94.2%
              </div>
            </div>

            {/* ── Bottom-left: timestamp ── */}
            <div style={{ position: 'absolute', bottom: 10, left: 12 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.48rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}>
                {cam.id} // 10:15:51 UTC
              </p>
            </div>

            {/* ── Bottom-right: signal quality ── */}
            <div style={{ position: 'absolute', bottom: 10, right: 12, display: 'flex', gap: 2 }}>
              {[5, 7, 9, 9, 8].map((h, i) => (
                <div key={i} style={{ width: 2, height: h, background: i < 4 ? 'rgba(0,220,130,0.7)' : 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
