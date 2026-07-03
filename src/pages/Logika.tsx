import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import Navbar from "@/components/landing/Navbar";
import { useNavAccent } from "@/components/landing/Navbar";
import FooterCTA from "@/components/landing/FooterCTA";
import Scanlines from "@/components/ui/scanlines";
import PretextHeadline from "@/components/ui/pretext-headline";
import EncryptedText from "@/components/ui/encrypted-text";
import MagneticButton from "@/components/ui/magnetic-button";
import NeuralNetCanvas from "@/components/ui/neural-net-canvas";
import LogicCircuit from "@/components/ui/logic-circuit";
import TiltCard from "@/components/ui/tilt-card";

const MONO = "'JetBrains Mono', monospace";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ── Section color themes — neutral black canvas, calm 3-hue accent flow ── */
const SECTION_THEMES = [
  { id: "hero",      color: "#00ffaa", raw: "0,255,170",  label: "DISCOVER" },
  { id: "stats",     color: "#00ffaa", raw: "0,255,170",  label: "METRICS" },
  { id: "arguments", color: "#4A9EFF", raw: "74,158,255", label: "LOGIKA" },
  { id: "process",   color: "#FF8C00", raw: "255,140,0",  label: "PROCESS" },
  { id: "roi",       color: "#FF8C00", raw: "255,140,0",  label: "ROI" },
  { id: "compare",   color: "#4A9EFF", raw: "74,158,255", label: "VS" },
  { id: "cta",       color: "#00ffaa", raw: "0,255,170",  label: "CONNECT" },
];

/* ── Reduced motion hook ── */
const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
};

/* ── Glitch text effect ── */
const GlitchText = ({ children, color = "var(--neon-primary)" }: { children: string; color?: string }) => {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    let timeout: number | undefined;
    const interval = window.setInterval(() => {
      setGlitch(true);
      timeout = window.setTimeout(() => setGlitch(false), 150);
    }, 3000 + Math.random() * 4000);
    return () => {
      window.clearInterval(interval);
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, []);

  return (
    <span className="relative inline-block">
      {children}
      {glitch && (
        <>
          <span className="absolute inset-0 pointer-events-none" style={{ color, opacity: 0.7, transform: "translate(2px, -1px)", clipPath: "inset(10% 0 60% 0)" }}>
            {children}
          </span>
          <span className="absolute inset-0 pointer-events-none" style={{ color, opacity: 0.5, transform: "translate(-2px, 1px)", clipPath: "inset(50% 0 10% 0)" }}>
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
    let raf = 0;
    const timeout = window.setTimeout(() => {
      const duration = 1200;
      const startTime = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = numVal * eased;
        setDisplay(numVal % 1 === 0 ? Math.floor(current).toString() : current.toFixed(numVal < 10 ? 1 : 0));
        if (progress < 1) raf = requestAnimationFrame(animate);
        else setDisplay(value);
      };
      raf = requestAnimationFrame(animate);
    }, delay * 1000);
    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
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

/* ── Hero boot prelude — decision engine booting up ── */
const BOOT_LINES: { text: string; final: boolean }[] = [
  { text: "> analyzujem trh...", final: false },
  { text: "> porovnávam agentúry...", final: false },
  { text: "> výsledok: COKTECH", final: true },
];

const BootPrelude = ({ started, reduced, onDone }: { started: boolean; reduced: boolean; onDone: () => void }) => {
  const [visible, setVisible] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!started || doneRef.current) return;
    if (reduced) {
      setVisible(BOOT_LINES.length);
      doneRef.current = true;
      onDone();
      return;
    }
    const timers = BOOT_LINES.map((_, i) => window.setTimeout(() => setVisible(i + 1), 300 + i * 650));
    const doneTimer = window.setTimeout(() => {
      doneRef.current = true;
      onDone();
    }, 300 + (BOOT_LINES.length - 1) * 650 + 900);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(doneTimer);
    };
  }, [started, reduced, onDone]);

  return (
    <div aria-hidden className="mb-8 flex justify-center" style={{ minHeight: 66 }}>
      <div className="text-left">
        {BOOT_LINES.slice(0, visible).map((line) => (
          <div
            key={line.text}
            style={{
              fontFamily: MONO,
              fontSize: 10,
              lineHeight: "22px",
              letterSpacing: "0.1em",
              color: line.final ? "var(--neon-primary)" : "rgba(0,255,170,0.45)",
            }}
          >
            {reduced ? (
              <span>{line.text}</span>
            ) : (
              <EncryptedText
                text={line.text}
                triggerOnView={false}
                revealDelayMs={24}
                flipDelayMs={34}
                encryptedClassName="opacity-40"
                revealedClassName="opacity-100"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Argument — 3D tilt card with diamond badge ── */
const Argument = ({ number, title, body, color, raw, delay, wide = false }: {
  number: string;
  title: string;
  body: string;
  color: string;
  raw: string;
  delay: number;
  wide?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={`h-full ${wide ? "md:col-span-2" : ""}`}
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ delay, duration: 0.7, ease: EASE }}
    >
      <TiltCard
        glare={raw}
        className="h-full p-6 sm:p-7"
        style={{ background: "rgba(255,255,255,0.015)", border: `1px solid rgba(${raw},0.12)` }}
      >
        <div className="flex items-center justify-between mb-5">
          <div
            className="w-10 h-10 flex items-center justify-center flex-shrink-0"
            style={{ border: `1px solid rgba(${raw},0.35)`, transform: "rotate(45deg)" }}
          >
            <span style={{ transform: "rotate(-45deg)", fontFamily: MONO, fontSize: 9, color, letterSpacing: "0.05em" }}>
              {number}
            </span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: 7, color, opacity: 0.3, letterSpacing: "0.25em" }}>
            ARG_{number}
          </span>
        </div>
        <h3 style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(1.05rem, 2vw, 1.3rem)",
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
          maxWidth: 520,
        }}>
          {body}
        </p>
      </TiltCard>
    </motion.div>
  );
};

