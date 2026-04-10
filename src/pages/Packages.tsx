import { motion, AnimatePresence } from "framer-motion";
import { useState, lazy, Suspense, useEffect, type ElementType } from "react";
import { Check, Monitor, Zap, TrendingUp, Layers } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { RippleButton } from "@/components/ui/ripple-button";
import Navbar, { useNavAccent } from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ReservationModal from "@/components/ReservationModal";

const ParticleField = lazy(() => import("@/components/landing/ParticleField"));

type Tab = "web" | "automation" | "marketing" | "hybrid";

/* ── Package data ── */
const webPackages = [
  {
    name: "Starter",
    price: "od 390 €",
    desc: "Pre živnostníkov a podnikateľov, ktorí potrebujú web stránku.",
    features: [
      "Jednoduchá prezentačná webstránka (1–3 podstránky)",
      "Plne responzívny dizajn pre mobilné zariadenia",
      "Kontaktný formulár s doručovaním na e-mail",
      "Základná SEO optimalizácia + Google index",
      "Prepojenie na sociálne siete",
      "Dodanie do 5 dní",
    ],
  },
  {
    name: "Business",
    price: "od 890 €",
    desc: "Pre malé firmy, ktoré chcú rásť online.",
    popular: true,
    features: [
      "Všetko zo Starter",
      "Viacstránkový web (5–10 podstránok)",
      "CMS pre jednoduchú správu obsahu",
      "Google Analytics + meranie návštevnosti",
      "Moderné animácie a prémiový dizajn",
      "SSL certifikát a základná bezpečnosť",
      "Dodanie do 7 dní",
    ],
  },
  {
    name: "Premium",
    price: "od 2 200 €",
    desc: "Komplexné riešenie pre ambiciózne firmy.",
    features: [
      "Všetko z Business",
      "E-shop alebo rezervačný systém na mieru",
      "Prepojenie na fakturačný / účtovný systém",
      "Vlastný backend a API riešenie",
      "Pokročilá SEO optimalizácia",
      "Dodanie do 14 dní",
    ],
  },
  {
    name: "Na mieru",
    price: "cena na dopyt",
    desc: "Vlastná konfigurácia — len to, čo skutočne potrebujete.",
    custom: true,
    features: [
      "Vlastný výber funkcií a rozsahu",
      "Headless CMS / vlastná databáza",
      "SaaS MVP alebo komplexná platforma",
      "Multi-jazykový web alebo portál",
      "Integrácia s akýmkoľvek externým systémom",
      "Dedikovaný vývojár počas projektu",
    ],
  },
];

const automationPackages = [
  {
    name: "Flow",
    price: "od 390 €",
    desc: "Pre jednoduché prepojenie nástrojov a automatické notifikácie.",
    features: [
      "1–3 automatizované workflow-y",
      "Prepojenie existujúcich nástrojov (CRM, email, Slack)",
      "Automatické notifikácie a reporty",
      "Základné AI triedenie dát",
      "Dokumentácia a zaškolenie",
      "Dodanie do 3 dní",
    ],
  },
  {
    name: "System",
    price: "od 1 200 €",
    desc: "Pre firmy, ktoré chcú eliminovať manuálnu prácu.",
    popular: true,
    features: [
      "Všetko z Flow",
      "5–10 prepojených workflow-ov",
      "AI agent pre email / chat / support",
      "Automatická fakturácia a lead scoring",
      "Integrácia s CRM a účtovníctvom",
      "n8n / Make hosting a správa",
      "Dodanie do 7 dní",
    ],
  },
  {
    name: "Enterprise",
    price: "od 3 500 €",
    desc: "Komplexná automatizácia celého biznisu na mieru.",
    features: [
      "Všetko zo System",
      "Custom AI agenti s Claude / GPT API",
      "Automatizácia interných procesov end-to-end",
      "Vlastný dashboard a reporting",
      "Integrácia s existujúcim IT stackom",
      "SLA a prioritná podpora 24/7",
      "Servisná zmluva na 12 mesiacov",
    ],
  },
  {
    name: "Na mieru",
    price: "cena na dopyt",
    desc: "Automatizácia šitá na mieru — váš stack, vaše pravidlá.",
    custom: true,
    features: [
      "Analýza existujúcich procesov zdarma",
      "Custom AI model fine-tuning",
      "Integrácia s legacy systémami",
      "Vlastný no-code / low-code nástroj",
      "Neobmedzený počet workflow-ov",
      "Dedikovaný automation engineer",
    ],
  },
];

