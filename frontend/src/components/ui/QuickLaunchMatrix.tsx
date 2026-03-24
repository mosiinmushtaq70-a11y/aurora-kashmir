'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Pill {
  id: string;
  icon: React.ReactNode;
  text: string;
  color: string;        // hex
  rgb: string;          // "r,g,b" for rgba usage
  glow: string;         // box-shadow glow string
  coordinates?: { lat: number; lng: number; name: string; zoom: number };
}

// ─── Pill Data ────────────────────────────────────────────────────────────────
const PILLS: Pill[] = [
  {
    id: 'kashmir',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="4" y1="12" x2="8" y2="12"/>
        <line x1="16" y1="12" x2="20" y2="12"/>
      </svg>
    ),
    text: 'Target: Kashmir',
    color: '#00DC82',
    rgb: '0,220,130',
    glow: '0 0 20px rgba(0,220,130,0.5), 0 0 50px rgba(0,220,130,0.25), 0 0 80px rgba(0,220,130,0.1)',
    coordinates: { lat: 34.0837, lng: 74.7973, name: 'Kashmir', zoom: 7 },
  },
  {
    id: 'tromso',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    text: 'Kp 6.5: Tromsø, Norway',
    color: '#F59E0B',
    rgb: '245,158,11',
    glow: '0 0 20px rgba(245,158,11,0.5), 0 0 50px rgba(245,158,11,0.25), 0 0 80px rgba(245,158,11,0.1)',
    coordinates: { lat: 69.6492, lng: 18.9553, name: 'Tromsø', zoom: 8 },
  },
  {
    id: 'dscovr',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10a7.33 7.33 0 0 1 10.39 10.39l-4.73-4.73a3.33 3.33 0 0 0-4.66-4.66L4 10Z"/>
        <path d="m14 21 7-7"/>
        <path d="m21 21-6-6"/>
      </svg>
    ),
    text: 'View DSCOVR Feed',
    color: '#A78BFA',
    rgb: '167,139,250',
    glow: '0 0 20px rgba(167,139,250,0.5), 0 0 50px rgba(167,139,250,0.25), 0 0 80px rgba(167,139,250,0.1)',
  },
  {
    id: 'flare',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    text: 'Active Flare Warning',
    color: '#EF4444',
    rgb: '239,68,68',
    glow: '0 0 20px rgba(239,68,68,0.5), 0 0 50px rgba(239,68,68,0.25), 0 0 80px rgba(239,68,68,0.1)',
  },
];

// ─── Quick-Launch Pill ────────────────────────────────────────────────────────
function QuickPill({ pill, index, onClick }: { pill: Pill; index: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.55rem 1.1rem',
        borderRadius: '9999px',
        border: `1px solid ${hovered ? pill.color : `rgba(${pill.rgb},0.3)`}`,
        background: hovered
          ? `rgba(${pill.rgb},0.1)`
          : 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: hovered
          ? pill.glow
          : `0 0 0 1px rgba(${pill.rgb},0.0)`,
        transform: hovered ? 'scale(1.06)' : 'scale(1)',
        opacity: mounted ? 1 : 0,
        transition: [
          'transform 280ms cubic-bezier(0.34,1.56,0.64,1)',
          'box-shadow 280ms ease-out',
          'border-color 200ms ease',
          'background 200ms ease',
          'opacity 400ms ease',
        ].join(', '),
        cursor: 'pointer',
        outline: 'none',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.03em',
        color: hovered ? '#fff' : `rgba(${pill.rgb},0.75)`,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ 
        width: 16, 
        height: 16, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingRight: '6px',
        color: hovered ? pill.color : 'rgba(255,255,255,0.4)',
        transition: 'color 200ms ease',
      }}>
        {pill.icon}
      </span>
      <span>{pill.text}</span>

      {/* Trailing arrow — appears on hover */}
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          width: 12,
          height: 12,
          opacity: hovered ? 0.7 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
      >
        <path d="M3 8h10M8 3l5 5-5 5" />
      </svg>
    </button>
  );
}

export default function QuickLaunchMatrix() {
  const { zoomToLocation } = useAppStore();

  const handlePillClick = (pill: Pill) => {
    if (pill.coordinates) {
      zoomToLocation(pill.coordinates);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        justifyContent: 'center',
        maxWidth: 720,
      }}
      className="pointer-events-auto"
    >
      {PILLS.map((pill, i) => (
        <QuickPill 
          key={pill.id} 
          pill={pill} 
          index={i} 
          onClick={() => handlePillClick(pill)}
        />
      ))}
    </div>
  );
}
