import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { ServiceConfig } from "@/data/services";

interface Props {
  service: ServiceConfig;
}

/**
 * Terminal-log style process timeline. Each step reveals on scroll, with a
 * vertical neon line that "fills" based on scroll progress.
 */
const ServiceProcess = ({ service }: Props) => {
  const { process, hero, kicker } = service;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden" style={{ backgroundColor: hero.bg }}>
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-mono mb-4 block" style={{ color: hero.accent }}>
            {kicker} / PROCESS
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            Ako to bežne ide
          </h2>
        </motion.div>

        <div className="relative pl-8 md:pl-16">
          {/* Static rail */}
          <div className="absolute left-3 md:left-7 top-2 bottom-2 w-px bg-border/30" />

          {/* Animated rail */}
          <motion.div
            className="absolute left-3 md:left-7 top-2 w-px origin-top"
            style={{ height: lineHeight, background: `linear-gradient(to bottom, ${hero.accent}, transparent)` }}
          />

          {process.map((p, i) => (
            <motion.div
              key={p.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="relative mb-12 md:mb-16 last:mb-0"
            >
              {/* Step marker */}
              <div
                className="absolute -left-8 md:-left-16 top-1 w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-mono"
                style={{
                  borderColor: hero.accent,
                  background: hero.bg,
                  color: hero.accent,
                  boxShadow: `0 0 20px rgba(${hero.accentRaw},0.4)`,
                }}
              >
                {p.step}
              </div>

              {/* Terminal-style log line */}
              <div className="text-xs font-mono mb-2 opacity-50" style={{ color: hero.accent }}>
                {`> step_${p.step}.exec --title="${p.title}"`}
              </div>

              <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
                {p.title}
              </h3>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceProcess;
