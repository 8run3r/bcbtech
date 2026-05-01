import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { ServiceConfig } from "@/data/services";

interface Props {
  service: ServiceConfig;
}

const ServiceCTA = ({ service }: Props) => {
  const { cta, pricing, hero } = service;

  return (
    <section className="relative py-32 px-6 overflow-hidden" style={{ backgroundColor: hero.bg }}>
      {/* Sweep glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: `radial-gradient(ellipse at center, rgba(${hero.accentRaw},1) 0%, transparent 60%)`,
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {pricing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-baseline gap-3 mb-6 font-mono"
          >
            <span className="text-xs uppercase tracking-[0.2em] opacity-60">cena</span>
            <span className="text-3xl md:text-4xl font-bold" style={{ color: hero.accent, fontFamily: "Syne, sans-serif" }}>
              {pricing.from}
            </span>
            {pricing.note && (
              <span className="text-xs uppercase tracking-wider opacity-60">{pricing.note}</span>
            )}
          </motion.div>
        )}

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          {cta.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto mb-12"
        >
          {cta.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to={`/kontakt?service=${service.slug}`}
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full font-semibold uppercase tracking-wider text-sm transition-all duration-300 overflow-hidden"
            style={{
              background: `rgba(${hero.accentRaw},0.08)`,
              border: `1px solid rgba(${hero.accentRaw},0.4)`,
              color: hero.accent,
              boxShadow: `0 0 40px rgba(${hero.accentRaw},0.15)`,
            }}
          >
            <span
              className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
              style={{ background: `linear-gradient(90deg, transparent, rgba(${hero.accentRaw},0.2), transparent)` }}
            />
            <span className="relative">{cta.buttonText}</span>
            <ArrowUpRight size={18} className="relative transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-xs font-mono uppercase tracking-wider opacity-50"
        >
          alebo zavolaj +421 911 640 660
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceCTA;
