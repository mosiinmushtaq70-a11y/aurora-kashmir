import React from 'react';

// ─── Orbital Plane Grid (SVG, inline) ────────────────────────────────────────
export default function OrbitalGrid() {
  const C = 500; // Center coordinate
  const S = 1000; // ViewBox size

  // Design Tokens
  const LINE_COLOR = 'var(--color-aurora-primary, #00DC82)';
  const GRID_OPACITY = 0.10;      // Increased to 15% for high visibility (or 0.10)
  const ACCENT_OPACITY = 0.25;    // Increased for crosshairs and markers

  // Concentric circle radii (Spatial depth layers)
  const radii = [60, 120, 190, 270, 360, 460];

  // Polar axes: 45, 90, 135, 180 degrees (intersecting circles)
  const axesDegrees = [0, 45, 90, 135]; // These cover all quadrants when drawn as full spokes

  // Degree ticks every 10° on the outermost ring
  const outerR = radii[radii.length - 1];
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1, // Layer 2 (Above Polar Earth)
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox={`0 0 ${S} ${S}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '140vmax',
          height: '140vmax',
          flexShrink: 0,
          animation: 'orbitalSpin 120s linear infinite',
          willChange: 'transform',
          color: LINE_COLOR,
        }}
      >
        {/* --- Concentric Rings --- */}
        {radii.map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx={C} cy={C} r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeOpacity={GRID_OPACITY}
          />
        ))}

        {/* --- Polar Axes (Full spokes across both sides) --- */}
        {axesDegrees.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const len = outerR + 40;
          const dx = Math.cos(rad) * len;
          const dy = Math.sin(rad) * len;
          return (
            <line
              key={`axis-${i}`}
              x1={(C - dx).toFixed(2)} y1={(C - dy).toFixed(2)}
              x2={(C + dx).toFixed(2)} y2={(C + dy).toFixed(2)}
              stroke="currentColor"
              strokeWidth="0.4"
              strokeOpacity={GRID_OPACITY * 0.8}
            />
          );
        })}

        {/* --- Degree Tick Marks & HUD Annotations --- */}
        {ticks.map(deg => {
          const rad = (deg * Math.PI) / 180;
          const isMajor = deg % 90 === 0;
          const isMid = deg % 45 === 0;
          const len = isMajor ? 12 : isMid ? 8 : 4;

          const x1 = C + Math.cos(rad) * outerR;
          const y1 = C + Math.sin(rad) * outerR;
          const x2 = C + Math.cos(rad) * (outerR + len);
          const y2 = C + Math.sin(rad) * (outerR + len);

          return (
            <g key={`tick-group-${deg}`}>
              <line
                x1={x1.toFixed(2)} y1={y1.toFixed(2)} x2={x2.toFixed(2)} y2={y2.toFixed(2)}
                stroke="currentColor"
                strokeWidth={isMajor ? 1 : 0.6}
                strokeOpacity={ACCENT_OPACITY}
              />
              {isMajor && (
                <text
                  x={(C + Math.cos(rad) * (outerR + 25)).toFixed(2)}
                  y={(C + Math.sin(rad) * (outerR + 25)).toFixed(2)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill="currentColor"
                  fillOpacity={ACCENT_OPACITY}
                  fontFamily="JetBrains Mono, monospace"
                  style={{ transform: `rotate(${deg}deg)`, transformOrigin: 'center' }}
                >
                  {deg}°
                </text>
              )}
            </g>
          );
        })}

        {/* --- Central Crosshairs (Exact dead-center behind Omnibar) --- */}
        <g stroke="currentColor" strokeOpacity={ACCENT_OPACITY} strokeWidth="0.5">
          <line x1={C - 30} y1={C} x2={C - 5} y2={C} />
          <line x1={C + 5} y1={C} x2={C + 30} y2={C} />
          <line x1={C} y1={C - 30} x2={C} y2={C - 5} />
          <line x1={C} y1={C + 5} x2={C} y2={C + 30} />
          <circle cx={C} cy={C} r={3} fill="none" />
          <circle cx={C} cy={C} r={12} fill="none" strokeDasharray="1,3" />
        </g>

        {/* --- L1 Lagrange Marker --- */}
        <text
          x={C + 15} y={C - 15}
          fontSize="6"
          fill="currentColor"
          fillOpacity={ACCENT_OPACITY * 1.5}
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
        >
          L1_LAGRANGE_POINT [ACTIVE]
        </text>
      </svg>
    </div>
  );
}
