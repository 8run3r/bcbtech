import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const projects = [
  {
    title: "FinTrack",
    category: "Fintech",
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
    title: "ShopForge",
    category: "E-commerce",
    desc: "Headless e-commerce riešenie s bleskovou rýchlosťou a custom CMS.",
    tech: ["Remix", "Stripe", "Sanity"],
    year: "2025",
  },
  {
    title: "DataPulse",
    category: "SaaS",
    desc: "Real-time analytická platforma pre B2B klientov s custom vizualizáciami.",
    tech: ["TypeScript", "D3.js", "Supabase"],
    year: "2026",
  },
];

const Portfolio = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-tight leading-[1.05] mb-6">
              Naše práce
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-20">
              Vybrané projekty, na ktoré sme hrdí. Každý z nich bol výzvou — a my výzvy milujeme.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.12, duration: 0.7 }}
                className="group relative p-8 sm:p-10 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className="text-xs text-muted-foreground">{p.year}</span>
                    <h3 className="text-2xl font-bold mt-1">{p.title}</h3>
                    <span className="text-xs text-primary uppercase tracking-wider">
                      {p.category}
                    </span>
                  </div>
                  <ArrowUpRight
                    className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                    size={20}
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {p.desc}
                </p>
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

      <Footer />
    </main>
  );
};

export default Portfolio;
