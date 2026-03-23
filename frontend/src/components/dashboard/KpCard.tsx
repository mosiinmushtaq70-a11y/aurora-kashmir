'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface KpCardProps {
  kp: number;
  history?: any[];
}

const KpCard: React.FC<KpCardProps> = ({ kp, history = [] }) => {
  // Determine status and style based on Kp index
  const getStatus = (val: number) => {
    if (val < 4)  return { label: 'QUIET', color: 'text-aurora-primary', glow: 'glow-aurora' };
    if (val === 4) return { label: 'UNSETTLED', color: 'text-text-warning', glow: 'glow-solar' };
    if (val < 7)  return { label: 'STORM ALERT', color: 'text-accent-solar', glow: 'glow-solar' };
    return { label: 'EXTREME STORM', color: 'text-accent-danger', glow: 'glow-danger' };
  };

  const status = getStatus(kp);
  const isHighActivity = kp >= 5;
  const primaryColor = isHighActivity ? '#F59E0B' : '#00DC82'; // accent-solar or aurora-primary

  // Prepare data for sparkline (last 24 points)
  const chartData = history.slice(-24).map((d) => d.kp);
  
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
      colors: [primaryColor],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.0,
        stops: [0, 95],
        colorStops: [
          { offset: 0, color: primaryColor, opacity: 0.3 },
          { offset: 95, color: primaryColor, opacity: 0 },
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
    <div className={`relative group telemetry-card p-6 overflow-hidden h-full flex flex-col justify-between ${isHighActivity ? status.glow : ''}`}>
      {/* HUD Brackets Container */}
      <div className="hud-brackets" />

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="section-label mb-1">GEOMAGNETIC INDEX</p>
          <div className="flex items-baseline gap-2">
            <h3 className="font-display text-4xl font-bold tracking-tighter">
              KP<span className={status.color}>{kp.toFixed(1)}</span>
            </h3>
            {isHighActivity && (
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-accent-solar shadow-[0_0_8px_#F59E0B]"
              />
            )}
          </div>
        </div>
        <div className={`badge-${isHighActivity ? 'warning' : 'online'} text-[9px]`}>
          {status.label}
        </div>
      </div>

      {/* Sparkline (ApexCharts) */}
      <div className="flex-1 min-h-[60px] w-full mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
        <Chart 
          options={chartOptions} 
          series={[{ name: 'Kp', data: chartData }]} 
          type="area" 
          height="100%" 
          width="100%" 
        />
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-60">
        <span className="data-label text-[9px]">24H TREND</span>
        <span className="font-mono text-[9px]">RES: 1.0H</span>
      </div>
    </div>
  );
};

export default KpCard;

