import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Code2, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  type: string;
  description: string | null;
  image_url: string | null;
  tech: string[] | null;
  year: string | null;
  link: string | null;
}

// Fallback static data
const fallbackProjects: PortfolioItem[] = [
  { id: "1", title: "FinTrack", category: "Fintech", type: "web", description: "Dashboardová aplikácia pre správu financií s real-time analytikou.", image_url: null, tech: ["React", "Node.js", "PostgreSQL"], year: "2026", link: null },
  { id: "2", title: "MedConnect", category: "HealthTech", type: "web", description: "Telemedicínska platforma s video konzultáciami a AI diagnostikou.", image_url: null, tech: ["Next.js", "WebRTC", "AI/ML"], year: "2025", link: null },
  { id: "3", title: "ShopForge", category: "E-commerce", type: "web", description: "Headless e-commerce riešenie s bleskovou rýchlosťou a custom CMS.", image_url: null, tech: ["Remix", "Stripe", "Sanity"], year: "2025", link: null },
  { id: "4", title: "DataPulse", category: "SaaS", type: "web", description: "Real-time analytická platforma pre B2B klientov.", image_url: null, tech: ["TypeScript", "D3.js", "Supabase"], year: "2026", link: null },
];

const Portfolio = () => {
  const [items, setItems] = useState<PortfolioItem[]>(fallbackProjects);
  const [filter, setFilter] = useState<"web" | "camera">("camera");

  useEffect(() => {
    supabase.from("portfolio_items").select("*").order("sort_order").then(({ data }) => {
      if (data && data.length > 0) setItems(data as PortfolioItem[]);
    });
  }, []);

  const filtered = items.filter(i => i.type === filter);

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
              Naše projekty
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-10">
              Zabezpečenie a digitálne riešenia — vyberte si kategóriu.
            </p>
          </motion.div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-12">
            {([
              { key: "camera", label: "Kamery & Zabezpečenie", icon: Camera },
              { key: "web", label: "Weby & Appky", icon: Code2 },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-2 text-sm px-5 py-2 rounded-full transition-all duration-300 font-medium ${
                  filter === f.key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground border border-border/50"
                }`}
              >
                <f.icon size={14} />
                {f.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  className="group relative rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  {p.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="p-8 sm:p-10">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">{p.year}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.type === "web" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"}`}>
                            {p.type === "web" ? "Web" : "Kamery"}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold mt-1">{p.title}</h3>
                        <span className="text-xs text-primary uppercase tracking-wider">{p.category}</span>
                      </div>
                      <ArrowUpRight className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={20} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{p.description}</p>
                    {p.tech && (
                      <div className="flex flex-wrap gap-2">
                        {p.tech.map(t => (
                          <span key={t} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Portfolio;
