'use client';

import React from 'react';
import DossierShell from './DossierShell';
import DossierEnvironmental from './tabs/DossierEnvironmental';
import DossierTactical from './tabs/DossierTactical';
import DossierArchives from './tabs/DossierArchives';
import DossierLogistics from './tabs/DossierLogistics';

const DossierView_Tromso_Polished: React.FC = () => {
  return (
    <DossierShell
      heroImage="https://lh3.googleusercontent.com/aida-public/AB6AXuCHXbMv0nC5Z9S9Uvx-Y97l2V1vjP03fD3v9bXU91l6V6j0U4h9V8r0N1m1u1n1o1p1q1r1s1t1u1v1w1x1y1z"
      subtitle="THE ARCTIC CAPITOL"
    >
      {/* 1. Environmental Section */}
      <DossierEnvironmental
        quote="A sanctuary where the"
        italicWord="magnetic"
        lore={[
          "Situated 350km north of the Arctic Circle, Tromsø is more than a city; it is a gateway to the high latitudes where the sun vanishes for months, leaving only the spectral glow of the aurora.",
          "The surrounding fjords act as thermal regulators, keeping the coastal temperatures surprisingly manageable while the sky above erupts in nitrogen-violet and oxygen-green curtains.",
          "For centuries, the Sami people have watched these 'revontulet' (fox-fires), believing them to be the heralds of mountain spirits."
        ]}
      />

      {/* 2. Tactical Site Brief */}
      <DossierTactical
        weatherShieldTitle="Fjord Microclimate"
        weatherShieldDesc="The Gulf Stream drift provides a semi-temperate maritime climate. Coastal moisture can cause rapid cloud formation, but inland valleys offer rain-shadow protection."
        magBandTitle="The Auroral Oval Core"
        magBandDesc="Tromsø is positioned directly beneath the maximum auroral probability band. Even during low Kp cycles (Kp 1-2), visible displays are frequent."
      />

      {/* 3. Archives Section */}
      <DossierArchives
        images={[
          {
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHXbMv0nC5Z9S9Uvx-Y97l2V1vjP03fD3v9bXU91l6V6j0U4h9V8r0N1m1u1n1o1p1q1r1s1t1u1v1w1x1y1z",
            alt: "Tromso Skyline",
            title: "Midnight Spectral",
            author: "Bjørn Arntzen",
            span: "large"
          },
          {
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9S9Uvx-Y97l2V1vjP03fD3v9bXU91l6V6j0U4h9V8r0N1m1u1n1o1p1q1r1s1t1u1v1w1x1y1z",
            alt: "Arctic Cathedral",
            title: "Cathedral Silhouette",
            author: "S. Kristiansen",
            span: "medium"
          }
        ]}
      />

      {/* 4. Intelligence Footnotes (The "Subtle & Informative" part) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20 border-t border-white/5 opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-2">
          <span className="font-['Manrope'] font-bold text-xs text-[#00e5ff] uppercase tracking-widest">Research Hub</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed text-[#bac9cc]">
            Tromsø is home to the world's most northerly university (UiT), which hosts the Tromsø Satellite Station (TSS) for real-time auroral telemetry.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-['Manrope'] font-bold text-xs text-[#00e5ff] uppercase tracking-widest">Photographic Apex</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed text-[#bac9cc]">
            The Fjellheisen cable car takes you to 421m above sea level, providing a 360-degree vantage point that clears the city's light pollution dome.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-['Manrope'] font-bold text-xs text-[#00e5ff] uppercase tracking-widest">Deep Field Stat</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed text-[#bac9cc]">
            The local geomagnetic field here is tilted at 78 degrees, causing auroral particles to descend vertically, creating the 'corona' effect.
          </p>
        </div>
      </section>

      {/* 5. Logistics Section */}
      <DossierLogistics
        locationBlurb="Tromsø (TOS) is the primary logistics hub for Northern Scandinavia. It offers high-speed fiber connectivity even in remote fjord-side cabins."
        resources={[
          { title: "Visit Tromsø", desc: "The official regional tourism board and safety desk.", icon: "public" },
          { title: "挪威气象局 (Yr.no)", desc: "Hyper-local cloud cover and solar wind forecasts.", icon: "cloud" },
          { title: "Arctic Transit Pass", desc: "Bus route schedules for nightly aurora chasing.", icon: "directions_bus" }
        ]}
      />
    </DossierShell>
  );
};

export default DossierView_Tromso_Polished;
