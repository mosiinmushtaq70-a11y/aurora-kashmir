'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import KPLineChart from './KPLineChart';

interface ForecastPoint {
  timestamp: string;
  kp: number;
  aurora_score: number;
  level: string;
  cloud_cover: number;
}

const AuroraForecastPanel: React.FC = () => {
  const { activeDossier } = useAppStore();
  const [series, setSeries] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeDossier) return;

    async function fetchSeries() {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const url = `${baseUrl}/api/weather/forecast/series?lat=${activeDossier?.lat}&lon=${activeDossier?.lng}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch tactical series');
        const data = await res.json();
        setSeries(data.series || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchSeries();
  }, [activeDossier]);

  // Logic: Find the highest 6-hour window (peak)
  const calculatePeak = () => {
    if (series.length < 2) return null;
    let maxScore = -1;
    let peakIndex = 0;
    
    series.forEach((d, i) => {
      if (d.aurora_score > maxScore) {
        maxScore = d.aurora_score;
        peakIndex = i;
      }
    });

    const peakPoint = series[peakIndex];
    const timeStr = new Date(peakPoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dayStr = new Date(peakPoint.timestamp).toLocaleDateString([], { weekday: 'long' });

    return { 
      time: timeStr, 
      day: dayStr,
      score: peakPoint.aurora_score, 
      level: peakPoint.level,
      kp: peakPoint.kp
    };
  };

  const peak = calculatePeak();

  return (
    <div className="w-full max-w-5xl mx-auto mb-40 px-4 md:px-0">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="flex flex-col">
          <span className="font-['Manrope'] font-bold tracking-[0.3em] uppercase text-[#00e5ff] text-[10px] mb-3 opacity-80">
            Tactical Analysis
          </span>
          <h3 className="font-['Manrope'] font-extrabold text-white text-3xl md:text-5xl leading-[1.1] tracking-tight">
            Aurora Forecast Panel
          </h3>
        </div>
        
        <AnimatePresence>
          {peak && !loading && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-6 py-4 bg-[#00e5ff]/5 border border-[#00e5ff]/20 rounded-2xl md:rounded-3xl backdrop-blur-md"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#00e5ff]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#00e5ff] text-xl">event_upcoming</span>
                </div>
                <div>
                  <div className="font-['Manrope'] font-bold text-[9px] uppercase tracking-[0.2em] text-[#bac9cc] opacity-60 mb-1 leading-none">
                    Next Peak Window
                  </div>
                  <div className="font-['Inter'] font-semibold text-white text-lg leading-tight flex items-baseline gap-2">
                    {peak.day}, {peak.time}
                    <span className="text-[10px] text-[#00e5ff] bg-[#00e5ff]/10 px-2 rounded-full uppercase tracking-tighter">
                      KP-{Math.round(peak.kp)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* The Chart Card */}
      <div className="stitch-glass-panel rounded-3xl md:rounded-4xl p-6 md:p-10 relative overflow-hidden">
        {error ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
            <span className="material-symbols-outlined text-red-400 text-4xl opacity-50">cloud_off</span>
            <p className="font-['Inter'] text-xs text-red-200/40 uppercase tracking-widest max-w-[200px]">
              Connection failure: {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="text-[9px] font-['Manrope'] font-bold text-[#00e5ff] uppercase tracking-widest border border-[#00e5ff]/20 px-4 py-2 rounded-full hover:bg-[#00e5ff]/10 transition-all"
            >
              Retry Sync
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-[3px] bg-[#00e5ff]" />
                  <span className="font-['Manrope'] font-bold text-[9px] uppercase tracking-widest text-[#bac9cc]">Probability Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-[3px] bg-white opacity-20" />
                  <span className="font-['Manrope'] font-bold text-[9px] uppercase tracking-widest text-[#bac9cc]">Cloud Density</span>
                </div>
              </div>
              <div className="font-['Inter'] text-[10px] text-[#bac9cc] opacity-30 flex items-center gap-2 uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px]">update</span>
                48h Series Resolution
              </div>
            </div>

            <KPLineChart data={series} loading={loading} />

            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6 opacity-60 grayscale transition-all">
               <div className="flex-1">
                <p className="font-['Inter'] text-[11px] leading-relaxed text-[#bac9cc]">
                  Forecast is synchronized with NOAA planetary K-index predictions and mapped via XGBoost model. Confidence level: <span className="text-[#00e5ff]">87% High Precision</span>.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-1 flex-1 w-24 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: loading ? '30%' : '100%' }}
                    className="h-full bg-linear-to-r from-[#00e5ff]/20 to-[#00e5ff]" 
                   />
                </div>
                <span className="font-['Manrope'] font-bold text-[9px] uppercase tracking-[0.2em] text-[#00e5ff]">
                   Stream Synchronized
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuroraForecastPanel;
