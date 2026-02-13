import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import ScrollStory from "@/components/landing/ScrollStory";
import ServicesOverview from "@/components/landing/ServicesOverview";
import PortfolioPreview from "@/components/landing/PortfolioPreview";
import CameraServices from "@/components/landing/CameraServices";

import ContactCTA from "@/components/landing/ContactCTA";
import Footer from "@/components/landing/Footer";
import ParticleField from "@/components/landing/ParticleField";

const Index = () => {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      {/* Global particle field behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ParticleField density={3000} particleSize={2} />
      </div>

      <div className="relative z-10">
        <Header />
        <Hero />
        <Marquee />
        <ScrollStory />
        <ServicesOverview />
        <PortfolioPreview />
        
        <CameraServices />
        <ContactCTA />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
