import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Phone, Monitor, Zap, Bot, Layers } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFormSecurity } from "@/hooks/use-form-security";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import NeuralNetCanvas from "@/components/ui/neural-net-canvas";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné").max(100),
  email: z.string().trim().email("Neplatný email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Správa je povinná").max(2000),
  package_category: z.enum(["web", "agents", "automation", "hybrid", ""]).optional(),
  package_name: z.string().max(200).optional().or(z.literal("")),
});

const webPackageOptions = [
  "Starter – od 390 €",
  "Business – od 890 €",
  "Premium – od 2 200 €",
];

const automationPackageOptions = [
  "Flow – od 390 €",
  "System – od 1 200 €",
  "Enterprise – od 3 500 €",
];

const agentPackageOptions = [
  "Assistant – od 690 €",
  "Agent Pro – od 1 290 €",
  "Agent Fleet – od 2 900 €",
];

const hybridPackageOptions = [
  "Launch – od 1 490 €",
  "Scale – od 2 900 €",
  "Enterprise – od 5 500 €",
];

const MONO = "'JetBrains Mono', monospace";

/* Accent per category — css var for UI, raw rgb for glows, hex for the canvas tint */
const ACCENTS: Record<string, { css: string; raw: string; hex: string }> = {
  web:        { css: "var(--neon-primary)",   raw: "0,255,170",  hex: "#00ffaa" },
  agents:     { css: "var(--neon-accent)",    raw: "255,61,113", hex: "#ff3d71" },
  automation: { css: "var(--neon-secondary)", raw: "255,140,0",  hex: "#ff8c00" },
  hybrid:     { css: "var(--neon-cold)",      raw: "74,158,255", hex: "#4a9eff" },
};
const DEFAULT_ACCENT = { css: "var(--neon-primary)", raw: "0,255,170", hex: "#00ffaa" };

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 0,
  padding: "12px 14px",
  fontSize: "13px",
  fontFamily: MONO,
  color: "var(--text-primary)",
  outline: "none",
  transition: "border-color 0.25s ease, box-shadow 0.25s ease",
};

const NeonInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  accent = "var(--neon-primary)",
  accentRaw = "0,255,170",
  as: Tag = "input",
  rows,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  accent?: string;
  accentRaw?: string;
  as?: "input" | "textarea";
  rows?: number;
}) => {
  const [focused, setFocused] = useState(false);
  const style: React.CSSProperties = {
    ...baseInputStyle,
    borderColor: focused ? accent : "rgba(255,255,255,0.1)",
    boxShadow: focused
      ? `0 0 0 1px rgba(${accentRaw},0.25), 0 0 18px rgba(${accentRaw},0.1)`
      : "none",
    resize: Tag === "textarea" ? ("vertical" as const) : undefined,
  };

  if (Tag === "textarea") {
    return (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows || 5}
        style={style}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    );
  }
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={style}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
};

const FieldLabel = ({ children, accent = "var(--neon-primary)" }: { children: React.ReactNode; accent?: string }) => (
  <span style={{
    display: "block",
    fontFamily: MONO,
    fontSize: "10px",
    letterSpacing: "0.15em",
    color: "var(--text-dim)",
    textTransform: "uppercase",
    marginBottom: 6,
    transition: "color 0.25s ease",
  }}>
    <span style={{ color: accent, marginRight: 4, transition: "color 0.25s ease" }}>&gt;</span>
    {children}
  </span>
);

const ContactChip = ({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
}) => {
  const [hovered, setHovered] = useState(false);
  const content = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 14px",
        background: hovered ? "rgba(0,255,170,0.04)" : "transparent",
        border: `1px solid ${hovered ? "rgba(0,255,170,0.25)" : "rgba(255,255,255,0.07)"}`,
        transition: "all 0.2s",
        cursor: href ? "pointer" : "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon
        size={14}
        style={{ color: hovered ? "var(--neon-primary)" : "var(--text-dim)", flexShrink: 0, transition: "color 0.2s" }}
      />
      <span style={{
        fontFamily: MONO,
        fontSize: "12px",
        color: hovered ? "var(--text-primary)" : "var(--text-dim)",
        transition: "color 0.2s",
      }}>
        {label}
      </span>
    </div>
  );

  if (href) {
    return <a href={href} style={{ textDecoration: "none" }}>{content}</a>;
  }
  return content;
};

