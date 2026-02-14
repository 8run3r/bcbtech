import { useState, useEffect, useRef } from "react";
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
import FluidCursor from "@/components/landing/FluidCursor";

const Index = () => {
  const [particlesEnded, setParticlesEnded] = useState(false);
  const scrollStoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollStoryRef.current) return;
      const rect = scrollStoryRef.current.getBoundingClientRect();
      // Particles end when ScrollStory bottom passes the viewport top
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
        <Marquee />
        <div ref={scrollStoryRef}>
          <ScrollStory />
        </div>
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