const marketingPackages = [
  {
    name: "Pulse",
    price: "od 290 € / mes.",
    desc: "Pre firmy, ktoré chcú rásť na sociálnych sieťach s pomocou AI.",
    features: [
      "AI obsah pre 3 sociálne siete (FB, IG, LI)",
      "Automatický publishing kalendár",
      "AI SEO audit a optimalizácia stránky",
      "Mesačný report výkonnosti",
      "2× AI blogový príspevok / mesiac",
      "Nastavenie do 3–5 dní",
    ],
  },
  {
    name: "Amplify",
    price: "od 590 € / mes.",
    desc: "Kompletná AI marketing mašinéria pre rastúce firmy.",
    popular: true,
    features: [
      "Všetko z Pulse",
      "AI email marketing kampane (5× / mes.)",
      "Automatizácia lead nurturing workflow",
      "Google Ads AI optimalizácia",
      "A/B testovanie obsahu a CTA",
      "Custom AI copywriter pre váš tone of voice",
      "Týždenný analytics report",
    ],
  },
  {
    name: "Dominate",
    price: "od 1 490 € / mes.",
    desc: "Full-stack AI marketing pre firmy, ktoré chcú dominovať trhu.",
    features: [
      "Všetko z Amplify",
      "Vlastný AI brand agent",
      "Multi-channel (Meta, Google, LinkedIn)",
      "AI video scripty a content repurposing",
      "CRO optimalizácia webu",
      "Dedikovaný AI marketing strategist",
      "Real-time dashboard a 24/7 monitoring",
    ],
  },
];

const hybridPackages = [
  {
    name: "Launch",
    price: "od 1 490 €",
    desc: "Web + základná automatizácia. Ideálne pre startupy a živnostníkov.",
    badge: "WEB + AUTO",
    features: [
      "Business web (5–10 strán) na mieru",
      "3 automatizované workflow-y",
      "Kontaktný formulár → CRM integrácia",
      "AI chatbot na web",
      "SEO základ + Google Analytics",
      "Dodanie do 10 dní",
    ],
  },
  {
    name: "Scale",
    price: "od 3 900 €",
    desc: "Premium web + AI marketing + automatizácia. Kompletný online ekosystém.",
    popular: true,
    badge: "WEB + AUTO + MKT",
    features: [
      "Všetko z Launch",
      "Premium web (e-shop alebo SaaS MVP)",
      "AI Marketing Pulse (3 mesiace zadarmo)",
      "System automatizácia (10 workflow-ov)",
      "AI lead scoring a email sequences",
      "Custom reporting dashboard",
      "Prioritná podpora 6 mesiacov",
    ],
  },
  {
    name: "Full Stack",
    price: "cena na mieru",
    desc: "Kompletná digitálna transformácia. Pre firmy, ktoré to myslia vážne.",
    badge: "FULL DIGITAL",
    features: [
      "Enterprise web + mobilná aplikácia",
      "Full AI automation stack",
      "Dominate marketing suite",
      "AI agenti pre každý department",
      "Integrácia s existujúcim IT stackom",
      "SLA 99.9% + 24/7 podpora",
      "Dedikovaný CTO as a Service",
    ],
  },
];

