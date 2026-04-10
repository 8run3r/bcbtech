import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, FileText, Search, Mail, BarChart2, Megaphone } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "AI Content Engine",
    desc: "Blogové príspevky, sociálne siete, emaily — generované AI s vaším tone of voice.",
    accent: "var(--neon-accent)",
    accentRaw: "255,61,113",
  },
  {
    icon: Search,
    title: "Automatický SEO",
    desc: "AI audit, optimalizácia kľúčových slov a technické SEO opravy bez manuálnej práce.",
    accent: "var(--neon-accent)",
    accentRaw: "255,61,113",
  },
  {
    icon: Mail,
    title: "Email Sequences",
    desc: "Lead nurturing, welcome série a upsell kampane s AI personalizáciou na mieru.",
    accent: "var(--neon-accent)",
    accentRaw: "255,61,113",
  },
  {
    icon: Megaphone,
    title: "Multi-Channel Kampane",
    desc: "Meta, Google, LinkedIn — jeden input, AI distribuuje obsah naprieč všetkými kanálmi.",
    accent: "var(--neon-primary)",
    accentRaw: "0,255,170",
  },
  {
    icon: BarChart2,
    title: "Real-time Analytics",
    desc: "Dashboard s live metrikami, A/B výsledkami a odporúčaniami v reálnom čase.",
    accent: "var(--neon-primary)",
    accentRaw: "0,255,170",
  },
  {
    icon: TrendingUp,
    title: "AI Brand Agent",
    desc: "Vlastný AI agent natrénovaný na vašu značku — odpovedá, tvorí a optimalizuje 24/7.",
    accent: "var(--neon-primary)",
    accentRaw: "0,255,170",
  },
];

const STATS = [
  { value: "3×", label: "viac obsahu za rovnaký čas", accent: "var(--neon-accent)" },
  { value: "67%", label: "zníženie nákladov na marketing", accent: "var(--neon-accent)" },
  { value: "24/7", label: "AI agent pracuje za vás", accent: "var(--neon-primary)" },
];

const AIMarketingSection = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative py-32 px-6 overflow-hidden"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,61,113,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,61,113,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top border accent */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,61,113,0.3), rgba(0,255,170,0.2), transparent)" }} />

      <div className="max-w-6xl mx-auto relative z-10">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--neon-accent)", letterSpacing: "0.28em", marginBottom: 16, opacity: 0.6 }}
          >
            NEW // AI_MARKETING_MODULE
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2rem,4.5vw,3.5rem)", letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--text-primary)" }}
          >
            Marketing, ktorý{" "}
            <span style={{ color: "var(--neon-accent)", textShadow: "0 0 40px rgba(255,61,113,0.25)" }}>
              rastie sám.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-5 max-w-xl mx-auto"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.75 }}
          >
            AI preberá rutinné marketingové úlohy — vy sa sústreďujete na biznis. Obsah, SEO, kampane a analytics na autopilote.
          </motion.p>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-6"
            style={{ height: 1, maxWidth: 120, background: "linear-gradient(90deg, transparent, rgba(255,61,113,0.5), transparent)", transformOrigin: "center" }}
          />
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20 max-w-3xl mx-auto"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="text-center p-6"
              style={{ border: "1px solid rgba(255,61,113,0.1)", background: "rgba(255,61,113,0.03)" }}
            >
              <p style={{ fontFamily: "'VT323', monospace", fontSize: 42, color: s.accent, lineHeight: 1 }}>{s.value}</p>
              <p className="mt-2" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5 }}>{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.08 }}
                className="relative p-6 group transition-all duration-300"
                style={{
                  border: "1px solid rgba(255,255,255,0.05)",
                  background: "rgba(0,0,0,0.3)",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = `rgba(${f.accentRaw},0.2)`)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)")}
              >
                {/* Corner accent */}
                <span className="absolute top-0 left-0 w-3 h-3" style={{ borderTop: `1px solid rgba(${f.accentRaw},0.3)`, borderLeft: `1px solid rgba(${f.accentRaw},0.3)` }} />

                <div className="flex items-center gap-3 mb-4">
                  <div style={{ width: 32, height: 32, background: `rgba(${f.accentRaw},0.1)`, border: `1px solid rgba(${f.accentRaw},0.2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={14} style={{ color: f.accent }} />
                  </div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>{f.title}</h3>
                </div>

                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/balicky?tab=marketing"
            className="inline-flex items-center gap-2 px-8 py-3.5 transition-all duration-300 group"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "#000",
              background: "var(--neon-accent)",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            <TrendingUp size={13} />
            [ POZRIEŤ BALÍČKY ]
          </Link>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 px-8 py-3.5 transition-all duration-300"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.12em",
              color: "var(--neon-accent)",
              border: "1px solid rgba(255,61,113,0.25)",
              background: "transparent",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,61,113,0.5)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,61,113,0.25)")}
          >
            Bezplatná konzultácia →
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default AIMarketingSection;
