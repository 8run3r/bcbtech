import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AtmosphereWrapper from "@/components/ui/atmosphere-wrapper";

const ParticleField = lazy(() => import("@/components/landing/ParticleField"));

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

const TYPE_META: Record<string, { label: string; color: string; colorRaw: string }> = {
  web: { label: "Web", color: "var(--neon-primary)", colorRaw: "0,255,170" },
  appky: { label: "Appka", color: "var(--neon-cold)", colorRaw: "74,158,255" },
  vizualy: { label: "Vizuál", color: "var(--neon-accent)", colorRaw: "255,61,113" },
  produkty: { label: "Produkt", color: "var(--neon-secondary)", colorRaw: "255,140,0" },
  automation: { label: "Automatizácia", color: "var(--neon-secondary)", colorRaw: "255,140,0" },
};

const fallbackProjects: PortfolioItem[] = [
  {
    id: "1",
    title: "FinTrack",
    category: "Fintech",
    type: "web",
    description: "Dashboardová aplikácia pre správu financií s real-time analytikou.",
    image_url: null,
    tech: ["React", "Node.js", "PostgreSQL"],
    year: "2026",
    link: null,
  },
  {
    id: "2",
    title: "MedConnect",
    category: "HealthTech",
    type: "appky",
    description: "Telemedicínska platforma s video konzultáciami a AI diagnostikou.",
    image_url: null,
    tech: ["Next.js", "WebRTC", "AI/ML"],
    year: "2025",
    link: null,
  },
  {
    id: "3",
    title: "ShopForge",
    category: "E-commerce",
    type: "web",
    description: "Headless e-commerce riešenie s bleskovou rýchlosťou a custom CMS.",
    image_url: null,
    tech: ["Remix", "Stripe", "Sanity"],
    year: "2025",
    link: null,
  },
  {
    id: "4",
    title: "LeadFlow AI",
    category: "Sales Automation",
    type: "automation",
    description: "Automatický lead scoring a nurturing pipeline s AI klasifikáciou.",
    image_url: null,
    tech: ["n8n", "Claude API", "HubSpot"],
    year: "2026",
    link: null,
  },
];

