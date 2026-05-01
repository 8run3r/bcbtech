import { motion } from "framer-motion";
import type { ServiceConfig } from "@/data/services";

interface Props {
  service: ServiceConfig;
}

const ServiceFeatureGrid = ({ service }: Props) => {
  const { features, hero, kicker } = service;

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, rgba(${hero.accentRaw},0.3), transparent)` }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-mono mb-4 block" style={{ color: hero.accent }}>
            {kicker} / FEATURES
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "Syne, sans-serif" }}>
            Čo vieme
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="group relative p-8 rounded-lg bg-card/40 border border-border/50 backdrop-blur-sm overflow-hidden transition-all duration-500"
                style={{
                  ["--accent" as string]: hero.accent,
                  ["--accent-raw" as string]: hero.accentRaw,
                }}
              >
                {/* Surveillance corner brackets */}
                <span className="absolute top-2 left-2 w-3 h-3 border-t border-l opacity-30 group-hover:opacity-80 transition-opacity"
                      style={{ borderColor: hero.accent }} />
                <span className="absolute top-2 right-2 w-3 h-3 border-t border-r opacity-30 group-hover:opacity-80 transition-opacity"
                      style={{ borderColor: hero.accent }} />
                <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l opacity-30 group-hover:opacity-80 transition-opacity"
                      style={{ borderColor: hero.accent }} />
                <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r opacity-30 group-hover:opacity-80 transition-opacity"
                      style={{ borderColor: hero.accent }} />

                {/* Hover glow gradient */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 30% 0%, rgba(${hero.accentRaw},0.08) 0%, transparent 70%)`,
                  }}
                />

                <div
                  className="relative w-12 h-12 mb-6 rounded flex items-center justify-center"
                  style={{
                    background: `rgba(${hero.accentRaw},0.08)`,
                    border: `1px solid rgba(${hero.accentRaw},0.2)`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: hero.accent }} />
                </div>

                <h3 className="relative text-xl font-bold mb-3 tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
                  {f.title}
                </h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed">{f.desc}</p>

                <span
                  className="absolute bottom-0 left-0 h-px transition-all duration-500"
                  style={{
                    width: "0%",
                    background: hero.accent,
                  }}
                />
                <style>{`
                  .group:hover > span:last-of-type { width: 100% !important; }
                `}</style>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceFeatureGrid;
