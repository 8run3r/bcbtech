import { useState, useEffect, useRef } from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";

import ScrollStory from "@/components/landing/ScrollStory";
import ServicesOverview from "@/components/landing/ServicesOverview";
import BeforeAfter from "@/components/landing/BeforeAfter";
import PortfolioPreview from "@/components/landing/PortfolioPreview";
import FAQ from "@/components/landing/FAQ";
import ContactCTA from "@/components/landing/ContactCTA";
import Footer from "@/components/landing/Footer";
import ParticleField from "@/components/landing/ParticleField";
import FluidCursor from "@/components/landing/FluidCursor";
import ExitIntentPopup from "@/components/landing/ExitIntentPopup";

const Index = () => {
  const [particlesEnded, setParticlesEnded] = useState(false);
  const scrollStoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollStoryRef.current) return;
      const rect = scrollStoryRef.current.getBoundingClientRect();
      setParticlesEnded(rect.bottom < window.innerHeight * 0.5);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      {/* Particles — visible until after scroll story */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: particlesEnded ? 0 : 1 }}
      >
        <ParticleField density={3000} particleSize={2} />
      </div>

      {/* Fluid cursor background — fades in after scroll story */}
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
        style={{ opacity: particlesEnded ? 1 : 0 }}
      >
        <FluidCursor />
      </div>

      <div className="relative z-10">
        <Header />
        <Hero />
        
        <div ref={scrollStoryRef}>
          <ScrollStory />
        </div>
        <ServicesOverview />
        <BeforeAfter />
        <PortfolioPreview />
        <FAQ />
        <ContactCTA />
        <Footer />
        <ExitIntentPopup />
      </div>
    </main>
  );
};

export default Index;
