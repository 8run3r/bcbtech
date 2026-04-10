import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Navbar from "@/components/landing/Navbar";
import { useNavAccent } from "@/components/landing/Navbar";
import FooterCTA from "@/components/landing/FooterCTA";
import Scanlines from "@/components/ui/scanlines";
import PretextHeadline from "@/components/ui/pretext-headline";
import FluidCursor from "@/components/landing/FluidCursor";

/* ── Section color themes ── */
const SECTION_THEMES = [
  { id: "hero",      color: "#00ffaa", raw: "0,255,170",   label: "DISCOVER" },
  { id: "stats",     color: "#00ffaa", raw: "0,255,170",   label: "METRICS" },
  { id: "arguments", color: "#4A9EFF", raw: "74,158,255",  label: "LOGIKA" },
  { id: "process",   color: "#FF8C00", raw: "255,140,0",   label: "PROCESS" },
  { id: "roi",       color: "#FF8C00", raw: "255,140,0",   label: "ROI" },
  { id: "compare",   color: "#FF3D71", raw: "255,61,113",  label: "VS" },
  { id: "cta",       color: "#00ffaa", raw: "0,255,170",   label: "CONNECT" },
];

/* ── Glitch text effect ── */
const GlitchText = ({ children, color = "var(--neon-primary)" }: { children: string; color?: string }) => {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block">
      {children}
      {glitch && (
        <>
          <span className="absolute inset-0" style={{ color, opacity: 0.7, transform: "translate(2px, -1px)", clipPath: "inset(10% 0 60% 0)" }}>
            {children}
          </span>
          <span className="absolute inset-0" style={{ color, opacity: 0.5, transform: "translate(-2px, 1px)", clipPath: "inset(50% 0 10% 0)" }}>
            {children}
          </span>
        </>
      )}
    </span>
  );
};

/* ── Animated counter ── */
const AnimCounter = ({ value, suffix = "", color, delay = 0 }: { value: string; suffix?: string; color: string; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");
  const numVal = parseFloat(value.replace(/[^0-9.]/g, ""));

  useEffect(() => {
    if (!inView) return;
    const timeout = setTimeout(() => {
      let start = 0;
      const duration = 1200;
      const startTime = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        start = numVal * eased;
        setDisplay(numVal % 1 === 0 ? Math.floor(start).toString() : start.toFixed(numVal < 10 ? 1 : 0));
        if (progress < 1) requestAnimationFrame(animate);
        else setDisplay(value);
      };
      requestAnimationFrame(animate);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [inView, value, numVal, delay]);

  return (
    <div ref={ref}>
      <span style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(2.5rem, 6vw, 4rem)",
        color,
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}>
        {display}{suffix}
      </span>
    </div>
  );
};

/* ── Section wrapper ── */
const Section = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => (
  <section id={id} className={`relative py-28 px-6 overflow-hidden ${className}`} style={{ background: "transparent" }}>
    {children}
  </section>
);

/* ── Argument block — redesigned ── */
const Argument = ({ number, title, body, color, delay }: { number: string; title: string; body: string; color: string; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
      style={{ padding: "28px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}
    >
      <div className="flex gap-6 items-start">
        <div
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
          style={{
            border: `1px solid ${color}40`,
            transform: "rotate(45deg)",
          }}
        >
          <span style={{
            transform: "rotate(-45deg)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color,
            letterSpacing: "0.05em",
          }}>
            {number}
          </span>
        </div>
        <div>
          <h3 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.1rem, 2vw, 1.4rem)",
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}>
            <GlitchText color={color}>{title}</GlitchText>
          </h3>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "rgba(200,196,208,0.35)",
            lineHeight: 1.7,
            maxWidth: 480,
          }}>
            {body}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/* ── Comparison row — enhanced ── */
const CompareRow = ({ label, us, them, delay }: { label: string; us: string; them: string; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -10 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="grid grid-cols-3 gap-4 py-5 transition-all duration-300"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.03)",
        background: hovered ? "rgba(0,255,170,0.02)" : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "var(--neon-primary)", textAlign: "center" }}>{us}</span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-muted)", opacity: 0.35, textAlign: "center", textDecoration: "line-through" }}>{them}</span>
    </motion.div>
  );
};

