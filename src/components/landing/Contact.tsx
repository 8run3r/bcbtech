import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné").max(100),
  email: z.string().trim().email("Neplatný email").max(255),
  message: z.string().trim().min(1, "Správa je povinná").max(2000),
});

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

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
      message: result.data.message,
    });

    setSending(false);
    if (error) {
      toast.error("Nepodarilo sa odoslať správu.");
      return;
    }

    setSent(true);
    setForm({ name: "", email: "", message: "" });
    toast.success("Správa bola odoslaná!");
  };

  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-primary mb-4 block">Kontakt</span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Poďme tvoriť</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Máte nápad? Ozvite sa a my ho premeníme na realitu.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <a href="mailto:8run3r@gmail.com" className="flex flex-col items-center p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
            <Mail className="text-primary mb-3" size={24} strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">8run3r@gmail.com</span>
          </a>
          <a href="tel:+421911640660" className="flex flex-col items-center p-6 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
            <Phone className="text-primary mb-3" size={24} strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">+421 911 640 660</span>
          </a>
          <div className="flex flex-col items-center p-6 rounded-lg bg-card border border-border">
            <MapPin className="text-primary mb-3" size={24} strokeWidth={1.5} />
            <span className="text-sm text-muted-foreground">Levice, SK</span>
          </div>
        </motion.div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <CheckCircle className="mx-auto text-primary mb-4" size={48} strokeWidth={1.5} />
            <h3 className="text-xl font-bold mb-2">Ďakujeme!</h3>
            <p className="text-sm text-muted-foreground mb-4">Ozveme sa vám čo najskôr.</p>
            <button onClick={() => setSent(false)} className="text-sm text-primary underline underline-offset-4">
              Odoslať ďalšiu správu
            </button>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-1">
              <input
                type="text"
                placeholder="Meno *"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full bg-card border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              {errors.name && <p className="text-xs text-destructive px-1">{errors.name}</p>}
            </div>
            <div className="space-y-1">
              <input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full bg-card border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              {errors.email && <p className="text-xs text-destructive px-1">{errors.email}</p>}
            </div>
            <div className="sm:col-span-2 space-y-1">
              <textarea
                placeholder="Opíšte váš projekt... *"
                rows={5}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                className="w-full bg-card border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              />
              {errors.message && <p className="text-xs text-destructive px-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="sm:col-span-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-md font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 glow-primary"
            >
              {sending ? (
                <><Loader2 size={16} className="animate-spin" /> Odosielam...</>
              ) : (
                <><Send size={16} /> Odoslať správu</>
              )}
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
};

export default Contact;
