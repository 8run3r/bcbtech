import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const packages = [
  {
    name: "Starter",
    price: "od 1 500 €",
    desc: "Ideálny pre malé projekty a MVP.",
    features: [
      "Landing page / one-pager",
      "Responzívny dizajn",
      "Kontaktný formulár",
      "SEO základ",
      "Dodanie do 2 týždňov",
    ],
  },
  {
    name: "Pro",
    price: "od 4 000 €",
    desc: "Pre firmy, ktoré to myslia vážne.",
    popular: true,
    features: [
      "Všetko zo Starter",
      "Viacstránková aplikácia",
      "CMS integrácia",
      "Animácie a interakcie",
      "Analytika a tracking",
      "3 mesiace support",
    ],
  },
  {
    name: "Enterprise",
    price: "individuálne",
    desc: "Komplexné riešenia na mieru.",
    features: [
      "Všetko z Pro",
      "Custom backend & API",
      "Platobné integrácie",
      "AI funkcionality",
      "Neobmedzený support",
      "SLA garancia",
    ],
  },
];

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
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
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/kontakt"
                  className={`block text-center text-sm font-semibold py-3 rounded-full transition-all duration-300 ${
                    pkg.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border text-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  Začať projekt
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Packages;
