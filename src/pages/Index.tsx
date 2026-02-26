import { lazy, Suspense, useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import PageLoader from "@/components/landing/PageLoader";

import ServicesOverview from "@/components/landing/ServicesOverview";
import BeforeAfter from "@/components/landing/BeforeAfter";
import PortfolioPreview from "@/components/landing/PortfolioPreview";
import Testimonials from "@/components/landing/Testimonials";
import ContactCTA from "@/components/landing/ContactCTA";
import Footer from "@/components/landing/Footer";
import FluidCursor from "@/components/landing/FluidCursor";
import ExitIntentPopup from "@/components/landing/ExitIntentPopup";

// Lazy-load the heavy 3D ScrollStory component
const ScrollStory = lazy(() => import("@/components/landing/ScrollStory"));

// Preload ScrollStory immediately when module loads (before component mounts)
const preloadPromise = import("@/components/landing/ScrollStory");

const Index = () => {
  const [sceneReady, setSceneReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress while the chunk loads
    let frame: number;
    let current = 0;

    const tick = () => {
      if (current < 85) {
        current += (85 - current) * 0.04;
        setProgress(current);
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);

    preloadPromise.then(() => {
      // Chunk loaded — animate to 100% then hide loader
      setProgress(100);
      setTimeout(() => setSceneReady(true), 400);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      {/* Loading screen */}
      <AnimatePresence>
        {!sceneReady && <PageLoader progress={progress} />}
      </AnimatePresence>

      {/* Fluid cursor background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FluidCursor />
      </div>

      <div className="relative z-10">
        <Header />
        <Hero />
        
        <Suspense fallback={null}>
          <ScrollStory />
        </Suspense>
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
