import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection1";
import ImpactSection from "@/components/landing/ImpactSection1";
import FamiliesSection from "@/components/landing/FamiliesSection";
import CTABand from "@/components/landing/CTABand1";
import Footer from "@/components/landing/Footer1";

export default function Index() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ImpactSection />
        <FamiliesSection />
        <CTABand />
      </main>
      <Footer />
    </>
  );
}