'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Clock } from 'lucide-react';

export default function TimelineScrubber() {
  const { timeScrubber, setTimeScrubber } = useAppStore();

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    console.log('Scrubber change:', val);
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
      className="absolute bottom-12 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[500px] md:w-[600px] p-2"
    >
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div className="flex items-center gap-2 text-aurora-green">
          <Clock size={16} />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">Predictive Timeline</span>
        </div>
        <div className="bg-aurora-green/10 text-aurora-green border border-aurora-green/30 px-3 py-1 rounded-full font-mono text-xs font-bold shadow-[0_0_15px_rgba(0,220,130,0.2)] min-w-[100px] text-center">
          {getLabel(timeScrubber)}
        </div>
      </div>

      <div className="relative w-full pb-4">
        {/* Track Background */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-2 bg-white/5 rounded-full" />
        
        {/* Active Track */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-linear-to-r from-[#00d4ff] to-aurora-green rounded-full shadow-[0_0_15px_rgba(0,220,130,0.5)]"
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
          className="relative w-full h-2 appearance-none bg-transparent outline-none cursor-pointer z-50 slider-thumb"
        />

        {/* Timeline Markers */}
        <div className="absolute -bottom-1 left-0 w-full h-4 pointer-events-none data-ticks">
          {[0, 24, 48, 72].map((hour) => (
            <div
              key={hour}
              className="absolute top-0 flex flex-col items-center -translate-x-1/2"
              style={{ left: calculateTickPosition(hour) }}
            >
              <div className={`w-px h-2 ${timeScrubber >= hour ? 'bg-aurora-green' : 'bg-white/20'}`} />
              <span className={`text-[9px] font-mono mt-1 whitespace-nowrap ${timeScrubber >= hour ? 'text-white font-bold' : 'text-slate-500'}`}>
                {getDayLabel(hour)}
              </span>
            </div>
          ))}
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
          border: 3px solid #00dc82;
          box-shadow: 0 0 20px rgba(0, 220, 130, 0.8);
          cursor: grab;
          transition: transform 0.1s, box-shadow 0.2s;
        }
        .slider-thumb::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(0, 220, 130, 1);
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #00dc82;
          box-shadow: 0 0 20px rgba(0, 220, 130, 0.8);
          cursor: grab;
          transition: transform 0.1s;
        }
        .slider-thumb::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
      `}} />
    </motion.div>
  );
}
