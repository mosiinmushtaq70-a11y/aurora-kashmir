'use client';

import React from 'react';

const LOGS = [
  { type: 'SYSTEM', msg: 'AURORALENS INITIALIZATION SEQUENCE START...' },
  { type: 'SYNC',   msg: 'ESTABLISHING HANDSHAKE WITH DSCOVR L1 GATEWAY' },
  { type: 'INFO',   msg: 'DOWNLINK SECURED. BITRATE: 1.2 GBPS' },
  { type: 'SYNC',   msg: 'KP INDEX UPDATED: 6.33 [G2 MODERATE STORM]' },
  { type: 'WARN',   msg: 'SOLAR WIND VELOCITY SPIKE DETECTED (+42 KM/S)' },
  { type: 'INFO',   msg: 'NEURAL NET RE-CALIBRATING PROBABILITY VECTORS' },
  { type: 'SYSTEM', msg: 'GLOBAL SECTOR SCANNING ACTIVE...' },
  { type: 'INFO',   msg: 'GEOMAGNETIC HEATMAP DATA REFRESH COMPLETE' },
  { type: 'SYSTEM', msg: 'BACKGROUND PROCESSES NOMINAL.' },
];

export default function CommandTerminal() {
  return (
    <section style={{ position: 'relative', zIndex: 10, padding: '0 4rem 10rem 4rem' }}>
      {/* Section Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,220,130,0.2))' }} />
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.3em', color: 'rgba(0,220,130,0.7)', textTransform: 'uppercase' }}>SYSTEM EVENT LOG</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(0,220,130,0.2), transparent)' }} />
      </div>

      {/* Terminal Window */}
      <div style={{
        width: '100%',
        height: 256,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 4,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Terminal Header */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>TERMINAL_SESSION_01 // L1_DOWNLINK</span>
        </div>

        {/* Log Stream */}
        <div className="custom-scrollbar" style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.7rem',
          lineHeight: '1.6',
        }}>
          {LOGS.map((log, i) => (
            <div key={i} className="animate-[fadeIn_500ms_ease_forwards]" style={{ opacity: 0, animationDelay: `${i * 150}ms`, marginBottom: '0.25rem' }}>
              <span style={{
                color: log.type === 'WARN' ? '#EF4444' :
                       log.type === 'SYNC' ? '#A78BFA' :
                       log.type === 'INFO' ? '#00DC82' :
                       'rgba(255,255,255,0.3)',
                marginRight: '0.75rem'
              }}>
                [{log.type.padEnd(6)}]
              </span>
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>{log.msg}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white/20">{'>'}</span>
            <span className="animate-pulse w-2 h-4 bg-aurora-primary opacity-60" />
          </div>
        </div>
      </div>
    </section>
  );
}
