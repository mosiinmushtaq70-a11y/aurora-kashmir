import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-[#080B11] text-gray-300 font-sans selection:bg-[#00F5C4]/30 selection:text-[#00F5C4]">
      <div className="max-w-3xl mx-auto px-6 py-20 pb-32">
        <Link 
          href="/" 
          className="inline-flex items-center text-[#00F5C4] hover:text-[#00F5C4]/80 mb-12 transition-colors group text-sm font-semibold tracking-widest uppercase"
        >
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight font-heading">Terms of Use</h1>
        <p className="text-[#bac9cc] mb-16 font-light">Last updated: April 2026</p>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Section 1 — About This Service</h2>
            <p className="text-[#bac9cc] leading-relaxed font-light">
              AuroraLens is an open-source aurora visibility forecasting tool 
              built as a B.Tech AI/ML engineering project. It provides 
              probabilistic forecasts based on live NASA/NOAA satellite data 
              and machine learning inference.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Section 2 — Data & Accuracy</h2>
            <p className="text-[#bac9cc] leading-relaxed font-light">
              All telemetry data is sourced from publicly available NASA and 
              NOAA APIs. Forecast scores are estimates based on geomagnetic 
              conditions and local cloud cover. AuroraLens does not guarantee 
              aurora visibility. Predictions are for informational and 
              educational purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Section 3 — Open Source</h2>
            <p className="text-[#bac9cc] leading-relaxed font-light">
              The AuroraLens codebase is open source under the MIT License. 
              You are free to use, modify, and distribute the code with 
              attribution. The ML model and training pipeline are documented 
              in the project repository.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Section 4 — Contact</h2>
            <p className="text-[#bac9cc] leading-relaxed font-light">
              For questions about data usage or the project, contact:<br />
              mosiinmushtaq70@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
