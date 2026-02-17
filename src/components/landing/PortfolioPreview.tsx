import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string | null;
  tech: string[] | null;
  year: string | null;
  link: string | null;
  image_url: string | null;
  type: string;
}

const PortfolioPreview = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("sort_order", { ascending: true });
      if (data) setItems(data);
    };
    fetchItems();
  }, []);

  const visibleCount = 3;
  const maxIndex = Math.max(0, items.length - visibleCount);

  const prev = () => {
    setDirection(-1);
    setCurrentIndex((i) => Math.max(0, i - 1));
  };
  const next = () => {
    setDirection(1);
    setCurrentIndex((i) => Math.min(maxIndex, i + 1));
  };

  const visibleItems = items.slice(currentIndex, currentIndex + visibleCount);

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">
            [ Portfólio ]
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Vybrané práce
          </h2>
        </motion.div>

        {/* Cards wrapper with side arrows */}
        <div className="relative">
          {/* Left arrow */}
          {items.length > visibleCount && (
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full border border-border/50 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Right arrow */}
          {items.length > visibleCount && (
            <button
              onClick={next}
              disabled={currentIndex >= maxIndex}
              className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full border border-border/50 bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
            <AnimatePresence mode="popLayout" custom={direction}>
              {visibleItems.map((p, i) => (
                <motion.div
                  key={p.id}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 80 : -80 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -80 : 80 }}
                  transition={{ duration: 0.35, delay: i * 0.06 }}
                  className="group relative p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-500 backdrop-blur-sm"
                >
                  {p.image_url && (
                    <div className="mb-5 rounded-lg overflow-hidden aspect-video bg-secondary/20">
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <span className="text-[11px] text-muted-foreground font-mono">{p.year}</span>
                      <h3 className="text-xl font-bold mt-1">{p.title}</h3>
                      <span className="text-[11px] text-primary uppercase tracking-wider">{p.category}</span>
                    </div>
                    {p.link && (
                      <a
                        href={p.link.startsWith("http") ? p.link : `https://${p.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                      >
                        <ArrowUpRight size={18} />
                      </a>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{p.description}</p>
                  )}
                  {p.tech && p.tech.length > 0 && (
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
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioPreview;