/* ── ROI Calculator ── */
const ROICalculator = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hours, setHours] = useState(20);
  const [rate, setRate] = useState(25);
  const [people, setPeople] = useState(3);
  const [showResult, setShowResult] = useState(false);
  const [animatedSavings, setAnimatedSavings] = useState(0);

  const monthlyCost = hours * rate * people;
  const automationSavings = Math.floor(monthlyCost * 0.7);
  const yearlySavings = automationSavings * 12;
  const paybackWeeks = Math.ceil(2200 / (automationSavings / 4));

  const calculate = useCallback(() => {
    setShowResult(true);
    let current = 0;
    const target = automationSavings;
    const step = target / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      setAnimatedSavings(Math.floor(current));
    }, 25);
  }, [automationSavings]);

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-10">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "var(--neon-secondary)", letterSpacing: "0.25em", opacity: 0.4 }}>
            INTERACTIVE // ROI_CALC
          </span>
          <h3 className="mt-3" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Koľko ušetríte s automatizáciou?
          </h3>
        </div>

        <div className="p-6 sm:p-8 relative" style={{ background: "rgba(255,140,0,0.02)", border: "1px solid rgba(255,140,0,0.06)" }}>
          {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((cls, i) => (
            <span key={i} className={`absolute w-3 h-3 ${cls}`} style={{ borderColor: "rgba(255,140,0,0.15)" }} />
          ))}

          <div className="space-y-8">
            <SliderInput label="Hodiny manuálnej práce / mesiac" value={hours} min={5} max={80} step={5} unit="hod" color="var(--neon-secondary)" onChange={setHours} />
            <SliderInput label="Priemerná hodinová sadzba" value={rate} min={10} max={80} step={5} unit="€/hod" color="var(--neon-secondary)" onChange={setRate} />
            <SliderInput label="Počet ľudí v tíme" value={people} min={1} max={20} step={1} unit="ľudí" color="var(--neon-secondary)" onChange={setPeople} />

            <div className="flex items-center justify-between py-3 px-4" style={{ background: "rgba(255,140,0,0.04)", border: "1px solid rgba(255,140,0,0.06)" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>AKTUÁLNY MESAČNÝ NÁKLAD</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "var(--neon-secondary)" }}>{monthlyCost.toLocaleString()} €</span>
            </div>

            <button
              onClick={calculate}
              className="w-full py-3 transition-all duration-300 hover:scale-[1.01]"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: "0.15em", color: "#000", background: "var(--neon-secondary)", border: "none", cursor: "none" }}
            >
              [ VYPOČÍTAŤ ÚSPORU ]
            </button>
          </div>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 pt-8"
                style={{ borderTop: "1px solid rgba(255,140,0,0.08)" }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <ResultCard label="MESAČNÁ ÚSPORA" value={`${animatedSavings.toLocaleString()} €`} color="var(--neon-secondary)" delay={0.2} />
                  <ResultCard label="ROČNÁ ÚSPORA" value={`${yearlySavings.toLocaleString()} €`} color="var(--neon-primary)" delay={0.4} />
                  <ResultCard label="NÁVRATNOSŤ" value={`${paybackWeeks} týždňov`} color="var(--neon-primary)" delay={0.6} />
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 1 }}
                  className="mt-6 text-center"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.05em" }}
                >
                  * Odhad na základe 70% redukcie manuálnej práce.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Slider ── */
const SliderInput = ({ label, value, min, max, step, unit, color, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; color: string; onChange: (v: number) => void }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color }}>{value} {unit}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute left-0 right-0 h-px" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="absolute left-0 h-px" style={{ width: `${pct}%`, background: color, opacity: 0.5 }} />
        <div className="absolute h-3 w-px" style={{ left: `${pct}%`, background: color, transform: "translateX(-50%)" }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-none" style={{ height: 24 }} />
      </div>
    </div>
  );
};

