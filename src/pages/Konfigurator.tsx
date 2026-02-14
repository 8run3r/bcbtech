import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, HardDrive, Wifi, CheckCircle2, ArrowRight, ArrowLeft, Send } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

type Step = 1 | 2 | 3 | 4;

const cameraTypes = [
  { id: "dome", name: "Dome", desc: "Interiér, diskrétne", price: 120 },
  { id: "bullet", name: "Bullet", desc: "Exteriér, dlhý dosah", price: 150 },
  { id: "ptz", name: "PTZ", desc: "Otáčanie, zoom", price: 350 },
  { id: "turret", name: "Turret", desc: "Univerzálna", price: 130 },
];

const nvrOptions = [
  { id: "4ch", name: "4-kanálový NVR", channels: 4, price: 180 },
  { id: "8ch", name: "8-kanálový NVR", channels: 8, price: 280 },
  { id: "16ch", name: "16-kanálový NVR", channels: 16, price: 420 },
  { id: "32ch", name: "32-kanálový NVR", channels: 32, price: 650 },
];

const extras = [
  { id: "poe", name: "PoE Switch", desc: "Napájanie cez kábel", price: 90 },
  { id: "hdd", name: "4TB HDD", desc: "Úložisko pre nahrávky", price: 120 },
  { id: "monitor", name: "Monitor 22\"", desc: "Live náhľad", price: 160 },
  { id: "install", name: "Montáž", desc: "Profesionálna inštalácia", price: 300 },
];

