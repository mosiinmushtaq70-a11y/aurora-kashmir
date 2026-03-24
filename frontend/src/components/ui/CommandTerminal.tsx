'use client';

import React, { useState, useEffect } from 'react';

export default function CommandTerminal() {
  const [uptime, setUptime] = useState('');

  useEffect(() => {
    const inceptionDate = new Date('2026-03-13T15:22:36');
    const updateUptime = () => {
      const now = new Date();
      const diff = now.getTime() - inceptionDate.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setUptime(`${days}d ${hours}h ${minutes}m`);
    };
    updateUptime();
    const interval = setInterval(updateUptime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative z-10 px-4 sm:px-8 pb-8 sm:pb-16">
      {/* Section Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1 h-px bg-linear-to-r from-transparent to-aurora-primary/20" />
        <span className="font-mono text-[0.6rem] tracking-[0.3em] text-aurora-primary/70 uppercase">
          SYSTEM COMMAND INTERFACE
        </span>
        <div className="flex-1 h-px bg-linear-to-r from-aurora-primary/20 to-transparent" />
      </div>

      {/* Terminal Window */}
      <div className="w-full max-w-2xl mx-auto bg-slate-950/80 rounded-xl border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Title Bar */}
        <div className="h-9 bg-slate-900/90 flex items-center px-4 relative border-b border-white/5">
          <div className="flex gap-2 z-10 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[10px] text-slate-400 font-mono tracking-wide truncate">
              ROOT_CONSOLE // AURORALENS
            </span>
          </div>
        </div>

        {/* Console Body */}
        <div className="p-4 sm:p-5 font-mono text-xs sm:text-sm leading-relaxed bg-black/40 overflow-x-auto">
          <div className="space-y-1 min-w-0">

            {/* Command 1 */}
            <div className="flex flex-wrap gap-x-2">
              <span className="text-[#4af626] shrink-0">root@auroralens:~$</span>
              <span className="text-slate-200 break-all">echo $AURORA_SYSTEM_STATUS</span>
            </div>
            <div className="text-slate-400 mb-3 pl-2">
              {'>'} <span className="text-[#30dff3]">status</span>: <span className="text-[#ff5f56]">"NOMINAL"</span>
              {', '}<span className="text-[#30dff3]">uptime</span>: <span className="text-[#ff5f56]">"{uptime}"</span>
            </div>

            {/* Command 2 */}
            <div className="flex flex-wrap gap-x-2 mt-2">
              <span className="text-[#4af626] shrink-0">root@auroralens:~$</span>
              <span className="text-slate-200 break-all">cat telemetry.json</span>
            </div>
            <div className="pl-3 border-l border-white/5 mt-1 space-y-0.5">
              <div className="text-slate-400">{'{'}</div>
              <div className="pl-3 flex flex-wrap gap-x-1">
                <span className="text-[#30dff3]">"satellite_id"</span>
                <span className="text-slate-400">:</span>
                <span className="text-[#ff5f56]">"DSCOVR-L1"</span>
              </div>
              <div className="pl-3 flex flex-wrap gap-x-1">
                <span className="text-[#30dff3]">"neural_engine"</span>
                <span className="text-slate-400">:</span>
                <span className="text-[#ff5f56]">"XGBOOST-V4.2"</span>
              </div>
              <div className="pl-3 flex flex-wrap gap-x-1">
                <span className="text-[#30dff3]">"auto_refresh"</span>
                <span className="text-slate-400">:</span>
                <span className="text-[#ff5f56]">true</span>
              </div>
              <div className="text-slate-400">{'}'}</div>
            </div>

            {/* Active Prompt */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-[#4af626] shrink-0">root@auroralens:~$</span>
              <span className="w-2 h-4 bg-[#4af626] opacity-70 animate-pulse" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