/* ── Scramble-in value (comparison "us" column) ── */
const SCRAMBLE_CHARS = "0123456789€%#/|<>–";

const ScrambleValue = ({ text, color, active, delay = 0 }: { text: string; color: string; active: boolean; delay?: number }) => {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const TOTAL = 16;
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        frame += 1;
        if (frame >= TOTAL) {
          setDisplay(text);
          if (interval !== undefined) window.clearInterval(interval);
          return;
        }
        const reveal = Math.floor((frame / TOTAL) * text.length);
        setDisplay(
          text
            .split("")
            .map((ch, i) => (ch === " " || i < reveal ? ch : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]))
            .join("")
        );
      }, 38);
    }, delay * 1000);
    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [active, text, delay]);

  return <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color }}>{display}</span>;
};

/* ── Comparison row — scan sweep + scramble + animated strike ── */
const CompareRow = ({ label, us, them, delay }: { label: string; us: string; them: string; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ delay, duration: 0.4 }}
      className="relative grid grid-cols-3 gap-4 py-5 overflow-hidden transition-colors duration-300"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.03)",
        background: hovered ? "rgba(0,255,170,0.02)" : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* horizontal scan-line sweep */}
      {inView && (
        <motion.div
          aria-hidden
          className="absolute inset-y-0 left-0 pointer-events-none"
          style={{ width: "35%", background: "linear-gradient(90deg, transparent, rgba(0,255,170,0.07), transparent)" }}
          initial={{ x: "-110%" }}
          animate={{ x: "320%" }}
          transition={{ delay: delay + 0.1, duration: 0.9, ease: "easeInOut" }}
        />
      )}
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
      <span className="text-center">
        <ScrambleValue text={us} color="var(--neon-primary)" active={inView} delay={delay + 0.25} />
      </span>
      <span className="text-center" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--text-muted)", opacity: 0.35 }}>
        <span className="relative inline-block">
          {them}
          <motion.span
            aria-hidden
            className="absolute left-0 right-0 top-1/2 h-px pointer-events-none"
            style={{ background: "var(--neon-accent)", originX: 0 }}
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ delay: delay + 0.9, duration: 0.4, ease: EASE }}
          />
        </span>
      </span>
    </motion.div>
  );
};

