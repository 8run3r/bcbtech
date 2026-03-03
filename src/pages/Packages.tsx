import { motion, AnimatePresence } from "framer-motion";
import { useState, lazy, Suspense } from "react";
import { Check, Camera, Monitor } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { RippleButton } from "@/components/ui/ripple-button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ReservationModal from "@/components/ReservationModal";

const ParticleField = lazy(() => import("@/components/landing/ParticleField"));

const webPackages = [
{
  name: "Starter",
  price: "od 490 €",
  desc: "Pre živnostníkov a podnikateľov, ktorí potrebujú web stránku.",
  features: [
  "Jednoduchá prezentačná webstránka (1–3 podstránky)",
  "Plne responzívny dizajn optimalizovaný pre mobilné zariadenia",
  "Kontaktný formulár s doručovaním na e-mail",
  "Základná SEO optimalizácia + registrácia do Google indexu",
  "Prepojenie na sociálne siete",
  "Dodanie projektu do 5 dní"]

},
{
  name: "Business",
  price: "od 990 €",
  desc: "Pre malé firmy, ktoré chcú rásť online.",
  popular: true,
  features: [
  "Všetko zo Starter",
  "Viacstránkový web (5–10 podstránok)",
  "Redakčný systém (CMS) pre jednoduchú správu obsahu",
  "Integrácia Google Analytics a merania návštevnosti",
  "Moderné animácie a prémiový dizajn",
  "SSL certifikát",
  "3 mesiace technickej podpory",
  "Dodanie projektu do 5 dní"]

},
{
  name: "Premium",
  price: "od 2 500 €",
  desc: "Komplexné riešenie pre ambiciózne firmy.",
  features: [
  "Všetko z Business",
  "Kompletné riešenie na mieru (e-shop alebo rezervačný systém)",
  "Prepojenie na fakturačný alebo účtovný systém",
  "Vlastný backend a API riešenie",
  "Pokročilá SEO optimalizácia na mieru",
  "6 mesiacov podpory a údržby",
  "Prioritná zákaznícka podpora",
  "Dodanie projektu do 14 dní"]

}];


const cameraPackages = [
{
  name: "WiFi kamery",
  price: "od 390 €",
  desc: "Pre domácnosti a malé priestory bez káblových rozvodov.",
  features: [
  "2–4 WiFi kamery (2MP / 4MP)",
  "Jednoduché nastavenie cez mobilnú appku",
  "Detekcia pohybu s notifikáciami",
  "Nočné videnie do 15m",
  "Obojsmerná komunikácia",
  "Cloud alebo SD karta záznam",
  "1 rok záruky na prácu"]
},
{
  name: "IP kamery",
  price: "od 1 290 €",
  desc: "Pre firmy, sklady a predajne s pevnou inštaláciou.",
  popular: true,
  features: [
  "4–8 IP kamier (4MP / 5MP)",
  "8-kanálový NVR s 2TB HDD",
  "AI detekcia pohybu a osôb",
  "Nočné videnie do 30m",
  "PoE napájanie cez sieť",
  "Vzdialený prístup + VPN",
  "Zaškolenie obsluhy",
  "2 roky záruky"]
},
{
  name: "OTB kamery (4K)",
  price: "od 3 500 €",
  desc: "Vysoko rozlíšené kamery pre veľké objekty a areály.",
  features: [
  "8–16+ kamier (5MP / 4K)",
  "16-kanálový NVR s RAID",
  "Perimeter ochrana s AI",
  "PTZ kamery s automatickým trackingom",
  "Integrácia s alarmom",
  "Projektová dokumentácia",
  "Servisná zmluva na 12 mesiacov",
  "Prioritná podpora 24/7"]
}];


