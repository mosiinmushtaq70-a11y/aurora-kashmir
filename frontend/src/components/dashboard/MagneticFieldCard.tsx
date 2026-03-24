'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Target, ArrowUp, ArrowDown } from 'lucide-react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface MagneticFieldCardProps {
  bz: number;
  history?: any[];
}

const MagneticFieldCard: React.FC<MagneticFieldCardProps> = ({ bz, history = [] }) => {
  const isSouthward = bz < 0;
  const isCritical = bz < -10;
  
  // Theme based on magnetic orientation
  const theme = isCritical 
    ? { color: 'text-accent-danger', hex: '#EF4444', glow: 'glow-danger', label: 'CRITICAL SOUTH' }
    : isSouthward 
      ? { color: 'text-accent-solar', hex: '#F59E0B', glow: 'glow-solar', label: 'SOUTHWARD' }
      : { color: 'text-aurora-primary', hex: '#00DC82', glow: '', label: 'NORTHWARD (STABLE)' };

  // Prepare data for sparkline (last 24 points)
  const chartData = history.slice(-24).map((d) => d.bz_nt || 0);

  const chartOptions = {
    chart: {
      type: 'area' as const,
      sparkline: { enabled: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
      background: 'transparent',
    },
    stroke: {
      curve: 'smooth' as const,
      width: 1.5,
      colors: [theme.hex],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.0,
        stops: [0, 95],
        colorStops: [
          { offset: 0, color: theme.hex, opacity: 0.2 },
          { offset: 95, color: theme.hex, opacity: 0 },
        ]
      }
    },
    tooltip: {
      fixed: { enabled: false },
      x: { show: false },
      y: { title: { formatter: () => '' } },
      marker: { show: false }
    },
  };

  return (
    <div className={`relative group telemetry-card p-4 md:p-6 overflow-hidden h-full flex flex-col justify-between ${theme.glow}`}>
      {/* Bento Brackets */}
      <div className="hud-brackets" />

      {/* Header */}
      <div className="mb-6 flex justify-between items-start opacity-80 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-3">
          <div className={`hidden md:block p-2 border border-white/10 bg-white/5 rounded-sm ${isSouthward ? 'bg-accent-solar/5 border-accent-solar/20' : ''}`}>
            <Target size={16} className={theme.color} />
          </div>
          <p className="section-label">IMF BZ VECTOR</p>
        </div>
        <div className={`hidden md:block badge-${isCritical ? 'danger' : isSouthward ? 'warning' : 'online'} text-[9px]`}>
          {theme.label}
        </div>
      </div>

      {/* Primary Metric */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-baseline gap-2 mb-2">
          <h3 className={`font-display text-3xl md:text-5xl font-bold tracking-tighter ${theme.color}`}>
            {bz.toFixed(1)}
          </h3>
          <span className="text-[10px] text-text-dim font-mono">NT</span>
        </div>

        {/* Orientation Indicator */}
        <div className="hidden md:flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-white/5 relative">
            {/* Zero point marker */}
            <div className="absolute left-1/2 -top-1 w-px h-2 bg-white/20" />
            {/* Active needle */}
            <div 
              className={`absolute top-0 w-1 h-1 rounded-full transition-all duration-1000 ${isSouthward ? 'bg-accent-solar shadow-[0_0_8px_#F59E0B]' : 'bg-aurora-primary shadow-[0_0_8px_#00DC82]'}`}
              style={{ left: `${Math.max(0, Math.min(100, 50 + (bz * 2)))}%` }}
            />
          </div>
          <div className={`p-1 rounded-full bg-white/5 ${isSouthward ? 'animate-[bounce_2s_infinite]' : ''}`}>
            {isSouthward ? <ArrowDown size={14} className={theme.color} /> : <ArrowUp size={14} className={theme.color} />}
          </div>
        </div>
      </div>

      {/* Sparkline (Magnetic Field Trend) */}
      <div className="hidden md:block h-[30px] w-full mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
        <Chart 
          options={chartOptions} 
          series={[{ name: 'Bz', data: chartData }]} 
          type="area" 
          height="100%" 
          width="100%" 
        />
      </div>

      {/* Footer Info (Animated Details) */}
      <details className="hidden md:block mt-3 pt-3 border-t border-white/5 opacity-90 group cursor-pointer">
        <summary className="data-label text-[10px] font-bold outline-none flex items-center justify-between list-none [&::-webkit-details-marker]:hidden" style={{ color: theme.hex }}>
          WHAT IS THIS?
          <span className="text-white/30 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <p className="font-sans text-xs text-slate-300 leading-snug mt-2 pointer-events-none">
          Interplanetary Magnetic Field. A negative Bz (<strong className="text-white">{'<'} 0 nT</strong>) means it points 'South', cracking Earth's shield to fuel the aurora.
        </p>
      </details>
    </div>
  );
};

export default MagneticFieldCard;

