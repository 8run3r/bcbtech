import RebrandHero from "@/components/landing/RebrandHero";
import RebrandServices from "@/components/landing/RebrandServices";
import RebrandPricing from "@/components/landing/RebrandPricing";
import RebrandProcess from "@/components/landing/RebrandProcess";
import RebrandContact from "@/components/landing/RebrandContact";
import RebrandFooter from "@/components/landing/RebrandFooter";

const Index = () => (
  <main className="bg-black min-h-screen">
    <RebrandHero />
    <RebrandServices />
    <RebrandPricing />
    <RebrandProcess />
    <RebrandContact />
    <RebrandFooter />
  </main>
);

export default Index;
