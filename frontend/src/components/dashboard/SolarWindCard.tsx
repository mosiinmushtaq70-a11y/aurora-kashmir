'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Wind } from 'lucide-react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SolarWindCardProps {
  speed: number;
  density: number;
  history?: any[];
}

const SolarWindCard: React.FC<SolarWindCardProps> = ({ speed, density, history = [] }) => {
  // Speed trend data (last 24 points)
  const speedData = history.slice(-24).map((d) => d.speed_km_s || 0);

  const chartOptions = {
    chart: {
      type: 'area' as const,
      sparkline: { enabled: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
      background: 'transparent',
    },
    stroke: {
      curve: 'stepline' as const,
      width: 1.5,
      colors: ['#67E8F9'], // accent-ice hex
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.0,
        stops: [0, 95],
        colorStops: [
          { offset: 0, color: '#67E8F9', opacity: 0.25 },
          { offset: 95, color: '#67E8F9', opacity: 0 },
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
    <div className="relative group telemetry-card p-6 overflow-hidden h-full flex flex-col justify-between">
      {/* Bento Brackets */}
      <div className="hud-brackets" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
        <div className="p-2 border border-accent-ice/20 bg-accent-ice/5 rounded-sm">
          <Wind size={16} className="text-accent-ice" />
        </div>
        <p className="section-label">SOLAR WIND TELEMETRY</p>
      </div>

      {/* Speed & Density Display */}
      <div className="space-y-6 flex-1 flex flex-col justify-center">
        {/* Speed */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="data-label text-[10px] text-accent-ice">VELOCITY</span>
            <span className="text-[10px] text-text-dim font-mono">KM/S</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-4xl font-bold tracking-tighter text-white">
              {speed.toFixed(0)}
            </h3>
            <div className="w-1.5 h-1.5 bg-accent-ice rounded-full animate-pulse shadow-[0_0_8px_#67E8F9]" />
          </div>
        </div>

        {/* Density */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="data-label text-[10px]">PLASMA DENSITY</span>
            <span className="text-[10px] text-text-dim font-mono">P/CM³</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-3xl font-semibold tracking-tight text-white">
              {density.toFixed(2)}
            </h3>
            <div className="flex-1 h-px bg-white/5 ml-4 mb-2" />
          </div>
        </div>
      </div>

      {/* Sparkline (Velocity Trend) */}
      <div className="h-[50px] w-full mt-6 opacity-60 group-hover:opacity-100 transition-opacity">
        <Chart 
          options={chartOptions} 
          series={[{ name: 'Velocity', data: speedData }]} 
          type="area" 
          height="100%" 
          width="100%" 
        />
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center opacity-80">
        <div>
          <span className="data-label text-[8px]">STREAK</span>
          <span className="font-mono text-[9px] text-white ml-2">ACTIVE</span>
        </div>
        <div>
          <span className="data-label text-[8px]">L1 SOURCE</span>
          <span className="font-mono text-[9px] text-white ml-2">ACE/DSCOVR</span>
        </div>
      </div>
    </div>
  );
};

export default SolarWindCard;

