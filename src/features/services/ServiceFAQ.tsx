import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import type { ServiceConfig } from "@/data/services";

interface Props {
  service: ServiceConfig;
}

const ServiceFAQ = ({ service }: Props) => {
  const { faq, hero, kicker } = service;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="text-xs uppercase tracking-[0.2em] font-mono mb-4 block" style={{ color: hero.accent }}>
            {kicker} / FAQ
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            Čo sa najčastejšie pýtate
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden"
                style={{
                  borderColor: isOpen ? `rgba(${hero.accentRaw},0.4)` : undefined,
                  boxShadow: isOpen ? `0 0 30px rgba(${hero.accentRaw},0.05)` : undefined,
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-foreground/[0.015]"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-base md:text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
                    {item.q}
                  </span>
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={{
                      border: `1px solid rgba(${hero.accentRaw},0.4)`,
                      color: hero.accent,
                    }}
                  >
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceFAQ;