const Konfigurator = () => {
  const [step, setStep] = useState<Step>(1);
  const [selectedCameras, setSelectedCameras] = useState<Record<string, number>>({});
  const [selectedNvr, setSelectedNvr] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const totalCameras = Object.values(selectedCameras).reduce((a, b) => a + b, 0);

  const totalPrice = (() => {
    let total = 0;
    cameraTypes.forEach((c) => { total += (selectedCameras[c.id] || 0) * c.price; });
    const nvr = nvrOptions.find((n) => n.id === selectedNvr);
    if (nvr) total += nvr.price;
    extras.forEach((e) => { if (selectedExtras.includes(e.id)) total += e.price; });
    return total;
  })();

  const canProceed = () => {
    if (step === 1) return totalCameras > 0;
    if (step === 2) return !!selectedNvr;
    return true;
  };

  const stepLabels = ["Kamery", "NVR", "Príslušenstvo", "Súhrn"];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="pt-36 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block font-mono">
              Marketingový nástroj #2
            </span>
            <h1 className="text-[clamp(2rem,5vw,4rem)] font-bold tracking-tight leading-[1.05] mb-4">
              Konfigurátor <span className="text-primary glow-text">Systému</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Poskladajte si kamerový systém na mieru v 4 krokoch.
            </p>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    i + 1 <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  {i + 1 < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block transition-colors ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
                {i < 3 && <div className={`w-8 h-px ${i + 1 < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-2xl bg-card border border-border min-h-[400px]"
            >
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Camera size={22} className="text-primary" /> Vyberte kamery
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cameraTypes.map((cam) => {
                      const count = selectedCameras[cam.id] || 0;
                      return (
                        <div
                          key={cam.id}
                          className={`p-5 rounded-xl border transition-all duration-300 ${
                            count > 0 ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-foreground">{cam.name}</h3>
                              <p className="text-xs text-muted-foreground">{cam.desc}</p>
                            </div>
                            <span className="text-primary font-bold text-sm">{cam.price} €</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedCameras((p) => ({ ...p, [cam.id]: Math.max(0, (p[cam.id] || 0) - 1) }))}
                              className="w-8 h-8 rounded-lg bg-secondary border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all text-sm font-bold"
                            >−</button>
                            <span className="text-lg font-bold w-8 text-center text-foreground">{count}</span>
                            <button
                              onClick={() => setSelectedCameras((p) => ({ ...p, [cam.id]: (p[cam.id] || 0) + 1 }))}
                              className="w-8 h-8 rounded-lg bg-secondary border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all text-sm font-bold"
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Vybrané: <span className="text-primary font-bold">{totalCameras}</span> kamier
                  </p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <HardDrive size={22} className="text-primary" /> Vyberte NVR
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {nvrOptions.map((nvr) => (
                      <button
                        key={nvr.id}
                        onClick={() => setSelectedNvr(nvr.id)}
                        className={`p-5 rounded-xl border text-left transition-all duration-300 ${
                          selectedNvr === nvr.id
                            ? "border-primary bg-primary/5 glow-primary"
                            : "border-border hover:border-primary/20"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-foreground">{nvr.name}</h3>
                            <p className="text-xs text-muted-foreground">Max {nvr.channels} kamier</p>
                          </div>
                          <span className="text-primary font-bold">{nvr.price} €</span>
                        </div>
                        {totalCameras > nvr.channels && (
                          <p className="text-xs text-destructive mt-2">⚠ Nedostatočný pre {totalCameras} kamier</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Wifi size={22} className="text-primary" /> Príslušenstvo
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {extras.map((ext) => {
                      const selected = selectedExtras.includes(ext.id);
                      return (
                        <button
                          key={ext.id}
                          onClick={() =>
                            setSelectedExtras((p) =>
                              selected ? p.filter((e) => e !== ext.id) : [...p, ext.id]
                            )
                          }
                          className={`p-5 rounded-xl border text-left transition-all duration-300 ${
                            selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-foreground">{ext.name}</h3>
                              <p className="text-xs text-muted-foreground">{ext.desc}</p>
                            </div>
                            <span className="text-primary font-bold">{ext.price} €</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <CheckCircle2 size={22} className="text-primary" /> Váš systém
                  </h2>

                  <div className="space-y-3 mb-8">
                    {cameraTypes.filter((c) => (selectedCameras[c.id] || 0) > 0).map((c) => (
                      <div key={c.id} className="flex justify-between text-sm py-2 border-b border-border/30">
                        <span className="text-foreground">{c.name} × {selectedCameras[c.id]}</span>
                        <span className="text-muted-foreground">{(selectedCameras[c.id] || 0) * c.price} €</span>
                      </div>
                    ))}
                    {selectedNvr && (() => {
                      const nvr = nvrOptions.find((n) => n.id === selectedNvr)!;
                      return (
                        <div className="flex justify-between text-sm py-2 border-b border-border/30">
                          <span className="text-foreground">{nvr.name}</span>
                          <span className="text-muted-foreground">{nvr.price} €</span>
                        </div>
                      );
                    })()}
                    {extras.filter((e) => selectedExtras.includes(e.id)).map((e) => (
                      <div key={e.id} className="flex justify-between text-sm py-2 border-b border-border/30">
                        <span className="text-foreground">{e.name}</span>
                        <span className="text-muted-foreground">{e.price} €</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-5 rounded-xl bg-primary/10 border border-primary/30">
                    <span className="text-lg font-bold text-foreground">Celková cena</span>
                    <span className="text-3xl font-bold text-primary glow-text">{totalPrice} €</span>
                  </div>

                  <Link
                    to="/kontakt"
                    className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all"
                  >
                    <Send size={16} /> Odoslať dopyt
                  </Link>

                  <p className="text-[11px] text-muted-foreground/60 text-center mt-4">
                    * Orientačné ceny. Finálna ponuka závisí od konkrétnych podmienok.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep((s) => (s > 1 ? (s - 1) as Step : s))}
              disabled={step === 1}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} /> Späť
            </button>

            {step < 4 && (
              <button
                onClick={() => setStep((s) => (s < 4 ? (s + 1) as Step : s))}
                disabled={!canProceed()}
                className="flex items-center gap-2 text-sm font-medium bg-foreground text-background px-6 py-2.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Ďalej <ArrowRight size={16} />
              </button>
            )}

            {/* Floating price */}
            {totalPrice > 0 && step < 4 && (
              <div className="fixed bottom-8 right-8 bg-card border border-primary/30 glow-primary rounded-2xl px-6 py-3 z-50">
                <p className="text-xs text-muted-foreground">Priebežná cena</p>
                <p className="text-xl font-bold text-primary">{totalPrice} €</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Konfigurator;