const Portfolio = () => {
  const [items, setItems] = useState<PortfolioItem[]>(fallbackProjects);

  useEffect(() => {
    supabase
      .from("portfolio_items")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data as PortfolioItem[]);
      });
  }, []);

  // Group by type
  const grouped = items.reduce<Record<string, PortfolioItem[]>>((acc, item) => {
    const key = item.type || "web";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // Order: web, appky, vizualy, produkty, automation, rest
  const typeOrder = ["web", "appky", "vizualy", "produkty", "automation"];
  const sortedTypes = [
    ...typeOrder.filter((t) => grouped[t]),
    ...Object.keys(grouped).filter((t) => !typeOrder.includes(t)),
  ];

  return (
    <AtmosphereWrapper>
      <main className="min-h-screen" style={{ background: "#000", color: "var(--text-primary)" }}>
        <Navbar />

        {/* Hero */}
        <section className="relative min-h-[50vh] flex items-center overflow-hidden pt-20">
          <div className="absolute inset-0">
            <Suspense fallback={null}>
              <ParticleField
                color="0,255,170"
                particleOpacityScale={1.8}
                density={2000}
                particleSize={2}
                connectionDistance={110}
                connectionOpacity={0.1}
              />
            </Suspense>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px]"
            style={{ background: "rgba(0,255,170,0.05)" }} />

          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "var(--neon-primary)",
                letterSpacing: "0.2em",
                opacity: 0.5,
                marginBottom: 16,
                textTransform: "uppercase",
              }}>
                Naše projekty
              </p>
              <h1 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}>
                Portfólio
              </h1>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                color: "rgba(200,196,208,0.4)",
                marginTop: 16,
                maxWidth: 400,
                lineHeight: 1.6,
              }}>
                Weby, appky, vizuály a automatizácie — všetko na jednom mieste.
              </p>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* All items grouped by type */}
        <section className="py-12 sm:py-16 px-5 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-16">
            {sortedTypes.map((type) => {
              const meta = TYPE_META[type] || { label: type, color: "var(--neon-primary)", colorRaw: "0,255,170" };
              const typeItems = grouped[type];

              return (
                <div key={type}>
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div style={{ width: 5, height: 5, background: meta.color }} />
                    <h2 style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                    }}>
                      {meta.label}
                    </h2>
                    <div style={{ flex: 1, height: 1, background: `rgba(${meta.colorRaw},0.1)` }} />
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8,
                      color: meta.color,
                      opacity: 0.4,
                      letterSpacing: "0.15em",
                    }}>
                      {typeItems.length} {typeItems.length === 1 ? "PROJEKT" : "PROJEKTY"}
                    </span>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {typeItems.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06, duration: 0.5 }}
                        className="group relative overflow-hidden"
                        style={{
                          background: "rgba(0,0,0,0.3)",
                          border: `1px solid rgba(${meta.colorRaw},0.08)`,
                          transition: "border-color 0.4s, box-shadow 0.4s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = `rgba(${meta.colorRaw},0.25)`;
                          e.currentTarget.style.boxShadow = `0 0 30px rgba(${meta.colorRaw},0.06)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = `rgba(${meta.colorRaw},0.08)`;
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {p.image_url && (
                          <div className="h-44 overflow-hidden">
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        )}
                        <div className="p-7">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {p.year && (
                                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-ghost)", letterSpacing: "0.08em" }}>
                                    {p.year}
                                  </span>
                                )}
                                <span style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: 8,
                                  color: meta.color,
                                  letterSpacing: "0.1em",
                                  opacity: 0.6,
                                  textTransform: "uppercase",
                                }}>
                                  {p.category}
                                </span>
                              </div>
                              <h3 style={{
                                fontFamily: "'Syne', sans-serif",
                                fontWeight: 700,
                                fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
                                color: "var(--text-primary)",
                                letterSpacing: "-0.02em",
                                marginTop: 4,
                              }}>
                                {p.title}
                              </h3>
                            </div>
                            {p.link && (
                              <a href={p.link} target="_blank" rel="noopener noreferrer">
                                <ArrowUpRight
                                  size={18}
                                  className="text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                                />
                              </a>
                            )}
                          </div>
                          {p.description && (
                            <p style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 13,
                              color: "rgba(200,196,208,0.35)",
                              lineHeight: 1.6,
                              marginBottom: 10,
                            }}>
                              {p.description}
                            </p>
                          )}
                          {p.tech && p.tech.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {p.tech.map((t) => (
                                <span
                                  key={t}
                                  style={{
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: 8,
                                    color: meta.color,
                                    opacity: 0.4,
                                    letterSpacing: "0.06em",
                                    padding: "2px 8px",
                                    background: `rgba(${meta.colorRaw},0.05)`,
                                    border: `1px solid rgba(${meta.colorRaw},0.08)`,
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* "Produkty" in-progress note */}
                  {type === "produkty" && typeItems.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      className="py-12 text-center"
                      style={{
                        border: `1px dashed rgba(${meta.colorRaw},0.15)`,
                        background: `rgba(${meta.colorRaw},0.02)`,
                      }}
                    >
                      <p style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: meta.color,
                        opacity: 0.5,
                        letterSpacing: "0.15em",
                      }}>
                        COMING SOON — IN PROGRESS
                      </p>
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* Show "Produkty" section even if empty */}
            {!grouped["produkty"] && (
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div style={{ width: 5, height: 5, background: "var(--neon-secondary)" }} />
                  <h2 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}>
                    Produkt
                  </h2>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,140,0,0.1)" }} />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="py-12 text-center"
                  style={{
                    border: "1px dashed rgba(255,140,0,0.15)",
                    background: "rgba(255,140,0,0.02)",
                  }}
                >
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: "var(--neon-secondary)",
                    opacity: 0.5,
                    letterSpacing: "0.15em",
                  }}>
                    COMING SOON — IN PROGRESS
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>
    </AtmosphereWrapper>
  );
};

export default Portfolio;
