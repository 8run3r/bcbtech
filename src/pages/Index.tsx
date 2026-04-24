import { useState, lazy, Suspense } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FooterCTA from "@/components/landing/FooterCTA";
import BootSequence from "@/components/landing/BootSequence";
import Scanlines from "@/components/ui/scanlines";
import SystemMessages from "@/components/ui/system-messages";
import HiddenInteractions from "@/components/ui/hidden-interactions";
import DataRain from "@/components/ui/data-rain";

const SubworldContainer = lazy(() => import("@/components/subworlds/SubworldContainer"));

const Index = () => {
  const [bootDone, setBootDone] = useState(false);

  return (
    <>
      {!bootDone && <BootSequence onComplete={() => setBootDone(true)} />}

      {bootDone && (
        <>
          <Scanlines />
          <SystemMessages />
          <HiddenInteractions />
          <DataRain opacity={0.025} color="#00ffaa" />

          <main style={{ background: "#000", minHeight: "100vh" }}>
            <Navbar />
            <HeroSection />
            <Suspense fallback={
              <div style={{ height: "100vh", background: "#000" }} className="flex items-center justify-center">
                <span className="blink-cursor" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--neon-primary)", opacity: 0.3 }}>
                  LOADING WORLDS
                </span>
              </div>
            }>
              <SubworldContainer />
            </Suspense>
            <FooterCTA />
          </main>
        </>
      )}
    </>
  );
};

export default Index;
