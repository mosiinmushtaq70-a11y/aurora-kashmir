'use client';

import React from 'react';
import DossierShell from './DossierShell';
import DossierEnvironmental from './tabs/DossierEnvironmental';
import DossierTactical from './tabs/DossierTactical';
import DossierArchives from './tabs/DossierArchives';
import DossierLogistics from './tabs/DossierLogistics';

const DossierView_Kirkjufell: React.FC = () => {
  return (
    <DossierShell
      heroImage="https://lh3.googleusercontent.com/aida-public/AB6AXuAdhVAGG6MIWUfVCaC0XxIJQ5vG7uCAwirX4rQWgREm8oUOw11JcHzz-4_2E5_qafmYuXv2SLVLLdZpNlWZJ6E_0dqJoOqwgIC2tHNso1MCgUuY6WuOcfGhAenzxjF4NKMcv0vceYMmCaXp5QOKInxgQ91CQxKEn6DsGZko39UA6VAdqT-gH0s3C4yWXP0yZNuN5YDlcV4vhNfiOjRrcjZrWFerNDSfChnSAHZ0jtIddXx5Z8C961dCwUCyECZAGKuWpPBDRuo2UMs"
      subtitle="THE CHURCH MOUNTAIN"
    >
      <DossierEnvironmental
        quote="A sanctuary where the"
        italicWord="basalt"
        lore={[
          "Beyond the basalt columns and the rhythmic crash of the Atlantic lies a landmark forged in fire and sculpted by ice.",
          "Kirkjufell stands not merely as a mountain, but as a celestial convergence point where the magnetic pulse of the North reaches its zenith.",
          "Ancient seafarers spoke of a 'Church' made of stone, a sanctuary where the veil between worlds thins during the equinox."
        ]}
      />

      <DossierTactical
        weatherShieldTitle="Magnetic Band Convergence"
        weatherShieldDesc="High-density magnetic flux detected at the peak apex, accelerating ion collision probability by 14%."
        magBandTitle="Deep-Field Optical Clarity"
        magBandDesc="Bortle Class 1 rating. Minimal atmospheric haze with particulate matter below 0.5 PPM."
      />

      <DossierArchives
        images={[
          {
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD0GI8AeT4uXJVhWIrK1vZ0AnckzpS5wEd1pCbHUo7Q1OZ_7vg-V-FSyxwqRjDP7CmlxG53CxIUUX9m5xGz7Fxx_Kal9VRU0puEsORQEQBMPxY29YroJI4VCNG2vIuB7PGQ5WQwNKEEzj6IF9c3zBn2AAkh07iz-AueVDzBaRQyWwusgomL7JM9ZIVo6rzbOEw8xTFHig3xfRD9lr0bOqbrazWVuEDKEa4V8Rjs9asYSN1RbKM7Nx13-HovWcsoCXsPLqJfpry-HM8",
            alt: "Kirkjufell Reflection",
            title: "The Reflection Ritual",
            author: "Elias Thorne",
            span: "large"
          },
          {
            src: "https://lh3.googleusercontent.com/aida-public/AB6AXuANxWcYDusj4iPdomEVD8HlQD1GyUfu7P3EWgBhOKC9JGJuG1HBAZ3RsZygER8Z4eaeBZmBT_qRtGkCcY4fk87qrOfM90VeugucmpLl6jVUJqS_lzAFuf3dMI-ZOnhE-dci2V1j5MveaU91Ku5BTUiqUZVWzpLPieWsLOKXNGi505GHa6gcpnKwkdTQcXfHHLJEI1yTOU_DkQLl4wM3bmPpXJnvsXAQVpYMOB62S4gDdiX_I_s50S_1yZbbfH_uUg-BkRqWtgOcfug",
            alt: "Cascading Symmetry",
            title: "Glacial Flow",
            author: "M. Jónsdóttir",
            span: "medium"
          }
        ]}
      />

      {/* Intelligence Footnotes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20 border-t border-white/5 opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex flex-col gap-2">
          <span className="font-['Manrope'] font-bold text-xs text-[#00e5ff] uppercase tracking-widest">Geologic Origin</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed text-[#bac9cc]">
            The mountain is a 'Nunatak' — a peak that remained above the ice sheet during the last glacial period, preserving its unique triangular symmetry.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-['Manrope'] font-bold text-xs text-[#00e5ff] uppercase tracking-widest">Cinematic Legacy</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed text-[#bac9cc]">
            Globally known as the 'Arrowhead Mountain' from Game of Thrones, it remains the most photographed landmark in Iceland.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-['Manrope'] font-bold text-xs text-[#00e5ff] uppercase tracking-widest">Basalt Formation</span>
          <p className="font-['Inter'] text-[13px] leading-relaxed text-[#bac9cc]">
            The layers are composed of volcanic rock (basalt) and sandstone, stratified over millions of years of oceanic sedimentation.
          </p>
        </div>
      </section>

      <DossierLogistics
        locationBlurb="Kirkjufell is the crown jewel of the Snæfellsnes Peninsula. Accessible via Grundarfjörður, it requires specialized winter gear for high-altitude observation."
        resources={[
          { title: "Snæfellsnes Safety", desc: "Winter transit guidelines and weather warnings for the peninsula.", icon: "security" },
          { title: "Digital Navigation Pack", desc: "Offline maps and GPS coordinates for photographers.", icon: "download" },
          { title: "Local Satellite", desc: "Real-time cloud cover and wind speed over the peninsula.", icon: "satellite_alt" }
        ]}
      />
    </DossierShell>
  );
};

export default DossierView_Kirkjufell;