/* ── Winner stamp ── */
const WinnerStamp = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="flex justify-center mt-12">
      <motion.div
        initial={{ opacity: 0, scale: 1.6, rotate: -10 }}
        animate={inView ? { opacity: 1, scale: 1, rotate: -3 } : {}}
        transition={{ duration: 0.45, delay: 0.3, ease: EASE }}
        className="px-5 py-2.5 select-none"
        style={{
          border: "2px solid rgba(0,255,170,0.5)",
          background: "rgba(0,255,170,0.03)",
          color: "var(--neon-primary)",
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: "0.3em",
          boxShadow: "0 0 24px rgba(0,255,170,0.12), inset 0 0 12px rgba(0,255,170,0.05)",
        }}
      >
        WINNER: COKTECH
      </motion.div>
    </div>
  );
};

/* ── Console typer — prints result lines like terminal output ── */
const PAUSE_TICKS = 12;

const ConsoleTyper = ({ lines, color, instant = false, onComplete }: {
  lines: string[];
  color: string;
  instant?: boolean;
  onComplete: () => void;
}) => {
  const total = lines.reduce((acc, l) => acc + l.length + PAUSE_TICKS, 0);
  const [progress, setProgress] = useState(instant ? total : 0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (instant) return;
    const interval = window.setInterval(() => {
      setProgress((p) => (p >= total ? p : p + 2));
    }, 24);
    return () => window.clearInterval(interval);
  }, [instant, total]);

  useEffect(() => {
    if (progress < total || doneRef.current) return;
    doneRef.current = true;
    const t = window.setTimeout(onComplete, 250);
    return () => window.clearTimeout(t);
  }, [progress, total, onComplete]);

  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const before = lines.slice(0, i).reduce((acc, l) => acc + l.length + PAUSE_TICKS, 0);
        if (progress <= before) return null;
        const take = Math.min(line.length, progress - before);
        return (
          <div
            key={line}
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color,
              letterSpacing: "0.05em",
              lineHeight: 1.9,
              opacity: i === 0 ? 0.55 : 0.9,
            }}
          >
            {line.slice(0, take)}
            {take < line.length && <span style={{ opacity: 0.9 }}>▋</span>}
          </div>
        );
      })}
    </div>
  );
};

/* ── ROI Calculator — terminal window ── */
type RoiPhase = "idle" | "typing" | "done";

interface RoiSnapshot {
  monthly: number;
  yearly: number;
  weeks: number;
}