const PackageCard = ({ pkg, i, cta, onReserve }: {pkg: any;i: number;cta: string;onReserve: () => void;}) =>
<motion.div
  key={pkg.name}
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ delay: 0.1 + i * 0.12, duration: 0.7 }}
  className={`relative p-6 sm:p-8 rounded-2xl border transition-all duration-500 ${
  pkg.popular ?
  "bg-card border-primary/40 glow-primary" :
  "bg-card border-border hover:border-primary/20"}`
  }>

    {pkg.popular &&
  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-4 py-1 rounded-full font-semibold">
        Populárny
      </span>
  }
    <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
    <p className="text-2xl font-bold text-primary mb-2">{pkg.price}</p>
    <p className="text-sm text-muted-foreground mb-8">{pkg.desc}</p>
    <ul className="space-y-3 mb-8">
      {pkg.features.map((f: string) =>
    <li key={f} className="flex items-start gap-2.5 text-sm">
        <Check size={15} className="mt-0.5 shrink-0 text-primary" />
        <span>{f}</span>
      </li>
    )}
    </ul>
    <RippleButton
    onClick={onReserve}
    rippleColor={pkg.popular ? "hsl(160 100% 50% / 0.3)" : "hsl(0 0% 100% / 0.2)"}
    className={`block w-full text-center text-sm font-semibold py-3 rounded-full transition-all duration-300 cursor-pointer ${
    pkg.popular ?
    "bg-primary text-primary-foreground hover:brightness-110" :
    "border border-border text-foreground hover:bg-foreground hover:text-background"}`
    }>
      {cta}
    </RippleButton>
  </motion.div>;


const Packages = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "web" ? "web" : "cameras";
  const [activeTab, setActiveTab] = useState<"cameras" | "web">(initialTab);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<{category: "cameras" | "web";name: string;}>({ category: "cameras", name: "" });

  const openReservation = (category: "cameras" | "web", name: string) => {
    setSelectedPkg({ category, name });
    setReservationOpen(true);
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <Suspense fallback={null}>
          <ParticleField density={4000} particleSize={1.8} />
        </Suspense>
      </div>
      <div className="relative z-10">
      <Header />

      <section className="pt-32 sm:pt-40 pb-20 px-5 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12">

            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-tight leading-[1.05] mb-6">
              Balíčky
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Transparentné ceny. Žiadne skryté poplatky. Vyberte si, čo vám vyhovuje.
            </p>
          </motion.div>

          <div className="flex justify-center mb-12 sm:mb-16">
            <div className="inline-flex rounded-full border border-border bg-card p-1 gap-1">
              <button
                  onClick={() => setActiveTab("cameras")}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  activeTab === "cameras" ?
                  "bg-primary text-primary-foreground" :
                  "text-muted-foreground hover:text-foreground"}`
                  }>

                <Camera size={16} />
                <span className="hidden xs:inline">Kamerové systémy</span>
                <span className="xs:hidden">Kamery</span>
              </button>
              <button
                  onClick={() => setActiveTab("web")}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${
                  activeTab === "web" ?
                  "bg-primary text-primary-foreground" :
                  "text-muted-foreground hover:text-foreground"}`
                  }>

                <Monitor size={16} />
                <span className="hidden xs:inline">Webové balíčky</span>
                <span className="xs:hidden">Weby</span>
              </button>
            </div>
          </div>


          <AnimatePresence mode="wait">
            {activeTab === "cameras" ?
              <motion.div
                key="cameras"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                  {cameraPackages.map((pkg, i) =>
                  <PackageCard key={pkg.name} pkg={pkg} i={i} cta="Nezáväzná konzultácia" onReserve={() => openReservation("cameras", `${pkg.name} – ${pkg.price}`)} />
                  )}
                </div>

                {/* Doplnkové služby - only under cameras */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl border border-border bg-card/50">

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
              </motion.div> :

              <motion.div
                key="web"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                  {webPackages.map((pkg, i) =>
                  <PackageCard key={pkg.name} pkg={pkg} i={i} cta="Začať projekt" onReserve={() => openReservation("web", `${pkg.name} – ${pkg.price}`)} />
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl border border-border bg-card/50">

                  <h3 className="text-lg font-bold mb-6">Doplnkové služby</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="font-semibold text-foreground mb-1">Správa webu</p>
                      <p className="text-primary font-bold">75 € / mes.</p>
                      <p className="text-muted-foreground text-xs mt-1">Aktualizácie obsahu, zálohy, monitoring+Technicka podpora</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">SEO optimalizácia</p>
                      <p className="text-primary font-bold">od 150 € / mes.</p>
                      <p className="text-muted-foreground text-xs mt-1">Mesačná SEO správa a vylepšenia</p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Grafické práce</p>
                      <p className="text-primary font-bold">od 30 € </p>
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
              }
          </AnimatePresence>
        </div>
      </section>

      <Footer />
      <ReservationModal
          open={reservationOpen}
          onClose={() => setReservationOpen(false)}
          packageCategory={selectedPkg.category}
          packageName={selectedPkg.name} />

      </div>
    </main>);

};

export default Packages;