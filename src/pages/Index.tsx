import { useState, lazy, Suspense } from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FounderSection from "@/components/landing/FounderSection";
import FooterCTA from "@/components/landing/FooterCTA";
import BootSequence from "@/components/landing/BootSequence";
import Scanlines from "@/components/ui/scanlines";
import SystemMessages from "@/components/ui/system-messages";
import HiddenInteractions from "@/components/ui/hidden-interactions";
import DataRain from "@/components/ui/data-rain";
import PageLoader from "@/components/ui/page-loader";

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
            <Suspense fallback={<PageLoader />}>
              <SubworldContainer />
            </Suspense>
            <FounderSection />
            <FooterCTA />
          </main>
        </>
      )}
    </>
  );
};

export default Index;
