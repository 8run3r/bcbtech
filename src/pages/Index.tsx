import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import ScrollStory from "@/components/landing/ScrollStory";
import CameraServices from "@/components/landing/CameraServices";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Marquee />
      <ScrollStory />
      <CameraServices />
      <Footer />
    </main>
  );
};

export default Index;
