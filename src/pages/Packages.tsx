import { motion } from "framer-motion";
import { Check, Camera, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

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
    name: "Základ",
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

const PackageCard = ({ pkg, i, cta, ctaLink }: { pkg: any; i: number; cta: string; ctaLink: string }) => (
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
    <Link
      to={ctaLink}
      className={`block text-center text-sm font-semibold py-3 rounded-full transition-all duration-300 ${
        pkg.popular
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border text-foreground hover:bg-foreground hover:text-background"
      }`}
    >
      {cta}
    </Link>
  </motion.div>
);

const Packages = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-tight leading-[1.05] mb-6">
              Balíčky
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Transparentné ceny. Žiadne skryté poplatky. Vyberte si, čo vám vyhovuje.
            </p>
          </motion.div>

          {/* Kamerové balíčky */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <Camera size={24} className="text-primary" />
            <h2 className="text-2xl font-bold">Kamerové systémy</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            {cameraPackages.map((pkg, i) => (
              <PackageCard key={pkg.name} pkg={pkg} i={i} cta="Nezáväzná konzultácia" ctaLink="/kontakt" />
            ))}
          </div>

          {/* Web balíčky */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <Monitor size={24} className="text-primary" />
            <h2 className="text-2xl font-bold">Web & Software</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {webPackages.map((pkg, i) => (
              <PackageCard key={pkg.name} pkg={pkg} i={i} cta="Začať projekt" ctaLink="/kontakt" />
            ))}
          </div>

          {/* Doplnkové služby */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-2xl border border-border bg-card/50"
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
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Packages;
