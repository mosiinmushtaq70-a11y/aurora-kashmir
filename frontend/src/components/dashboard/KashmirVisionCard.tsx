'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface KashmirVisionCardProps {
  score: number; // 0-100
}

const KashmirVisionCard: React.FC<KashmirVisionCardProps> = ({ score }) => {
  // Gauge math
  const radius = 70;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const arcLength = normalizedRadius * Math.PI;
  const offset = arcLength - (score / 100) * arcLength;

  const getStatus = (val: number) => {
    if (val >= 75) return { label: 'OPTIMAL', color: 'text-aurora-primary', hex: '#00DC82', glow: 'glow-aurora' };
    if (val >= 40) return { label: 'FAINT / VISIBLE', color: 'text-text-warning', hex: '#F59E0B', glow: 'glow-solar' };
    return { label: 'OBSCURED / LOW', color: 'text-text-dim', hex: '#64748B', glow: '' };
  };

  const status = getStatus(score);

  return (
    <div className={`relative group telemetry-card p-6 overflow-hidden h-full flex flex-col items-center justify-between ${status.glow}`}>
      {/* Bento Brackets */}
      <div className="hud-brackets" />

      {/* Header */}
      <div className="w-full mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
        <p className="section-label">SOLAR FLARE PROBABILITY (12H)</p>
      </div>

      {/* Radial Gauge SVG */}
      <div className="relative flex items-center justify-center pt-2">
        <svg
          height={radius + 10}
          width={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius + 10}`}
          className="overflow-visible"
        >
          {/* Background Arc */}
          <path
            d={`M ${radius - normalizedRadius} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius + normalizedRadius} ${radius}`}
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress Arc */}
          <motion.path
            d={`M ${radius - normalizedRadius} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius + normalizedRadius} ${radius}`}
            stroke={status.hex}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`filter drop-shadow-[0_0_8px_${status.hex}]`}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-center">
          <h3 className={`font-display text-3xl font-bold tracking-tighter ${status.color}`}>
            {score.toFixed(0)}<span className="text-xs opacity-40">%</span>
          </h3>
          <p className={`font-mono text-[8px] tracking-[0.2em] mt-0.5 font-bold ${status.color}`}>
            {status.label}
          </p>
        </div>
      </div>

      {/* Local Telemetry Stats */}
      <div className="w-full mt-2 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 opacity-80">
        <div className="bg-white/5 p-2 rounded-sm text-center">
          <p className="data-label text-[8px] mb-1">CLOUD COVER</p>
          <p className="font-mono text-[10px] text-white">12%</p>
        </div>
        <div className="bg-white/5 p-2 rounded-sm text-center">
          <p className="data-label text-[8px] mb-1">CONFIDENCE</p>
          <p className="font-mono text-[10px] text-white">88%</p>
        </div>
      </div>

      {/* AI Predictive Analysis Micro-Module */}
      <div className="w-full mt-2 flex flex-col items-center justify-center gap-1 opacity-90">
        <div className="flex items-center gap-2">
          {/* Pulsing indicator */}
          <div className="relative flex h-[6px] w-[6px]">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aurora-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-[6px] w-[6px] bg-aurora-primary"></span>
          </div>
          {/* Primary Readout */}
          <p className="font-mono text-[9px] text-text-secondary tracking-widest uppercase">
            NEURAL NET FORECAST: <span className="text-aurora-primary drop-shadow-[0_0_5px_#00DC82]">ACTIVE</span>
          </p>
        </div>
        {/* Secondary Readout */}
        <p className="font-mono text-[8px] text-text-dim tracking-widest uppercase opacity-70">
          AURORAL PROBABILITY MODEL CONFIDENCE: 88.4%
        </p>
      </div>
    </div>
  );
};

export default KashmirVisionCard;

