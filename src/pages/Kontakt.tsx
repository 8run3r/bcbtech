import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle, Camera, Monitor } from "lucide-react";
import { RippleButton } from "@/components/ui/ripple-button";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné").max(100),
  email: z.string().trim().email("Neplatný email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Správa je povinná").max(2000),
  package_category: z.enum(["cameras", "web", ""]).optional(),
  package_name: z.string().max(200).optional().or(z.literal("")),
});

const cameraPackageOptions = [
  "Základ – od 590 €",
  "Firma – od 1 490 €",
  "Komplex – od 3 500 €",
];

const webPackageOptions = [
  "Starter – od 490 €",
  "Business – od 990 €",
  "Premium – od 2 500 €",
];

const Kontakt = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", package_category: "" as "" | "cameras" | "web", package_name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const packageOptions = form.package_category === "cameras" ? cameraPackageOptions : form.package_category === "web" ? webPackageOptions : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      message: result.data.message,
      package_category: result.data.package_category || null,
      package_name: result.data.package_name || null,
    });

    setSending(false);
    if (error) {
      toast.error("Nepodarilo sa odoslať správu. Skúste to znova.");
      return;
    }

    setSent(true);
    toast.success("Správa bola odoslaná!");
  };

  if (sent) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <section className="pt-32 sm:pt-40 pb-20 px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <CheckCircle className="mx-auto text-primary mb-6" size={64} strokeWidth={1.5} />
            <h1 className="text-3xl font-bold mb-4">Ďakujeme!</h1>
            <p className="text-muted-foreground mb-8">
              Vašu správu sme prijali. Ozveme sa vám čo najskôr.
            </p>
            <button
              onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", message: "", package_category: "", package_name: "" }); }}
              className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
            >
              Odoslať ďalšiu správu
            </button>
          </motion.div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="pt-32 sm:pt-40 pb-20 px-5 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold tracking-tight leading-[1.05] mb-6">
              Poďme tvoriť
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Máte nápad? Ozvite sa a my ho premeníme na realitu.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14"
          >
            <a href="mailto:8run3r@gmail.com" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
              <Mail className="text-primary mb-3" size={24} strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">8run3r@gmail.com</span>
            </a>
            <a href="tel:+421911640660" className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
              <Phone className="text-primary mb-3" size={24} strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">+421 911 640 660</span>
            </a>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card border border-border">
              <MapPin className="text-primary mb-3" size={24} strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground">Levice, SK</span>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Meno *"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-card border border-border rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              {errors.name && <p className="text-xs text-destructive px-1">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-card border border-border rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              {errors.email && <p className="text-xs text-destructive px-1">{errors.email}</p>}
            </div>
            <div className="sm:col-span-2 space-y-1">
              <input
                type="tel"
                placeholder="Telefón (voliteľné)"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="w-full bg-card border border-border rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Category selector */}
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground mb-2">Mám záujem o (voliteľné):</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, package_category: p.package_category === "cameras" ? "" : "cameras", package_name: "" }))}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                    form.package_category === "cameras"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  <Camera size={16} />
                  Kamerový systém
                </button>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, package_category: p.package_category === "web" ? "" : "web", package_name: "" }))}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
                    form.package_category === "web"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  <Monitor size={16} />
                  Webová stránka
                </button>
              </div>
            </div>

            {/* Package selector */}
            {form.package_category && (
              <div className="sm:col-span-2">
                <select
                  value={form.package_name}
                  onChange={(e) => setForm((p) => ({ ...p, package_name: e.target.value }))}
                  className="w-full bg-card border border-border rounded-xl px-5 py-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="">Vyberte balíček (voliteľné)</option>
                  {packageOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="sm:col-span-2 space-y-1">
              <textarea
                placeholder="Opíšte váš projekt... *"
                rows={5}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="w-full bg-card border border-border rounded-xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
              {errors.message && <p className="text-xs text-destructive px-1">{errors.message}</p>}
            </div>
            <RippleButton
              type="submit"
              disabled={sending}
              rippleColor="hsl(160 100% 50% / 0.3)"
              className="sm:col-span-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <><Loader2 size={16} className="animate-spin" /> Odosielam...</>
              ) : (
                <><Send size={16} /> Odoslať správu</>
              )}
            </RippleButton>
          </motion.form>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Kontakt;
