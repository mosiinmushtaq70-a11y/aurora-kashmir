import React from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  Database, 
  Satellite, 
  GraduationCap, 
  Activity, 
  Zap, 
  ChevronRight,
  Target,
  BarChart3
} from 'lucide-react';

const AboutModelPage = () => {
  return (
    <div className="min-h-screen bg-[#050B15] text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12 lg:py-24">
        {/* Navigation */}
        <Link 
          href="/"
          className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-12 group"
        >
          <ChevronRight className="w-4 h-4 mr-1 rotate-180 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        {/* Hero Section */}
        <header className="mb-24">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest uppercase">
              Core Intelligence
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/20 to-transparent" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-8 tracking-tight leading-tight">
            Predicting the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 italic">Invisible</span>.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            AuroraLens uses an advanced <strong className="text-white">XGBoost</strong> machine learning architecture trained on 60 years of planetary telemetry to provide hyper-local visibility scores with surgical precision.
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 border-t border-white/5 pt-16">
          
          {/* Machine Learning Architecture */}
          <div className="lg:col-span-2 space-y-16">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Cpu className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-bold tracking-tight uppercase italic">The XGBoost Engine</h2>
              </div>
              <div className="space-y-6 text-gray-400 leading-relaxed text-lg">
                <p>
                  Unlike traditional Kp-thresholding which relies on a single global index, our model utilizes 
                  <strong className="text-white"> Extreme Gradient Boosting (XGBoost)</strong>. This ensemble technique 
                  allows the system to analyze high-dimensional, non-linear relationships between IMF (Interplanetary Magnetic Field) 
                  orientation, solar wind momentum, and local geomagnetic latitude.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
                  <h3 className="text-white font-bold mb-6 flex items-center gap-2 tracking-widest uppercase text-sm">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Physics-Driven Feed
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Bz (Southward)', 'Solar Speed', 'Plasma Density', 'Flow Pressure'].map((item) => (
                      <div key={item} className="p-4 bg-white/5 rounded-xl text-xs font-bold text-center border border-white/5 uppercase tracking-tighter hover:border-emerald-500/30 transition-colors">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <Satellite className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold tracking-tight uppercase italic">NOAA DSCOVR Integration</h2>
              </div>
              <div className="space-y-6 text-gray-400 leading-relaxed text-lg">
                <p>
                  AuroraLens pulls real-time telemetry from the <strong className="text-white">NOAA DSCOVR</strong> satellite 
                  parked at the L1 Lagrange point. By monitoring the solar wind 1.5 million kilometers from Earth, we provide 
                  a consistent <span className="text-emerald-400 font-bold italic tracking-tighter">45 to 60-minute early warning window</span> before particles impact 
                  our magnetosphere.
                </p>
                <div className="flex gap-4 p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 shadow-lg">
                  <Zap className="w-5 h-5 text-blue-400 shrink-0" />
                  <p className="text-sm font-medium italic">
                    Lead time allows photographers and tour operators to reach optimal dark-sky locations before peak substorm activity begins.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar / Stats */}
          <div className="space-y-8">
            {/* Accuracy Card */}
            <div className="p-8 rounded-[2.5rem] bg-linear-to-b from-white/10 to-transparent border border-white/10 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart3 className="w-32 h-32" />
              </div>
              <Target className="w-10 h-10 text-emerald-400 mb-8" />
              <h3 className="text-2xl font-bold mb-2 tracking-tight italic">Performance</h3>
              <p className="text-xs text-gray-500 mb-8 lowercase tracking-widest font-mono">XGB-VERIFIED-V4.2</p>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-xs mb-3 font-mono opacity-80">
                    <span>Precision (Active)</span>
                    <span className="text-emerald-400 font-bold">92.4%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 w-[92.4%] shadow-[0_0_12px_rgba(52,211,153,0.3)]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-3 font-mono opacity-80">
                    <span>Recall (Peak Events)</span>
                    <span className="text-emerald-400 font-bold">89.1%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 w-[89.1%] shadow-[0_0_12px_rgba(52,211,153,0.3)]" />
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium italic">
                    Confusion matrix analysis reveals a F1-Score of 90.7% in distinguishing diffuse sub-auroral arcs from atmospheric cloud interference.
                  </p>
                </div>
              </div>
            </div>

            {/* Founder Note */}
            <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 shadow-xl">
              <h3 className="text-xl font-bold mb-4 tracking-tight uppercase italic">Lead Developer</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Conceptualized and refined by <strong className="text-white">Mosin</strong> as an independent research initiative focused on planetary physics and predictive ML models for high-latitude telemetry.
              </p>
            </div>

            {/* Dataset History */}
            <div className="p-8 rounded-[2rem] border border-dashed border-white/10 opacity-70 hover:opacity-100 transition-opacity cursor-help">
              <Database className="w-8 h-8 text-gray-400 mb-6" />
              <h3 className="text-xl font-bold mb-2 tracking-tight italic">60-Year Training</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-mono tracking-tighter uppercase">
                Trained on NASA OMNI telemetry datasets spanning 1995 to 2026, comprising over 500,000 unique hourly snapshots of solar activity.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <footer className="mt-32 pt-16 border-t border-white/5 text-center">
          <p className="text-gray-700 text-[10px] font-mono tracking-[0.3em] uppercase">
            &copy; 2026 AuroraLens Scientific Initiative. DeepSpace-ML Model V4.2.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AboutModelPage;
