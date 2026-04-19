'use client';

import React from 'react';
import { motion } from 'framer-motion';

const TrustBar: React.FC = () => {
  const stats = [
    { value: '87.3%', label: 'Intensity Precision' },
    { value: '74.6%', label: 'Activity Detection' },
    { value: '40 Years', label: 'NASA OMNI Dataset' },
    { value: 'DSCOVR', label: 'Real-Time Telemetry' },
  ];

  return (
    <section className="w-full bg-[#0D1117] border-y border-white/5 py-12 md:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`flex flex-col items-center justify-center text-center px-4 ${
                idx !== stats.length - 1 ? 'md:border-r border-white/10' : ''
              }`}
            >
              <div className="text-3xl md:text-5xl font-['Manrope'] font-extrabold text-[#00F5C4] mb-2">
                {stat.value}
              </div>
              <div className="text-[10px] md:text-xs font-['Manrope'] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
