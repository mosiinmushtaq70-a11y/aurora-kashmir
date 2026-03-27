'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

/**
 * --- getTacticalIntelligence ---
 * Color and title logic based on aurora score.
 */
export function getTacticalIntelligence(score: number) {
  if (score < 45) return { title: "MINIMAL ACTIVITY", color: "text-slate-400", border: "border-slate-500/10" };
  if (score <= 55) return { title: "TRANSITIONAL SHIFT", color: "text-amber-500", border: "border-amber-500/20" };
  if (score < 65) return { title: "ACTIVE SUBSTORM", color: "text-cyan-400", border: "border-cyan-400/20" };
  if (score <= 75) return { title: "HIGH INTENSITY", color: "text-sky-400", border: "border-sky-400/20" };
  if (score < 85) return { title: "SEVERE STORM", color: "text-purple-400", border: "border-purple-400" };
  return { title: "HISTORIC ANOMALY", color: "text-rose-500", border: "border-rose-500" };
}

interface SiteIntelligenceCardProps {
  score: number;
  locationName: string;
  cloudCover?: number;
  temperature?: number;
}

const SiteIntelligenceCard: React.FC<SiteIntelligenceCardProps> = ({ score, locationName, cloudCover = 0, temperature = 0 }) => {
  const [tacticalBrief, setTacticalBrief] = useState('Awaiting satellite telemetry...');
  const [isBriefLoading, setIsBriefLoading] = useState(true);

  const advisoryColor = useMemo(() => {
    return getTacticalIntelligence(score);
  }, [score]);

  useEffect(() => {
    if (!locationName) return;
    
    let isMounted = true;
    setIsBriefLoading(true);
    
    const fetchBrief = async () => {
      try {
        const res = await fetch('/api/tactical-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: score,
            location: locationName,
            cloudCover: cloudCover,
            temperature: temperature
          })
        });
        if (!res.ok) throw new Error('Uplink failed');
        const data = await res.json();
        if (isMounted && data.brief) {
          setTacticalBrief(data.brief);
        }
      } catch (e) {
        if (isMounted) setTacticalBrief('Telemetry connection lost. Rely on local radar.');
      } finally {
        if (isMounted) setIsBriefLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchBrief, 800);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [score, locationName, cloudCover, temperature]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`stitch-glass-panel rounded-r-2xl p-5 border-l-2 bg-[#080B11]/40 backdrop-blur-2xl border border-white/5 shadow-2xl ${advisoryColor.border}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className={advisoryColor.color} />
        <span className={`font-semibold text-[10px] tracking-[0.2em] uppercase ${advisoryColor.color}`}>
          Site Intelligence
        </span>
      </div>
      <p className={`font-['Inter',_sans-serif] font-light text-[13px] leading-relaxed text-slate-300 ${isBriefLoading ? 'animate-pulse' : ''}`}>
        {tacticalBrief}
      </p>
    </motion.div>
  );
};

export default SiteIntelligenceCard;
