import HeroSection from "@/components/landing/HeroSection8";
import AboutSection from "@/components/landing/AboutSection1";
import StatsSection from "@/components/landing/StatsSection1";
import CampaignsSection from "@/components/landing/CampaignsSection1";
import PartnersSection from "@/components/landing/PartnersSection1";
import ImpactSection from "@/components/landing/ImpactSection1";
import StoriesSection from "@/components/landing/StoriesSection1";
import CTABand from "@/components/landing/CTABand1";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // 👈 missing
import gsap from "gsap";

export default function Index() {
useEffect(() => {
  gsap.registerPlugin(ScrollTrigger);

  // Two rAFs guarantee all GSAP contexts + pin spacers are in the DOM
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
  });
}, []);
  return (
    <>
      {/* <Navbar /> */}
      <main className="">
        <HeroSection />
        <AboutSection />
        <StatsSection />
        <PartnersSection />
        <CampaignsSection />
        <ImpactSection />
        <StoriesSection />
        <CTABand />
      </main>
      {/* <Footer /> */}
    </>
  );
}
