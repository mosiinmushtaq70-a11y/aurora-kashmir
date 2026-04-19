import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-3xl mx-auto px-6 py-20 pb-32">
        <Link 
          href="/" 
          className="inline-flex items-center text-emerald-500 hover:text-emerald-400 mb-12 transition-colors group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
          Back to Dashboard
        </Link>

        <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last Updated: March 31, 2026</p>

        <div className="space-y-12 prose prose-invert prose-emerald max-w-none">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">1. Data We Collect</h2>
            <p>
              AuroraLens is designed with privacy as a priority. We collect minimal data necessary to provide our prediction services:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-400">
              <li><strong className="text-emerald-400">Location Data:</strong> When you search for a location or use "Find Me", coordinates are used to calculate hyper-local aurora probability. This is not stored persistently unless you subscribe to an alert.</li>
              <li><strong className="text-emerald-400">Email Addresses:</strong> Collected only if you explicitly sign up for Aurora Alerts or beta testing.</li>
              <li><strong className="text-emerald-400">Device Specs:</strong> In the Photo Assistant, any camera data you provide is used only for the duration of the chat session to provide accurate settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">2. Telemetry & Science</h2>
            <p>
              We utilize public geomagnetic telemetry from NASA (DSCOVR) and NOAA. Our machine learning models process this data to provide forecasts. No user-specific data is ever used to "train" our global aurora models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">3. Third-Party Services</h2>
            <p>
              We use the following verified partners to power AuroraLens:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-gray-400">
              <li><strong className="text-emerald-400">NVIDIA NIM:</strong> Powers our AI Co-Pilot (Aura). Your chat messages are processed by NVIDIA's secure infrastructure.</li>
              <li><strong className="text-emerald-400">Nominatim:</strong> Provides geographic search capabilities.</li>
              <li><strong className="text-emerald-400">Vercel:</strong> Our primary hosting and infrastructure provider.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">4. Your Rights</h2>
            <p>
              You have the right to request the deletion of your email from our alert database at any time. Simply use the "Unsubscribe" link in any alert email or contact our support.
            </p>
          </section>

          <section className="pt-8 border-t border-white/10">
            <p className="text-sm text-gray-500 italic">
              AuroraLens is currently in <span className="text-emerald-500/80">Public Beta</span>. As we scale, our privacy practices will continue to prioritize user anonymity and data security.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
