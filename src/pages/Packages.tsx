import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Check, Camera, Monitor } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import FluidCursor from "@/components/landing/FluidCursor";
import ReservationModal from "@/components/ReservationModal";

const webPackages = [
  {
    name: "Starter",
    price: "od 490 €",
    desc: "Pre živnostníkov a mikrofirmy, ktoré potrebujú online prezentáciu.",
    features: [
      "Jednoduchá webstránka (1–3 podstránky)",
      "Responzívny dizajn pre mobily",
      "Kontaktný formulár",
      "SEO základ + Google indexácia",
      "Napojenie na sociálne siete",
      "Dodanie do 7 dní",
    ],
  },
  {
    name: "Business",
    price: "od 990 €",
    desc: "Pre malé firmy, ktoré chcú rásť online.",
    popular: true,
    features: [
      "Všetko zo Starter",
      "Viacstránkový web (5–10 podstránok)",
      "CMS na správu obsahu",
      "Google Analytics & tracking",
      "Animácie a moderný dizajn",
      "SSL certifikát + hosting 1 rok",
      "3 mesiace technickej podpory",
    ],
  },
  {
    name: "Premium",
    price: "od 2 500 €",
    desc: "Komplexné riešenie pre ambiciózne firmy.",
    features: [
      "Všetko z Business",
      "E-shop alebo rezervačný systém",
      "Napojenie na fakturačný systém",
      "Vlastný backend & API",
      "SEO optimalizácia na mieru",
      "6 mesiacov podpory a údržby",
      "Prioritný servis",
    ],
  },
];

const cameraPackages = [
  {
    name: "Bezpečný domov",
    price: "od 590 €",
    desc: "Pre malé prevádzky, kancelárie a rodinné domy.",
    features: [
      "2–4 IP kamery (2MP / 4MP)",
      "4-kanálový NVR rekordér",
      "Montáž a káblové trasy",
      "Konfigurácia vzdialeného prístupu",
      "Mobilná appka pre monitoring",
      "1 rok záruky na prácu",
    ],
  },
  {
    name: "Firma",
    price: "od 1 490 €",
    desc: "Pre sklady, predajne a menšie firemné objekty.",
    popular: true,
    features: [
      "4–8 IP kamier (4MP / 5MP)",
      "8-kanálový NVR s 2TB HDD",
      "AI detekcia pohybu a osôb",
      "Nočné videnie do 30m",
      "PoE napájanie cez sieť",
      "Vzdialený prístup + VPN",
      "Zaškolenie obsluhy",
      "2 roky záruky",
    ],
  },
  {
    name: "Komplex",
    price: "od 3 500 €",
    desc: "Pre výrobné haly, areály a väčšie objekty.",
    features: [
      "8–16+ kamier (5MP / 4K)",
      "16-kanálový NVR s RAID",
      "Perimeter ochrana s AI",
      "PTZ kamery s automatickým trackingom",
      "Integrácia s alarmom",
      "Projektová dokumentácia",
      "Servisná zmluva na 12 mesiacov",
      "Prioritná podpora 24/7",
    ],
  },
];

const PackageCard = ({ pkg, i, cta, onReserve }: { pkg: any; i: number; cta: string; onReserve: () => void }) => (
  <motion.div
    key={pkg.name}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.1 + i * 0.12, duration: 0.7 }}
    className={`relative p-8 rounded-2xl border transition-all duration-500 ${
      pkg.popular
        ? "bg-card border-primary/40 glow-primary"
        : "bg-card border-border hover:border-primary/20"
    }`}
  >
    {pkg.popular && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-4 py-1 rounded-full font-semibold">
        Populárny
      </span>
    )}
    <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
    <p className="text-2xl font-bold text-primary mb-2">{pkg.price}</p>
    <p className="text-sm text-muted-foreground mb-8">{pkg.desc}</p>
    <ul className="space-y-3 mb-8">
      {pkg.features.map((f: string) => (
        <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
          <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
          {f}
        </li>
      ))}
    </ul>
    <button
      onClick={onReserve}
      className={`block w-full text-center text-sm font-semibold py-3 rounded-full transition-all duration-300 cursor-pointer ${
        pkg.popular
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border text-foreground hover:bg-foreground hover:text-background"
      }`}
    >
      {cta}
    </button>
  </motion.div>
);

