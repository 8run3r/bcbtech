import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Code2, Camera, ArrowRight, Palette, Rocket, Shield, Eye, Wifi } from "lucide-react";

const digitalServices = [
  { icon: Code2, title: "Web Aplikácie", desc: "React, TypeScript, fullstack riešenia" },
  { icon: Palette, title: "UI/UX Dizajn", desc: "Dizajnové systémy a prototypy" },
  { icon: Rocket, title: "Performance & AI", desc: "Optimalizácia, automatizácia, LLM" },
];

const securityServices = [
  { icon: Eye, title: "24/7 Monitoring", desc: "AI detekcia, nočné videnie" },
  { icon: Wifi, title: "Sieťová infraštruktúra", desc: "PoE, NVR, káblové trasy" },
  { icon: Shield, title: "Zabezpečenie", desc: "Firmy, sklady, rezidencie" },
];

const ServicesOverview = () => {
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
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <s.icon className="text-primary/60 mt-0.5 flex-shrink-0" size={18} strokeWidth={1.5} />
                    <div>
                      <span className="text-sm font-semibold text-foreground">{s.title}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </motion.div>
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
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <s.icon className="text-primary/60 mt-0.5 flex-shrink-0" size={18} strokeWidth={1.5} />
                    <div>
                      <span className="text-sm font-semibold text-foreground">{s.title}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </motion.div>
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
    </section>
  );
};

export default ServicesOverview;