/* Terminal window title bar — three dots + process label */
const WindowTitleBar = ({ label, accent, accentRaw }: { label: string; accent: string; accentRaw: string }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
  }}>
    <div style={{ display: "flex", gap: 6 }} aria-hidden>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(255,95,86,0.75)" }} />
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(255,189,46,0.75)" }} />
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: "rgba(39,201,63,0.75)" }} />
    </div>
    <span style={{
      fontFamily: MONO,
      fontSize: "10px",
      letterSpacing: "0.15em",
      color: "var(--text-dim)",
      textTransform: "lowercase",
    }}>
      {label}
    </span>
    <span style={{
      marginLeft: "auto",
      fontFamily: MONO,
      fontSize: "9px",
      letterSpacing: "0.2em",
      color: accent,
      opacity: 0.6,
      border: `1px solid rgba(${accentRaw},0.25)`,
      padding: "2px 8px",
      transition: "color 0.4s ease, border-color 0.4s ease",
    }}>
      ENCRYPTED
    </span>
  </div>
);

/* Corner brackets around the window */
const CornerBrackets = ({ accentRaw }: { accentRaw: string }) => (
  <>
    <span aria-hidden className="pointer-events-none" style={{ position: "absolute", top: -1, left: -1, width: 16, height: 16, borderTop: `1px solid rgba(${accentRaw},0.6)`, borderLeft: `1px solid rgba(${accentRaw},0.6)`, transition: "border-color 0.4s ease" }} />
    <span aria-hidden className="pointer-events-none" style={{ position: "absolute", top: -1, right: -1, width: 16, height: 16, borderTop: `1px solid rgba(${accentRaw},0.6)`, borderRight: `1px solid rgba(${accentRaw},0.6)`, transition: "border-color 0.4s ease" }} />
    <span aria-hidden className="pointer-events-none" style={{ position: "absolute", bottom: -1, left: -1, width: 16, height: 16, borderBottom: `1px solid rgba(${accentRaw},0.6)`, borderLeft: `1px solid rgba(${accentRaw},0.6)`, transition: "border-color 0.4s ease" }} />
    <span aria-hidden className="pointer-events-none" style={{ position: "absolute", bottom: -1, right: -1, width: 16, height: 16, borderBottom: `1px solid rgba(${accentRaw},0.6)`, borderRight: `1px solid rgba(${accentRaw},0.6)`, transition: "border-color 0.4s ease" }} />
  </>
);

