import { useState, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Zap, TrendingUp, Layers, Send, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AnimatedModal from "@/components/ui/animated-modal";

type Category = "web" | "automation" | "marketing" | "hybrid";

const CATEGORIES: { key: Category; label: string; sub: string; icon: ElementType; accent: string; accentRaw: string; packages: string[] }[] = [
  {
    key: "web",
    label: "Digital Web",
    sub: "Weby, e-shopy, SaaS",
    icon: Monitor,
    accent: "var(--neon-primary)",
    accentRaw: "0,255,170",
    packages: ["Starter – od 390 €", "Business – od 890 €", "Premium – od 2 200 €", "Na mieru"],
  },
  {
    key: "automation",
    label: "AI Automatizácia",
    sub: "Workflow, agenti, pipelines",
    icon: Zap,
    accent: "var(--neon-secondary)",
    accentRaw: "255,140,0",
    packages: ["Flow – od 390 €", "System – od 1 200 €", "Enterprise – od 3 500 €", "Na mieru"],
  },
  {
    key: "marketing",
    label: "AI Marketing",
    sub: "Obsah, SEO, kampane",
    icon: TrendingUp,
    accent: "var(--neon-accent)",
    accentRaw: "255,61,113",
    packages: ["Pulse – od 290 €/mes.", "Amplify – od 590 €/mes.", "Dominate – od 1 490 €/mes."],
  },
  {
    key: "hybrid",
    label: "Hybrid",
    sub: "Web + auto + marketing",
    icon: Layers,
    accent: "var(--neon-cold)",
    accentRaw: "74,158,255",
    packages: ["Launch – od 1 490 €", "Scale – od 3 900 €", "Full Stack – na mieru"],
  },
];

const ContactModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [pkg, setPkg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const activeCat = CATEGORIES.find((c) => c.key === category);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setCategory(null);
      setPkg("");
      setForm({ name: "", email: "", message: "" });
      setErrors({});
      setSent(false);
    }, 300);
  };

  const handleCategorySelect = (key: Category) => {
    setCategory(key);
    setPkg("");
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Meno je povinné";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Neplatný email";
    if (!category) errs.category = "Vyberte kategóriu";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSending(true);

    const fullMessage = [
      pkg ? `Balíček: ${pkg}` : "",
      form.message,
    ].filter(Boolean).join("\n");

    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      message: fullMessage || null,
      package_category: category,
      package_name: pkg || null,
    });

    setSending(false);
    if (error) { toast.error("Nepodarilo sa odoslať správu."); return; }
    setSent(true);
    toast.success("Správa odoslaná! Ozveme sa do 24h.");
  };

  const inputStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "var(--text-primary)",
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.06)",
    letterSpacing: "0.04em",
    outline: "none",
    width: "100%",
    padding: "10px 14px",
    transition: "border-color 0.2s",
  };

  return (
    <AnimatedModal open={open} onClose={handleClose}>
      {sent ? (
        <div className="text-center py-8">
          <CheckCircle size={40} className="mx-auto mb-4" style={{ color: "var(--neon-primary)" }} />
          <p style={{ fontFamily: "'VT323', monospace", fontSize: 22, color: "var(--text-primary)", letterSpacing: "0.05em" }}>
            TRANSMISSION_OK
          </p>
          <p className="mt-2 mb-6" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.06em" }}>
            Ozveme sa vám do 24 hodín.
          </p>
          <button onClick={handleClose} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--neon-primary)", letterSpacing: "0.12em" }}>
            [ ZAVRIEŤ ]
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div style={{ width: 6, height: 6, background: "var(--neon-primary)" }} />
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: 22, color: "var(--text-primary)", letterSpacing: "0.05em" }}>
              INITIATE_CONTACT
            </h2>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
            {'>'} Vyberte kategóriu a popíšte projekt. Odpovieme do 24h.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.18em", marginBottom: 8, textTransform: "uppercase" }}>
                Kategória služby
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const active = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => handleCategorySelect(cat.key)}
                      className="flex items-start gap-2 p-3 text-left transition-all duration-200"
                      style={{
                        background: active ? `rgba(${cat.accentRaw},0.1)` : "rgba(0,0,0,0.3)",
                        border: `1px solid ${active ? `rgba(${cat.accentRaw},0.4)` : "rgba(255,255,255,0.05)"}`,
                      }}
                    >
                      <Icon size={12} style={{ color: active ? cat.accent : "var(--text-muted)", marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: active ? cat.accent : "var(--text-dim)", letterSpacing: "0.08em", lineHeight: 1.4 }}>
                          {cat.label}
                        </p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>
                          {cat.sub}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.category && <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--neon-accent)", marginTop: 4 }}>{errors.category}</p>}
            </div>

            <AnimatePresence>
              {activeCat && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.18em", marginBottom: 8, textTransform: "uppercase" }}>
                    Balíček (voliteľné)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeCat.packages.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPkg(pkg === p ? "" : p)}
                        className="transition-all duration-200 px-3 py-1.5"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9,
                          letterSpacing: "0.06em",
                          color: pkg === p ? "#000" : activeCat.accent,
                          background: pkg === p ? activeCat.accent : `rgba(${activeCat.accentRaw},0.06)`,
                          border: `1px solid rgba(${activeCat.accentRaw},${pkg === p ? "1" : "0.2"})`,
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <input
                type="text"
                placeholder="// meno a priezvisko *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(0,255,170,0.25)")}
                onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.06)")}
              />
              {errors.name && <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--neon-accent)", marginTop: 4 }}>{errors.name}</p>}
            </div>

            <div>
              <input
                type="email"
                placeholder="// email *"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                style={inputStyle}
                onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(0,255,170,0.25)")}
                onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.06)")}
              />
              {errors.email && <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--neon-accent)", marginTop: 4 }}>{errors.email}</p>}
            </div>

            <textarea
              placeholder="// popíšte projekt... (voliteľné)"
              rows={3}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(0,255,170,0.25)")}
              onBlur={(e) => ((e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.06)")}
            />

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 flex items-center justify-center gap-2 transition-all duration-300 hover:opacity-80 disabled:opacity-50"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.15em",
                background: activeCat ? `rgba(${activeCat.accentRaw},0.12)` : "rgba(0,255,170,0.08)",
                border: `1px solid ${activeCat ? `rgba(${activeCat.accentRaw},0.35)` : "rgba(0,255,170,0.2)"}`,
                color: activeCat ? activeCat.accent : "var(--neon-primary)",
              }}
            >
              {sending ? (
                <><Loader2 size={13} className="animate-spin" /> ODOSIELAM...</>
              ) : (
                <><Send size={13} /> [ TRANSMIT ]</>
              )}
            </button>
          </form>
        </div>
      )}
    </AnimatedModal>
  );
};

export default ContactModal;
