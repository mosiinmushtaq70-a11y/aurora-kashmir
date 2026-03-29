'use client';

import React, { useMemo } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & LOGIC
// ─────────────────────────────────────────────────────────────────────────────

export interface AuroraDialData {
  kp: number;           // 0–9
  solarWindSpeed: number; // km/s
  bz: number;           // nT
  cloudCover: number;   // 0–100%
  stormClass?: string;
}

interface VisualSystem {
  themeColor: string;
  glowColor: string;
  accentColor: string;
  energyScale: number;    // 0.5 to 2.0 based on activity
  plasmaSpeed: number;
  rotationSpeed: number;
  corePulseRate: number;
  opacity: number;
}

function computeVisualSystem(data: AuroraDialData): VisualSystem {
  const { kp, solarWindSpeed, bz, cloudCover } = data;
  
  // Theme selection
  let themeColor = '#00F5C4', glowColor = 'rgba(0, 245, 196, 0.4)', accentColor = '#4FFFE1';
  if (kp >= 3 && kp < 5) { themeColor = '#00E5FF'; glowColor = 'rgba(0, 229, 255, 0.4)'; accentColor = '#70F3FF'; }
  else if (kp >= 5 && kp < 7) { themeColor = '#FFD700'; glowColor = 'rgba(255, 215, 0, 0.4)'; accentColor = '#FFF1A8'; }
  else if (kp >= 7) { themeColor = '#FF4D4D'; glowColor = 'rgba(255, 77, 77, 0.4)'; accentColor = '#FFB3B3'; }

  const energyScale = 0.8 + (kp / 9) * 1.2;
  const plasmaSpeed = (solarWindSpeed / 400) * (bz < 0 ? 1.5 : 1.0);
  const rotationSpeed = 40 / plasmaSpeed;
  const corePulseRate = 2 + (kp / 4);
  const opacity = 1 - (cloudCover / 100) * 0.4;

  return { themeColor, glowColor, accentColor, energyScale, plasmaSpeed, rotationSpeed, corePulseRate, opacity };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const TelemetryNode: React.FC<{ 
  angle: number; 
  radius: number; 
  label: string; 
  value: string; 
  unit: string;
  systemRotation: any;
  color: string;
}> = ({ angle, radius, label, value, unit, systemRotation, color }) => {
  const x = useTransform(systemRotation, (r: number) => Math.cos(((angle + r) - 90) * Math.PI / 180) * radius);
  const y = useTransform(systemRotation, (r: number) => Math.sin(((angle + r) - 90) * Math.PI / 180) * radius);
  const nodeRotation = useTransform(systemRotation, (r: number) => -r);

  return (
    <motion.div
      style={{ x, y, rotate: nodeRotation, top: '50%', left: '50%' }}
      className="absolute flex items-start gap-3 pointer-events-none"
    >
      {/* The "Particle" Node */}
      <div className="relative mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]" />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -inset-1 rounded-full border border-white/30" 
        />
        {/* Trailing energy tether */}
        <div className="absolute top-1/2 left-full w-4 h-px bg-linear-to-r from-white/40 to-transparent" />
      </div>

      {/* Atmospheric Typography (Zero Box-UI) */}
      <div className="flex flex-col -mt-1 group">
        <span className="text-[7px] font-black tracking-[0.3em] uppercase leading-none mb-1 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color }}>
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-light text-white/90 tracking-tighter tabular-nums">
            {value}
          </span>
          <span className="text-[8px] font-medium text-white/30 uppercase">{unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// AURORA DIAL MAIN
// ─────────────────────────────────────────────────────────────────────────────

const AuroraDial: React.FC<{ data?: Partial<AuroraDialData> }> = ({ data = {} }) => {
  const merged = { kp: 6.2, solarWindSpeed: 620, bz: -8.4, cloudCover: 15, ...data };
  const sys = useMemo(() => computeVisualSystem(merged), [merged]);
  
  const rotationOffset = useMotionValue(0);
  const driftX = useMotionValue(0);
  const driftY = useMotionValue(0);

  useAnimationFrame((time) => {
    rotationOffset.set((time / (sys.rotationSpeed * 10)) % 360);
    driftX.set(Math.sin(time / 2000) * 4);
    driftY.set(Math.cos(time / 2500) * 4);
  });

  return (
    <div
      className="relative flex items-center justify-center p-20 origin-center max-md:scale-[0.72] max-md:-mx-[52px] max-md:-my-[52px]"
      style={{ opacity: sys.opacity }}
    >
      
      {/* ── PLASMA ENGINE (SVG LAYER) ────────────────────────────────────── */}
      <svg width="460" height="460" viewBox="-230 -230 460 460" className="absolute pointer-events-none">
        <defs>
          <filter id="plasmaBlur">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <radialGradient id="coreGlow">
            <stop offset="0%" stopColor={sys.themeColor} stopOpacity="0.4" />
            <stop offset="60%" stopColor={sys.themeColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="streamGrad" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={sys.themeColor} stopOpacity="0" />
            <stop offset="50%" stopColor={sys.accentColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={sys.themeColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Deep Field Glow */}
        <motion.circle 
          r="160" 
          fill="url(#coreGlow)"
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Magnetic Field Lines (Interactive paths) */}
        <g strokeWidth="0.5" stroke="rgba(255,255,255,0.08)" fill="none">
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse 
              key={i} 
              cx="0" cy="0" rx={80 + i * 15} ry={120 + i * 5} 
              transform={`rotate(${(i / 12) * 180})`}
              className="opacity-20"
            />
          ))}
        </g>

        {/* The Plasma Stream (Physics-driven stroke) */}
        <motion.g style={{ rotate: rotationOffset }}>
          <circle 
            r="180" fill="none" 
            stroke="url(#streamGrad)" 
            strokeWidth="2"
            strokeDasharray="120 400"
            strokeLinecap="round"
            filter="url(#plasmaBlur)"
          />
          {/* Smaller, faster plasma wisps */}
          <motion.circle 
             r="176" fill="none" 
             stroke={sys.accentColor} 
             strokeWidth="0.5"
             strokeDasharray="2 30"
             opacity="0.4"
             animate={{ rotate: [0, 360] }}
             transition={{ duration: sys.rotationSpeed / 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.g>

        {/* Static telemetric markers */}
        <g opacity="0.1">
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = (i / 72) * 360;
            const x1 = Math.cos(angle * Math.PI / 180) * 190;
            const y1 = Math.sin(angle * Math.PI / 180) * 190;
            const x2 = Math.cos(angle * Math.PI / 180) * (i % 6 === 0 ? 200 : 194);
            const y2 = Math.sin(angle * Math.PI / 180) * (i % 6 === 0 ? 200 : 194);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" />;
          })}
        </g>
      </svg>

      {/* ── TELEMETRY NODES (POLAR) ──────────────────────────────────────── */}
      <div className="absolute inset-0">
        <TelemetryNode 
          angle={320} radius={180} label="Solar Velocity" value={merged.solarWindSpeed.toString()} unit="km/s"
          systemRotation={rotationOffset} color={sys.themeColor}
        />
        <TelemetryNode 
          angle={40} radius={180} label="Interplanetary Bz" value={merged.bz.toFixed(1)} unit="nT"
          systemRotation={rotationOffset} color={sys.themeColor}
        />
        <TelemetryNode 
          angle={200} radius={180} label="Cloud Density" value={merged.cloudCover.toString()} unit="%"
          systemRotation={rotationOffset} color={sys.themeColor}
        />
        <TelemetryNode 
          angle={140} radius={180} label="Storm Class" value={merged.stormClass || 'G0'} unit="mag"
          systemRotation={rotationOffset} color={sys.themeColor}
        />
      </div>

      {/* ── THE SINGULARITY (CENTRAL CORE) ───────────────────────────────── */}
      <motion.div 
        style={{ x: driftX, y: driftY }}
        className="relative z-20 flex flex-col items-center justify-center w-56 h-56 rounded-full"
      >
        {/* Core Shimmer */}
        <div className="absolute inset-0 rounded-full border border-white/5 bg-[#080B11]/40 backdrop-blur-3xl shadow-inner" />
        
        {/* Activity Indicator (The "Live" element) */}
        <motion.div 
          animate={{ scale: [0.98, 1.02, 0.98], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-4 rounded-full border border-white/3" 
        />

        <div className="relative text-center pointer-events-none select-none">
          <motion.div 
            key={merged.kp}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            className="text-8xl md:text-9xl font-['Manrope'] font-black text-white leading-none tracking-tighter"
            style={{ 
               textShadow: `0 0 40px ${sys.glowColor}, 0 0 10px rgba(255,255,255,0.2)`
            }}
          >
            {merged.kp.toFixed(1)}
          </motion.div>
          
          <div className="flex flex-col items-center mt-2 space-y-1">
            <div className="w-12 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
            <span className="text-[10px] font-black tracking-[0.5em] text-white opacity-20 uppercase">TELEMETRY KP</span>
            <motion.span 
              className="text-[9px] font-bold px-4 py-0.5 rounded-full border tracking-[0.2em] uppercase"
              style={{ 
                color: sys.themeColor, 
                borderColor: `${sys.themeColor}33`,
                backgroundColor: `${sys.themeColor}05`
              }}
            >
              {sys.themeColor === '#FF4D4D' ? 'SEVERE STORM' : 
               sys.themeColor === '#FFD700' ? 'HIGH ACTIVITY' :
               sys.themeColor === '#00E5FF' ? 'MODERATE FLUX' : 'STABLE FLUX'}
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* ── ORBITAL MICRO-READOUTS (PERIPH) ─────────────────────────────── */}
      <div className="absolute top-10 left-10 flex flex-col gap-1 opacity-20 hover:opacity-100 transition-opacity">
        <span className="text-[8px] font-mono text-white/50 lowercase tracking-widest">protocol.v4.live</span>
        <div className="w-20 h-px bg-white/20" />
      </div>

    </div>
  );
};

export default AuroraDial;
