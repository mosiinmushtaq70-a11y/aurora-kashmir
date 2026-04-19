'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "Does AuroraLens work at my latitude?",
    answer: "The model is trained on a global coordinate system. While accuracy is highest in traditional auroral zones (Scandinavia, Iceland, Alaska), it is capable of predicting geomagnetic storm reach into mid-latitudes during high solar activity."
  },
  {
    question: "How is this different from standard forecast apps?",
    answer: "Most apps rely solely on the planetary K-index. This project uses a dual-stage XGBoost engine that layers in live solar wind telemetry (Bz/Density/Speed) with local atmospheric variables to provide a more granular probability score."
  },
  {
    question: "How far in advance can it predict an aurora event?",
    answer: "The current pipeline provides reliable 3-hour forecasts based on DSCOVR satellite data at the L1 point, with longer 24-48 hour trends derived from solar wind stability analysis."
  },
  {
    question: "Is the model publicly available?",
    answer: "Yes, the training scripts, the dual-stage XGBoost architecture, and the preprocessing pipeline are all documented and available in the GitHub repository for peer review."
  },
  {
    question: "Can I use AuroraLens data for research?",
    answer: "The project is built on the NASA OMNI database (1995-present) and real-time NOAA telemetry. All derived predictive data is open-source and intended for educational and engineering demonstration purposes."
  }
];

const FAQAccordion: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00F5C4]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-['Manrope'] font-bold text-white tracking-tight">Technical Clarification</h2>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((item, index) => (
            <div 
              key={index}
              className="group"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className={`w-full text-left p-6 md:p-8 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-6
                  ${activeIndex === index 
                    ? 'bg-white/10 border-[#00F5C4]/30 shadow-[0_10px_30px_rgba(0,0,0,0.3)]' 
                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.07]'}`}
              >
                <span className={`text-lg md:text-xl font-semibold transition-colors
                  ${activeIndex === index ? 'text-[#00F5C4]' : 'text-white'}`}
                >
                  {item.question}
                </span>
                <span className={`material-symbols-outlined text-2xl transition-transform duration-300
                  ${activeIndex === index ? 'rotate-180 text-[#00F5C4]' : 'text-[#9CA3AF]'}`}
                >
                  expand_more
                </span>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-8 pt-2 text-[#bac9cc] leading-relaxed text-base md:text-lg font-light">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Support Link */}
        <div className="mt-16 text-center">
          <p className="text-[#9CA3AF] text-sm">
            Interested in the technical implementation? <a href="https://github.com/mosiinmushtaq70-a11y/aurora-kashmir" className="text-[#00F5C4] hover:underline font-medium">Review the codebase on GitHub</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;
