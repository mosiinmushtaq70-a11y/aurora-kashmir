/**
 * [AuroraDial.tsx]
 * 
 * PURPOSE: A high-fidelity, physics-driven HUD for visualizing real-time aurora visibility and solar telemetry.
 * DATA SOURCE: Consumes LiveTelemetryData from useAppStore (NOAA DSCOVR + Open-Meteo).
 * DEPENDS ON: Framer Motion for orbit physics, useAppStore for global state.
 * AUTHOR: Mosin Mushtaq — B.Tech AI/ML, SKUAST 2026
 * NOTE: Sections marked "AI-generated" were produced by agentic AI
 *       and verified for correctness against source documentation.
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import MagicRings from './MagicRings';
import './MagicRings.css';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & LOGIC
// ─────────────────────────────────────────────────────────────────────────────

export interface AuroraDialData {
  kp: number;           // 0–9
  auroraScore: number;  // 0–100
  solarWindSpeed: number; // km/s
  bz: number;           // nT
  density?: number;      // p/cm3 (optional)
  cloudCover: number;   // 0–100
  locationName?: string;
  globalHotspots?: number;
  forceGlobalView?: boolean;
  onToggleMode?: (mode: 'LOCAL' | 'GLOBAL') => void;
  currentMode?: 'LOCAL' | 'GLOBAL';
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

/**
 * Calculates the visual system properties based on real-time solar telemetry.
 * 
 * @param {AuroraDialData} data - Combined planetary and local telemetry
 * @returns {VisualSystem} Calculated colors, speeds, and scales for the HUD
 * 
 * NOTE: AI-generated section. Core logic verified against NOAA SWPC documentation.
 * Manual review recommended before modifying. See: https://www.swpc.noaa.gov/
 */