/* ── Result card ── */
const ResultCard = ({ label, value, color, delay }: { label: string; value: string; color: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    className="p-5 text-center"
    style={{ background: `${color}06`, border: `1px solid ${color}12` }}
  >
    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color, opacity: 0.5, letterSpacing: "0.2em", display: "block" }}>{label}</span>
    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color, display: "block", marginTop: 6 }}>{value}</span>
  </motion.div>
);

/* ── Process Timeline — vertical with pulse nodes ── */
const ProcessTimeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const steps = [
    { phase: "01", title: "Discovery Call", desc: "30 min. Pochopíme váš biznis, ciele a pain points.", time: "Deň 1", color: "var(--neon-primary)" },
    { phase: "02", title: "Návrh & Cenová ponuka", desc: "Transparentná ponuka so scope, cenou a timeline-om.", time: "Deň 2-3", color: "var(--neon-primary)" },
    { phase: "03", title: "Vývoj & Iterácie", desc: "Stavby s pravidelnými demo-mi. Vidíte progres každý týždeň.", time: "Deň 4-14", color: "var(--neon-secondary)" },
    { phase: "04", title: "Launch & Podpora", desc: "Deployment, monitoring, optimalizácia. Neodchádzame.", time: "Ongoing", color: "var(--neon-accent)" },
  ];

  return (
    <div ref={ref} className="max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, rgba(0,255,170,0.2), rgba(255,61,113,0.2))" }} />

        <div className="space-y-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.phase}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex gap-6 items-start relative"
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center relative z-10" style={{ background: "var(--bg-base, #000)" }}>
                <motion.div
                  className="w-7 h-7 flex items-center justify-center"
                  style={{ border: `1px solid ${step.color}`, transform: "rotate(45deg)" }}
                  animate={{ boxShadow: [`0 0 0px ${step.color}00`, `0 0 15px ${step.color}30`, `0 0 0px ${step.color}00`] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                >
                  <span style={{ transform: "rotate(-45deg)", fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: step.color }}>{step.phase}</span>
                </motion.div>
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{step.title}</h4>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: step.color, opacity: 0.4, letterSpacing: "0.1em" }}>{step.time}</span>
                </div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(200,196,208,0.35)", lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Horizontal scrolling text band ── */
const MarqueeBand = ({ text, color, speed = 30 }: { text: string; color: string; speed?: number }) => (
  <div className="overflow-hidden py-4" style={{ borderTop: `1px solid ${color}10`, borderBottom: `1px solid ${color}10` }}>
    <motion.div
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      className="flex whitespace-nowrap"
    >
      {[0, 1].map((i) => (
        <span key={i} className="inline-block" style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(3rem, 8vw, 6rem)",
          color,
          opacity: 0.04,
          letterSpacing: "-0.04em",
          paddingRight: "4rem",
        }}>
          {text}
        </span>
      ))}
    </motion.div>
  </div>
);

/* ── Floating color palette indicator ── */
const ColorPalette = ({ activeIndex }: { activeIndex: number }) => (
  <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2">
    {SECTION_THEMES.map((theme, i) => (
      <button
        key={theme.id}
        onClick={() => document.getElementById(theme.id)?.scrollIntoView({ behavior: "smooth" })}
        className="group relative flex items-center"
        style={{ cursor: "pointer", background: "transparent", border: "none", padding: "2px 0" }}
      >
        <motion.div
          animate={{
            width: i === activeIndex ? 16 : 4,
            height: 4,
            background: i === activeIndex ? theme.color : "rgba(255,255,255,0.12)",
            boxShadow: i === activeIndex ? `0 0 8px ${theme.color}50` : "none",
          }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ borderRadius: 1 }}
        />
        <span
          className="absolute right-full mr-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 7,
            color: theme.color,
            letterSpacing: "0.15em",
          }}
        >
          {theme.label}
        </span>
      </button>
    ))}
  </div>
);

