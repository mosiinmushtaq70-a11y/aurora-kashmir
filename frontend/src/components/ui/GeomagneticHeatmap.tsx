'use client';

import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

// Standard 110m TopoJSON for global bounds
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export default function GeomagneticHeatmap() {
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/forecast/global_heatmap` : 'http://localhost:8000/api/forecast/global_heatmap')
      .then(res => res.json())
      .then(data => {
        setForecastData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load heatmap grid:", err);
        setLoading(false);
      });
  }, []);

  // Use the current time interval (0) since we removed the 7-day scrubber
  const currentData = forecastData?.timeline ? forecastData.timeline[0]?.points : [];

  const lightPollutionNodes = [
    // N. America
    [-74.0, 40.7], [-118.2, 34.0], [-87.6, 41.8], [-95.3, 29.7],
    // Europe
    [-0.1, 51.5], [2.3, 48.8], [13.4, 52.5], [12.4, 41.9],
    // Asia
    [139.6, 35.6], [116.4, 39.9], [121.4, 31.2], [77.2, 28.6], [72.8, 19.0],
    // S. America
    [-46.6, -23.5], [-58.3, -34.6],
    // Africa
    [31.2, 30.0], [28.0, -26.2]
  ];

  return (
    <section style={{
      position: 'relative',
      zIndex: 10,
      padding: '0 4rem 6rem 4rem',
    }} className="pointer-events-none">
      
      {/* Section Divider */}
      <div className="flex items-center gap-4 mb-12">
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,220,130,0.2))' }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(0,220,130,0.7)', textTransform: 'uppercase' }}>VIEWING VIABILITY MAP</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(0,220,130,0.2), transparent)' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pointer-events-auto">
        
        {/* The Left Panel (Educational Context) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col justify-center">
          <div className="p-8 rounded bg-black/40 backdrop-blur-md border border-white/5">
            <h3 className="text-aurora-primary font-mono text-sm tracking-widest uppercase mb-6">
              Observation Prerequisites
            </h3>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              The biggest threat to aurora hunting isn't low solar activity; it's the weather. Auroras occur 100km above the Earth. If local cloud cover blocks your line of sight to the upper atmosphere, even the most intense geomagnetic storms will be completely invisible.
            </p>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              Auroral light is incredibly faint. Artificial light from cities and highways reflects off the atmosphere and washes out the night sky. To capture the aurora, you must travel outside of the amber light-pollution zones into pitch-black environments.
            </p>
          </div>
        </div>

        {/* The Right Panel (Interactive Map) mb-0 */}
        <div className="col-span-1 lg:col-span-8">
          <div style={{
            width: '100%',
            minHeight: 600,
            background: 'rgba(6,9,18,0.85)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Dynamic Map Area */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center font-mono text-aurora-primary gap-4">
                 <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-aurora-primary animate-spin" />
                 <p className="text-[10px] tracking-widest uppercase">Initializing XGBoost Grid...</p>
              </div>
            ) : (
              <div className="flex-1 relative w-full h-full pb-10">
                <ComposableMap projection="geoMercator" projectionConfig={{ scale: 110 }} width={800} height={400} style={{ width: "100%", height: "100%" }}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#020409"
                          stroke="rgba(100, 116, 139, 0.3)" // dark slate inner borders
                          strokeWidth={0.5}
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none", fill: "rgba(255,255,255,0.02)" },
                            pressed: { outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  
                  {/* Layer 1: Aurora Heatmap (Green/Amber at the poles) */}
                  {currentData?.map((pt: any, i: number) => {
                    const isHigh = pt.score > 60;
                    const color = isHigh ? "#F59E0B" : "#00DC82";
                    return (
                      <Marker key={i} coordinates={[pt.lon, pt.lat]}>
                        <circle r={isHigh ? 14 : 9} fill={color} opacity={0.4} filter="blur(8px)" />
                        <circle r={isHigh ? 6 : 4} fill={color} opacity={0.8} filter="blur(3px)" />
                        <circle r={isHigh ? 2 : 1} fill="#FFF" opacity={0.9} />
                      </Marker>
                    );
                  })}

                  {/* Layer 2: Light Pollution Grid (Amber Dots at Equator/Cities) */}
                  {lightPollutionNodes.map((pt, i) => (
                    <Marker key={`lp-${i}`} coordinates={pt as [number, number]}>
                       <circle r={12} fill="#F59E0B" opacity={0.2} filter="blur(4px)" />
                       <circle r={4} fill="#F59E0B" opacity={0.6} />
                       <circle r={1} fill="#FFF" opacity={0.9} />
                    </Marker>
                  ))}
                </ComposableMap>

                {/* Minimal coordinate labels */}
                {[
                  ['top-3 left-4', '90.0°N 180.0°W'], 
                  ['top-3 right-4', '90.0°N 180.0°E'],
                  ['bottom-14 left-4', '0.0°N 180.0°W'], 
                  ['bottom-14 right-4', '0.0°N 180.0°E']
                ].map(([pos, label]) => (
                  <span key={label} className={`absolute ${pos} font-mono text-[8px] text-white/20 tracking-widest pointer-events-none`}>{label}</span>
                ))}
              </div>
            )}

            {/* The Map Legend */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md border-t border-white/10 p-4">
              <div className="flex flex-wrap items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-aurora-primary shadow-[0_0_8px_rgba(0,220,130,0.8)]" />
                  <span className="font-mono text-[10px] tracking-widest text-slate-300 uppercase">Auroral Oval</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent-solar shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  <span className="font-mono text-[10px] tracking-widest text-slate-300 uppercase">Urban Light Pollution</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
