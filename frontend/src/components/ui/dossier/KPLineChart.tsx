'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  timestamp: string;
  kp: number;
  aurora_score: number;
  cloud_cover: number;
}

interface KPLineChartProps {
  data: DataPoint[];
  loading?: boolean;
}

const KPLineChart: React.FC<KPLineChartProps> = ({ data, loading }) => {
  if (loading || data.length === 0) {
    return (
      <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">
        <span className="font-['Manrope'] text-[10px] uppercase tracking-widest text-[#bac9cc] opacity-40">
          Syncing Orbital Data...
        </span>
      </div>
    );
  }

  const width = 1000;
  const height = 300;
  const padding = { top: 40, right: 40, bottom: 40, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scaling helpers
  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (score: number) => padding.top + chartHeight - (score / 100) * chartHeight;

  // Find Peak Window (highest aurora score)
  const peakIndex = data.reduce((prev, curr, idx, arr) => curr.aurora_score > arr[prev].aurora_score ? idx : prev, 0);
  const peakX = getX(peakIndex);

  // Path generation - Aurora Probability
  const auroraPoints = data.map((d, i) => `${getX(i)},${getY(d.aurora_score)}`).join(' ');
  const auroraLinePath = `M ${auroraPoints}`;
  
  // Path generation - Cloud Cover
  const cloudPoints = data.map((d, i) => `${getX(i)},${getY(d.cloud_cover)}`).join(' ');
  const cloudLinePath = `M ${cloudPoints}`;

  // Area fill path for Aurora
  const areaPath = `${auroraLinePath} L ${getX(data.length - 1)},${padding.top + chartHeight} L ${padding.left},${padding.top + chartHeight} Z`;

  // Time labels
  const labels = data.filter((_, i) => i % 6 === 0);

  return (
    <div className="w-full h-full">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Gradients */}
        <defs>
          <linearGradient id="auroraGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="peakGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines (Horizontal) */}
        {[0, 25, 50, 75, 100].map((level) => (
          <g key={level}>
            <line 
              x1={padding.left} 
              x2={width - padding.right} 
              y1={getY(level)} 
              y2={getY(level)} 
              className="stroke-white/5 stroke-[1px]" 
            />
            <text 
              x={padding.left - 15} 
              y={getY(level) + 4} 
              textAnchor="end"
              className="fill-white/20 font-['Inter'] text-[10px] font-medium"
            >
              {level}%
            </text>
          </g>
        ))}

        {/* Peak Window Highlight */}
        {data.length > 0 && data[peakIndex].aurora_score > 40 && (
          <g>
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              x={peakX - 50}
              y={padding.top}
              width="100"
              height={chartHeight}
              fill="url(#peakGradient)"
              className="pointer-events-none"
            />
            <motion.line
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              x1={peakX}
              x2={peakX}
              y1={padding.top}
              y2={padding.top + chartHeight}
              className="stroke-[#00e5ff]/40 stroke-[1.5px] stroke-dasharray-[4,2] origin-bottom"
            />
            <motion.text
              initial={{ opacity: 0, y: padding.top - 5 }}
              animate={{ opacity: 1, y: padding.top - 10 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              x={peakX}
              textAnchor="middle"
              className="fill-[#00e5ff] font-['Manrope'] font-black text-[8px] tracking-[0.2em] uppercase"
            >
              Peak Opportunity
            </motion.text>
          </g>
        )}

        {/* Cloud Cover Line (Dashed, Muted) */}
        <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          d={cloudLinePath} 
          fill="none" 
          stroke="white" 
          strokeWidth="1.5" 
          strokeDasharray="6,4"
          strokeLinecap="round" 
        />

        {/* Aurora Area Fill */}
        <motion.path 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          d={areaPath} 
          fill="url(#auroraGradient)" 
        />

        {/* Aurora Probability Line (Bold Teal) */}
        <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          d={auroraLinePath} 
          fill="none" 
          stroke="#00e5ff" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Data points (Hover only) */}
        {data.map((d, i) => (
          <g key={i} className="group/point">
            <circle 
              cx={getX(i)} 
              cy={getY(d.aurora_score)} 
              r="4" 
              className="fill-[#00e5ff] stroke-[#0A0E1A] stroke-[2px] opacity-0 group-hover/point:opacity-100 transition-opacity duration-200 cursor-crosshair"
            />
            <rect 
              x={getX(i) - 20} 
              y={padding.top} 
              width="40" 
              height={chartHeight} 
              fill="transparent" 
              className="cursor-crosshair"
            />
          </g>
        ))}

        {/* X-Axis Time Labels */}
        {labels.map((d, i) => {
          const date = new Date(d.timestamp);
          const timeStr = `${date.getHours().toString().padStart(2, '0')}:00`;
          const actualIndex = data.indexOf(d);
          return (
            <text 
              key={i} 
              x={getX(actualIndex)} 
              y={height - 10} 
              textAnchor="middle" 
              className="fill-white/30 font-['Manrope'] font-bold text-[10px] uppercase tracking-wider"
            >
              {timeStr}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default KPLineChart;
