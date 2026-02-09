import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "FinTrack",
    category: "Fintech App",
    desc: "Dashboardová aplikácia pre správu financií s real-time analytiko.",
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
    title: "ShopForge",
    category: "E-commerce",
    desc: "Headless e-commerce riešenie s bleskovou rýchlosťou a custom CMS.",
    tech: ["Remix", "Stripe", "Sanity"],
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

const Projects = () => {
  return (
    <section id="projects" className="relative py-32 px-6 bg-card/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block">
            Naše projekty
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Vybrané práce
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group relative p-8 rounded-lg bg-background border border-border hover:border-primary/40 transition-all duration-500 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-xs text-muted-foreground">{p.year}</span>
                  <h3 className="text-2xl font-bold mt-1">{p.title}</h3>
                  <span className="text-xs text-primary uppercase tracking-wider">{p.category}</span>
                </div>
                <ArrowUpRight
                  className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                  size={20}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{p.desc}</p>
              <div className="flex flex-wrap gap-2">
                {p.tech.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
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

export default Projects;