const Kontakt = () => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: "",
    package_category: "" as "" | "web" | "agents" | "automation" | "hybrid",
    package_name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { honeypot, setHoneypot, cooldown, startCooldown, canSubmit } = useFormSecurity();

  const accentSet = ACCENTS[form.package_category] ?? DEFAULT_ACCENT;
  const accent = accentSet.css;
  const accentRaw = accentSet.raw;
  const packageOptions = form.package_category === "web"
    ? webPackageOptions
    : form.package_category === "agents"
    ? agentPackageOptions
    : form.package_category === "automation"
    ? automationPackageOptions
    : form.package_category === "hybrid"
    ? hybridPackageOptions
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!canSubmit()) {
      if (honeypot) return;
      toast.error(`Počkajte ${cooldown}s pred ďalším odoslaním.`);
      return;
    }

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
    startCooldown();
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
  };

  return (
    <main className="min-h-screen bg-background text-foreground relative">
      {/* Blinking block cursor — the one decorative animation on this page */}
      <style>{`
        @keyframes kontakt-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .kontakt-caret { animation: kontakt-blink 1.1s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) { .kontakt-caret { animation: none; } }
      `}</style>

      {/* Neural net background — very subtle, tinted by selected category */}
      <NeuralNetCanvas accent={accentSet.hex} density={0.5} opacity={0.4} cursorForce={0.5} />

      <div className="relative z-10">
        <Navbar />

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.section
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ paddingTop: 160, paddingBottom: 120, paddingLeft: 20, paddingRight: 20 }}
            >
              <div style={{ maxWidth: 560, margin: "0 auto", position: "relative" }}>
                <CornerBrackets accentRaw="0,255,170" />
                {/* Terminal success window */}
                <div style={{
                  background: "rgba(2,4,6,0.75)",
                  border: "1px solid rgba(0,255,170,0.2)",
                }}>
                  <WindowTitleBar label="kontakt.exe — secure channel" accent="var(--neon-primary)" accentRaw="0,255,170" />
                  <div style={{ padding: "32px 28px", fontFamily: MONO }}>
                    <div style={{ fontSize: "10px", color: "var(--text-dim)", marginBottom: 20, letterSpacing: "0.1em" }}>
                      // TRANSMISSION_STATUS
                    </div>
                    {[
                      "> CONNECTING TO SERVER..........OK",
                      "> ENCRYPTING PAYLOAD............OK",
                      "> SENDING MESSAGE...............OK",
                      "> ACKNOWLEDGEMENT RECEIVED......OK",
                    ].map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.15 }}
                        style={{ fontSize: "12px", color: "var(--neon-primary)", marginBottom: 6 }}
                      >
                        {line}
                      </motion.div>
                    ))}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 700, marginBottom: 8 }}>
                        Správa odoslaná.
                        <span className="kontakt-caret" aria-hidden style={{ color: "var(--neon-primary)", marginLeft: 6 }}>█</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-dim)", marginBottom: 24 }}>
                        Ozveme sa čo najskôr — zvyčajne do 24h.
                      </div>
                      <button
                        onClick={() => {
                          setSent(false);
                          setForm({ name: "", email: "", phone: "", message: "", package_category: "", package_name: "" });
                        }}
                        style={{
                          fontFamily: MONO,
                          fontSize: "11px",
                          color: "var(--neon-primary)",
                          background: "transparent",
                          border: "1px solid rgba(0,255,170,0.3)",
                          padding: "8px 16px",
                          cursor: "pointer",
                          letterSpacing: "0.08em",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(0,255,170,0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        [ NOVÁ SPRÁVA ]
                      </button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ paddingTop: 140, paddingBottom: 100, paddingLeft: 20, paddingRight: 20 }}
            >
              <div style={{ maxWidth: 960, margin: "0 auto" }}>

                {/* Header — static, only the block cursor blinks */}
                <div style={{ marginBottom: 48 }}>
                  <div style={{
                    fontFamily: MONO,
                    fontSize: "11px",
                    color: "var(--neon-primary)",
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}>
                    // CONTACT_MODULE — INITIALIZED
                  </div>
                  <h1 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
                    fontWeight: 800,
                    lineHeight: 1.0,
                    letterSpacing: "-0.02em",
                    color: "var(--text-primary)",
                    margin: 0,
                  }}>
                    Naviaž<br />
                    <span style={{ color: "var(--neon-primary)" }}>spojenie</span>
                    <span className="kontakt-caret" aria-hidden style={{ color: "var(--neon-primary)", marginLeft: 10 }}>█</span>
                  </h1>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "15px",
                    color: "var(--text-dim)",
                    marginTop: 16,
                    maxWidth: 440,
                  }}>
                    Máš projekt, nápad alebo otázku? Pošli správu — odpovieme do 24h.
                  </p>
                </div>

                {/* ── Terminal window — the centerpiece ── */}
                <div style={{ position: "relative" }}>
                  <CornerBrackets accentRaw={accentRaw} />
                  <div style={{
                    background: "rgba(2,4,6,0.72)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}>
                    <WindowTitleBar label="kontakt.exe — secure channel" accent={accent} accentRaw={accentRaw} />

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr]">

                      {/* Left — contact info */}
                      <div className="md:border-r md:border-white/[0.08]" style={{ padding: "32px 28px" }}>
                        <div style={{
                          fontFamily: MONO,
                          fontSize: "10px",
                          letterSpacing: "0.2em",
                          color: "var(--text-dim)",
                          textTransform: "uppercase",
                          marginBottom: 16,
                        }}>
                          DIRECT_LINK
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 40 }}>
                          <ContactChip icon={Mail} label="studio@coktech.tech" href="mailto:studio@coktech.tech" />
                          <ContactChip icon={Phone} label="+421 911 640 660" href="tel:+421911640660" />
                          <ContactChip icon={MapPin} label="Levice, Slovensko" />
                        </div>

                        {/* Response time block */}
                        <div style={{
                          background: "rgba(0,255,170,0.03)",
                          border: "1px solid rgba(0,255,170,0.1)",
                          padding: "16px 18px",
                        }}>
                          <div style={{
                            fontFamily: MONO,
                            fontSize: "10px",
                            color: "var(--text-dim)",
                            letterSpacing: "0.15em",
                            marginBottom: 10,
                          }}>
                            SYSTEM_STATUS
                          </div>
                          {[
                            { label: "Odozva", value: "< 24h" },
                            { label: "Dostupnosť", value: "Po–Pi" },
                            { label: "Zóna", value: "UTC+1" },
                          ].map((row) => (
                            <div
                              key={row.label}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "5px 0",
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                              }}
                            >
                              <span style={{ fontFamily: MONO, fontSize: "11px", color: "var(--text-dim)" }}>
                                {row.label}
                              </span>
                              <span style={{ fontFamily: MONO, fontSize: "11px", color: "var(--neon-primary)" }}>
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right — form */}
                      <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-5"
                        style={{ padding: "32px 28px" }}
                      >
                        {/* Name + Email row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <FieldLabel accent={accent}>Meno *</FieldLabel>
                            <NeonInput
                              placeholder="Ján Novák"
                              value={form.name}
                              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                              accent={accent}
                              accentRaw={accentRaw}
                            />
                            {errors.name && <ErrMsg>{errors.name}</ErrMsg>}
                          </div>
                          <div>
                            <FieldLabel accent={accent}>Email *</FieldLabel>
                            <NeonInput
                              type="email"
                              placeholder="jan@firma.sk"
                              value={form.email}
                              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                              accent={accent}
                              accentRaw={accentRaw}
                            />
                            {errors.email && <ErrMsg>{errors.email}</ErrMsg>}
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <FieldLabel accent={accent}>Telefón (voliteľné)</FieldLabel>
                          <NeonInput
                            type="tel"
                            placeholder="+421 9XX XXX XXX"
                            value={form.phone}
                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                            accent={accent}
                            accentRaw={accentRaw}
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <FieldLabel accent={accent}>Typ projektu</FieldLabel>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {[
                              { id: "web",        label: "Web / E-shop",              icon: Monitor, color: "var(--neon-primary)" },
                              { id: "agents",     label: "AI Agenti",                  icon: Bot,     color: "var(--neon-accent)" },
                              { id: "automation", label: "Automatizácie & Fakturácia", icon: Zap,     color: "var(--neon-secondary)" },
                              { id: "hybrid",     label: "Hybrid Stack",               icon: Layers,  color: "var(--neon-cold)" },
                            ].map(({ id, label, icon: Icon, color }) => {
                              const active = form.package_category === id;
                              return (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => setForm((p) => ({
                                    ...p,
                                    package_category: p.package_category === id ? "" : id as typeof form.package_category,
                                    package_name: "",
                                  }))}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    padding: "9px 12px",
                                    fontFamily: MONO,
                                    fontSize: "11px",
                                    background: active ? `${color}14` : "transparent",
                                    border: `1px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
                                    color: active ? color : "var(--text-dim)",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    borderRadius: 0,
                                    letterSpacing: "0.05em",
                                  }}
                                >
                                  <Icon size={13} />
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Package — plain conditional, no motion */}
                        {form.package_category && (
                          <div>
                            <FieldLabel accent={accent}>Balíček</FieldLabel>
                            <select
                              value={form.package_name}
                              onChange={(e) => setForm((p) => ({ ...p, package_name: e.target.value }))}
                              style={{
                                ...baseInputStyle,
                                background: "rgba(2,4,6,0.9)",
                              }}
                              onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
                              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                            >
                              <option value="">— vyber balíček —</option>
                              {packageOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Message */}
                        <div>
                          <FieldLabel accent={accent}>Správa *</FieldLabel>
                          <NeonInput
                            as="textarea"
                            placeholder="Opíš projekt, cieľ, alebo čo potrebuješ vyriešiť..."
                            value={form.message}
                            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                            rows={5}
                            accent={accent}
                            accentRaw={accentRaw}
                          />
                          {errors.message && <ErrMsg>{errors.message}</ErrMsg>}
                        </div>

                        {/* Honeypot */}
                        <div style={{ position: "absolute", left: "-9999px", opacity: 0 }} aria-hidden="true" tabIndex={-1}>
                          <input
                            type="text"
                            name="website_url"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            autoComplete="off"
                            tabIndex={-1}
                          />
                        </div>

                        {/* Submit — plain button, CSS transitions only */}
                        <button
                          type="submit"
                          disabled={sending || cooldown > 0}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 10,
                            padding: "14px 28px",
                            background: sending ? "transparent" : accent,
                            color: sending ? accent : "#000",
                            border: sending ? `1px solid rgba(${accentRaw},0.4)` : "1px solid transparent",
                            borderRadius: 0,
                            fontFamily: MONO,
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            cursor: sending || cooldown > 0 ? "not-allowed" : "pointer",
                            opacity: cooldown > 0 && !sending ? 0.5 : 1,
                            boxShadow: sending ? "none" : `0 0 24px rgba(${accentRaw},0.2)`,
                            transition: "background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease, border-color 0.25s ease",
                          }}
                        >
                          {sending ? (
                            <>&gt; ODOSIELAM<span className="kontakt-caret" aria-hidden>█</span></>
                          ) : cooldown > 0 ? (
                            `ČAKAJ ${cooldown}s`
                          ) : (
                            <>&gt; ODOSLAŤ SPRÁVU</>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </main>
  );
};

const ErrMsg = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontFamily: MONO,
    fontSize: "10px",
    color: "var(--red-warning)",
    marginTop: 5,
    letterSpacing: "0.05em",
  }}>
    ! {children}
  </p>
);

export default Kontakt;
