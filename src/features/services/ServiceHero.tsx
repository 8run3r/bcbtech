import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import PretextHeadline from "@/components/ui/pretext-headline";
import ServiceScene from "./ServiceScene";
import type { ServiceConfig } from "@/data/services";

interface Props {
  service: ServiceConfig;
}

const ServiceHero = ({ service }: Props) => {
  const { kicker, hero, scene } = service;

  return (
    <section
      className="relative min-h-[88vh] flex items-center overflow-hidden"
      style={{ backgroundColor: hero.bg }}
    >
      {/* Background scene */}
      {scene && <ServiceScene variant={scene} accent={hero.accent} accentRaw={hero.accentRaw} />}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, ${hero.bg} 90%)`,
        }}
      />

      {/* Side rule */}
      <div
        className="absolute left-6 top-24 bottom-24 w-px hidden md:block"
        style={{ background: `linear-gradient(to bottom, transparent, rgba(${hero.accentRaw},0.4), transparent)` }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full py-32 md:py-40">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-block text-xs uppercase tracking-[0.3em] font-mono mb-6"
          style={{ color: hero.accent }}
        >
          {kicker}
        </motion.span>

        <PretextHeadline
          text={hero.headline}
          fontSize={72}
          fontWeight={800}
          color="var(--text-primary)"
          className="max-w-4xl mb-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12"
        >
          {hero.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex items-center gap-6 text-xs font-mono uppercase tracking-wider"
        >
          <span className="text-muted-foreground/60">Scroll pre detail</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: hero.accent }}
          >
            <ArrowDown size={16} />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom corner brackets */}
      <div
        className="absolute bottom-6 left-6 w-8 h-8 border-l border-b"
        style={{ borderColor: `rgba(${hero.accentRaw},0.4)` }}
      />
      <div
        className="absolute bottom-6 right-6 w-8 h-8 border-r border-b"
        style={{ borderColor: `rgba(${hero.accentRaw},0.4)` }}
      />
    </section>
  );
};

export default ServiceHero;
