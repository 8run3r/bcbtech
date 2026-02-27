import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFormSecurity } from "@/hooks/use-form-security";

const reservationSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné").max(100),
  email: z.string().trim().email("Neplatný email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

interface ReservationModalProps {
  open: boolean;
  onClose: () => void;
  packageCategory: "cameras" | "web";
  packageName: string;
}

const ReservationModal = ({ open, onClose, packageCategory, packageName }: ReservationModalProps) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { honeypot, setHoneypot, cooldown, startCooldown, canSubmit } = useFormSecurity();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSent(false);
      setForm({ name: "", email: "", phone: "", message: "" });
      setErrors({});
    }, 300);
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
    const { error } = await supabase.from("reservations").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      message: result.data.message || null,
      package_category: packageCategory,
      package_name: packageName,
    });

    setSending(false);
    if (error) {
      toast.error("Nepodarilo sa odoslať rezerváciu.");
      return;
    }

    startCooldown();
    setSent(true);
    toast.success("Rezervácia bola odoslaná!");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="mx-auto text-primary mb-4" size={48} strokeWidth={1.5} />
                <h3 className="text-xl font-bold mb-2">Ďakujeme!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Vašu rezerváciu balíčka <span className="text-foreground font-medium">{packageName}</span> sme prijali. Ozveme sa vám do 24 hodín.
                </p>
                <button
                  onClick={handleClose}
                  className="text-sm text-primary underline underline-offset-4"
                >
                  Zavrieť
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-widest text-primary font-semibold">Rezervácia</span>
                  <h3 className="text-xl font-bold mt-1">{packageName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {packageCategory === "cameras" ? "Kamerový systém" : "Webový balíček"}
                  </p>
                </div>

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
                    <label htmlFor="res_website">Website</label>
                    <input id="res_website" type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" tabIndex={-1} />
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
                      <><Send size={16} /> Odoslať rezerváciu</>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReservationModal;
