'use client';

import React, { useState, useEffect, useRef } from 'react';

import KpCard from '@/components/dashboard/KpCard';
import SolarWindCard from '@/components/dashboard/SolarWindCard';
import MagneticFieldCard from '@/components/dashboard/MagneticFieldCard';
import KashmirVisionCard from '@/components/dashboard/KashmirVisionCard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Pill {
  id: string;
  icon: React.ReactNode;
  text: string;
  color: string;        // hex
  rgb: string;          // "r,g,b" for rgba usage
  glow: string;         // box-shadow glow string
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
function QuickPill({ pill, index }: { pill: Pill; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 300 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <button
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

// ─── Animated Dot Cursor (follows mouse, aurora green) ────────────────────────
function AuroraCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const anim = useRef<number>(0);

  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', move);

    const loop = () => {
      if (ref.current) {
        ref.current.style.transform = `translate(${pos.current.x - 8}px, ${pos.current.y - 8}px)`;
      }
      anim.current = requestAnimationFrame(loop);
    };
    anim.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(anim.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 z-[999]"
      style={{
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: 'rgba(0,220,130,0.15)',
        border: '1.5px solid rgba(0,220,130,0.6)',
        boxShadow: '0 0 10px rgba(0,220,130,0.4)',
        willChange: 'transform',
      }}
    />
  );
}

// ─── Typing Placeholder ───────────────────────────────────────────────────────
const PLACEHOLDER_STRINGS = [
  '> Target: L1 Lagrange Point Telemetry...',
  '> Query: Incoming CME velocity & density...',
  '> Monitor: Global Kp Index threshold...',
  '> Uplink: DSCOVR & ACE satellite feeds...',
];

function useTypingPlaceholder() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'erasing'>('typing');
  const charIdx = useRef(0);

  useEffect(() => {
    const target = PLACEHOLDER_STRINGS[idx];

    if (phase === 'typing') {
      if (charIdx.current < target.length) {
        // Fast, mechanical typing speed (~50ms)
        const t = setTimeout(() => {
          setDisplayed(target.slice(0, charIdx.current + 1));
          charIdx.current++;
        }, 50);
        return () => clearTimeout(t);
      } else {
        // Completed typing; pause to read (~2000ms)
        const t = setTimeout(() => setPhase('pausing'), 2000);
        return () => clearTimeout(t);
      }
    }

    if (phase === 'pausing') {
      setPhase('erasing');
      return;
    }

    if (phase === 'erasing') {
      if (charIdx.current > 0) {
        // Extremely fast deleting speed (~20ms)
        const t = setTimeout(() => {
          charIdx.current--;
          setDisplayed(target.slice(0, charIdx.current));
        }, 20);
        return () => clearTimeout(t);
      } else {
        // Move to the next string and restart typing
        setIdx(i => (i + 1) % PLACEHOLDER_STRINGS.length);
        setPhase('typing');
      }
    }
  }, [phase, displayed, idx]);

  return displayed;
}

// ─── The Omnibar ──────────────────────────────────────────────────────────────
function Omnibar() {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState('');
  const placeholder = useTypingPlaceholder();

  return (
    <div className="relative w-full" style={{ maxWidth: 720 }}>
      {/* Outer glow bloom */}
      <div
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: 16,
          background: 'transparent',
          boxShadow: focused
            ? '0 0 40px rgba(0,220,130,0.2), 0 0 80px rgba(0,220,130,0.1)'
            : '0 0 0 transparent',
          transition: 'box-shadow 400ms ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Input wrapper */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.1rem 1.5rem',
          borderRadius: 14,
          background: focused
            ? 'rgba(0,220,130,0.04)'
            : 'rgba(255,255,255,0.035)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: `1px solid ${focused ? 'rgba(0,220,130,0.5)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: focused
            ? 'inset 0 1px 0 rgba(0,220,130,0.08), 0 1px 0 rgba(0,0,0,0.5)'
            : 'inset 0 1px 0 rgba(255,255,255,0.04)',
          transition: 'border-color 250ms ease, background 250ms ease, box-shadow 250ms ease',
          zIndex: 1,
        }}
      >
        {/* Search icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"
          style={{
            width: 20, height: 20, flexShrink: 0,
            color: focused ? '#00DC82' : 'rgba(255,255,255,0.3)',
            transition: 'color 250ms ease',
          }}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={!focused ? placeholder : ''}
          style={{
            flex: 1,
            background: 'transparent',
            outline: 'none',
            border: 'none',
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.015em',
            caretColor: '#00DC82',
          }}
          className="placeholder:text-white/25"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Right: keyboard shortcut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {['⌘', 'K'].map(k => (
            <kbd
              key={k}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4,
                padding: '2px 5px',
              }}
            >{k}</kbd>
          ))}
        </div>
      </div>

      {/* Animated Caret (aurora-primary green blinking indicator below input) */}
      {focused && (
        <div
          style={{
            position: 'absolute',
            bottom: -3,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 40,
            height: 2,
            borderRadius: 1,
            background: 'linear-gradient(90deg, transparent, #00DC82, transparent)',
            animation: 'pulseBar 1.5s ease-in-out infinite',
          }}
        />
      )}
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

