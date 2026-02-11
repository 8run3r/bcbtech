import Header from "@/components/landing/Header";
import CameraServices from "@/components/landing/CameraServices";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";

const ParticleField = lazy(() => import("@/components/landing/ParticleField"));

const Kamery = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <ParticleField />
          </Suspense>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[180px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-sm text-primary font-mono mb-6 tracking-[0.2em] uppercase">
              [ Surveillance Systems ]
            </p>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-6">
              Kamerové systémy
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Profesionálna montáž, konfigurácia a servis bezpečnostných kamerových systémov 
              — Hikvision, Dahua, Uniview a ďalšie.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      <CameraServices />

      {/* Brands Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">
              Značky, s ktorými pracujeme
            </span>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {["Hikvision", "Dahua", "Uniview", "Axis", "TP-Link VIGI", "Reolink"].map((brand, i) => (
              <motion.span
                key={brand}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-lg font-semibold text-foreground/20 hover:text-primary/60 transition-colors duration-500 cursor-default"
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Kamery;
