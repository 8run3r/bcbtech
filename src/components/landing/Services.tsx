import { motion } from "framer-motion";
import { Code2, Palette, Rocket, Shield, Smartphone, Zap } from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Web Aplikácie",
    desc: "React, Next.js, TypeScript — moderné SPA a fullstack riešenia na mieru.",
  },
  {
    icon: Palette,
    title: "UI/UX Dizajn",
    desc: "Dizajnové systémy a prototypy, ktoré konvertujú a vyzerajú brutálne.",
  },
  {
    icon: Rocket,
    title: "Performance",
    desc: "Optimalizácia rýchlosti, Core Web Vitals, SSR a edge rendering.",
  },
  {
    icon: Shield,
    title: "Bezpečnosť",
    desc: "Bezpečná architektúra, auth, šifrovanie a compliance od základov.",
  },
  {
    icon: Smartphone,
    title: "Responzívny vývoj",
    desc: "Mobile-first prístup, PWA a cross-platform kompatibilita.",
  },
  {
    icon: Zap,
    title: "AI Integrácie",
    desc: "LLM-powered funkcie, chatboty, automatizácia a inteligentné dáta.",
  },
];

const Services = () => {
  return (
    <section id="services" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block">
            Čo robíme
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Služby
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-lg bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:glow-primary"
            >
              <s.icon className="text-primary mb-5" size={28} strokeWidth={1.5} />
              <h3 className="text-lg font-semibold mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
