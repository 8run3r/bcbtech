import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, HardDrive, Wifi, CheckCircle2, ArrowRight, ArrowLeft, Send, X } from "lucide-react";
import { Link } from "react-router-dom";

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

interface KonfiguratorModalProps {
  open: boolean;
  onClose: () => void;
}

const KonfiguratorModal = ({ open, onClose }: KonfiguratorModalProps) => {
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

  const handleClose = () => {
    onClose();
    // Reset after animation
    setTimeout(() => {
      setStep(1);
      setSelectedCameras({});
      setSelectedNvr(null);
      setSelectedExtras([]);
    }, 400);
  };

  const stepLabels = ["Kamery", "NVR", "Extras", "Súhrn"];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-background/85 backdrop-blur-2xl"
            onClick={handleClose}
          />

          {/* Modal panel — 3D entrance */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: 20, y: 60 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotateX: -10, y: 40 }}
            transition={{
              type: "spring",
              damping: 22,
              stiffness: 260,
              mass: 0.9,
            }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] rounded-2xl bg-card border border-border/50 shadow-2xl shadow-primary/10 overflow-hidden flex flex-col"
            style={{ perspective: "1200px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/30 flex-shrink-0">
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  Konfigurátor <span className="text-primary">Systému</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Poskladajte si kamerový systém v 4 krokoch
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Zavrieť"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-5 py-4 flex-shrink-0">
              {stepLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all duration-300 ${
                      i + 1 <= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {i + 1 < step ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span className={`text-[11px] sm:text-xs hidden sm:block transition-colors ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                  {i < 3 && <div className={`w-4 sm:w-8 h-px ${i + 1 < step ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-4 min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step === 1 && (
                    <div>
                      <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                        <Camera size={18} className="text-primary" /> Vyberte kamery
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cameraTypes.map((cam) => {
                          const count = selectedCameras[cam.id] || 0;
                          return (
                            <div
                              key={cam.id}
                              className={`p-4 rounded-xl border transition-all duration-300 ${
                                count > 0 ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-sm text-foreground">{cam.name}</h4>
                                  <p className="text-[11px] text-muted-foreground">{cam.desc}</p>
                                </div>
                                <span className="text-primary font-bold text-xs">{cam.price} €</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedCameras((p) => ({ ...p, [cam.id]: Math.max(0, (p[cam.id] || 0) - 1) }))}
                                  className="w-7 h-7 rounded-lg bg-secondary border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all text-xs font-bold"
                                >−</button>
                                <span className="text-sm font-bold w-6 text-center text-foreground">{count}</span>
                                <button
                                  onClick={() => setSelectedCameras((p) => ({ ...p, [cam.id]: (p[cam.id] || 0) + 1 }))}
                                  className="w-7 h-7 rounded-lg bg-secondary border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all text-xs font-bold"
                                >+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Vybrané: <span className="text-primary font-bold">{totalCameras}</span> kamier
                      </p>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                        <HardDrive size={18} className="text-primary" /> Vyberte NVR
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nvrOptions.map((nvr) => (
                          <button
                            key={nvr.id}
                            onClick={() => setSelectedNvr(nvr.id)}
                            className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                              selectedNvr === nvr.id
                                ? "border-primary bg-primary/5 glow-primary"
                                : "border-border hover:border-primary/20"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-sm text-foreground">{nvr.name}</h4>
                                <p className="text-[11px] text-muted-foreground">Max {nvr.channels} kamier</p>
                              </div>
                              <span className="text-primary font-bold text-xs">{nvr.price} €</span>
                            </div>
                            {totalCameras > nvr.channels && (
                              <p className="text-[11px] text-destructive mt-2">⚠ Nedostatočný pre {totalCameras} kamier</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                        <Wifi size={18} className="text-primary" /> Príslušenstvo
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                              className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                                selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-semibold text-sm text-foreground">{ext.name}</h4>
                                  <p className="text-[11px] text-muted-foreground">{ext.desc}</p>
                                </div>
                                <span className="text-primary font-bold text-xs">{ext.price} €</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div>
                      <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-primary" /> Váš systém
                      </h3>

                      <div className="space-y-2 mb-6">
                        {cameraTypes.filter((c) => (selectedCameras[c.id] || 0) > 0).map((c) => (
                          <div key={c.id} className="flex justify-between text-sm py-1.5 border-b border-border/30">
                            <span className="text-foreground">{c.name} × {selectedCameras[c.id]}</span>
                            <span className="text-muted-foreground">{(selectedCameras[c.id] || 0) * c.price} €</span>
                          </div>
                        ))}
                        {selectedNvr && (() => {
                          const nvr = nvrOptions.find((n) => n.id === selectedNvr)!;
                          return (
                            <div className="flex justify-between text-sm py-1.5 border-b border-border/30">
                              <span className="text-foreground">{nvr.name}</span>
                              <span className="text-muted-foreground">{nvr.price} €</span>
                            </div>
                          );
                        })()}
                        {extras.filter((e) => selectedExtras.includes(e.id)).map((e) => (
                          <div key={e.id} className="flex justify-between text-sm py-1.5 border-b border-border/30">
                            <span className="text-foreground">{e.name}</span>
                            <span className="text-muted-foreground">{e.price} €</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center p-4 rounded-xl bg-primary/10 border border-primary/30">
                        <span className="text-base font-bold text-foreground">Celková cena</span>
                        <span className="text-2xl font-bold text-primary glow-text">{totalPrice} €</span>
                      </div>

                      <Link
                        to="/kontakt"
                        onClick={handleClose}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all"
                      >
                        <Send size={16} /> Odoslať dopyt
                      </Link>

                      <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
                        * Orientačné ceny. Finálna ponuka závisí od konkrétnych podmienok.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer nav + price */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-t border-border/30 flex-shrink-0">
              <button
                onClick={() => setStep((s) => (s > 1 ? (s - 1) as Step : s))}
                disabled={step === 1}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={14} /> Späť
              </button>

              <div className="flex items-center gap-4">
                {totalPrice > 0 && step < 4 && (
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Cena</p>
                    <p className="text-sm font-bold text-primary">{totalPrice} €</p>
                  </div>
                )}
                {step < 4 && (
                  <button
                    onClick={() => setStep((s) => (s < 4 ? (s + 1) as Step : s))}
                    disabled={!canProceed()}
                    className="flex items-center gap-1.5 text-xs font-medium bg-foreground text-background px-5 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Ďalej <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KonfiguratorModal;