/* ── Tab config ── */
const TABS: { key: Tab; label: string; shortLabel: string; icon: ElementType; accent: string; accentRaw: string }[] = [
  { key: "web",        label: "Webové balíčky",    shortLabel: "Web",      icon: Monitor,     accent: "var(--neon-primary)",   accentRaw: "0,255,170" },
  { key: "automation", label: "AI Automatizácia",   shortLabel: "Auto",     icon: Zap,         accent: "var(--neon-secondary)", accentRaw: "255,140,0" },
  { key: "marketing",  label: "AI Marketing",       shortLabel: "Mktg",     icon: TrendingUp,  accent: "var(--neon-accent)",    accentRaw: "255,61,113" },
  { key: "hybrid",     label: "Hybrid balíčky",     shortLabel: "Hybrid",   icon: Layers,      accent: "var(--neon-cold)",      accentRaw: "74,158,255" },
];

/* ── PackageCard ── */
const PackageCard = ({
  pkg,
  i,
  cta,
  onReserve,
  accent,
  accentRaw,
}: {
  pkg: { name: string; price: string; desc: string; popular?: boolean; custom?: boolean; badge?: string; features: string[] };
  i: number;
  cta: string;
  onReserve: () => void;
  accent: string;
  accentRaw: string;
}) => {
  const ripple = `rgba(${accentRaw}, 0.3)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
      className="relative flex flex-col p-6 sm:p-8 border transition-all duration-500 bg-card"
      style={{
        borderColor: pkg.popular ? `rgba(${accentRaw}, 0.35)` : "rgba(255,255,255,0.06)",
        boxShadow: pkg.popular ? `0 0 40px rgba(${accentRaw}, 0.07)` : "none",
      }}
    >
      {/* Popular badge */}
      {pkg.popular && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest px-4 py-1 font-bold"
          style={{ background: accent, color: "#000", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.18em" }}
        >
          Populárny
        </span>
      )}

      {/* Hybrid badge */}
      {pkg.badge && (
        <span
          className="absolute top-4 right-4 text-[8px] px-2 py-0.5"
          style={{ background: `rgba(${accentRaw},0.12)`, border: `1px solid rgba(${accentRaw},0.25)`, color: accent, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em" }}
        >
          {pkg.badge}
        </span>
      )}

      {/* Custom corner accent */}
      <span className="absolute top-0 left-0 w-3 h-3 pointer-events-none" style={{ borderTop: `1px solid rgba(${accentRaw},0.4)`, borderLeft: `1px solid rgba(${accentRaw},0.4)` }} />
      <span className="absolute bottom-0 right-0 w-3 h-3 pointer-events-none" style={{ borderBottom: `1px solid rgba(${accentRaw},0.4)`, borderRight: `1px solid rgba(${accentRaw},0.4)` }} />

      <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>{pkg.name}</h3>
      <p className="text-2xl font-bold mb-2" style={{ color: accent, fontFamily: "'VT323', monospace", fontSize: 26 }}>{pkg.price}</p>
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{pkg.desc}</p>

      <ul className="space-y-3 mb-8 flex-1">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check size={14} className="mt-0.5 shrink-0" style={{ color: accent }} />
            <span style={{ color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-center mt-auto">
        <RippleButton
          onClick={onReserve}
          rippleColor={ripple}
          className="block w-full text-center text-sm font-semibold py-3 transition-all duration-300"
          style={
            pkg.popular
              ? { background: accent, color: "#000", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em" }
              : { background: "transparent", color: accent, border: `1px solid rgba(${accentRaw},0.3)`, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.1em" }
          }
        >
          {pkg.custom ? "[ NAKONFIGUROVAŤ ]" : cta}
        </RippleButton>
      </div>
    </motion.div>
  );
};

/* ── Addons section ── */
const AddonsSection = ({ tab }: { tab: Tab }) => {
  const configs: Record<Tab, { title: string; accent: string; items: { label: string; price: string; desc: string }[] }> = {
    web: {
      title: "Doplnkové služby",
      accent: "var(--neon-primary)",
      items: [
        { label: "Správa webu", price: "75 € / mes.", desc: "Aktualizácie obsahu, zálohy, monitoring" },
        { label: "Technická podpora", price: "od 49 € / mes.", desc: "Bug fixy, úpravy, prioritná pomoc" },
        { label: "SEO optimalizácia", price: "od 150 € / mes.", desc: "Mesačná SEO správa a vylepšenia" },
        { label: "Grafické práce", price: "od 30 €", desc: "Bannery, logá, vizuálny obsah" },
        { label: "Zákaznícka podpora", price: "od 29 € / mes.", desc: "Prioritná podpora a rýchla reakcia" },
        { label: "Údržba & aktualizácie", price: "od 39 € / mes.", desc: "Bezpečnostné záplaty, aktualizácie" },
      ],
    },
    automation: {
      title: "Doplnkové služby",
      accent: "var(--neon-secondary)",
      items: [
        { label: "Správa workflow-ov", price: "od 79 € / mes.", desc: "Monitoring, opravy, optimalizácia" },
        { label: "AI agent na mieru", price: "od 490 €", desc: "Custom AI asistent pre váš biznis" },
        { label: "Integrácia nového nástroja", price: "od 150 €", desc: "Pridanie nového systému do pipeline" },
        { label: "Audit procesov", price: "od 200 €", desc: "Analýza a návrh automatizácie" },
        { label: "Zaškolenie tímu", price: "od 99 €", desc: "Workshop pre váš tím" },
        { label: "Prioritná podpora", price: "od 49 € / mes.", desc: "SLA, rýchla reakcia, hotline" },
      ],
    },
    marketing: {
      title: "Marketingové doplnky",
      accent: "var(--neon-accent)",
      items: [
        { label: "Extra sociálna sieť", price: "+89 € / mes.", desc: "TikTok, Pinterest, X alebo iná platforma" },
        { label: "AI video scripty", price: "od 49 € / video", desc: "Scripty pre YouTube, Reels, TikTok" },
        { label: "Influencer outreach", price: "od 199 € / mes.", desc: "AI-asistované oslovovanie influencerov" },
        { label: "PR kampane", price: "od 299 € / mes.", desc: "Tlačové správy a mediálny dosah" },
        { label: "Landing page optimalizácia", price: "od 150 €", desc: "CRO audit a A/B implementácia" },
        { label: "Mesačný strategy call", price: "od 79 €", desc: "60 min. strategická konzultácia" },
      ],
    },
    hybrid: {
      title: "Rozšírenia hybridných balíčkov",
      accent: "var(--neon-cold)",
      items: [
        { label: "Mobilná aplikácia", price: "od 2 900 €", desc: "React Native iOS + Android" },
        { label: "AI Marketing Pulse", price: "+290 € / mes.", desc: "Pridanie marketingového modulu" },
        { label: "Vlastný AI agent", price: "od 490 €", desc: "Chatbot, support agent, interno" },
        { label: "Analytický dashboard", price: "od 390 €", desc: "Custom Supabase / Grafana dashboard" },
        { label: "DevOps & CI/CD setup", price: "od 290 €", desc: "Automatizovaný deployment pipeline" },
        { label: "Rozšírená SLA zmluva", price: "od 149 € / mes.", desc: "99.9% uptime, 4h response time" },
      ],
    },
  };

  const cfg = configs[tab];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-8 border"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}
    >
      <div className="flex items-center gap-3 mb-8">
        <div style={{ width: 4, height: 16, background: cfg.accent }} />
        <h3 className="text-lg font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>{cfg.title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
        {cfg.items.map((item) => (
          <div key={item.label} className="p-4 border transition-all duration-300 hover:border-white/10"
            style={{ borderColor: "rgba(255,255,255,0.04)", background: "rgba(0,0,0,0.2)" }}>
            <p className="font-semibold mb-1" style={{ fontFamily: "'Syne', sans-serif", color: "var(--text-primary)" }}>{item.label}</p>
            <p className="font-bold mb-2" style={{ color: cfg.accent, fontFamily: "'VT323', monospace", fontSize: 18 }}>{item.price}</p>
            <p style={{ color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* ── Main ── */
const VALID_TABS: Tab[] = ["web", "automation", "marketing", "hybrid"];

const Packages = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const t = searchParams.get("tab");
    return (VALID_TABS.includes(t as Tab) ? t : "web") as Tab;
  });
  const [reservationOpen, setReservationOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<{ category: Tab; name: string }>({ category: "web", name: "" });
  const { setAccent } = useNavAccent();

  // Sync tab when URL param changes
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && VALID_TABS.includes(t as Tab)) setActiveTab(t as Tab);
  }, [searchParams]);

  // Sync navbar accent color with active tab
  useEffect(() => {
    const tab = TABS.find((t) => t.key === activeTab);
    if (tab) setAccent(tab.accent, tab.accentRaw);
    return () => setAccent("var(--neon-primary)", "0,255,170");
  }, [activeTab, setAccent]);

  const openReservation = (category: Tab, name: string) => {
    setSelectedPkg({ category, name });
    setReservationOpen(true);
  };

  const currentTab = TABS.find((t) => t.key === activeTab)!;
  const packages = { web: webPackages, automation: automationPackages, marketing: marketingPackages, hybrid: hybridPackages }[activeTab];
  const ctas = { web: "Začať projekt", automation: "Nezáväzná konzultácia", marketing: "Spustiť kampaň", hybrid: "Nakonfigurovať" };

  return (
    <main className="min-h-screen bg-background text-foreground relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Suspense fallback={null}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
              <ParticleField color={currentTab.accentRaw} particleOpacityScale={1.8} density={2000} particleSize={2} connectionDistance={120} connectionOpacity={0.18} />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>

      <div className="relative z-10">
        <Navbar />

        <section className="pt-32 sm:pt-40 pb-20 px-5 sm:px-6">
          <div className="max-w-6xl mx-auto">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-14"
            >
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: currentTab.accent, letterSpacing: "0.25em", opacity: 0.5, display: "block", marginBottom: 12, transition: "color 0.5s" }}>
                CENNÍK // TRANSPARENTNÉ CENY
              </span>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(2.2rem,5vw,4rem)", letterSpacing: "-0.03em", lineHeight: 1.05, color: "var(--text-primary)" }}>
                Balíčky
              </h1>
              <p className="mt-4 max-w-lg mx-auto" style={{ color: "var(--text-muted)", fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.7 }}>
                Transparentné ceny. Žiadne skryté poplatky. Vyberte si, čo vám vyhovuje.
              </p>
            </motion.div>

            {/* Tab switcher */}
            <div className="flex justify-center mb-14">
              <div className="flex gap-1 p-1 overflow-x-auto"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className="flex items-center gap-2 px-4 sm:px-5 py-2.5 transition-all duration-300 whitespace-nowrap"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        color: active ? "#000" : "var(--text-dim)",
                        background: active ? tab.accent : "transparent",
                      }}
                    >
                      <Icon size={13} />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Package cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
              >
                {/* Tab label */}
                <div className="flex items-center gap-3 mb-8">
                  <div style={{ width: 24, height: 1, background: currentTab.accent }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: currentTab.accent, letterSpacing: "0.2em", opacity: 0.6 }}>
                    {currentTab.label.toUpperCase()}
                  </span>
                  <div style={{ flex: 1, height: 1, background: `rgba(${currentTab.accentRaw},0.08)` }} />
                </div>

                <div className={`grid gap-5 mb-14 ${packages.length === 4 ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" : "grid-cols-1 md:grid-cols-3"}`}>
                  {packages.map((pkg, i) => (
                    <PackageCard
                      key={pkg.name}
                      pkg={pkg}
                      i={i}
                      cta={ctas[activeTab]}
                      accent={currentTab.accent}
                      accentRaw={currentTab.accentRaw}
                      onReserve={() => openReservation(activeTab, `${pkg.name} – ${pkg.price}`)}
                    />
                  ))}
                </div>

                <AddonsSection tab={activeTab} />
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <Footer />
        <ReservationModal
          open={reservationOpen}
          onClose={() => setReservationOpen(false)}
          packageCategory={selectedPkg.category}
          packageName={selectedPkg.name}
        />
      </div>
    </main>
  );
};

export default Packages;
