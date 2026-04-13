import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import CampaignsSection from "@/components/landing/CampaignsSection";
import ImpactSection from "@/components/landing/ImpactSection";
import StoriesSection from "@/components/landing/StoriesSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <CampaignsSection />
        <ImpactSection />
        <StoriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
