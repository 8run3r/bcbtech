import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Shield, Clock, DollarSign, ChevronDown } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const RoiKalkulator = () => {
  const [cameras, setCameras] = useState(4);
  const [propertyType, setPropertyType] = useState<"house" | "business" | "warehouse">("house");
  const [hasExisting, setHasExisting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const config = {
    house: { label: "Rodinný dom", riskMultiplier: 1, avgLoss: 8000 },
    business: { label: "Prevádzka / Obchod", riskMultiplier: 2.5, avgLoss: 25000 },
    warehouse: { label: "Sklad / Areál", riskMultiplier: 3, avgLoss: 50000 },
  };

  const results = useMemo(() => {
    const c = config[propertyType];
    const installCost = cameras * 180 + (hasExisting ? 200 : 600);
    const monthlyCost = cameras * 5;
    const yearlyCost = installCost + monthlyCost * 12;
    const riskReduction = Math.min(0.85, 0.4 + cameras * 0.08);
    const expectedSaving = c.avgLoss * c.riskMultiplier * riskReduction * 0.15;
    const roi = ((expectedSaving - yearlyCost) / yearlyCost) * 100;
    const paybackMonths = Math.ceil(installCost / (expectedSaving / 12));

    return { installCost, monthlyCost, yearlyCost, riskReduction, expectedSaving, roi, paybackMonths };
  }, [cameras, propertyType, hasExisting]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="pt-36 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">
              Marketingový nástroj #1
            </span>
            <h1 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-tight leading-[1.05] mb-4">
              ROI <span className="text-primary glow-text">Kalkulačka</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Zistite, koľko vám kamerový systém reálne ušetrí. Zadajte parametre a uvidíte návratnosť investície.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="p-8 rounded-2xl bg-card border border-border space-y-8"
            >
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Typ nehnuteľnosti</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(config) as Array<keyof typeof config>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setPropertyType(key)}
                      className={`py-3 px-2 rounded-xl text-xs font-medium transition-all duration-300 border ${
                        propertyType === key
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                      }`}
                    >
                      {config[key].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Počet kamier: <span className="text-primary font-bold text-lg">{cameras}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={32}
                  value={cameras}
                  onChange={(e) => setCameras(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1</span>
                  <span>8</span>
                  <span>16</span>
                  <span>32</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setHasExisting(!hasExisting)}
                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${
                      hasExisting ? "bg-primary" : "bg-secondary border border-border"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-all duration-300 ${
                        hasExisting ? "left-[26px]" : "left-0.5"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Mám existujúcu kabeláž
                  </span>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowResults(true)}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all"
              >
                Vypočítať ROI
              </motion.button>
            </motion.div>

            {/* Results panel */}
            <AnimatePresence mode="wait">
              {showResults ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="p-8 rounded-2xl bg-card border border-primary/20 glow-primary space-y-6"
                >
                  <h3 className="text-lg font-bold text-foreground">Vaše výsledky</h3>

                  {/* ROI hero number */}
                  <div className="text-center py-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      className={`text-6xl font-bold ${results.roi > 0 ? "text-primary glow-text" : "text-destructive"}`}
                    >
                      {results.roi > 0 ? "+" : ""}{Math.round(results.roi)}%
                    </motion.div>
                    <p className="text-sm text-muted-foreground mt-2">Návratnosť investície (1. rok)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: DollarSign, label: "Inštalácia", value: `${results.installCost} €` },
                      { icon: Clock, label: "Návratnosť", value: `${results.paybackMonths} mes.` },
                      { icon: Shield, label: "Zníženie rizika", value: `${Math.round(results.riskReduction * 100)}%` },
                      { icon: TrendingUp, label: "Ročná úspora", value: `${Math.round(results.expectedSaving)} €` },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="p-4 rounded-xl bg-secondary/50 border border-border"
                      >
                        <stat.icon size={18} className="text-primary mb-2" />
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-lg font-bold text-foreground">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  <p className="text-[11px] text-muted-foreground/60 text-center">
                    * Odhad na základe priemerných štatistík pre daný typ objektu
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-border/50 text-center"
                >
                  <ChevronDown size={32} className="text-muted-foreground/30 mb-4 animate-bounce" />
                  <p className="text-muted-foreground text-sm">
                    Nastavte parametre a kliknite na <span className="text-primary font-medium">Vypočítať ROI</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default RoiKalkulator;