// ─── Optical Satellite Feed (Real-World Photography) ───────────────────────────
function OpticalSatelliteFeed() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0, // Deepest visible layer
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* ── The Physical Earth Imagery ── */}
      {/* Heavily filtered to match the terminal tracking aesthetic rather than bright photography */}
      <img
        src="https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2000&auto=format&fit=crop" // High-res Earth from space
        alt="Top-down satellite feed"
        className="grayscale contrast-125 brightness-75 opacity-30 mix-blend-screen"
        style={{
          width: '120vmax',
          height: '120vmax',
          objectFit: 'cover',
          flexShrink: 0,
          /* CSS mask to seamlessly fade out the harsh square edges of the photography */
          WebkitMaskImage: 'radial-gradient(circle at center, black 20%, transparent 70%)',
          maskImage: 'radial-gradient(circle at center, black 20%, transparent 70%)',
          filter: 'hue-rotate(180deg)', // Slight tint manipulation to match the cold space aesthetic
          transformOrigin: 'center center',
          animation: 'earthSpin 140s linear infinite',
          willChange: 'transform',
        }}
      />
      
      {/* ── The Auroral Oval (Pulsing Center Glow) ── */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '35vmax', // Big radial glow over the North Pole
          height: '35vmax',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,220,130,1) 0%, rgba(0,220,130,0) 65%)',
          animation: 'auroraOvalPulse 4s ease-in-out infinite alternate',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}

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

