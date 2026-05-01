import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { getServiceBySlug } from "@/data/services";
import ServiceHero from "@/features/services/ServiceHero";
import ServiceFeatureGrid from "@/features/services/ServiceFeatureGrid";
import ServiceProcess from "@/features/services/ServiceProcess";
import ServiceCalculator from "@/features/services/ServiceCalculator";
import ServiceFAQ from "@/features/services/ServiceFAQ";
import ServiceCTA from "@/features/services/ServiceCTA";

const Sluzba = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getServiceBySlug(slug) : undefined;

  // Update <title> + meta description per service
  useEffect(() => {
    if (!service) return;
    const prevTitle = document.title;
    const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute("content");

    document.title = `${service.title} — CokTech`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", service.description);

    return () => {
      document.title = prevTitle;
      if (meta && prevDesc) meta.setAttribute("content", prevDesc);
    };
  }, [service]);

  if (!service) return <Navigate to="/sluzby" replace />;

  return (
    <main style={{ background: service.hero.bg, color: "var(--text-primary)" }}>
      <Navbar />
      <ServiceHero service={service} />
      <ServiceFeatureGrid service={service} />
      <ServiceProcess service={service} />
      {service.hasCalculator && <ServiceCalculator service={service} />}
      <ServiceFAQ service={service} />
      <ServiceCTA service={service} />
      <Footer />
    </main>
  );
};

export default Sluzba;
