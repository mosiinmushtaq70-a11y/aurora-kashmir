'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

interface DossierTacticalProps {
  weatherShieldTitle: string;
  weatherShieldDesc: string;
  magBandTitle: string;
  magBandDesc: string;
}

const DossierTactical: React.FC<DossierTacticalProps> = ({
  weatherShieldTitle,
  weatherShieldDesc,
  magBandTitle,
  magBandDesc,
}) => {
  const { 
    activeDossier, 
    liveData, 
    openAICopilot, 
    pushToast 
  } = useAppStore();

  const [isSyncing, setIsSyncing] = useState(false);

  // Mock "Satellite Sync" instead of the old Alert Emailer
  const handleMockSync = useCallback(async () => {
    setIsSyncing(true);
    pushToast(`Establishing uplink to ${activeDossier?.name} orbital array...`, 'info');
    
    // Simulate API call to the mock endpoint
    try {
      const res = await fetch('/api/copilot/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: { location: activeDossier?.name } })
      });
      const data = await res.json();
      
      setTimeout(() => {
        setIsSyncing(false);
        pushToast(`Uplink Secure. ${data.content.substring(0, 40)}...`, 'success');
      }, 1500);
    } catch (err) {
      setIsSyncing(false);
      pushToast('Uplink Interrupted. Atmospheric interference.', 'error');
    }
  }, [activeDossier, pushToast]);

  const getTacticalBrief = useCallback(() => {
    if (!activeDossier) return '';
    return (
      `## Tactical Site Brief — ${activeDossier.name}, ${activeDossier.region}\n\n` +
      `**Aurora Score**: ${activeDossier.auroraScore}/100 · **Cloud Cover**: ${activeDossier.cloudCover}% · **Ambient**: ${activeDossier.temperature !== null ? `${activeDossier.temperature}°C` : 'N/A'}\n\n` +
      `### ${weatherShieldTitle}\n${weatherShieldDesc}\n\n` +
      `### ${magBandTitle}\n${magBandDesc}\n\n` +
      `*System: Mock satellite telemetry verified.*`
    );
  }, [activeDossier, weatherShieldTitle, weatherShieldDesc, magBandTitle, magBandDesc]);

  const handleCopilot = useCallback(() => {
    openAICopilot({
      locationName: activeDossier?.name ?? 'Target Location',
      auroraScore:  activeDossier?.auroraScore ?? 50,
      temperature:  activeDossier?.temperature ?? 0,
      initialBrief: getTacticalBrief(),
      mode: 'PHOTO_ASSISTANT',
    });
  }, [openAICopilot, activeDossier, getTacticalBrief]);

  return (
    <div className="flex flex-col gap-24 py-20">
      {/* Vitals Summary Card - "Clickable" & Lively */}
      <section className="w-full">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="stitch-glass-panel rounded-[2rem] p-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative overflow-hidden group cursor-pointer"
        >
          {/* Decorative background glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00e5ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="flex flex-col gap-2 relative z-10">
            <span className="font-['Manrope'] text-[10px] tracking-[0.4em] text-[#00e5ff] uppercase font-bold mb-2">LIVE INTEL SCORE</span>
            <span className="font-['Manrope'] font-extrabold text-5xl text-white mega-glow-text">
              {liveData?.auroraScore ? Math.round(liveData.auroraScore) : activeDossier?.auroraScore}
              <span className="text-xl opacity-30 ml-2">/100</span>
            </span>
          </div>
          
          <div className="flex flex-col gap-2 relative z-10 md:border-x border-white/5 md:px-12">
            <span className="font-['Manrope'] text-[10px] tracking-[0.4em] text-[#bac9cc] uppercase font-bold mb-2">ATMOSPHERICS</span>
            <span className="font-['Manrope'] font-bold text-2xl text-white">
              {liveData?.cloudCover ? `${liveData.cloudCover}%` : `${activeDossier?.cloudCover}%`}
              <span className="text-xs font-light block mt-1 uppercase tracking-widest opacity-40">Cloud Density</span>
            </span>
          </div>
          
          <div className="flex flex-col gap-2 relative z-10">
            <span className="font-['Manrope'] text-[10px] tracking-[0.4em] text-[#bac9cc] uppercase font-bold mb-2">THERMAL</span>
            <span className="font-['Manrope'] font-bold text-2xl text-white">
              {liveData?.temperature ? `${liveData.temperature.toFixed(1)}°C` : `${activeDossier?.temperature ?? -4}°C`}
              <span className="text-xs font-light block mt-1 uppercase tracking-widest opacity-40">Ambient Temp</span>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Primary Actions - Lively buttons */}
      <section className="flex flex-col md:flex-row justify-center items-center gap-6">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,229,255,0.4)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleMockSync}
          disabled={isSyncing}
          className="w-full md:w-auto min-w-[280px] flex items-center justify-center gap-4 bg-[#00e5ff] text-[#080B11] px-10 py-6 rounded-full font-black uppercase tracking-[0.2em] text-[11px] transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-xl">
            {isSyncing ? 'sync_lock' : 'rss_feed'}
          </span>
          {isSyncing ? 'Establishing Uplink...' : 'Initiate Satellite Sync'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopilot}
          className="w-full md:w-auto min-w-[280px] flex items-center justify-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white px-10 py-6 rounded-full font-black uppercase tracking-[0.2em] text-[11px] transition-all"
        >
          <span className="material-symbols-outlined text-xl">auto_awesome</span>
          Tactical Copilot
        </motion.button>
      </section>

      {/* Intelligence Cards - Staggered entrance via whileInView */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="stitch-glass-panel p-12 rounded-[2.5rem] border-white/5 group hover:border-[#00e5ff]/30 transition-all duration-700 cursor-help"
        >
          <div className="w-16 h-16 rounded-[1.5rem] bg-[#00e5ff]/5 flex items-center justify-center border border-[#00e5ff]/10 mb-8 group-hover:bg-[#00e5ff]/10 transition-colors">
            <span className="material-symbols-outlined text-[#00e5ff] text-2xl">landscape</span>
          </div>
          <h4 className="font-['Manrope'] font-black text-2xl text-white mb-6 tracking-tight uppercase tracking-wider">{weatherShieldTitle}</h4>
          <p className="font-['Inter'] font-light text-[#bac9cc] leading-relaxed text-sm md:text-lg opacity-70 group-hover:opacity-100 transition-opacity">
            {weatherShieldDesc}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="stitch-glass-panel p-12 rounded-[2.5rem] border-white/5 group hover:border-[#00e5ff]/30 transition-all duration-700 cursor-help"
        >
          <div className="w-16 h-16 rounded-[1.5rem] bg-[#00e5ff]/5 flex items-center justify-center border border-[#00e5ff]/10 mb-8 group-hover:bg-[#00e5ff]/10 transition-colors">
            <span className="material-symbols-outlined text-[#00e5ff] text-2xl">explore</span>
          </div>
          <h4 className="font-['Manrope'] font-black text-2xl text-white mb-6 tracking-tight uppercase tracking-wider">{magBandTitle}</h4>
          <p className="font-['Inter'] font-light text-[#bac9cc] leading-relaxed text-sm md:text-lg opacity-70 group-hover:opacity-100 transition-opacity">
            {magBandDesc}
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default DossierTactical;
