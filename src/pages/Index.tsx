import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";

import ScrollStory from "@/components/landing/ScrollStory";
import ServicesOverview from "@/components/landing/ServicesOverview";
import BeforeAfter from "@/components/landing/BeforeAfter";
import PortfolioPreview from "@/components/landing/PortfolioPreview";
import Testimonials from "@/components/landing/Testimonials";
import ContactCTA from "@/components/landing/ContactCTA";
import Footer from "@/components/landing/Footer";
import FluidCursor from "@/components/landing/FluidCursor";
import ExitIntentPopup from "@/components/landing/ExitIntentPopup";

const Index = () => {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      {/* Fluid cursor background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FluidCursor />
      </div>

      <div className="relative z-10">
        <Header />
        <Hero />
        
        <ScrollStory />
        <ServicesOverview />
        <BeforeAfter />
        <PortfolioPreview />
        <Testimonials />
        <ContactCTA />
        <Footer />
        <ExitIntentPopup />
      </div>
    </main>
  );
};

export default Index;
