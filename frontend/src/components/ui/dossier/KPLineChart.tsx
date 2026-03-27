'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  timestamp: string;
  kp: number;
  aurora_score: number;
}

interface KPLineChartProps {
  data: DataPoint[];
  loading?: boolean;
}

const KPLineChart: React.FC<KPLineChartProps> = ({ data, loading }) => {
  if (loading || data.length === 0) {
    return (
      <div className="w-full h-64 bg-white/5 animate-pulse rounded-xl flex items-center justify-center">
        <span className="font-['Manrope'] text-[10px] uppercase tracking-widest text-[#bac9cc] opacity-40">
          Generating Forecast Grid...
        </span>
      </div>
    );
  }

  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 40, bottom: 40, left: 60 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scaling helpers
  const getX = (index: number) => padding.left + (index / (data.length - 1)) * chartWidth;
  const getY = (score: number) => padding.top + chartHeight - (score / 100) * chartHeight;

  // Path generation
  const points = data.map((d, i) => `${getX(i)},${getY(d.aurora_score)}`).join(' ');
  const linePath = `M ${points}`;
  
  // Area fill path
  const areaPath = `${linePath} L ${getX(data.length - 1)},${padding.top + chartHeight} L ${padding.left},${padding.top + chartHeight} Z`;

  // Time labels (every 3rd point or similar)
  const labels = data.filter((_, i) => i % 3 === 0);

  return (
    <div className="w-full overflow-hidden">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-auto overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
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
              x={padding.left - 10} 
              y={getY(level) + 4} 
              textAnchor="end"
              className="fill-[#bac9cc] opacity-30 font-['Inter'] text-[10px]"
            >
              {level}%
            </text>
          </g>
        ))}

        {/* Threshold Line (KP-5 => Score approx 55-60) */}
        <line 
          x1={padding.left} 
          x2={width - padding.right} 
          y1={getY(55)} 
          y2={getY(55)} 
          className="stroke-[#00e5ff] stroke-[1px] stroke-dasharray-[4,4] opacity-30"
        />
        <text 
          x={width - padding.right + 5} 
          y={getY(55) + 4} 
          className="fill-[#00e5ff] opacity-40 font-['Manrope'] font-bold text-[9px] uppercase tracking-tighter"
        >
          Visible (KP-5)
        </text>

        {/* Area Fill */}
        <motion.path 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          d={areaPath} 
          fill="url(#chartGradient)" 
          className="opacity-20"
        />

        {/* Probability Line */}
        <motion.polyline 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          points={points} 
          fill="none" 
          stroke="#00e5ff" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Data points (Circles) */}
        {data.map((d, i) => (
          <circle 
            key={i} 
            cx={getX(i)} 
            cy={getY(d.aurora_score)} 
            r="3" 
            className="fill-[#00e5ff] stroke-[#080B11] stroke-[1.5px] opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-help"
          >
            <title>{`Time: ${new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\nScore: ${d.aurora_score}%\nKP index: ${d.kp}`}</title>
          </circle>
        ))}

        {/* X-Axis Time Labels */}
        {labels.map((d, i) => {
          const date = new Date(d.timestamp);
          const timeStr = date.getHours() === 0 ? date.toLocaleDateString([], { month: 'short', day: 'numeric' }) : `${date.getHours()}:00`;
          const actualIndex = data.indexOf(d);
          return (
            <text 
              key={i} 
              x={getX(actualIndex)} 
              y={height - 15} 
              textAnchor="middle" 
              className="fill-[#bac9cc] opacity-40 font-['Inter'] text-[10px]"
            >
              {timeStr}
            </text>
          );
        })}

        {/* Gradients */}
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default KPLineChart;
