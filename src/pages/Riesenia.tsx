import Header from "@/components/landing/Header";
import CameraServices from "@/components/landing/CameraServices";
import { Camera, Home, Network, Move3d, Shield, Package, BatteryCharging, LayoutGrid } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { lazy, Suspense, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings2 } from "lucide-react";
import KonfiguratorModal from "@/components/KonfiguratorModal";
import { RippleButton } from "@/components/ui/ripple-button";

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

const techCategories = [
  { name: "Frontend", tools: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
  { name: "Backend", tools: ["Node.js", "PostgreSQL", "Supabase", "REST / GraphQL"] },
  { name: "DevOps & Deploy", tools: ["Docker", "Vercel", "GitHub Actions", "Cloudflare"] },
  { name: "Dizajn", tools: ["Figma", "Framer", "After Effects"] },
  { name: "AI & Automatizácia", tools: ["OpenAI", "LangChain", "Zapier", "n8n"] },
  { name: "Platby & Integrácie", tools: ["Stripe", "Shopify", "Twilio", "SendGrid"] },
];

const categoryIcon = (cat: string) => {
  if (cat.toLowerCase().includes("outdoor") || cat.toLowerCase().includes("všeobecné")) return Camera;
  if (cat.toLowerCase().includes("interiér") || cat.toLowerCase().includes("bytu")) return Home;
  if (cat.toLowerCase().includes("sieťové") || cat.toLowerCase().includes("rozlíšen")) return Network;
  if (cat.toLowerCase().includes("ptz") || cat.toLowerCase().includes("detailné")) return Move3d;
  if (cat.toLowerCase().includes("profesionálne") || cat.toLowerCase().includes("indoor")) return Shield;
  if (cat.toLowerCase().includes("sety") || cat.toLowerCase().includes("viac kamier")) return Package;
  if (cat.toLowerCase().includes("batériové") || cat.toLowerCase().includes("flexibilné")) return BatteryCharging;
  return Camera;
};

const Riesenia = () => {
  const [products, setProducts] = useState<CameraProduct[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("Všetky");
  const [categories, setCategories] = useState<string[]>([]);
  const [konfiguratorOpen, setKonfiguratorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"security" | "digital">("security");

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
      <section className="relative min-h-[60vh] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <ParticleField />
          </Suspense>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[180px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-xs sm:text-sm text-primary font-mono mb-4 sm:mb-6 tracking-[0.2em] uppercase">[ Naše riešenia ]</p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter mb-4 sm:mb-6">Riešenia</h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed mx-auto px-2 sm:px-0">
              Zabezpečovacie systémy aj digitálne produkty — všetko pod jednou strechou.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Tab Switcher */}
      <section className="pt-12 sm:pt-16 px-5 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div className="inline-flex rounded-full border border-border p-1 bg-card/50 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("security")}
              className={`px-6 sm:px-10 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wider transition-all duration-300 ${
                activeTab === "security"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Zabezpečenie
            </button>
            <button
              onClick={() => setActiveTab("digital")}
              className={`px-6 sm:px-10 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium uppercase tracking-wider transition-all duration-300 ${
                activeTab === "digital"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Technológie
            </button>
          </div>
        </div>
      </section>

      {/* ===== SECURITY TAB ===== */}
      {activeTab === "security" && (
        <motion.div
          key="security"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Konfigurátor CTA */}
          <div className="pt-12 sm:pt-16 text-center">
            <RippleButton
              onClick={() => setKonfiguratorOpen(true)}
              rippleColor="hsl(160 100% 50% / 0.3)"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-medium text-sm uppercase tracking-wider hover:brightness-110 transition-all duration-300"
            >
              <Settings2 size={16} />
              Konfigurátor systému
            </RippleButton>
          </div>

          {/* Products from DB */}
          {products.length > 0 && (
            <section className="py-16 sm:py-20 px-5 sm:px-6">
              <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-10">
                  <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">[ Produkty ]</span>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Naša ponuka kamier</h2>
                </motion.div>

                {/* Visual Category Filters */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
                  {[
                    { key: "Všetky", label: "Všetky", icon: LayoutGrid, count: products.length },
                    ...categories.map(cat => ({
                      key: cat,
                      label: cat,
                      icon: categoryIcon(cat),
                      count: products.filter(p => p.category === cat).length,
                    })),
                  ].map((item, i) => (
                    <motion.button
                      key={item.key}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setActiveFilter(item.key)}
                      className={`group relative flex flex-col items-start p-4 sm:p-5 rounded-xl border text-left transition-all duration-300 overflow-hidden ${
                        activeFilter === item.key
                          ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_-5px] shadow-primary/20"
                          : "bg-card/40 border-border/50 hover:border-primary/20 hover:bg-card/70"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <item.icon
                          size={18}
                          strokeWidth={1.5}
                          className={`transition-colors ${activeFilter === item.key ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"}`}
                        />
                        <span className={`text-[10px] font-mono tabular-nums ${activeFilter === item.key ? "text-primary" : "text-muted-foreground/60"}`}>
                          {item.count}
                        </span>
                      </div>
                      <span className={`text-xs sm:text-sm font-medium leading-tight transition-colors ${
                        activeFilter === item.key ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                      }`}>
                        {item.label}
                      </span>
                      {activeFilter === item.key && (
                        <motion.div
                          layoutId="activeFilterIndicator"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </motion.button>
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

          <CameraServices onOpenKonfigurator={() => setKonfiguratorOpen(true)} />

          {/* Brands */}
          <section className="py-16 sm:py-20 px-5 sm:px-6">
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
        </motion.div>
      )}

      {/* ===== DIGITAL / TECH TAB ===== */}
      {activeTab === "digital" && (
        <motion.div
          key="digital"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <section className="py-16 sm:py-20 px-5 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-16"
              >
                <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">[ Tech Stack ]</span>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Nástroje &amp; technológie
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Nástroje a technológie, ktoré denne používame na tvorbu moderných digitálnych produktov.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {techCategories.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.6 }}
                    className="p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-500"
                  >
                    <h3 className="text-sm uppercase tracking-widest text-primary mb-6 font-semibold">
                      {cat.name}
                    </h3>
                    <ul className="space-y-3">
                      {cat.tools.map((tool) => (
                        <li key={tool} className="text-foreground/80 text-sm">{tool}</li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </motion.div>
      )}

      <KonfiguratorModal open={konfiguratorOpen} onClose={() => setKonfiguratorOpen(false)} />
      <Footer />
    </main>
  );
};

export default Riesenia;
