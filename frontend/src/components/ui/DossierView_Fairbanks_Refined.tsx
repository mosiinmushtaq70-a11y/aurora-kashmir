'use client';

import React from 'react';
import DossierShell from './DossierShell';
import DossierEnvironmental from './tabs/DossierEnvironmental';
import DossierTactical from './tabs/DossierTactical';
import DossierArchives from './tabs/DossierArchives';
import DossierLogistics from './tabs/DossierLogistics';

const DossierView_Fairbanks_Refined: React.FC = () => {
  return (
    <DossierShell
      heroImage="https://lh3.googleusercontent.com/aida-public/AB6AXuAR5mM1FDzd5ED9lIsaHVgI5HH85msuTQ1i_ABt9X5EdSAlmz7gYFLXCeDBm-9V-ofaeKh_i-5Zzje3tryKh6KiHcnsYyOb_Z6_xIdOYMyfvntCQX9TKy0Kh7m5Vhafczh5Y6fvR9HsJq9HQE3fA-4ED4LHao7WSXtCz1z1BMPAeT1wIF3GB99DbaqKRx7-LOzcpqVL7SSW1LrqClYYUBunfsJUP7n0OkS0ygaeHO9h7NSLiMwFtprp2-jxdPkhweCrK4MbUpQ3F1k"
      subtitle="THE INTERIOR OBSERVATORY"
    >
      <DossierEnvironmental
        quote="A sanctuary where the"
        italicWord="continental"
        lore={[
          "Deep within the Alaskan interior, Fairbanks sits defined by brutal, silent winters and vast, snow-covered taiga forests.",
          "From vantage points like Cleary Summit, the unobstructed, 360-degree views offer a profound contrast between the harsh, sub-zero terrestrial environment and the fluid, dancing energy of the sky above.",
          "Positioned directly under the permanent Auroral Oval, the city is geographically shielded from coastal Pacific moisture — providing crystal-clear atmospheric conditions."
        ]}
      />

      <DossierTactical
        weatherShieldTitle="Continental Freeze"
        weatherShieldDesc="Located deep in the Alaskan interior, brutal winter nights strip all moisture from the air, providing the driest, clearest atmospheres on Earth."
        magBandTitle="Permanent Auroral Oval"
        magBandDesc="Positioned directly under the auroral oval, geographically shielded from coastal Pacific moisture. Crystal-clear conditions to capture nitrogen bands."
      />

      <DossierArchives
        images={[
          {
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAR5mM1FDzd5ED9lIsaHVgI5HH85msuTQ1i_ABt9X5EdSAlmz7gYFLXCeDBm-9V-ofaeKh_i-5Zzje3tryKh6KiHcnsYyOb_Z6_xIdOYMyfvntCQX9TKy0Kh7m5Vhafczh5Y6fvR9HsJq9HQE3fA-4ED4LHao7WSXtCz1z1BMPAeT1wIF3GB99DbaqKRx7-LOzcpqVL7SSW1LrqClYYUBunfsJUP7n0OkS0ygaeHO9h7NSLiMwFtprp2-jxdPkhweCrK4MbUpQ3F1k",
            alt: "Fairbanks Interior",
            title: "Continental Night",
            author: "Staff",
            span: "large"
          },
          {
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBAhZ1N2D21wPRnxvYo4R8L1GsypuhphvsFhb-zL9kbI9PPBZozynb4AUL8Be2XuzbWikhz8_JUuuYlzFAvunU8JYPDxY4rYNWbNVAPvU2uyI6L1PGhUO41ZhHekBDH87_SMJWX5rvYwO0KMDFla2My3wturFrTxVaHVRelhjk15tBBpxcGSUJk2ZScucPy-pdxESelDSxObsMkP6OCR3L2mCCHCC9pN0H4r-8r37GD465amuvNGGAJjNKLjCGhLdf_3KdkZUpl_E",
            alt: "Arctic Cabin",
            title: "Silent Watch",
            author: "Alaska Media",
            span: "medium"
          }
        ]}
      />

      {/* Intelligence Footnotes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20 border-t border-white/5 opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-2">
          <span className="font-['Manrope'] font-bold text-xs text-[#00e5ff] uppercase tracking-widest">Geophysical Institute</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed text-[#bac9cc]">
            The University of Alaska Fairbanks (UAF) operates the world-renowned auroral forecast center, analyzing real-time B-field fluctuations.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-['Manrope'] font-bold text-xs text-[#00e5ff] uppercase tracking-widest">Atmospheric Clarity</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed text-[#bac9cc]">
            Fairbanks is located in a 'Continental Dry Basin', meaning moisture rarely penetrates the interior, resulting in 200+ clear nights per year.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-['Manrope'] font-bold text-xs text-[#00e5ff] uppercase tracking-widest">Frozen Silence</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed text-[#bac9cc]">
            At -40°C, the air becomes so dense that sound waves travel significantly further, creating a unique acoustic environment for nighttime observation.
          </p>
        </div>
      </section>

      <DossierLogistics
        locationBlurb="Fairbanks (FAI) is the logistics capital of interior Alaska. Rail and air links provide the only reliable access to the deep Arctic tundra."
        resources={[
          { title: "Explore Fairbanks", desc: "Official interior Alaska travel and accommodation board.", icon: "public" },
          { title: "UAF Geophysical", desc: "The source for real-time aurora forecast and telemetry.", icon: "sensors" },
          { title: "Cleary Summit Guide", desc: "Prime high-altitude vantage points for celestial viewing.", icon: "visibility" }
        ]}
      />
    </DossierShell>
  );
};

export default DossierView_Fairbanks_Refined;
