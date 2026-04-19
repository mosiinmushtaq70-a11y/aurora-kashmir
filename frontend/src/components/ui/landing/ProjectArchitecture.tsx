'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ProjectArchitecture: React.FC = () => {
  const nodes = [
    { 
      id: 'noaa', 
      title: 'NASA/NOAA Data', 
      desc: 'Live DSCOVR Telemetry (L1 Point)',
      icon: 'rocket_launch',
      color: '#00F5C4'
    },
    { 
      id: 'pipeline', 
      title: 'Data Pipeline', 
      desc: 'Preprocessing & Feature Engineering',
      icon: 'settings_input_component',
      color: '#44e2cd'
    },
    { 
      id: 'engine', 
      title: 'XGBoost Engine', 
      desc: 'Dual-Stage Gradient Boosting',
      icon: 'psychology',
      color: '#c3f5ff'
    },
    { 
      id: 'ui', 
      title: 'Forecaster HUD', 
      desc: 'Real-time UX Visualization',
      icon: 'dashboard_customize',
      color: '#ffffff'
    }
  ];

  return (
    <section className="w-full py-24 md:py-32 bg-[#0D1117] relative overflow-hidden">
      {/* Decorative Orbits */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/20 rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-['Manrope'] font-bold text-white mb-6">Technical Architecture</h2>
          <p className="text-[#9CA3AF] text-lg max-w-2xl mx-auto">
            From deep-space telemetry to local forecasts—how the AuroraLens engine processes 
            magnetic flux into predictive insights.
          </p>
        </div>

        {/* The Pipeline Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          
          {/* Connecting Line (Desktop) with Traveling Pulse */}
          <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-px bg-white/10 z-0">
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-1/4 h-full bg-linear-to-r from-transparent via-[#00F5C4] to-transparent"
            />
          </div>

          {nodes.map((node, idx) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="relative z-10 p-8 rounded-[2rem] bg-[#0b0e14]/50 backdrop-blur-3xl border border-white/5 hover:border-white/20 transition-all group overflow-hidden"
            >
              {/* Card Background Glow */}
              <div 
                className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ backgroundColor: node.color }}
              />

              <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                {/* ICON ANIMATIONS */}
                {node.id === 'noaa' && (
                  <div className="absolute inset-0 rounded-full border border-[#00F5C4]/30 animate-ping"></div>
                )}
                {node.id === 'pipeline' && (
                  <>
                    <div className="absolute inset-x-0 inset-y-0 rounded-full border-2 border-dashed border-[#44e2cd]/20 animate-[spin_8s_linear_infinite]" />
                    <div className="absolute inset-x-2 inset-y-2 rounded-full border border-[#44e2cd]/40 animate-[spin_4s_linear_infinite_reverse]" />
                  </>
                )}
                {node.id === 'engine' && (
                  <div className="absolute inset-0 rounded-full bg-[#c3f5ff]/20 blur-md animate-pulse" />
                )}
                {node.id === 'ui' && (
                  <motion.div 
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border border-white/10"
                  />
                )}

                <div 
                  className="relative z-10 w-full h-full rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${node.color}15`, border: `1px solid ${node.color}30` }}
                >
                  <span className="material-symbols-outlined text-3xl" style={{ color: node.color }}>
                    {node.icon}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{node.title}</h3>
              <p className="text-sm text-[#9CA3AF] leading-relaxed relative z-10">{node.desc}</p>
              
              {/* Sequential Number */}
              <div className="absolute top-4 right-4 text-[10px] font-mono text-white/10">
                STP_0{idx + 1}
              </div>
            </motion.div>
          ))}
        </div>        {/* Model Card / Bento Detail */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-10 rounded-[2.5rem] bg-[#10141d] border border-white/5 relative overflow-hidden group">
            {/* Themed Background Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#00F5C4]/10 border border-[#00F5C4]/20 flex items-center justify-center relative overflow-hidden">
                  {/* Scanning Laser Animation */}
                  <motion.div 
                    animate={{ y: [-40, 40] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-px bg-[#00F5C4] shadow-[0_0_10px_#00F5C4] z-20"
                  />
                  <span className="material-symbols-outlined text-3xl text-[#00F5C4]">terminal</span>
                </div>
                <div>
                  <h4 className="text-[#00F5C4] font-mono text-[10px] uppercase tracking-[0.3em] mb-1">Inference Engine</h4>
                  <h3 className="text-xl text-white font-bold">XGBoost Dual-Stage</h3>
                </div>
              </div>

              <p className="text-[#9CA3AF] text-sm leading-relaxed mb-8">
                The engine utilizes two distinct Gradient Boosting models trained on the NASA OMNI dataset. 
                Stage 1 determines geomagnetic activity probability, while Stage 2 classifies intensity. 
                <span className="text-[#00F5C4]/80 block mt-2 font-mono text-[11px]">— Stage 1 output (Activity Probability) feeds Stage 2 as a primary classification feature.</span>
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider">
                    <span className="text-white/40">IMF Bz (GSM) Sensitivity</span>
                    <span className="text-[#00F5C4]">92% weight</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '92%' }}
                      transition={{ duration: 2, delay: 0.5 }}
                      className="h-full bg-[#00F5C4] shadow-[0_0_8px_#00F5C4]" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider">
                    <span className="text-white/40">Solar Wind Speed Impact</span>
                    <span className="text-[#44e2cd]">84% weight</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '84%' }}
                      transition={{ duration: 2, delay: 0.7 }}
                      className="h-full bg-[#44e2cd] shadow-[0_0_8px_#44e2cd]" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-wider">
                    <span className="text-white/40">Cloud Cover Density</span>
                    <span className="text-[#c3f5ff]">89% weight</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '89%' }}
                      transition={{ duration: 2, delay: 0.9 }}
                      className="h-full bg-[#c3f5ff] shadow-[0_0_8px_#c3f5ff]" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-10 rounded-[2.5rem] bg-linear-to-br from-[#00F5C4]/10 via-[#0D1117] to-[#0D1117] border border-[#00F5C4]/20 flex flex-col justify-center items-center text-center relative overflow-hidden group">
             {/* Background Pulse Glow */}
             <div className="absolute inset-0 bg-[#00F5C4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#00F5C4]/10 blur-[100px] rounded-full opacity-50" />

             <div className="relative z-10 w-full">
               <div className="w-24 h-24 rounded-full bg-[#00F5C4]/5 border border-[#00F5C4]/10 flex items-center justify-center mb-8 mx-auto relative group-hover:border-[#00F5C4]/30 transition-colors">
                {/* Floating Data Particles */}
                <div className="absolute inset-0">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        y: [0, -40, 0],
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 3 + i, 
                        repeat: Infinity, 
                        delay: i * 0.8,
                        ease: "easeInOut"
                      }}
                      className="absolute w-1 h-1 bg-[#00F5C4] rounded-full"
                      style={{ 
                        left: `${25 + i * 25}%`,
                        top: '50%'
                      }}
                    />
                  ))}
                </div>
                <span className="material-symbols-outlined text-5xl text-[#00F5C4] relative z-10">clinical_notes</span>
               </div>
               
               <h3 className="text-2xl text-white font-bold mb-4">Empirical Validation</h3>
               <p className="text-[#9CA3AF] text-sm leading-relaxed max-w-sm mb-8 mx-auto">
                 Validated against 1.2M hours of NASA OMNI telemetry records, achieving an 81.0% weighted F1-score across KP classification bins.
               </p>
               
               <a 
                 href="https://github.com/mosiinmushtaq70-a11y/aurora-kashmir"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#00F5C4] hover:text-[#003731] hover:px-10 transition-all duration-500"
               >
                 <span>View Project Artifacts</span>
                 <span className="material-symbols-outlined text-sm">arrow_forward</span>
               </a>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectArchitecture;
