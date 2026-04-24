import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Phone, Send, Loader2, Monitor, Zap, TrendingUp, Layers } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useFormSecurity } from "@/hooks/use-form-security";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Meno je povinné").max(100),
  email: z.string().trim().email("Neplatný email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Správa je povinná").max(2000),
  package_category: z.enum(["web", "automation", "marketing", "hybrid", ""]).optional(),
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

const marketingPackageOptions = [
  "Starter – od 290 €",
  "Growth – od 690 €",
  "Authority – od 1 490 €",
];

const hybridPackageOptions = [
  "Launch – od 1 490 €",
  "Scale – od 2 900 €",
  "Enterprise – od 5 500 €",
];

const inputStyle = (accent = "var(--neon-primary)") => ({
  width: "100%",
  background: "rgba(0,0,0,0.5)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 0,
  padding: "12px 14px",
  fontSize: "13px",
  fontFamily: "'JetBrains Mono', monospace",
  color: "var(--text-primary)",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
});

const NeonInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  accent = "var(--neon-primary)",
  as: Tag = "input",
  rows,
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  accent?: string;
  as?: "input" | "textarea";
  rows?: number;
}) => {
  const [focused, setFocused] = useState(false);
  const style = {
    ...inputStyle(accent),
    borderColor: focused ? accent : "rgba(255,255,255,0.08)",
    boxShadow: focused ? `0 0 0 1px ${accent}22, inset 0 0 20px rgba(0,0,0,0.3)` : "none",
    resize: Tag === "textarea" ? "vertical" as const : undefined,
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

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    letterSpacing: "0.15em",
    color: "var(--text-dim)",
    textTransform: "uppercase",
    marginBottom: 6,
  }}>
    <span style={{ color: "var(--neon-primary)", marginRight: 4 }}>&gt;</span>
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
        padding: "12px 16px",
        background: hovered ? "rgba(0,255,170,0.04)" : "rgba(0,0,0,0.3)",
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
        fontFamily: "'JetBrains Mono', monospace",
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

const Kontakt = () => {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", message: "",
    package_category: "" as "" | "web" | "automation" | "marketing" | "hybrid",
    package_name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { honeypot, setHoneypot, cooldown, startCooldown, canSubmit } = useFormSecurity();

  const accentMap: Record<string, string> = {
    web: "var(--neon-primary)",
    automation: "var(--neon-secondary)",
    marketing: "var(--neon-accent)",
    hybrid: "var(--neon-cold)",
  };
  const accent = accentMap[form.package_category] ?? "var(--neon-primary)";
  const packageOptions = form.package_category === "web"
    ? webPackageOptions
    : form.package_category === "automation"
    ? automationPackageOptions
    : form.package_category === "marketing"
    ? marketingPackageOptions
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
    <main className="min-h-screen bg-background text-foreground">
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
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
              {/* Terminal success block */}
              <div style={{
                background: "rgba(0,0,0,0.6)",
                border: "1px solid rgba(0,255,170,0.2)",
                padding: "32px 28px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
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
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
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
                      fontFamily: "'JetBrains Mono', monospace",
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
          </motion.section>
        ) : (
          <motion.section
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ paddingTop: 140, paddingBottom: 100, paddingLeft: 20, paddingRight: 20 }}
          >
            <div style={{ maxWidth: 900, margin: "0 auto" }}>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: 56 }}
              >
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
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
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-10">

                {/* Left — contact info */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                >
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
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
                      fontFamily: "'JetBrains Mono', monospace",
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
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--text-dim)" }}>
                          {row.label}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--neon-primary)" }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Right — form */}
                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: 18 }}
                >
                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Meno *</FieldLabel>
                      <NeonInput
                        placeholder="Ján Novák"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      />
                      {errors.name && <ErrMsg>{errors.name}</ErrMsg>}
                    </div>
                    <div>
                      <FieldLabel>Email *</FieldLabel>
                      <NeonInput
                        type="email"
                        placeholder="jan@firma.sk"
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      />
                      {errors.email && <ErrMsg>{errors.email}</ErrMsg>}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <FieldLabel>Telefón (voliteľné)</FieldLabel>
                    <NeonInput
                      type="tel"
                      placeholder="+421 9XX XXX XXX"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <FieldLabel>Typ projektu</FieldLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {[
                        { id: "web",        label: "Web / E-shop",      icon: Monitor,    color: "var(--neon-primary)" },
                        { id: "automation", label: "AI Automatizácia",   icon: Zap,        color: "var(--neon-secondary)" },
                        { id: "marketing",  label: "AI Marketing",       icon: TrendingUp, color: "var(--neon-accent)" },
                        { id: "hybrid",     label: "Hybrid Stack",       icon: Layers,     color: "var(--neon-cold)" },
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
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: "11px",
                              background: active ? `${color}14` : "rgba(0,0,0,0.4)",
                              border: `1px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
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

                  {/* Package */}
                  <AnimatePresence>
                    {form.package_category && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <FieldLabel>Balíček</FieldLabel>
                        <select
                          value={form.package_name}
                          onChange={(e) => setForm((p) => ({ ...p, package_name: e.target.value }))}
                          style={{
                            ...inputStyle(),
                            borderColor: "rgba(255,255,255,0.08)",
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = accent}
                          onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                        >
                          <option value="">— vyber balíček —</option>
                          {packageOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Message */}
                  <div>
                    <FieldLabel>Správa *</FieldLabel>
                    <NeonInput
                      as="textarea"
                      placeholder="Opíš projekt, cieľ, alebo čo potrebuješ vyriešiť..."
                      value={form.message}
                      onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                      rows={5}
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

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={sending || cooldown > 0}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      padding: "14px 28px",
                      background: accent,
                      color: "#000",
                      border: "none",
                      borderRadius: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      cursor: sending || cooldown > 0 ? "not-allowed" : "pointer",
                      opacity: sending || cooldown > 0 ? 0.5 : 1,
                      boxShadow: `0 0 24px ${form.package_category === "automation" ? "rgba(255,140,0,0.25)" : "rgba(0,255,170,0.2)"}`,
                      transition: "box-shadow 0.2s, opacity 0.2s",
                    }}
                  >
                    {sending ? (
                      <><Loader2 size={15} className="animate-spin" /> ODOSIELAM...</>
                    ) : cooldown > 0 ? (
                      `ČAKAJ ${cooldown}s`
                    ) : (
                      <><Send size={15} /> ODOSLAŤ SPRÁVU</>
                    )}
                  </motion.button>
                </motion.form>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
};

const ErrMsg = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    color: "var(--red-warning)",
    marginTop: 5,
    letterSpacing: "0.05em",
  }}>
    ! {children}
  </p>
);

export default Kontakt;