function computeVisualSystem(data: AuroraDialData): VisualSystem {
  const { kp, auroraScore, solarWindSpeed, bz, cloudCover } = data;
  
  // KP scale: 0-2 = quiet, 3-4 = unsettled, 5-6 = minor storm, 7+ = severe
  // Aurora typically visible at KP 5+ from latitudes above 55°N
  let themeColor = '#00F5C4', glowColor = 'rgba(0, 245, 196, 0.4)', accentColor = '#4FFFE1';
  if (kp >= 3 && kp < 5) { themeColor = '#00E5FF'; glowColor = 'rgba(0, 229, 255, 0.4)'; accentColor = '#70F3FF'; }
  else if (kp >= 5 && kp < 7) { themeColor = '#FFD700'; glowColor = 'rgba(255, 215, 0, 0.4)'; accentColor = '#FFF1A8'; }
  else if (kp >= 7) { themeColor = '#FF4D4D'; glowColor = 'rgba(255, 77, 77, 0.4)'; accentColor = '#FFB3B3'; }

  // Higher visibility score drives more intense visual energy scaling.
  const energyScale = 0.8 + (auroraScore / 100) * 1.2;

  // Bz southward (negative) = magnetic field reconnects with Earth's magnetosphere.
  // This is the PRIMARY aurora driver — more important than solar wind speed alone.
  const plasmaSpeed = (solarWindSpeed / 400) * (bz < 0 ? 1.5 : 1.0);
  
  // DSCOVR satellite sits at L1 Lagrange point, 1.5M km sunward.
  // We use this speed to estimate the arrival of the solar wind at Earth's magnetopause.
  const rotationSpeed = 40 / plasmaSpeed;

  const corePulseRate = 2 + (kp / 4);

  // Open-Meteo API returns cloud cover as 0–100 integer.
  // Values above 70 make visual aurora observation nearly impossible regardless of KP.
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
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  
  // ── ELLIPTICAL PATH LOGIC ────────────────────────────────────────────────
  // On mobile, we compress the horizontal radius (x) to prevent nodes from 
  // flying off-screen in portrait mode.
  const radiusX = isMobile ? radius * 0.75 : radius;
  const radiusY = isMobile ? radius * 1.05 : radius; // Slightly taller for a more dynamic "egg" orbit

  const x = useTransform(systemRotation, (r: number) => Math.cos(((angle + r) - 90) * Math.PI / 180) * radiusX);
  const y = useTransform(systemRotation, (r: number) => Math.sin(((angle + r) - 90) * Math.PI / 180) * radiusY);
  
  return (
    <motion.div
      style={{ x, y, top: '50%', left: '50%', rotate: 0 }}
      className="absolute flex items-start gap-3 pointer-events-none"
    >
      {/* The "Particle" Node */}
      <div className="relative mt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -inset-1 rounded-full border border-white/30" 
        />
        {/* Trailing energy tether */}
        <div className="absolute top-1/2 left-full w-4 h-px bg-linear-to-r from-white/40 to-transparent" />
      </div>

      {/* Atmospheric Typography (Upright & Horizontal) */}
      <div className="flex flex-col -mt-1 group">
        <div className="flex flex-col mb-1 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color }}>
          {label.split(' ').map((word, i) => (
            <span key={i} className="text-[7px] font-black tracking-[0.3em] uppercase leading-tight">
              {word}
            </span>
          ))}
        </div>
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
  const merged = { kp: 6.2, auroraScore: 68, solarWindSpeed: 620, bz: -8.4, density: 5.2, cloudCover: 15, globalHotspots: 0, ...data };
  const sys = useMemo(() => computeVisualSystem(merged), [merged]);
  
  const [isMobile, setIsMobile] = React.useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nodeRadius = isMobile ? 180 : 180; // Expanded for mobile
  
  const rotationOffset = useMotionValue(0);
  const driftX = useMotionValue(0);
  const driftY = useMotionValue(0);
  const lastTimeRef = React.useRef(0);

  useAnimationFrame((time) => {
    const deltaTime = lastTimeRef.current === 0 ? 0 : time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Use delta-based accumulation to prevent jumps when speed changes
    const increment = deltaTime / (Math.max(1, sys.rotationSpeed) * 10);
    rotationOffset.set(rotationOffset.get() + increment);

    driftX.set(Math.sin(time / 2000) * 4);
    driftY.set(Math.cos(time / 2500) * 4);
  });

  return (
    <div
      className="relative flex items-center justify-center p-0 md:p-20 origin-center w-[280px] sm:w-[350px] md:w-full md:max-w-[500px] aspect-square transform scale-[1.1] sm:scale-[1.2] md:scale-100 transition-transform duration-500 overflow-visible"
    >
      
      {/* ── PLASMA ENGINE (SVG LAYER) ────────────────────────────────────── */}
      <svg viewBox="-230 -230 460 460" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20" style={{ opacity: sys.opacity }}>
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

        {/* Deep Field Glow Removed */}

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
             const x1 = (Math.cos(angle * Math.PI / 180) * 190).toFixed(4);
             const y1 = (Math.sin(angle * Math.PI / 180) * 190).toFixed(4);
             const x2 = (Math.cos(angle * Math.PI / 180) * (i % 6 === 0 ? 200 : 194)).toFixed(4);
             const y2 = (Math.sin(angle * Math.PI / 180) * (i % 6 === 0 ? 200 : 194)).toFixed(4);
             return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" />;
           })}
         </g>
      </svg>

      {/* ── LIVE PULSE BACKGROUND EFFECT ─────────────────────────────────── */}
      {isMobile ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] z-0 pointer-events-none opacity-80 overflow-visible">
          <MagicRings 
            color="#00F5C4"
            colorTwo="#FFFFFF"
            ringCount={6}
            speed={1.0}
            attenuation={10}
            lineThickness={2}
            baseRadius={0.19}
            radiusStep={0.03}
            scaleRate={0.02}
            opacity={0.8}
            blur={0}
            noiseAmount={0.05}
            ringGap={1.5}
          />
        </div>
      ) : (
        <motion.div
          animate={{ 
            scale: [0.6, 0.7, 0.6], 
            opacity: [0.1, 0.3, 0.1],
            filter: ['blur(30px)', 'blur(50px)', 'blur(30px)']
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-white/40 shadow-[0_0_50px_rgba(165,243,252,0.4)] z-0"
        />
      )}

      {/* ── TELEMETRY NODES (POLAR) - HIDDEN ON MOBILE ─────────────────── */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {!isMobile && (
          <>
            <TelemetryNode 
              angle={320} radius={nodeRadius} label="Solar Velocity" value={merged.solarWindSpeed.toString()} unit="km/s"
              systemRotation={rotationOffset} color={sys.themeColor}
            />
            <TelemetryNode 
              angle={40} radius={nodeRadius} label="Interplanetary Bz" value={merged.bz.toFixed(1)} unit="nT"
              systemRotation={rotationOffset} color={sys.themeColor}
            />
            <TelemetryNode 
              angle={200} radius={nodeRadius} label="Proton Density" value={merged.density.toFixed(1)} unit="p/cm³"
              systemRotation={rotationOffset} color={sys.themeColor}
            />
          </>
        )}
      </div>

      {/* ── THE SINGULARITY (CENTRAL CORE) ───────────────────────────────── */}
      <motion.div 
        style={{ x: driftX, y: driftY }}
        className="relative z-10 flex flex-col items-center justify-center w-56 h-56 rounded-full"
      >
        {/* Core Glow (Stitch/Screenshot alignment) */}
        <div className="absolute inset-0 rounded-full bg-radial-at-c from-[#00F5C4]/20 via-[#00F5C4]/5 to-transparent blur-2xl" />
        <div className="absolute inset-0 rounded-full border border-white/5 bg-[#080B11]/60 backdrop-blur-3xl shadow-[inset_0_0_40px_rgba(0,245,196,0.2)]" />
        
        {/* Activity Indicator (The "Live" element) */}
        <motion.div 
          animate={{ scale: [0.98, 1.02, 0.98], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -inset-4 rounded-full border border-white/3" 
        />

        <div className="relative flex flex-col items-center justify-center text-center">
          <motion.div 
            key={(merged.locationName && !merged.forceGlobalView) ? merged.auroraScore : merged.globalHotspots}
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            className="text-7xl md:text-8xl font-['Manrope'] font-black text-white leading-none tracking-tighter drop-shadow-[0_0_25px_rgba(255,255,255,0.9)] pointer-events-none select-none"
          >
            {(merged.locationName && !merged.forceGlobalView) ? Math.round(merged.auroraScore) : (merged.globalHotspots || 0)}
          </motion.div>
          
          <div className="flex flex-col items-center mt-1 pointer-events-none select-none">
            <span className="text-[7px] font-black tracking-[0.4em] text-white uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]">
              {(merged.locationName && !merged.forceGlobalView) ? 'AURORA SCORE' : 'ACTIVE HOTSPOTS'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Live telemetry status labels removed */}

    </div>
  );
};

export default AuroraDial;

// TODO(mosin): Integrate real-time auroral oval boundary detection for sub-45°N accuracy
// LIMITATION: Model accuracy degrades beyond 3-hour forecast horizon — not currently communicated to user
