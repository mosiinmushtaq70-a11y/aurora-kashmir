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
    answer: "AuroraLens covers all latitudes with aurora activity, including auroral zones in North America, Scandinavia, Iceland, Russia, and during high KP events, central Europe and the northern US."
  },
  {
    question: "How is this different from SpaceWeather.com or Aurora Forecast apps?",
    answer: "Generic apps use NOAA's global KP-index. AuroraLens layers in local atmospheric density, cloud cover modeling, and terrain data for your exact GPS coordinates — not just your country."
  },
  {
    question: "How far in advance can it predict an aurora event?",
    answer: "Our XGBoost model provides reliable 48-hour forecasts for all plans. Pro and Research plans include 7-day probabilistic forecasts with confidence intervals."
  },
  {
    question: "Does Aura AI require a subscription?",
    answer: "Aura is available on the Pro plan and above. Free Observer accounts get limited Aura queries (3 per week)."
  },
  {
    question: "Can I use AuroraLens data for scientific research?",
    answer: "Yes. The Research plan includes full API access and historical dataset exports going back 60 years (where available). Academic institutions contact us for institutional pricing."
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
          <p className="text-[#00F5C4] font-bold tracking-[0.2em] text-xs uppercase mb-4">Uplink FAQ</p>
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
                      <div className="mt-6 flex items-center gap-2 text-[#00F5C4]/60 text-xs italic">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Verified Telemetry Protocol
                      </div>
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
            Have a specialized research request? <a href="#" className="text-[#00F5C4] hover:underline font-medium">Contact our scientific team</a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;
