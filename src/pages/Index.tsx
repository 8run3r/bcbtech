import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Showcase from "@/components/landing/Showcase";
import Stats from "@/components/landing/Stats";
import Services from "@/components/landing/Services";
import Projects from "@/components/landing/Projects";
import TechStack from "@/components/landing/TechStack";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Marquee />
      <Showcase />
      <Stats />
      <Services />
      <Projects />
      <TechStack />
      <Contact />
      <Footer />
    </main>
  );
};

export default Index;
