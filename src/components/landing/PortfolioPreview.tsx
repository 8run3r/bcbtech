import { motion } from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const featured = [
  {
    title: "FinTrack",
    category: "Fintech App",
    desc: "Dashboardová aplikácia pre správu financií s real-time analytikou.",
    tech: ["React", "Node.js", "PostgreSQL"],
    year: "2026",
  },
  {
    title: "MedConnect",
    category: "HealthTech",
    desc: "Telemedicínska platforma s video konzultáciami a AI diagnostikou.",
    tech: ["Next.js", "WebRTC", "AI/ML"],
    year: "2025",
  },
  {
    title: "DataPulse",
    category: "SaaS Platform",
    desc: "Real-time analytická platforma pre B2B klientov s custom vizualizáciami.",
    tech: ["TypeScript", "D3.js", "Supabase"],
    year: "2026",
  },
];

const PortfolioPreview = () => {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16"
        >
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">
              [ Portfólio ]
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Vybrané práce
            </h2>
          </div>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group shrink-0"
          >
            Všetky projekty
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featured.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group relative p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-500 cursor-pointer backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-[11px] text-muted-foreground font-mono">{p.year}</span>
                  <h3 className="text-xl font-bold mt-1">{p.title}</h3>
                  <span className="text-[11px] text-primary uppercase tracking-wider">{p.category}</span>
                </div>
                <ArrowUpRight
                  className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  size={18}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{p.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-secondary/50 text-secondary-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioPreview;