const ROICalculator = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduced = usePrefersReducedMotion();
  const [hours, setHours] = useState(20);
  const [rate, setRate] = useState(25);
  const [people, setPeople] = useState(3);
  const [phase, setPhase] = useState<RoiPhase>("idle");
  const [snapshot, setSnapshot] = useState<RoiSnapshot | null>(null);
  const [runId, setRunId] = useState(0);
  const [animatedSavings, setAnimatedSavings] = useState(0);

  const monthlyCost = hours * rate * people;
  const automationSavings = Math.floor(monthlyCost * 0.7);
  const yearlySavings = automationSavings * 12;
  const paybackWeeks = Math.ceil(2200 / (automationSavings / 4));

  const calculate = useCallback(() => {
    setSnapshot({ monthly: automationSavings, yearly: yearlySavings, weeks: paybackWeeks });
    setAnimatedSavings(0);
    setPhase("typing");
    setRunId((r) => r + 1);
  }, [automationSavings, yearlySavings, paybackWeeks]);

  const handleTyped = useCallback(() => setPhase("done"), []);

  // count-up on the monthly savings card
  useEffect(() => {
    if (phase !== "done" || !snapshot) return;
    if (reduced) {
      setAnimatedSavings(snapshot.monthly);
      return;
    }
    let raf = 0;
    const startTime = performance.now();
    const duration = 900;
    const target = snapshot.monthly;
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimatedSavings(Math.floor(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, snapshot, runId, reduced]);

  const consoleLines: string[] = snapshot
    ? [
        "> spúšťam roi_calc...",
        `> mesačná úspora: ${snapshot.monthly.toLocaleString()} €`,
        `> ročná úspora: ${snapshot.yearly.toLocaleString()} €`,
        `> návratnosť: ${snapshot.weeks} týždňov`,
      ]
    : [];

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: EASE }}
        className="max-w-3xl mx-auto"
      >
        <div className="mb-10">
          <span style={{ fontFamily: MONO, fontSize: 8, color: "var(--neon-secondary)", letterSpacing: "0.25em", opacity: 0.4 }}>
            INTERACTIVE // ROI_CALC
          </span>
          <h3 className="mt-3" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Koľko ušetríte s automatizáciou?
          </h3>
        </div>

        {/* terminal window */}
        <div style={{ border: "1px solid rgba(255,140,0,0.12)", background: "rgba(0,0,0,0.55)", boxShadow: "0 0 40px rgba(255,140,0,0.04)" }}>
          {/* title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,140,0,0.1)", background: "rgba(255,140,0,0.03)" }}>
            {["#FF3D71", "#d4a017", "#00ffaa"].map((c) => (
              <span key={c} className="inline-block w-2 h-2 rounded-full" style={{ background: c, opacity: 0.6 }} />
            ))}
            <span className="ml-2" style={{ fontFamily: MONO, fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.08em" }}>
              roi_calc.exe — CokTech Terminal
            </span>
            <span className="ml-auto hidden sm:inline" style={{ fontFamily: MONO, fontSize: 8, color: "var(--text-ghost)", letterSpacing: "0.1em" }}>
              80×24
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <p className="mb-7" style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,140,0,0.35)", letterSpacing: "0.08em" }}>
              $ ./roi_calc --interactive
            </p>

            <div className="space-y-8">
              <SliderInput label="Hodiny manuálnej práce / mesiac" value={hours} min={5} max={80} step={5} unit="hod" color="var(--neon-secondary)" onChange={setHours} />
              <SliderInput label="Priemerná hodinová sadzba" value={rate} min={10} max={80} step={5} unit="€/hod" color="var(--neon-secondary)" onChange={setRate} />
              <SliderInput label="Počet ľudí v tíme" value={people} min={1} max={20} step={1} unit="ľudí" color="var(--neon-secondary)" onChange={setPeople} />

              <div className="flex items-center justify-between py-3 px-4" style={{ background: "rgba(255,140,0,0.04)", border: "1px solid rgba(255,140,0,0.06)" }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.08em" }}>AKTUÁLNY MESAČNÝ NÁKLAD</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: "var(--neon-secondary)" }}>{monthlyCost.toLocaleString()} €</span>
              </div>

              <button
                onClick={calculate}
                className="w-full py-3 transition-all duration-300 hover:scale-[1.01]"
                style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.15em", color: "#000", background: "var(--neon-secondary)", border: "none", cursor: "none" }}
              >
                [ VYPOČÍTAŤ ÚSPORU ]
              </button>
            </div>

            {phase !== "idle" && snapshot && (
              <div className="mt-8 pt-6" style={{ borderTop: "1px dashed rgba(255,140,0,0.15)" }}>
                <ConsoleTyper key={runId} lines={consoleLines} color="var(--neon-secondary)" instant={reduced} onComplete={handleTyped} />

                <AnimatePresence>
                  {phase === "done" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        <ResultCard label="MESAČNÁ ÚSPORA" value={`${animatedSavings.toLocaleString()} €`} color="var(--neon-secondary)" delay={0.1} />
                        <ResultCard label="ROČNÁ ÚSPORA" value={`${snapshot.yearly.toLocaleString()} €`} color="var(--neon-primary)" delay={0.25} />
                        <ResultCard label="NÁVRATNOSŤ" value={`${snapshot.weeks} týždňov`} color="var(--neon-primary)" delay={0.4} />
                      </div>
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 text-center"
                        style={{ fontFamily: MONO, fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.05em" }}
                      >
                        * Odhad na základe 70% redukcie manuálnej práce.
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
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
        <span style={{ fontFamily: MONO, fontSize: 10, color: "var(--text-dim)", letterSpacing: "0.05em" }}>{label}</span>
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
    transition={{ delay, duration: 0.5, ease: EASE }}
    className="p-5 text-center"
    style={{ background: `${color}06`, border: `1px solid ${color}12` }}
  >
    <span style={{ fontFamily: MONO, fontSize: 7, color, opacity: 0.5, letterSpacing: "0.2em", display: "block" }}>{label}</span>
    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color, display: "block", marginTop: 6 }}>{value}</span>
  </motion.div>
);

/* ── Process Timeline — vertical, connector draws itself on scroll ── */
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
        {/* connector line — draws top → bottom */}
        <motion.div
          aria-hidden
          className="absolute left-[19px] top-0 bottom-0 w-px pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,255,170,0.25), rgba(255,140,0,0.2), rgba(255,61,113,0.25))", originY: 0 }}
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : {}}
          transition={{ duration: 1.4, ease: EASE }}
        />

        <div className="space-y-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.phase}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.7, ease: EASE }}
              className="flex gap-6 items-start relative"
            >
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center relative z-10" style={{ background: "var(--bg-base, #000)" }}>
                <motion.div
                  className="w-7 h-7 flex items-center justify-center"
                  style={{ border: `1px solid ${step.color}`, transform: "rotate(45deg)" }}
                  animate={{ boxShadow: [`0 0 0px ${step.color}00`, `0 0 15px ${step.color}30`, `0 0 0px ${step.color}00`] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                >
                  <span style={{ transform: "rotate(-45deg)", fontFamily: MONO, fontSize: 8, color: step.color }}>{step.phase}</span>
                </motion.div>
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{step.title}</h4>
                  <span style={{ fontFamily: MONO, fontSize: 8, color: step.color, opacity: 0.4, letterSpacing: "0.1em" }}>{step.time}</span>
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
          transition={{ duration: 0.4, ease: EASE }}
          style={{ borderRadius: 1 }}
        />
        <span
          className="absolute right-full mr-3 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            fontFamily: MONO,
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
  const [headlineOn, setHeadlineOn] = useState(false);
  const reduced = usePrefersReducedMotion();

  const handleBootDone = useCallback(() => setHeadlineOn(true), []);

  // Track which section is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    SECTION_THEMES.forEach((theme, i) => {
      const el = document.getElementById(theme.id);
      if (!el) return;
      // tall sections can never hit a fixed 30% ratio on small screens — adapt
      const threshold = Math.min(0.3, (window.innerHeight * 0.35) / Math.max(el.offsetHeight, 1));
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(i);
        },
        { threshold }
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

  const activeRaw = SECTION_THEMES[activeSection].raw;
  const activeColor = SECTION_THEMES[activeSection].color;

  return (
    <>
      {/* Background — pure black, colour comes only from the accent glow */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: "#000" }} />
      {/* Radial glow from center — whisper of the section accent */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, rgba(${activeRaw},0.025) 0%, transparent 55%)`,
          transition: "background 1.2s ease-in-out",
        }}
      />
      {/* Neural network — living circuit tinted by active section */}
      <NeuralNetCanvas accent={activeColor} opacity={0.5} />
      <Scanlines />
      <ColorPalette activeIndex={activeSection} />
      <main style={{ background: "transparent", minHeight: "100vh", position: "relative", zIndex: 1 }}>
        <Navbar />

        {/* ── Hero — decision engine boot ── */}
        <div ref={heroRef} id="hero" className="min-h-screen flex items-center justify-center px-6 relative">
          {/* corner brackets */}
          <div aria-hidden className="absolute inset-x-6 inset-y-24 sm:inset-x-12 pointer-events-none">
            {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((cls) => (
              <motion.span
                key={cls}
                className={`absolute w-6 h-6 ${cls}`}
                style={{ borderColor: "rgba(0,255,170,0.2)" }}
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: 0.4 }}
              />
            ))}
          </div>

          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={heroInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <p style={{
                fontFamily: MONO,
                fontSize: 9,
                color: "var(--neon-primary)",
                letterSpacing: "0.3em",
                opacity: 0.4,
                marginBottom: 24,
                textTransform: "uppercase",
              }}>
                Prečo CokTech
              </p>

              <BootPrelude started={heroInView} reduced={reduced} onDone={handleBootDone} />

              <div className="max-w-3xl mx-auto mb-10">
                <PretextHeadline
                  text="Najjednoduchšia voľba pre váš biznis."
                  fontSize={48}
                  color="var(--text-primary)"
                  stagger={0.06}
                  triggered={headlineOn}
                />
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={headlineOn ? { opacity: 1 } : {}}
                transition={{ delay: 0.9, duration: 0.8 }}
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
                animate={headlineOn ? { opacity: 0.3 } : {}}
                transition={{ delay: 1.4 }}
                className="mt-16"
              >
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ fontFamily: MONO, fontSize: 8, color: "var(--neon-primary)", letterSpacing: "0.2em" }}
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
          <p className="text-center mb-14" style={{ fontFamily: MONO, fontSize: 8, color: "var(--neon-primary)", letterSpacing: "0.25em", opacity: 0.4 }}>
            METRICS
          </p>
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

        {/* ── Arguments — decision circuit + tilt cards ── */}
        <Section id="arguments">
          <div className="max-w-4xl mx-auto mb-20">
            <LogicCircuit accent="#4A9EFF" />
          </div>

          <div className="max-w-3xl mx-auto">
            <p style={{ fontFamily: MONO, fontSize: 8, color: "var(--neon-primary)", letterSpacing: "0.25em", opacity: 0.4, marginBottom: 12 }}>LOGIKA</p>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 32 }}>
              5 dôvodov prečo <span style={{ color: "var(--neon-primary)" }}>CokTech</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Argument number="01" title="Žiadny overhead" body="Sme malý, fokusovaný tím. Neplatíte za projektového manažéra, account manažéra a 5 ľudí na meetingoch. Platíte za výsledok." color="var(--neon-primary)" raw="0,255,170" delay={0} />
              <Argument number="02" title="Enterprise kvalita, startup cena" body="Používame rovnaký stack a best practices ako top agentúry — React, TypeScript, CI/CD, monitoring. Rozdiel? Naša marža nie je 300%." color="var(--neon-primary)" raw="0,255,170" delay={0.08} />
              <Argument number="03" title="Transparentný proces" body="Každý týždeň vidíte progres. Staging link, live demo, changelog. Žiadne 'to bude hotové o mesiac a potom uvidíte'." color="var(--neon-cold)" raw="74,158,255" delay={0.16} />
              <Argument number="04" title="Agenti a automatizácie = ROI na steroidoch" body="AI agenti odpovedajú zákazníkom, faktúry sa párujú samé, workflow beží bez ľudí. n8n, Claude API, Make. Jeden workflow vám ušetrí 40+ hodín mesačne." color="var(--neon-secondary)" raw="255,140,0" delay={0.24} />
              <Argument number="05" title="Dlhodobý partner, nie vendor" body="Po spustení neodchádzame. Monitoring, údržba, iterácie. Keď rastie váš biznis, rastie váš produkt." color="var(--neon-accent)" raw="255,61,113" delay={0.32} wide />
            </div>
          </div>
        </Section>

        {/* ── Marquee band 2 ── */}
        <MarqueeBand text="WEB · AGENTI · AUTOMATIZÁCIE · FAKTURÁCIA · WEB · AGENTI · AUTOMATIZÁCIE · FAKTURÁCIA ·" color="var(--neon-secondary)" speed={35} />

        {/* ── Process Timeline ── */}
        <Section id="process">
          <div className="max-w-2xl mx-auto">
            <p style={{ fontFamily: MONO, fontSize: 8, color: "var(--neon-primary)", letterSpacing: "0.25em", opacity: 0.4, marginBottom: 12 }}>PROCESS</p>
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
            <p style={{ fontFamily: MONO, fontSize: 8, color: "var(--text-dim)", letterSpacing: "0.25em", opacity: 0.4, marginBottom: 12 }}>VS. TRADIČNÁ AGENTÚRA</p>
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
            <WinnerStamp />
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
            <MagneticButton
              onClick={() => { window.location.href = "mailto:studio@coktech.tech"; }}
              className="inline-block px-8 py-3.5 transition-colors duration-300"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: 14,
                color: "var(--neon-primary)",
                border: "1px solid rgba(0,255,170,0.3)",
                background: "rgba(0,255,170,0.04)",
                cursor: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,255,170,0.6)";
                e.currentTarget.style.boxShadow = "0 0 25px rgba(0,255,170,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,255,170,0.3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Bezplatná konzultácia →
            </MagneticButton>
          </div>
        </Section>

        <FooterCTA />
      </main>
    </>
  );
};

export default Logika;
