import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, HardDrive, Wifi, CheckCircle2, ArrowRight, ArrowLeft, Send, X, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFormSecurity } from "@/hooks/use-form-security";

type Step = 1 | 2 | 3 | 4 | 5;

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

const reservationSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné").max(100),
  email: z.string().trim().email("Neplatný email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

interface KonfiguratorModalProps {
  open: boolean;
  onClose: () => void;
}

const KonfiguratorModal = ({ open, onClose }: KonfiguratorModalProps) => {
  const [step, setStep] = useState<Step>(1);
  const [selectedCameras, setSelectedCameras] = useState<Record<string, number>>({});
  const [selectedNvr, setSelectedNvr] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  // Reservation form state
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { honeypot, setHoneypot, cooldown, startCooldown, canSubmit } = useFormSecurity();

  const totalCameras = Object.values(selectedCameras).reduce((a, b) => a + b, 0);

  const totalPrice = (() => {
    let total = 0;
    cameraTypes.forEach((c) => { total += (selectedCameras[c.id] || 0) * c.price; });
    const nvr = nvrOptions.find((n) => n.id === selectedNvr);
    if (nvr) total += nvr.price;
    extras.forEach((e) => { if (selectedExtras.includes(e.id)) total += e.price; });
    return total;
  })();

  const buildConfigSummary = () => {
    const lines: string[] = [];
    cameraTypes.filter((c) => (selectedCameras[c.id] || 0) > 0).forEach((c) => {
      lines.push(`${c.name} × ${selectedCameras[c.id]} (${(selectedCameras[c.id] || 0) * c.price} €)`);
    });
    if (selectedNvr) {
      const nvr = nvrOptions.find((n) => n.id === selectedNvr)!;
      lines.push(`${nvr.name} (${nvr.price} €)`);
    }
    extras.filter((e) => selectedExtras.includes(e.id)).forEach((e) => {
      lines.push(`${e.name} (${e.price} €)`);
    });
    lines.push(`--- Celková cena: ${totalPrice} €`);
    return lines.join("\n");
  };

  const canProceed = () => {
    if (step === 1) return totalCameras > 0;
    if (step === 2) return !!selectedNvr;
    return true;
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSelectedCameras({});
      setSelectedNvr(null);
      setSelectedExtras([]);
      setForm({ name: "", email: "", phone: "", message: "" });
      setErrors({});
      setSent(false);
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) {
      if (honeypot) { setSent(true); return; }
      toast.error(`Počkajte ${cooldown}s pred ďalším odoslaním.`);
      return;
    }
    setErrors({});

    const result = reservationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    const configSummary = buildConfigSummary();
    const fullMessage = form.message
      ? `${configSummary}\n\nPoznámka: ${form.message}`
      : configSummary;

    const { error } = await supabase.from("reservations").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      message: fullMessage,
      package_category: "cameras",
      package_name: `Konfigurátor — ${totalCameras} kamier, ${totalPrice} €`,
    });

    setSending(false);
    if (error) {
      toast.error("Nepodarilo sa odoslať dopyt.");
      return;
    }

    startCooldown();
    setSent(true);
    toast.success("Dopyt bol odoslaný!");
  };

  const stepLabels = ["Kamery", "NVR", "Extras", "Súhrn", "Kontakt"];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-background/85 backdrop-blur-2xl"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: 20, y: 60 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, rotateX: -10, y: 40 }}
            transition={{ type: "spring", damping: 22, stiffness: 260, mass: 0.9 }}
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
                  Poskladajte si kamerový systém v 5 krokoch
                </p>
              </div>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors p-1" aria-label="Zavrieť">
                <X size={20} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 px-4 py-4 flex-shrink-0">
              {stepLabels.map((label, i) => (
                <div key={label} className="flex items-center gap-1 sm:gap-1.5">
                  <div
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold transition-all duration-300 ${
                      i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground border border-border"
                    }`}
                  >
                    {i + 1 < step ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  <span className={`text-[10px] sm:text-[11px] hidden sm:block transition-colors ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                  {i < 4 && <div className={`w-3 sm:w-6 h-px ${i + 1 < step ? "bg-primary" : "bg-border"}`} />}
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
                            <div key={cam.id} className={`p-4 rounded-xl border transition-all duration-300 ${count > 0 ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20"}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-semibold text-sm text-foreground">{cam.name}</h4>
                                  <p className="text-[11px] text-muted-foreground">{cam.desc}</p>
                                </div>
                                <span className="text-primary font-bold text-xs">{cam.price} €</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={() => setSelectedCameras((p) => ({ ...p, [cam.id]: Math.max(0, (p[cam.id] || 0) - 1) }))} className="w-7 h-7 rounded-lg bg-secondary border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all text-xs font-bold">−</button>
                                <span className="text-sm font-bold w-6 text-center text-foreground">{count}</span>
                                <button onClick={() => setSelectedCameras((p) => ({ ...p, [cam.id]: (p[cam.id] || 0) + 1 }))} className="w-7 h-7 rounded-lg bg-secondary border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all text-xs font-bold">+</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">Vybrané: <span className="text-primary font-bold">{totalCameras}</span> kamier</p>
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                        <HardDrive size={18} className="text-primary" /> Vyberte NVR
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nvrOptions.map((nvr) => (
                          <button key={nvr.id} onClick={() => setSelectedNvr(nvr.id)} className={`p-4 rounded-xl border text-left transition-all duration-300 ${selectedNvr === nvr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"}`}>
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-semibold text-sm text-foreground">{nvr.name}</h4>
                                <p className="text-[11px] text-muted-foreground">Max {nvr.channels} kamier</p>
                              </div>
                              <span className="text-primary font-bold text-xs">{nvr.price} €</span>
                            </div>
                            {totalCameras > nvr.channels && <p className="text-[11px] text-destructive mt-2">⚠ Nedostatočný pre {totalCameras} kamier</p>}
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
                            <button key={ext.id} onClick={() => setSelectedExtras((p) => selected ? p.filter((e) => e !== ext.id) : [...p, ext.id])} className={`p-4 rounded-xl border text-left transition-all duration-300 ${selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"}`}>
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
                        <span className="text-2xl font-bold text-primary">{totalPrice} €</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
                        * Orientačné ceny. Finálna ponuka závisí od konkrétnych podmienok.
                      </p>
                    </div>
                  )}

                  {step === 5 && (
                    <div>
                      {sent ? (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                          <CheckCircle className="mx-auto text-primary mb-4" size={48} strokeWidth={1.5} />
                          <h3 className="text-xl font-bold mb-2">Ďakujeme!</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Vašu konfiguráciu sme prijali. Ozveme sa vám do 24 hodín.
                          </p>
                          <p className="text-xs text-muted-foreground mb-6">
                            <span className="text-primary font-semibold">{totalCameras} kamier</span> · <span className="text-primary font-semibold">{totalPrice} €</span>
                          </p>
                          <button onClick={handleClose} className="text-sm text-primary underline underline-offset-4">Zavrieť</button>
                        </motion.div>
                      ) : (
                        <>
                          <h3 className="text-base font-bold mb-1 flex items-center gap-2">
                            <Send size={18} className="text-primary" /> Odoslať dopyt
                          </h3>
                          <p className="text-xs text-muted-foreground mb-5">
                            Konfigurácia: {totalCameras} kamier · {totalPrice} €
                          </p>
                          <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                              <input
                                type="text"
                                placeholder="Meno a priezvisko *"
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                              />
                              {errors.name && <p className="text-xs text-destructive mt-1 px-1">{errors.name}</p>}
                            </div>
                            <div>
                              <input
                                type="email"
                                placeholder="Email *"
                                value={form.email}
                                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                              />
                              {errors.email && <p className="text-xs text-destructive mt-1 px-1">{errors.email}</p>}
                            </div>
                            <input
                              type="tel"
                              placeholder="Telefón (voliteľné)"
                              value={form.phone}
                              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            {/* Honeypot */}
                            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true" tabIndex={-1}>
                              <label htmlFor="konfig_website">Website</label>
                              <input id="konfig_website" type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" tabIndex={-1} />
                            </div>

                            <textarea
                              placeholder="Poznámka (voliteľné)"
                              rows={3}
                              value={form.message}
                              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                            />
                            <button
                              type="submit"
                              disabled={sending || cooldown > 0}
                              className="w-full bg-primary text-primary-foreground py-3.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {sending ? (
                                <><Loader2 size={16} className="animate-spin" /> Odosielam...</>
                              ) : cooldown > 0 ? (
                                <>Počkajte {cooldown}s</>
                              ) : (
                                <><Send size={16} /> Odoslať dopyt</>
                              )}
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer nav + price */}
            {!sent && (
              <div className="flex items-center justify-between p-5 sm:p-6 border-t border-border/30 flex-shrink-0">
                <button
                  onClick={() => setStep((s) => (s > 1 ? (s - 1) as Step : s))}
                  disabled={step === 1}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={14} /> Späť
                </button>

                <div className="flex items-center gap-4">
                  {totalPrice > 0 && step < 5 && (
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">Cena</p>
                      <p className="text-sm font-bold text-primary">{totalPrice} €</p>
                    </div>
                  )}
                  {step < 5 && (
                    <button
                      onClick={() => setStep((s) => (s < 5 ? (s + 1) as Step : s))}
                      disabled={!canProceed()}
                      className="flex items-center gap-1.5 text-xs font-medium bg-foreground text-background px-5 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {step === 4 ? "Odoslať dopyt" : "Ďalej"} <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KonfiguratorModal;