const Packages = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "web" ? "web" : "cameras";
  const [activeTab, setActiveTab] = useState<"cameras" | "web">(initialTab);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<{ category: "cameras" | "web"; name: string }>({ category: "cameras", name: "" });

  const openReservation = (category: "cameras" | "web", name: string) => {
    setSelectedPkg({ category, name });
    setReservationOpen(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FluidCursor blobCount={3} intensity={0.4} />
      </div>
      <div className="relative z-10">
      <Header />

      <section className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-tight leading-[1.05] mb-6">
              Balíčky
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Transparentné ceny. Žiadne skryté poplatky. Vyberte si, čo vám vyhovuje.
            </p>
          </motion.div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-16">
            <div className="inline-flex rounded-full border border-border bg-card p-1 gap-1">
              <button
                onClick={() => setActiveTab("cameras")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "cameras"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Camera size={18} />
                Kamerové systémy
              </button>
              <button
                onClick={() => setActiveTab("web")}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeTab === "web"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Monitor size={18} />
                Webové balíčky
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "cameras" ? (
              <motion.div
                key="cameras"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                  {cameraPackages.map((pkg, i) => (
                    <PackageCard key={pkg.name} pkg={pkg} i={i} cta="Nezáväzná konzultácia" onReserve={() => openReservation("cameras", `${pkg.name} – ${pkg.price}`)} />
                  ))}
                </div>

                {/* Doplnkové služby - only under cameras */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl border border-border bg-card/50"
                >
                  <h3 className="text-lg font-bold mb-6">Doplnkové služby</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="font-semibold text-foreground mb-1">Servisný výjazd</p>
                      <p className="text-primary font-bold">od 45 €</p>
                      <p className="text-muted-foreground text-xs mt-1">Diagnostika, oprava, údržba</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Rozšírenie systému</p>
                      <p className="text-primary font-bold">od 120 € / kamera</p>
                      <p className="text-muted-foreground text-xs mt-1">Doinštalovanie kamier do existujúceho systému</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Mesačný monitoring</p>
                      <p className="text-primary font-bold">od 29 € / mes.</p>
                      <p className="text-muted-foreground text-xs mt-1">Vzdialený dohľad a správa systému</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Servisná zmluva</p>
                      <p className="text-primary font-bold">od 19 € / mes.</p>
                      <p className="text-muted-foreground text-xs mt-1">Pravidelná údržba + prioritný servis</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="web"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                  {webPackages.map((pkg, i) => (
                    <PackageCard key={pkg.name} pkg={pkg} i={i} cta="Začať projekt" onReserve={() => openReservation("web", `${pkg.name} – ${pkg.price}`)} />
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl border border-border bg-card/50"
                >
                  <h3 className="text-lg font-bold mb-6">Doplnkové služby</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="font-semibold text-foreground mb-1">Správa webu</p>
                      <p className="text-primary font-bold">100 € / mes.</p>
                      <p className="text-muted-foreground text-xs mt-1">Aktualizácie obsahu, zálohy, monitoring</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">SEO optimalizácia</p>
                      <p className="text-primary font-bold">od 150 € / mes.</p>
                      <p className="text-muted-foreground text-xs mt-1">Mesačná SEO správa a vylepšenia</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Grafické práce</p>
                      <p className="text-primary font-bold">od 30 € / hod.</p>
                      <p className="text-muted-foreground text-xs mt-1">Bannery, logá, vizuálny obsah</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Technická podpora</p>
                      <p className="text-primary font-bold">od 49 € / mes.</p>
                      <p className="text-muted-foreground text-xs mt-1">Bug fixy, úpravy, prioritná pomoc</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
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
