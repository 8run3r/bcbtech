import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Code2, Camera, ArrowRight, Palette, Rocket, Shield, Eye, Wifi } from "lucide-react";
import AnimatedModal from "@/components/ui/animated-modal";

const digitalServices = [
  { icon: Code2, title: "Web Aplikácie", desc: "React, TypeScript, fullstack riešenia", detail: "Tvoríme moderné webové aplikácie s dôrazom na výkon, bezpečnosť a používateľský zážitok. Od landing pages po komplexné SaaS platformy." },
  { icon: Palette, title: "UI/UX Dizajn", desc: "Dizajnové systémy a prototypy", detail: "Navrhujeme intuitívne rozhrania v Figma, budujeme konzistentné dizajnové systémy a interaktívne prototypy pred samotným vývojom." },
  { icon: Rocket, title: "Performance & AI", desc: "Optimalizácia, automatizácia, LLM", detail: "Implementujeme AI riešenia, automatizujeme procesy pomocou LLM modelov a optimalizujeme výkon vašich aplikácií na maximum." },
];

const securityServices = [
  { icon: Eye, title: "24/7 Monitoring", desc: "AI detekcia, nočné videnie", detail: "Nepretržitý dohľad s AI rozpoznávaním pohybu, nočným videním a okamžitými notifikáciami priamo do vášho telefónu." },
  { icon: Wifi, title: "Sieťová infraštruktúra", desc: "PoE, NVR, káblové trasy", detail: "Kompletný návrh a realizácia sieťovej infraštruktúry — PoE switche, NVR záznamníky, štruktúrovaná kabeláž a bezdrôtové riešenia." },
  { icon: Shield, title: "Zabezpečenie", desc: "Firmy, sklady, rezidencie", detail: "Profesionálna montáž kamier pre firemné priestory, sklady, obchody aj rodinné domy. Certifikované komponenty s dlhou životnosťou." },
];

interface ServiceItem {
  icon: React.ElementType;
  title: string;
  desc: string;
  detail: string;
}

const ServicesOverview = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const openDetail = (service: ServiceItem) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">
            [ Čo robíme ]
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Dva svety. Jedno riešenie.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Security side — LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="p-8 sm:p-10 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 overflow-hidden">
              {/* Corner brackets */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary/20" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary/20" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary/20" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary/20" />

              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Camera className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Kamerové systémy</h3>
                  <p className="text-xs text-muted-foreground">Surveillance & Security</p>
                </div>
              </div>

              <div className="space-y-5 mb-8">
                {securityServices.map((s, i) => (
                  <motion.button
                    key={s.title}
                    onClick={() => openDetail(s)}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-4 w-full text-left group/item hover:bg-primary/5 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <s.icon className="text-primary/60 mt-0.5 flex-shrink-0 group-hover/item:text-primary transition-colors" size={18} strokeWidth={1.5} />
                    <div>
                      <span className="text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors">{s.title}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                    <ArrowRight size={14} className="ml-auto mt-0.5 text-transparent group-hover/item:text-primary transition-all" />
                  </motion.button>
                ))}
              </div>

              <Link
                to="/kamery"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-foreground transition-colors group/link"
              >
                Viac o kamerách
                <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Digital side — RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="p-8 sm:p-10 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Code2 className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Digitálne produkty</h3>
                  <p className="text-xs text-muted-foreground">Web & Software</p>
                </div>
              </div>
              
              <div className="space-y-5 mb-8">
                {digitalServices.map((s, i) => (
                  <motion.button
                    key={s.title}
                    onClick={() => openDetail(s)}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="flex items-start gap-4 w-full text-left group/item hover:bg-primary/5 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <s.icon className="text-primary/60 mt-0.5 flex-shrink-0 group-hover/item:text-primary transition-colors" size={18} strokeWidth={1.5} />
                    <div>
                      <span className="text-sm font-semibold text-foreground group-hover/item:text-primary transition-colors">{s.title}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                    <ArrowRight size={14} className="ml-auto mt-0.5 text-transparent group-hover/item:text-primary transition-all" />
                  </motion.button>
                ))}
              </div>

              <Link
                to="/balicky?tab=web"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-foreground transition-colors group/link"
              >
                Pozrieť balíčky
                <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animated Modal for service details */}
      <AnimatedModal open={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedService && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <selectedService.icon className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">{selectedService.title}</h3>
                <p className="text-xs text-muted-foreground">{selectedService.desc}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {selectedService.detail}
            </p>
            <div className="flex gap-3">
              <Link
                to="/kontakt"
                onClick={() => setModalOpen(false)}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Mám záujem
              </Link>
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-card transition-colors"
              >
                Zavrieť
              </button>
            </div>
          </div>
        )}
      </AnimatedModal>
    </section>
  );
};

export default ServicesOverview;
