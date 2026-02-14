import { Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import CameraServices from "@/components/landing/CameraServices";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { lazy, Suspense, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings2 } from "lucide-react";


const ParticleField = lazy(() => import("@/components/landing/ParticleField"));

interface CameraProduct {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  brand: string | null;
  price: string | null;
  features: string[] | null;
}

const Kamery = () => {
  const [products, setProducts] = useState<CameraProduct[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("Všetky");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("camera_products").select("*").order("sort_order").then(({ data }) => {
      if (data) {
        setProducts(data as CameraProduct[]);
        const cats = Array.from(new Set((data as CameraProduct[]).map(p => p.category).filter(Boolean))) as string[];
        setCategories(cats);
      }
    });
  }, []);

  const filtered = activeFilter === "Všetky" ? products : products.filter(p => p.category === activeFilter);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <ParticleField />
          </Suspense>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[180px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-sm text-primary font-mono mb-6 tracking-[0.2em] uppercase">[ Security Systems ]</p>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-6">Kamerové systémy</h1>
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed mx-auto">
              Profesionálna montáž, konfigurácia a servis bezpečnostných kamerových systémov — Hikvision, Dahua, Uniview a ďalšie.
            </p>
            <Link
              to="/konfigurator"
              className="mt-8 inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-medium text-sm uppercase tracking-wider hover:bg-primary/90 transition-all duration-300"
            >
              <Settings2 size={18} />
              Konfigurátor systému
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Products from DB */}
      {products.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-8">
              <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">[ Produkty ]</span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Naša ponuka kamier</h2>
            </motion.div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-10">
              {["Všetky", ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider border transition-all duration-300 ${
                    activeFilter === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-border bg-card/50 overflow-hidden hover:border-primary/30 transition-all duration-500"
                >
                  {p.image_url && (
                    <div className="h-48 overflow-hidden bg-black/20">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="p-6">
                    {p.category && <span className="text-[10px] text-muted-foreground font-mono mb-2 block">· {p.category}</span>}
                    <h3 className="text-lg font-semibold mb-2">{p.name}</h3>
                    {p.description && <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{p.description}</p>}
                    {p.features && p.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.features.map(f => (
                          <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground">{f}</span>
                        ))}
                      </div>
                    )}
                    {p.price && <p className="text-sm font-bold text-primary">{p.price}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CameraServices />

      {/* Brands Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-mono">Značky, s ktorými pracujeme</span>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {["Hikvision", "Dahua", "Uniview", "Axis", "TP-Link VIGI", "Reolink"].map((brand, i) => (
              <motion.span
                key={brand}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-lg font-semibold text-foreground/20 hover:text-primary/60 transition-colors duration-500 cursor-default"
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Kamery;
