'use client';

import React from 'react';
import { ComposableMap as RSM_ComposableMap, Geographies as RSM_Geographies, Geography as RSM_Geography, Marker as RSM_Marker } from 'react-simple-maps';

// Standard 110m TopoJSON for global bounds
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export default function GeomagneticHeatmap() {
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
    }} className="pointer-events-none pt-0 pb-24 px-4 md:px-16">
      
      {/* Section Divider */}
      <div className="flex items-center gap-4 mb-12">
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,220,130,0.2))' }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(0,220,130,0.7)', textTransform: 'uppercase' }}>VIEWING VIABILITY MAP</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(0,220,130,0.2), transparent)' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pointer-events-auto">
        
        {/* The Left Panel (Educational Context) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col justify-center">
          <div className="p-6 md:p-8 rounded-xl bg-black/40 backdrop-blur-md border border-white/5">
            <h3 className="text-aurora-primary font-mono text-xs md:text-sm tracking-widest uppercase mb-4 md:mb-6">
              Observation Prerequisites
            </h3>
            
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">
              The biggest threat to aurora hunting isn't low solar activity; it's the weather. Auroras occur 100km above the Earth. If local cloud cover blocks your line of sight to the upper atmosphere, even the most intense geomagnetic storms will be completely invisible.
            </p>
            
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              Auroral light is incredibly faint. Artificial light from cities and highways reflects off the atmosphere and washes out the night sky. To capture the aurora, you must travel outside of the amber light-pollution zones into pitch-black environments.
            </p>
          </div>
        </div>

        {/* The Right Panel (Interactive Map) mb-0 - Hidden on mobile! */}
        <div className="hidden md:block col-span-1 lg:col-span-8">
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
            <div className="flex-1 relative w-full h-full pb-10">
              <RSM_ComposableMap projection="geoMercator" projectionConfig={{ scale: 110 }} width={800} height={400} style={{ width: "100%", height: "100%" }}>
                <RSM_Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <RSM_Geography
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
                </RSM_Geographies>

                {/* Layer 2: Light Pollution Grid (Amber Dots at Equator/Cities) */}
                {lightPollutionNodes.map((pt, i) => (
                  <RSM_Marker key={`lp-${i}`} coordinates={pt as [number, number]}>
                      <circle r={12} fill="#F59E0B" opacity={0.2} filter="blur(4px)" />
                      <circle r={4} fill="#F59E0B" opacity={0.6} />
                      <circle r={1} fill="#FFF" opacity={0.9} />
                  </RSM_Marker>
                ))}
              </RSM_ComposableMap>

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

            {/* The Map Legend */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md border-t border-white/10 p-4">
              <div className="flex flex-wrap items-center justify-center gap-8">
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