/* ── Main ── */
const Logika = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });
  const { setAccent } = useNavAccent();
  const [activeSection, setActiveSection] = useState(0);

  // Track which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTION_THEMES.forEach((theme, i) => {
      const el = document.getElementById(theme.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(i);
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Sync navbar accent with active section
  useEffect(() => {
    const theme = SECTION_THEMES[activeSection];
    setAccent(theme.color, theme.raw);
    return () => setAccent("var(--neon-primary)", "0,255,170");
  }, [activeSection, setAccent]);

  return (
    <>
      <Scanlines />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <FluidCursor blobCount={6} intensity={1} />
      </div>
      <ColorPalette activeIndex={activeSection} />
      <main style={{ background: "transparent", minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <Navbar />

        {/* ── Hero — full viewport, dramatic ── */}
        <div ref={heroRef} id="hero" className="min-h-screen flex items-center justify-center px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "var(--neon-primary)",
                letterSpacing: "0.3em",
                opacity: 0.4,
                marginBottom: 24,
                textTransform: "uppercase",
              }}>
                Prečo CokTech
              </p>

              <div className="max-w-3xl mx-auto mb-10">
                <PretextHeadline
                  text="Najjednoduchšia voľba pre váš biznis."
                  fontSize={48}
                  color="var(--text-primary)"
                  stagger={0.06}
                  triggered={heroInView}
                />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-12"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "clamp(15px, 1.5vw, 18px)",
                  color: "rgba(200,196,208,0.35)",
                  lineHeight: 1.7,
                  maxWidth: 520,
                  margin: "3rem auto 0",
                }}
              >
                Veľké firmy platia za veľké agentúry. My dodávame rovnakú kvalitu za zlomok ceny — bez overhead-u, bez zbytočných meeting-ov.
              </motion.p>

              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 0.3 } : {}}
                transition={{ delay: 1.5 }}
                className="mt-16"
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "var(--neon-primary)", letterSpacing: "0.2em" }}
                >
                  SCROLL
                </motion.div>
                <motion.div
                  animate={{ scaleY: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ width: 1, height: 30, background: "var(--neon-primary)", opacity: 0.3, margin: "8px auto 0" }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ── Marquee band ── */}
        <MarqueeBand text="ZERO OVERHEAD · FULL RESULTS · ZERO OVERHEAD · FULL RESULTS ·" color="var(--neon-primary)" speed={40} />

        {/* ── Stats — big animated numbers ── */}
        <Section id="stats">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { value: "3", suffix: "×", label: "Rýchlejšie dodanie", color: "var(--neon-primary)", delay: 0 },
              { value: "60", suffix: "%", label: "Nižšie náklady", color: "var(--neon-primary)", delay: 0.15 },
              { value: "24", suffix: "h", label: "Čas na odpoveď", color: "var(--neon-secondary)", delay: 0.3 },
              { value: "0", suffix: "", label: "Skrytých poplatkov", color: "var(--neon-accent)", delay: 0.45 },
            ].map((s) => (
              <div key={s.label}>
                <AnimCounter value={s.value} suffix={s.suffix} color={s.color} delay={s.delay} />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(200,196,208,0.3)", marginTop: 8 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Arguments ── */}
        <Section id="arguments">
          <div className="max-w-2xl mx-auto">
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "var(--neon-primary)", letterSpacing: "0.25em", opacity: 0.4, marginBottom: 12 }}>LOGIKA</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 32 }}>
              5 dôvodov prečo <span style={{ color: "var(--neon-primary)" }}>CokTech</span>
            </h2>
            <Argument number="01" title="Žiadny overhead" body="Sme malý, fokusovaný tím. Neplatíte za projektového manažéra, account manažéra a 5 ľudí na meetingoch. Platíte za výsledok." color="var(--neon-primary)" delay={0} />
            <Argument number="02" title="Enterprise kvalita, startup cena" body="Používame rovnaký stack a best practices ako top agentúry — React, TypeScript, CI/CD, monitoring. Rozdiel? Naša marža nie je 300%." color="var(--neon-primary)" delay={0.08} />
            <Argument number="03" title="Transparentný proces" body="Každý týždeň vidíte progres. Staging link, live demo, changelog. Žiadne 'to bude hotové o mesiac a potom uvidíte'." color="var(--neon-cold)" delay={0.16} />
            <Argument number="04" title="Automation = ROI na steroidoch" body="Automatizujeme repetitívne procesy vášho tímu. n8n, Claude API, Make. Jeden workflow vám ušetrí 40+ hodín mesačne." color="var(--neon-secondary)" delay={0.24} />
            <Argument number="05" title="Dlhodobý partner, nie vendor" body="Po spustení neodchádzame. Monitoring, údržba, iterácie. Keď rastie váš biznis, rastie váš produkt." color="var(--neon-accent)" delay={0.32} />
          </div>
        </Section>

        {/* ── Marquee band 2 ── */}
        <MarqueeBand text="WEB · AI · AUTOMATION · MARKETING · WEB · AI · AUTOMATION · MARKETING ·" color="var(--neon-secondary)" speed={35} />

        {/* ── Process Timeline ── */}
        <Section id="process">
          <div className="max-w-2xl mx-auto">
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "var(--neon-primary)", letterSpacing: "0.25em", opacity: 0.4, marginBottom: 12 }}>PROCESS</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 40 }}>
              Od nápadu po launch za <span style={{ color: "var(--neon-secondary)" }}>14 dní</span>
            </h2>
          </div>
          <ProcessTimeline />
        </Section>

        {/* ── ROI Calculator ── */}
        <Section id="roi">
          <ROICalculator />
        </Section>

        {/* ── Comparison ── */}
        <Section id="compare">
          <div className="max-w-2xl mx-auto">
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.25em", opacity: 0.4, marginBottom: 12 }}>VS. TRADIČNÁ AGENTÚRA</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 32 }}>
              Porovnanie
            </h2>
            <div className="grid grid-cols-3 gap-4 mb-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span />
              <span className="text-center" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: "var(--neon-primary)" }}>CokTech</span>
              <span className="text-center" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--text-dim)", opacity: 0.4 }}>Agentúra</span>
            </div>
            <CompareRow label="Landing page" us="od 890 €" them="3 000 – 8 000 €" delay={0} />
            <CompareRow label="E-commerce" us="od 2 200 €" them="10 000 – 25 000 €" delay={0.06} />
            <CompareRow label="SaaS MVP" us="od 4 500 €" them="20 000 – 50 000 €" delay={0.12} />
            <CompareRow label="Automation flow" us="od 390 €" them="2 000 – 5 000 €" delay={0.18} />
            <CompareRow label="Dodanie" us="5 – 14 dní" them="4 – 12 týždňov" delay={0.24} />
            <CompareRow label="Komunikácia" us="Priama, denne" them="PM prostredník" delay={0.3} />
          </div>
        </Section>

        {/* ── CTA ── */}
        <Section id="cta">
          <div className="max-w-2xl mx-auto text-center">
            <PretextHeadline
              text="Menej overhead. Viac výsledkov."
              fontSize={38}
              color="var(--text-primary)"
              stagger={0.07}
              triggered
              className="mb-8"
            />
            <p className="mt-12 mb-10" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(200,196,208,0.35)", lineHeight: 1.7 }}>
              Ukážeme vám na 30-minútovom calle, koľko by ste ušetrili s nami vs. tradičná agentúra.
            </p>
            <a
              href="mailto:studio@coktech.tech"
              className="inline-block px-8 py-3.5 text-sm transition-all duration-300"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                color: "var(--neon-primary)",
                border: "1px solid rgba(0,255,170,0.3)",
                background: "rgba(0,255,170,0.04)",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(0,255,170,0.6)"; (e.target as HTMLElement).style.boxShadow = "0 0 25px rgba(0,255,170,0.1)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.borderColor = "rgba(0,255,170,0.3)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
            >
              Bezplatná konzultácia →
            </a>
          </div>
        </Section>

        <FooterCTA />
      </main>
    </>
  );
};

export default Logika;