// ─── Orbital Plane Grid (SVG, inline) ────────────────────────────────────────
function OrbitalGrid() {
  const C = 500; // Center coordinate
  const S = 1000; // ViewBox size

  // Design Tokens (Matching user request)
  const LINE_COLOR = 'var(--color-aurora-primary, #00DC82)';
  const GRID_OPACITY = 0.10;      // Increased to 15% for high visibility
  const ACCENT_OPACITY = 0.25;    // Increased for crosshairs and markers

  // Concentric circle radii (Spatial depth layers)
  const radii = [60, 120, 190, 270, 360, 460];

  // Polar axes: 45, 90, 135, 180 degrees (intersecting circles)
  const axesDegrees = [0, 45, 90, 135]; // These cover all quadrants when drawn as full spokes

  // Degree ticks every 10° on the outermost ring
  const outerR = radii[radii.length - 1];
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1, // Layer 2 (Above Polar Earth)
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox={`0 0 ${S} ${S}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '140vmax',
          height: '140vmax',
          flexShrink: 0,
          animation: 'orbitalSpin 120s linear infinite',
          willChange: 'transform',
          color: LINE_COLOR,
        }}
      >
        {/* --- Concentric Rings --- */}
        {radii.map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx={C} cy={C} r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity={GRID_OPACITY}
          />
        ))}

        {/* --- Polar Axes (Full spokes across both sides) --- */}
        {axesDegrees.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const len = outerR + 40;
          const dx = Math.cos(rad) * len;
          const dy = Math.sin(rad) * len;
          return (
            <line
              key={`axis-${i}`}
              x1={(C - dx).toFixed(2)} y1={(C - dy).toFixed(2)}
              x2={(C + dx).toFixed(2)} y2={(C + dy).toFixed(2)}
              stroke="currentColor"
              strokeWidth="0.4"
              strokeOpacity={GRID_OPACITY * 0.8}
            />
          );
        })}

        {/* --- Degree Tick Marks & HUD Annotations --- */}
        {ticks.map(deg => {
          const rad = (deg * Math.PI) / 180;
          const isMajor = deg % 90 === 0;
          const isMid = deg % 45 === 0;
          const len = isMajor ? 12 : isMid ? 8 : 4;

          const x1 = C + Math.cos(rad) * outerR;
          const y1 = C + Math.sin(rad) * outerR;
          const x2 = C + Math.cos(rad) * (outerR + len);
          const y2 = C + Math.sin(rad) * (outerR + len);

          return (
            <g key={`tick-group-${deg}`}>
              <line
                x1={x1.toFixed(2)} y1={y1.toFixed(2)} x2={x2.toFixed(2)} y2={y2.toFixed(2)}
                stroke="currentColor"
                strokeWidth={isMajor ? 1 : 0.6}
                strokeOpacity={ACCENT_OPACITY}
              />
              {isMajor && (
                <text
                  x={(C + Math.cos(rad) * (outerR + 25)).toFixed(2)}
                  y={(C + Math.sin(rad) * (outerR + 25)).toFixed(2)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill="currentColor"
                  fillOpacity={ACCENT_OPACITY}
                  fontFamily="JetBrains Mono, monospace"
                  style={{ transform: `rotate(${deg}deg)`, transformOrigin: 'center' }}
                >
                  {deg}°
                </text>
              )}
            </g>
          );
        })}

        {/* --- Central Crosshairs (Exact dead-center behind Omnibar) --- */}
        <g stroke="currentColor" strokeOpacity={ACCENT_OPACITY} strokeWidth="0.5">
          <line x1={C - 30} y1={C} x2={C - 5} y2={C} />
          <line x1={C + 5} y1={C} x2={C + 30} y2={C} />
          <line x1={C} y1={C - 30} x2={C} y2={C - 5} />
          <line x1={C} y1={C + 5} x2={C} y2={C + 30} />
          <circle cx={C} cy={C} r={3} fill="none" />
          <circle cx={C} cy={C} r={12} fill="none" strokeDasharray="1,3" />
        </g>

        {/* --- L1 Lagrange Marker --- */}
        <text
          x={C + 15} y={C - 15}
          fontSize="6"
          fill="currentColor"
          fillOpacity={ACCENT_OPACITY * 1.5}
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
        >
          L1_LAGRANGE_POINT [ACTIVE]
        </text>
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Idea3Page() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any>(null);
  const [kp, setKp] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // UI-First Approach: Use realistic mock data so the design is fully visible
    // without requiring the FastAPI backend to be running.
    setLoading(true);

    setTimeout(() => {
      // Generate realistic 24h history data for the ApexCharts sparklines
      const mockHistory = Array.from({ length: 24 }).map((_, i) => ({
        kp: Math.max(0, Math.min(9, 4 + Math.sin(i / 3) * 3 + Math.random())),
        bz_nt: -2 + Math.cos(i / 2) * 8 + (Math.random() * 4 - 2),
        speed_km_s: 420 + Math.sin(i / 4) * 80 + Math.random() * 20,
        density_p_cm3: 4 + Math.random() * 3
      }));

      setHistory(mockHistory);
      setKp(6.3); // High activity to show amber 'glow-solar' effect
      setData({
        telemetry: {
          speed_km_s: 482,
          density_p_cm3: 6.4,
          bz_nt: -8.3
        },
        aurora_score: 85 // High score to show optimal green
      });

      setLoading(false);
    }, 800); // Small artificial delay to show the loading state briefly
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflowX: 'hidden',
        overflowY: 'auto',
        background: '#020409',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'IBM Plex Sans, sans-serif',
        cursor: 'none', // hidden in favour of custom aurora cursor
      }}
    >
      <AuroraCursor />

      {/* ── Global Viewport Targeting Brackets (Phase 10) ── */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 50,
        }}
      >
        {([
          { top: 16, left: 16, rot: '0deg', transformOrigin: 'top left' },
          { top: 16, right: 16, rot: '90deg', transformOrigin: 'top left' },
          { bottom: 16, left: 16, rot: '270deg', transformOrigin: 'bottom left' },
          { bottom: 16, right: 16, rot: '180deg', transformOrigin: 'top left' }, // Wait, bottom right needs careful transform origin if rotated. 
          // Let's use pure scale without rotation if possible, or precise transforms. 
          // Actually, since borderTop/borderLeft is used, rotation works fine if we just animate the scale.
        ] as const).map((pos, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 24,
              height: 24,
              borderTop: '2px solid rgba(0,220,130,0.4)',
              borderLeft: '2px solid rgba(0,220,130,0.4)',
              '--rot': pos.rot, // Pass rotation to keyframes
              transform: `rotate(${pos.rot})`,
              // We'll add the animation via a class or inline style based on 'mounted'
              animation: mounted ? 'hudBracketLoad 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
              opacity: 0, // Starts invisible, animation brings it in
              ...pos,
            } as React.CSSProperties & { '--rot': string }}
          />
        ))}
      </div>

      {/* ── Layer 1: Optical Satellite Feed ── */}
      <OpticalSatelliteFeed />

      {/* ── Layer 2: Orbital Plane Grid ── */}
      <OrbitalGrid />

      {/* ── Layer 2.5: Radial vignette (fades grid toward edges, keeps center legible) ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse 65% 65% at 50% 52%, transparent 20%, rgba(2,4,9,0.88) 100%)',
          pointerEvents: 'none',
          zIndex: 2, // Above Grid and Map
        }}
      />

      {/* ── Hero Fold (100vh) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', position: 'relative', zIndex: 10 }}>
        {/* ── Top Nav ── */}
        <header
          style={{
            position: 'relative',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 2.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Logomark */}
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
              AURORA<span style={{ color: '#00DC82' }}>KASHMIR</span>
            </span>
          </div>

          {/* Right: live stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <HUDStat label="Solar Wind" value="482 km/s" color="#38BDF8" />
            <HUDStat label="Kp Index" value="6.3" color="#F59E0B" />
            <HUDStat label="IMF Bz" value="-8.3 nT" color="#A78BFA" />
            <HUDStat label="Aurora KV" value=">85%" color="#00DC82" />
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

        {/* ── Dead-Center Command Interface ── */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2.5rem',
            padding: '0 2rem',
            position: 'relative',
            zIndex: 10,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 600ms ease, transform 600ms ease',
          }}
        >
          {/* Heading */}
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              letterSpacing: '0.45em',
              color: 'rgba(255,255,255,0.2)',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>Geomagnetic Intelligence Platform · Command Interface</p>
            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              color: '#fff',
              lineHeight: 1.05,
              textShadow: '0 0 60px rgba(0,220,130,0.2)',
            }}>
              WHERE IS THE AURORA<br />
              <span style={{ color: '#00DC82' }}>TONIGHT?</span>
            </h1>
          </div>

          {/* ── The Omnibar ── */}
          <Omnibar />

          {/* ── Quick-Launch Matrix ── */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
              maxWidth: 720,
            }}
          >
            {PILLS.map((pill, i) => (
              <QuickPill key={pill.id} pill={pill} index={i} />
            ))}
          </div>

          {/* ── L1 Orbital Vector Mini-Map (Phase 12 / Hero) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.7 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              SUN · L1 · EARTH ORBITAL VECTOR
            </span>
            <svg width="260" height="26" viewBox="0 0 260 26" style={{ overflow: 'visible' }}>
              {/* Sun */}
              <circle cx="8" cy="13" r="5" fill="var(--color-accent-solar, #F59E0B)" filter="url(#hero-solar-glow)" />
              <circle cx="8" cy="13" r="8" fill="none" stroke="var(--color-accent-solar, #F59E0B)" strokeWidth="0.5" strokeOpacity="0.4" />
              {/* Trajectory */}
              <line x1="24" y1="13" x2="232" y2="13" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />
              {/* L1 Point at ~80% */}
              <g transform="translate(195, 13)">
                <rect x="-3" y="-3" width="6" height="6" fill="none" stroke="var(--color-aurora-primary, #00DC82)" strokeWidth="1" transform="rotate(45)" opacity="0.9" />
                <text x="0" y="-8" textAnchor="middle" fill="var(--color-aurora-primary, #00DC82)" fontSize="8" fontFamily="JetBrains Mono, monospace" letterSpacing="0.1em">L1</text>
              </g>
              {/* Earth */}
              <circle cx="248" cy="13" r="3.5" fill="var(--color-accent-ice, #38BDF8)" opacity="0.9" />
              <defs>
                <filter id="hero-solar-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
            </svg>
          </div>

          {/* ── Neural Net Forecast Readout (Phase 11 / Hero) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Pulsing indicator */}
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: 'var(--color-aurora-primary, #00DC82)',
                boxShadow: '0 0 8px var(--color-aurora-primary, #00DC82)',
                animation: 'pulseGlow 2s ease-in-out infinite',
              }} />
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                NEURAL NET FORECAST: <span style={{ color: 'var(--color-aurora-primary, #00DC82)', filter: 'drop-shadow(0 0 5px #00DC82)' }}>ACTIVE</span>
              </p>
            </div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.48rem', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              AURORAL PROBABILITY MODEL CONFIDENCE: 88.4%
            </p>
          </div>

          {/* Subtext */}
          <p style={{
            fontFamily: 'IBM Plex Sans, sans-serif',
            fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.22)',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}>
            Powered by NOAA DSCOVR · ACE Satellite · Real-time L1 Lagrange Telemetry
          </p>
        </main>
      </div>

      {/* ── Dashboard Grid ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 4rem 6rem 4rem', zIndex: 10, position: 'relative' }}>

        {/* Section Divider / Title */}
        <div className="flex flex-col items-center justify-center mb-16 opacity-80">
          <div style={{ width: 1, height: 60, background: 'linear-gradient(to bottom, transparent, #00DC82)', margin: '0 0 2rem 0' }} />
          
          <div className="flex flex-col items-center gap-6 w-full max-w-[800px]">
            <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '1.5rem', color: '#fff', letterSpacing: '0.2em', textShadow: '0 0 20px rgba(0,220,130,0.3)', textAlign: 'center' }}>
              L1 TELEMETRY DOWNLINK
            </h2>
            
            {/* L1 Orbital Vector Mini-Map (Phase 12) */}
            <div className="flex flex-col items-center gap-2 opacity-80">
              <span className="font-mono text-[8px] text-text-dim tracking-widest uppercase">ORBITAL VECTOR</span>
              <svg width="240" height="24" viewBox="0 0 240 24" className="overflow-visible">
                {/* Sun */}
                <circle cx="8" cy="12" r="5" fill="var(--color-accent-solar)" className="drop-shadow-[0_0_8px_#F59E0B]" />
                <circle cx="8" cy="12" r="8" fill="none" stroke="var(--color-accent-solar)" strokeWidth="0.5" strokeOpacity="0.5" />
                
                {/* Trajectory */}
                <line x1="24" y1="12" x2="216" y2="12" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="stroke-white/20" />
                
                {/* L1 Point (~80%) */}
                <g transform="translate(180, 12)">
                  <rect x="-3" y="-3" width="6" height="6" fill="none" stroke="var(--color-aurora-primary)" strokeWidth="1" transform="rotate(45)" className="drop-shadow-[0_0_5px_#00DC82] animate-pulse" />
                  <text x="0" y="-8" textAnchor="middle" fill="var(--color-aurora-primary)" fontSize="8" fontFamily="JetBrains Mono, monospace" letterSpacing="0.1em">L1</text>
                </g>

                {/* Earth */}
                <circle cx="232" cy="12" r="3" fill="var(--color-accent-ice)" className="drop-shadow-[0_0_6px_#38BDF8]" />
              </svg>
            </div>
          </div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#00DC82', letterSpacing: '0.2em', opacity: 0.6 }}>
            SYNCHRONIZING WITH DEEP SPACE GATEWAY...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: '10px', color: '#EF4444', letterSpacing: '0.2em', opacity: 0.6 }}>
            {error.toUpperCase()}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch w-full max-w-[1400px] mx-auto opacity-0 animate-[fadeIn_800ms_ease_forwards]">
            <KpCard kp={kp} history={history} />
            <SolarWindCard
              speed={data?.telemetry?.speed_km_s ?? 0}
              density={data?.telemetry?.density_p_cm3 ?? 0}
              history={history}
            />
            <MagneticFieldCard
              bz={data?.telemetry?.bz_nt ?? 0}
              history={history}
            />
            <KashmirVisionCard score={data?.aurora_score ?? 0} />
          </div>
        )}
      </section>

      {/* ── Phase 15: Geomagnetic Heatmap ── */}
      <section style={{
        position: 'relative',
        zIndex: 10,
        padding: '0 4rem 6rem 4rem',
      }}>
        {/* Section Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,220,130,0.2))' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(0,220,130,0.7)', textTransform: 'uppercase' }}>GEOMAGNETIC HEATMAP</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(0,220,130,0.2), transparent)' }} />
        </div>

        {/* The Card */}
        <div style={{
          width: '100%',
          minHeight: 600,
          background: 'rgba(6,9,18,0.85)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* Corner Coordinates */}
          {[['top-3 left-4', '90.0°N 180.0°W'], ['top-3 right-4', '90.0°N 180.0°E'],
            ['bottom-12 left-4', '0.0°N 180.0°W'], ['bottom-12 right-4', '0.0°N 180.0°E']]
            .map(([pos, label]) => (
              <span key={label} className={`absolute ${pos} font-mono text-[8px] text-white/20 tracking-widest`}>{label}</span>
            ))}

          {/* World map grid dots */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.12 }}>
            <defs>
              <pattern id="map-dots" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse">
                <circle cx="6" cy="4" r="0.7" fill="rgba(255,255,255,0.9)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-dots)" />
          </svg>

          {/* Continent silhouette layer (abstract horizontal bars) */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
            {/* North America */}
            <ellipse cx="22%" cy="42%" rx="11%" ry="14%" fill="white" />
            {/* Europe */}
            <ellipse cx="49%" cy="38%" rx="6%" ry="10%" fill="white" />
            {/* Asia */}
            <ellipse cx="66%" cy="37%" rx="14%" ry="12%" fill="white" />
            {/* Africa */}
            <ellipse cx="50%" cy="60%" rx="7%" ry="12%" fill="white" />
            {/* South America */}
            <ellipse cx="30%" cy="65%" rx="6%" ry="10%" fill="white" />
            {/* Australia */}
            <ellipse cx="77%" cy="68%" rx="6%" ry="7%" fill="white" />
          </svg>

          {/* Latitude grid lines */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
            {[20,35,50,65,80].map(pct => (
              <line key={pct} x1="0" y1={`${pct}%`} x2="100%" y2={`${pct}%`} stroke="white" strokeWidth="0.5" />
            ))}
            {[16,32,48,64,80].map(pct => (
              <line key={pct} x1={`${pct}%`} y1="0" x2={`${pct}%`} y2="100%" stroke="white" strokeWidth="0.5" />
            ))}
          </svg>

          {/* Auroral Oval glow — centered near North (top ~20%) */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            height: '55%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.9) 0%, rgba(0,220,130,0.7) 35%, rgba(0,220,130,0) 70%)',
            mixBlendMode: 'screen',
            opacity: 0.45,
            filter: 'blur(24px)',
            animation: 'pulseGlow 4s ease-in-out infinite alternate',
          }} />

          {/* Secondary southern aurora hint */}
          <div style={{
            position: 'absolute',
            bottom: '-5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '28%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(0,220,130,0.5) 0%, rgba(0,220,130,0) 70%)',
            mixBlendMode: 'screen',
            opacity: 0.25,
            filter: 'blur(20px)',
          }} />

          {/* Bottom HUD Controls */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(2,4,9,0.8)',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            padding: '0.6rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(0,220,130,0.7)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>12H IMPACT FORECAST</span>
            <input
              type="range"
              min={0} max={12} defaultValue={6} step={0.5}
              style={{
                flex: 1,
                height: 2,
                appearance: 'none',
                background: 'linear-gradient(90deg, rgba(0,220,130,0.8) 50%, rgba(255,255,255,0.1) 50%)',
                outline: 'none',
                cursor: 'crosshair',
                accentColor: '#00DC82',
              }}
            />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>T+06:00</span>
          </div>
        </div>
      </section>

      {/* ── Phase 16: Live Optical Network ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 4rem 8rem 4rem' }}>

        {/* Section Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,220,130,0.2))' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(0,220,130,0.7)', textTransform: 'uppercase' }}>LIVE OPTICAL NETWORK</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(0,220,130,0.2), transparent)' }} />
        </div>

        {/* Camera Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([
            { id: 'CAM_01', label: 'TROMSØ OBSERVATORY',  lat: '69.6°N', lon: '18.9°E', tint: 'rgba(0,220,130,0.06)' },
            { id: 'CAM_02', label: 'KIRUNA RADAR',         lat: '67.8°N', lon: '20.2°E', tint: 'rgba(245,158,11,0.05)' },
            { id: 'CAM_03', label: 'REYKJAVIK CAM',        lat: '64.1°N', lon: '21.9°W', tint: 'rgba(167,139,250,0.05)' },
          ] as const).map((cam) => (
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

      {/* ── Phase 17: System Event Log ── */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 4rem 10rem 4rem' }}>
        {/* Section Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,220,130,0.2))' }} />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(0,220,130,0.7)', textTransform: 'uppercase' }}>SYSTEM EVENT LOG</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(0,220,130,0.2), transparent)' }} />
        </div>

        {/* Terminal Window */}
        <div style={{
          width: '100%',
          height: 256,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 4,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Terminal Header */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            padding: '0.5rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>TERMINAL_SESSION_01 // L1_DOWNLINK</span>
          </div>

          {/* Log Stream */}
          <div className="custom-scrollbar" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.7rem',
            lineHeight: '1.6',
          }}>
            {[
              { type: 'SYSTEM', msg: 'AURORALENS INITIALIZATION SEQUENCE START...' },
              { type: 'SYNC',   msg: 'ESTABLISHING HANDSHAKE WITH DSCOVR L1 GATEWAY' },
              { type: 'INFO',   msg: 'DOWNLINK SECURED. BITRATE: 1.2 GBPS' },
              { type: 'SYNC',   msg: 'KP INDEX UPDATED: 6.33 [G2 MODERATE STORM]' },
              { type: 'WARN',   msg: 'SOLAR WIND VELOCITY SPIKE DETECTED (+42 KM/S)' },
              { type: 'INFO',   msg: 'NEURAL NET RE-CALIBRATING PROBABILITY VECTORS' },
              { type: 'SYSTEM', msg: 'KASHMIR SECTOR SCANNING ACTIVE...' },
              { type: 'INFO',   msg: 'GEOMAGNETIC HEATMAP DATA REFRESH COMPLETE' },
              { type: 'SYSTEM', msg: 'BACKGROUND PROCESSES NOMINAL.' },
            ].map((log, i) => (
              <div key={i} className="animate-[fadeIn_500ms_ease_forwards]" style={{ opacity: 0, animationDelay: `${i * 150}ms`, marginBottom: '0.25rem' }}>
                <span style={{
                  color: log.type === 'WARN' ? 'var(--color-accent-danger, #EF4444)' :
                         log.type === 'SYNC' ? 'var(--color-accent-plasma, #A78BFA)' :
                         log.type === 'INFO' ? 'var(--color-aurora-primary, #00DC82)' :
                         'rgba(255,255,255,0.3)',
                  marginRight: '0.75rem'
                }}>
                  [{log.type.padEnd(6)}]
                </span>
                <span style={{ color: 'rgba(255,255,255,0.65)' }}>{log.msg}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-white/20">{'>'}</span>
              <span className="animate-pulse w-2 h-4 bg-aurora-primary opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Prototype label (FIXED for scroll) ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.55rem',
          color: 'rgba(255,255,255,0.15)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          zIndex: 20,
        }}
      >
        Idea 3 · Command Center Desk · Design Prototype
      </div>


      {/* ── Inline keyframes ── */}
      <style>{`
        @keyframes orbitalSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes earthSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #00DC82; }
          50%       { opacity: 0.6; box-shadow: 0 0 12px #00DC82; }
        }
        @keyframes auroraOvalPulse {
          0%   { opacity: 0.15; transform: translate(-50%, -50%) scale(0.95); }
          100% { opacity: 0.35; transform: translate(-50%, -50%) scale(1.10); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hudBracketLoad {
          0% { opacity: 0; transform: scale(1.5) rotate(var(--rot)); }
          100% { opacity: 1; transform: scale(1) rotate(var(--rot)); }
        }
        @keyframes pulseBar {
          0%, 100% { opacity: 1; width: 40px; }
          50%       { opacity: 0.4; width: 24px; }
        }
        * { box-sizing: border-box; }
        input::placeholder {
          font-family: 'IBM Plex Sans', sans-serif;
          color: rgba(255,255,255,0.22);
          transition: opacity 200ms ease;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 220, 130, 0.35);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 220, 130, 0.6);
        }
      `}</style>
    </div>
  );
}
