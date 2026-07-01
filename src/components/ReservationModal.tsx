import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
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

const webAddons = [
  { id: "sprava",     label: "Správa webu",           price: "75 € / mes." },
  { id: "podpora",    label: "Technická podpora",      price: "od 49 € / mes." },
  { id: "seo",        label: "SEO optimalizácia",      price: "od 150 € / mes." },
  { id: "grafika",    label: "Grafické práce",         price: "od 30 €" },
  { id: "zakaznicka", label: "Zákaznícka podpora",     price: "od 29 € / mes." },
  { id: "udrzba",     label: "Údržba & aktualizácie",  price: "od 39 € / mes." },
];

const automationAddons = [
  { id: "sprava-wf",  label: "Správa workflow-ov",         price: "od 79 € / mes." },
  { id: "ai-agent",   label: "AI agent na mieru",          price: "od 490 €" },
  { id: "integracia", label: "Integrácia nového nástroja", price: "od 150 €" },
  { id: "audit",      label: "Audit procesov",             price: "od 200 €" },
];

const agentAddons = [
  { id: "kanal",        label: "Ďalší kanál (WhatsApp, Messenger…)", price: "od 150 €" },
  { id: "napojenie",    label: "Napojenie na systém (CRM, sklad…)",  price: "od 150 €" },
  { id: "znalosti",     label: "Znalostná báza z dokumentov",        price: "od 190 €" },
  { id: "sprava-agent", label: "Správa a ladenie agenta",            price: "od 59 € / mes." },
];

const hybridAddons = [
  { id: "mobile-app", label: "Mobilná aplikácia",    price: "od 2 900 €" },
  { id: "ai-agent-h", label: "Vlastný AI agent",     price: "od 490 €" },
  { id: "dashboard",  label: "Analytický dashboard", price: "od 390 €" },
  { id: "devops",     label: "DevOps & CI/CD setup", price: "od 290 €" },
];

const CATEGORY_ACCENT: Record<string, string> = {
  web:        "var(--neon-primary)",
  agents:     "var(--neon-accent)",
  automation: "var(--neon-secondary)",
  hybrid:     "var(--neon-cold)",
};

const CATEGORY_LABEL: Record<string, string> = {
  web:        "WEB_PACKAGE",
  agents:     "AI_AGENTS",
  automation: "AUTOMATION_INVOICING",
  hybrid:     "HYBRID_STACK",
};

interface Props {
  open: boolean;
  onClose: () => void;
  packageCategory: "web" | "agents" | "automation" | "hybrid";
  packageName: string;
}

