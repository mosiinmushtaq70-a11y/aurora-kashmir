'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Clock } from 'lucide-react';

export default function TimelineScrubber() {
  const { timeScrubber, setTimeScrubber, scenicMode } = useAppStore();

  // Hide the timeline in cinematic mode — it's an analytical tool, not scenic
  if (scenicMode) return null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);

    setTimeScrubber(val);
  };

  const getLabel = (value: number) => {
    if (value === 0) return 'Right Now';
    return `+${value} Hours`;
  };

  const getDayLabel = (value: number) => {
    if (value === 0) return 'Today';
    if (value === 24) return 'Tomorrow';
    if (value === 48) return 'Day 3';
    if (value === 72) return 'Day 4';
    return '';
  };

  const calculateTickPosition = (hour: number) => {
    return `${(hour / 72) * 100}%`;
  };

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 50, opacity: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed md:absolute bottom-4 md:bottom-8 left-0 md:left-1/2 md:-translate-x-1/2 z-50 w-full md:w-[600px]"
    >
      <div className="relative w-full px-8 md:p-0 flex flex-col items-center">
        {/* Unified Tracker Wrapper */}
        <div className="relative w-full h-6 md:h-2">
          {/* Track Background (The Groove) */}
          <div className="absolute inset-0 w-full h-full bg-black/60 md:bg-white/5 rounded-full border border-white/5 md:border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] md:shadow-none" />
          
          {/* Active Track */}
          <div 
            className="absolute inset-y-0 left-0 bg-linear-to-r from-[#00d4ff]/40 to-cyan-400/40 md:from-[#00d4ff] md:to-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.2)] md:shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            style={{ width: `${(timeScrubber / 72) * 100}%` }}
          />

          {/* Custom Slider Input */}
          <input
            type="range"
            min="0"
            max="72"
            step="3"
            value={timeScrubber}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full appearance-none bg-transparent outline-none cursor-pointer z-50 slider-thumb"
          />

          {/* Timeline Markers */}
          <div className="absolute top-full left-0 w-full h-6 pointer-events-none data-ticks mt-1 md:mt-2">
            {[0, 24, 48, 72].map((hour) => (
              <div
                key={hour}
                className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                style={{ left: calculateTickPosition(hour) }}
              >
                <div className={`w-px h-2 ${timeScrubber >= hour ? 'bg-cyan-400' : 'bg-white/20'}`} />
                <span style={{ fontSize: '9px', lineHeight: '1' }} className={`font-semibold tracking-[0.2em] uppercase mt-1 whitespace-nowrap ${timeScrubber >= hour ? 'text-white' : 'text-slate-500'}`}>
                  {getDayLabel(hour)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #22d3ee;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.8);
          cursor: grab;
          transition: transform 0.1s, box-shadow 0.2s;
          margin-top: 0px; /* Center thumb in track */
        }
        .slider-thumb::-webkit-slider-runnable-track {
          height: 100%; /* Important for alignment */
        }
        .slider-thumb::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(34, 211, 238, 1);
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #22d3ee;
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.8);
          cursor: grab;
          transition: transform 0.1s;
        }
        .slider-thumb::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(34, 211, 238, 1);
        }
      `}} />
    </motion.div>
  );
}
