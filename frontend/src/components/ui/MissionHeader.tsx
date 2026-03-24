'use client';

import React, { useState, useEffect } from 'react';

// ─── UTC Mission Clock ────────────────────────────────────────────────────────
function MissionClock() {
  const [timeStr, setTimeStr] = useState<string>('SYS_TIME // --:--:-- UTC');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const mm = String(now.getUTCMinutes()).padStart(2, '0');
      const ss = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeStr(`SYS_TIME // ${hh}:${mm}:${ss} UTC`);
    };

    tick(); // Initial tick
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: '0.65rem',
      letterSpacing: '0.15em',
      color: 'rgba(255,255,255,0.4)', // --text-dim terminal feel
      opacity: mounted ? 1 : 0.5,
      transition: 'opacity 300ms ease',
    }}>
      {timeStr}
    </div>
  );
}

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
      style={{
        position: 'relative',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(2,4,9,0.05)', // Increased transparency
        backdropFilter: 'blur(8px)',
      }}
      className="pointer-events-auto"
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 28, height: 28,
          border: '1px solid rgba(0,220,130,0.5)',
          borderRadius: 4,
          boxShadow: '0 0 10px rgba(0,220,130,0.2)',
          background: 'rgba(0,220,130,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 10, height: 10,
            borderRadius: '50%',
            background: 'rgba(0,220,130,0.6)',
            boxShadow: '0 0 6px rgba(0,220,130,0.8)',
          }} />
        </div>
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

      {/* Right: live stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <HUDStat label="Solar Wind" value={solarWind} color="#38BDF8" />
        <HUDStat label="Kp Index" value={kpIndex} color="#F59E0B" />
        <HUDStat label="IMF Bz" value={imfBz} color="#A78BFA" />
        <HUDStat label="Aurora KV" value={auroraKV} color="#00DC82" />
      </div>

      {/* Clock & Status pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <MissionClock />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 9999,
          border: '1px solid rgba(0,220,130,0.2)',
          background: 'rgba(0,220,130,0.06)',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#00DC82',
            boxShadow: '0 0 6px #00DC82',
            animation: 'pulseGlow 2s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.62rem',
            color: '#00DC82',
            letterSpacing: '0.15em',
          }}>SYSTEM NOMINAL</span>
        </div>
      </div>
    </header>
  );
}