const ReservationModal = ({ open, onClose, packageCategory, packageName }: Props) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const { honeypot, setHoneypot, cooldown, startCooldown, canSubmit } = useFormSecurity();

  const accent = CATEGORY_ACCENT[packageCategory] ?? "var(--neon-primary)";
  const addons = packageCategory === "web" ? webAddons
    : packageCategory === "agents" ? agentAddons
    : packageCategory === "automation" ? automationAddons
    : hybridAddons;

  const toggleAddon = (id: string) =>
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setSent(false);
      setForm({ name: "", email: "", phone: "", message: "" });
      setErrors({});
      setSelectedAddons([]);
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
      const fe: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) fe[err.path[0] as string] = err.message; });
      setErrors(fe);
      return;
    }
    const addonLabels = selectedAddons.map((id) => addons.find((a) => a.id === id)?.label).filter(Boolean);
    const fullMessage = [result.data.message, addonLabels.length ? `Addons: ${addonLabels.join(", ")}` : ""].filter(Boolean).join("\n\n");
    setSending(true);
    const { error } = await supabase.from("reservations").insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      message: fullMessage || null,
      package_category: packageCategory,
      package_name: packageName,
    });
    setSending(false);
    if (error) { toast.error("Nepodarilo sa odoslať rezerváciu."); return; }
    startCooldown();
    setSent(true);
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 0,
    padding: "10px 12px",
    fontSize: "12px",
    fontFamily: "'JetBrains Mono', monospace",
    color: "var(--text-primary)",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#040608",
              border: `1px solid ${accent}33`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.6), 0 0 40px ${accent}11`,
              zIndex: 10,
            }}
          >
            {/* Top accent bar */}
            <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />

            {/* Header */}
            <div style={{
              padding: "18px 20px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}>
              <div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.22em",
                  color: accent,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}>
                  // {CATEGORY_LABEL[packageCategory]} — REZERVÁCIA
                </div>
                <div style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.2,
                }}>
                  {packageName}
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  padding: 6,
                  display: "flex",
                  alignItems: "center",
                  flexShrink: 0,
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "var(--text-dim)"; }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px" }}>
              <AnimatePresence mode="wait">
                {sent ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontFamily: "'JetBrains Mono', monospace", paddingBottom: 8 }}
                  >
                    <div style={{ fontSize: "9px", color: "var(--text-dim)", letterSpacing: "0.15em", marginBottom: 16 }}>
                      // TRANSMISSION_LOG
                    </div>
                    {[
                      "> PACKAGE SELECTED..............OK",
                      "> PAYLOAD ENCRYPTED.............OK",
                      "> REQUEST SENT..................OK",
                      "> QUEUE POSITION: #1............OK",
                    ].map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                        style={{ fontSize: "11px", color: accent, marginBottom: 5 }}
                      >
                        {line}
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <p style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: 16 }}>
                        Rezervácia balíčka <span style={{ color: "var(--text-primary)" }}>{packageName}</span> prijatá. Ozveme sa do 24h.
                      </p>
                      <button
                        onClick={handleClose}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "10px",
                          color: accent,
                          background: "transparent",
                          border: `1px solid ${accent}44`,
                          padding: "7px 14px",
                          cursor: "pointer",
                          letterSpacing: "0.1em",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = `${accent}0f`)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        [ ZAVRIEŤ ]
                      </button>
                    </motion.div>
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", gap: 14 }}
                  >
                    {/* Name */}
                    <div>
                      <FieldLabel accent={accent}>Meno *</FieldLabel>
                      <FocusInput
                        placeholder="Ján Novák"
                        value={form.name}
                        onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                        accent={accent}
                        base={inputBase}
                      />
                      {errors.name && <ErrMsg>{errors.name}</ErrMsg>}
                    </div>

                    {/* Email */}
                    <div>
                      <FieldLabel accent={accent}>Email *</FieldLabel>
                      <FocusInput
                        type="email"
                        placeholder="jan@firma.sk"
                        value={form.email}
                        onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                        accent={accent}
                        base={inputBase}
                      />
                      {errors.email && <ErrMsg>{errors.email}</ErrMsg>}
                    </div>

                    {/* Phone */}
                    <div>
                      <FieldLabel accent={accent}>Telefón (voliteľné)</FieldLabel>
                      <FocusInput
                        type="tel"
                        placeholder="+421 9XX XXX XXX"
                        value={form.phone}
                        onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                        accent={accent}
                        base={inputBase}
                      />
                    </div>

                    {/* Addons */}
                    <div>
                      <FieldLabel accent={accent}>Doplnkové služby</FieldLabel>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {addons.map((addon) => {
                          const active = selectedAddons.includes(addon.id);
                          return (
                            <button
                              key={addon.id}
                              type="button"
                              onClick={() => toggleAddon(addon.id)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                                padding: "9px 12px",
                                background: active ? `${accent}0d` : "rgba(255,255,255,0.02)",
                                border: `1px solid ${active ? accent + "44" : "rgba(255,255,255,0.06)"}`,
                                cursor: "pointer",
                                transition: "all 0.15s",
                                textAlign: "left",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {/* Custom checkbox */}
                                <div style={{
                                  width: 13, height: 13, flexShrink: 0,
                                  border: `1px solid ${active ? accent : "rgba(255,255,255,0.2)"}`,
                                  background: active ? accent : "transparent",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  transition: "all 0.15s",
                                }}>
                                  {active && (
                                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                      <path d="M1 3L3 5L7 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <span style={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: "11px",
                                  color: active ? "var(--text-primary)" : "var(--text-dim)",
                                  transition: "color 0.15s",
                                }}>
                                  {addon.label}
                                </span>
                              </div>
                              <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: "10px",
                                color: active ? accent : "var(--text-muted)",
                                whiteSpace: "nowrap",
                                transition: "color 0.15s",
                              }}>
                                {addon.price}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Note */}
                    <div>
                      <FieldLabel accent={accent}>Poznámka (voliteľné)</FieldLabel>
                      <textarea
                        placeholder="Akékoľvek detaily k projektu..."
                        rows={3}
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        style={{ ...inputBase, resize: "vertical" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = accent)}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                      />
                    </div>

                    {/* Honeypot */}
                    <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true" tabIndex={-1}>
                      <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} autoComplete="off" tabIndex={-1} />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={sending || cooldown > 0}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: "13px 20px",
                        background: accent,
                        color: "#000",
                        border: "none",
                        borderRadius: 0,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        cursor: sending || cooldown > 0 ? "not-allowed" : "pointer",
                        opacity: sending || cooldown > 0 ? 0.5 : 1,
                        boxShadow: `0 0 20px ${accent}33`,
                        transition: "opacity 0.2s, box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) => { if (!sending && cooldown === 0) e.currentTarget.style.boxShadow = `0 0 30px ${accent}55`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `0 0 20px ${accent}33`; }}
                    >
                      {sending ? (
                        <><Loader2 size={13} className="animate-spin" /> ODOSIELAM...</>
                      ) : cooldown > 0 ? (
                        `ČAKAJ ${cooldown}s`
                      ) : (
                        <><Send size={13} /> ODOSLAŤ REZERVÁCIU</>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Helpers ── */
const FieldLabel = ({ children, accent }: { children: React.ReactNode; accent: string }) => (
  <span style={{
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "9px",
    letterSpacing: "0.18em",
    color: "var(--text-dim)",
    textTransform: "uppercase",
    marginBottom: 5,
  }}>
    <span style={{ color: accent, marginRight: 4 }}>&gt;</span>
    {children}
  </span>
);

const ErrMsg = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    color: "var(--red-warning)",
    marginTop: 4,
  }}>! {children}</p>
);

const FocusInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  accent,
  base,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  accent: string;
  base: React.CSSProperties;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{ ...base }}
    onFocus={(e) => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.boxShadow = `0 0 0 1px ${accent}22`; }}
    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
  />
);

export default ReservationModal;
