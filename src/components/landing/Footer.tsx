import { useRef, useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import SocialLinks from "@/components/SocialLinks";

const MONO = "'JetBrains Mono', monospace";
const DM = "'DM Sans', sans-serif";

/** CSSProperties extended with the footer accent custom property. */
type FtStyle = CSSProperties & { "--ft-accent"?: string };

/* ── Canvas: wave dot grid + signal waveform ──
 * 30fps cap via delta accumulation; pauses when footer is offscreen
 * (inView prop) or the tab is hidden (visibilitychange). Under
 * prefers-reduced-motion it paints a single static frame. */
const FooterGrid = ({ inView }: { inView: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const COLORS = ["0,255,170", "255,140,0", "255,61,113", "74,158,255"];
    const SPACING = 40;
    const FRAME_MS = 1000 / 30; // 30fps cap
    const TIME_STEP = 1 / 30;   // keeps wave speed identical to the old 60fps loop

    const draw = () => {
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);

      // Dot grid with wave distortion, color quadrants, center fade
      const cols = Math.ceil(W / SPACING);
      const rows = Math.ceil(H / SPACING);
      const cx = W / 2;
      const cy = H / 2;
      const maxDist = Math.max(W, H) * 0.6;
      for (let gx = 0; gx <= cols; gx++) {
        for (let gy = 0; gy <= rows; gy++) {
          const bx = gx * SPACING;
          const by = gy * SPACING;
          // Fade check first — skip offscreen-faded dots before any trig
          const dist = Math.sqrt((bx - cx) ** 2 + (by - cy) ** 2);
          const fade = Math.max(0, 1 - dist / maxDist);
          const alpha = 0.025 * fade * fade;
          if (alpha < 0.003) continue;

          const wave = Math.sin(bx * 0.004 + t * 0.3) * 4 + Math.cos(by * 0.006 + t * 0.2) * 3;
          const dx = bx + wave;
          const dy = by + Math.sin(bx * 0.003 + by * 0.003 + t * 0.15) * 3;
          const ci = (gx + gy) % COLORS.length;
          ctx.fillStyle = `rgba(${COLORS[ci]},${alpha})`;
          ctx.fillRect(dx - 0.5, dy - 0.5, 1, 1);
        }
      }

      // Signal waveform — one polyline near the top, composite sines
      const baseY = 74;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const y =
          baseY +
          Math.sin(x * 0.011 + t * 1.5) * 2.5 +
          Math.sin(x * 0.0037 - t * 0.65) * 4 +
          Math.sin(x * 0.021 + t * 2.3) * 1.4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(0,255,170,0.07)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Horizontal scan line
      const scanY = (t * 30) % H;
      ctx.fillStyle = "rgba(0,255,170,0.02)";
      ctx.fillRect(0, scanY, W, 1);
    };

    const ro = new ResizeObserver(() => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
      draw(); // repaint once so a resize never leaves a blank canvas
    });
    ro.observe(canvas);

    // Reduced motion → single static frame, no loop
    if (reduced) {
      draw();
      return () => ro.disconnect();
    }

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let running = false;
    let tabVisible = document.visibilityState === "visible";

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      acc += now - last;
      last = now;
      if (acc < FRAME_MS) return;
      acc = Math.min(acc % FRAME_MS, FRAME_MS);
      tRef.current += TIME_STEP;
      draw();
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      acc = FRAME_MS; // first tick draws immediately
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (inView && tabVisible) start();
      else stop();
    };

    const onVisibility = () => {
      tabVisible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    sync();

    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [inView]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};

/* ── Corner brackets framing the footer content ── */
const CornerBrackets = () => {
  const b = "1px solid rgba(0,255,170,0.3)";
  const base: CSSProperties = { position: "absolute", width: 14, height: 14 };
  return (
    <>
      <span aria-hidden className="pointer-events-none" style={{ ...base, top: 0, left: 0, borderTop: b, borderLeft: b }} />
      <span aria-hidden className="pointer-events-none" style={{ ...base, top: 0, right: 0, borderTop: b, borderRight: b }} />
      <span aria-hidden className="pointer-events-none" style={{ ...base, bottom: 0, left: 0, borderBottom: b, borderLeft: b }} />
      <span aria-hidden className="pointer-events-none" style={{ ...base, bottom: 0, right: 0, borderBottom: b, borderRight: b }} />
    </>
  );
};

/* ── Mono micro-header: "> LABEL" ── */
const ColHeader = ({ children }: { children: string }) => (
  <h4
    style={{
      fontFamily: MONO,
      fontSize: "9px",
      color: "rgba(200,196,208,0.35)",
      letterSpacing: "0.28em",
      marginBottom: "1.25rem",
      textTransform: "uppercase",
    }}
  >
    <span aria-hidden style={{ color: "var(--neon-primary)", opacity: 0.7 }}>&gt;&nbsp;</span>
    {children}
  </h4>
);

const pad = (n: number): string => String(n).padStart(2, "0");
const formatClock = (d: Date): string =>
  `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

const SERVICES = [
  { label: "Web aplikácie", to: "/balicky?tab=web", color: "var(--neon-primary)", code: "WEB" },
  { label: "AI automatizácia", to: "/balicky?tab=automation", color: "var(--neon-secondary)", code: "AUTO" },
  { label: "AI Agenti", to: "/balicky?tab=agents", color: "var(--neon-accent)", code: "AGT" },
  { label: "Hybrid riešenia", to: "/balicky?tab=hybrid", color: "var(--neon-cold)", code: "HYB" },
];

const NAV = [
  { label: "Portfólio", to: "/portfolio" },
  { label: "Balíčky", to: "/balicky" },
  { label: "Prečo my", to: "/logika" },
  { label: "Kontakt", to: "/kontakt" },
];

const Footer = () => {
  const ref = useRef<HTMLElement>(null);
  // One-shot reveal for content; continuous visibility drives the canvas.
  const revealed = useInView(ref, { once: true, margin: "-50px" });
  const onScreen = useInView(ref);
  const [year] = useState(new Date().getFullYear());
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer ref={ref} className="relative z-10 overflow-hidden" style={{ background: "#000" }}>
      {/* CSS-first micro-interactions — no per-link JS handlers, no motion loops */}
      <style>{`
        @keyframes ft-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px rgba(0,255,170,0.7); }
          50% { opacity: 0.3; box-shadow: 0 0 2px rgba(0,255,170,0.2); }
        }
        .ft-node { animation: ft-pulse 2.2s ease-in-out infinite; }
        @keyframes ft-blink { 0%, 49% { opacity: 0.7; } 50%, 100% { opacity: 0; } }
        .ft-cursor { animation: ft-blink 1.1s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ft-node, .ft-cursor { animation: none; }
        }
        .ft-link { color: rgba(200,196,208,0.34); transition: color 0.3s ease; }
        .ft-link:hover { color: var(--ft-accent, var(--neon-primary)); }
        .ft-caret {
          display: inline-block; width: 11px; flex-shrink: 0;
          font-family: ${MONO}; font-size: 10px;
          color: var(--ft-accent, var(--neon-primary));
          opacity: 0; transform: translateX(-6px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .ft-link:hover .ft-caret { opacity: 1; transform: translateX(0); }
        .ft-label { transition: letter-spacing 0.3s ease; }
        .ft-link:hover .ft-label { letter-spacing: 0.045em; }
        .ft-code { opacity: 0.4; transition: opacity 0.3s ease; }
        .ft-link:hover .ft-code { opacity: 1; }
        .ft-cta {
          border: 1px solid rgba(0,255,170,0.15);
          background: rgba(0,255,170,0.03);
          transition: border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
        }
        .ft-cta:hover {
          border-color: rgba(0,255,170,0.45);
          box-shadow: 0 0 24px rgba(0,255,170,0.08);
          background: rgba(0,255,170,0.06);
        }
        .ft-egg { color: var(--text-ghost); transition: color 0.3s ease; }
        .ft-egg:hover { color: var(--neon-primary); }
      `}</style>

      {/* Top gradient border */}
      <div
        aria-hidden
        className="h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,170,0.12), rgba(255,140,0,0.08), rgba(255,61,113,0.06), transparent)" }}
      />

      {/* Canvas background — decorative, never intercepts input */}
      <FooterGrid inView={onScreen} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={revealed ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-6xl mx-auto px-6 pt-6 pb-6"
      >
        <CornerBrackets />

        {/* ── System status strip ── */}
        <div
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 mb-12"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            fontFamily: MONO,
            fontSize: "9px",
            letterSpacing: "0.18em",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="ft-node"
              style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--neon-primary)", flexShrink: 0 }}
            />
            <span style={{ color: "rgba(200,196,208,0.45)" }}>
              CT-7X29 <span style={{ color: "rgba(0,255,170,0.55)" }}>// ONLINE</span>
            </span>
          </div>
          <div style={{ color: "rgba(200,196,208,0.3)" }}>
            SYS.TIME{" "}
            <span style={{ color: "rgba(0,255,170,0.5)", fontVariantNumeric: "tabular-nums" }}>{clock}</span>
          </div>
          <div style={{ color: "rgba(200,196,208,0.25)" }}>LEVICE / SK 48.2°N</div>
        </div>

        {/* ── Main grid: brand + služby + navigácia + kontakt ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.15fr] gap-10 mb-14">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-baseline gap-0.5 mb-4 group">
              <span
                className="group-hover:[text-shadow:0_0_12px_rgba(0,255,170,0.3)]"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 900,
                  fontSize: "20px",
                  color: "var(--text-primary)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  transition: "text-shadow 0.3s",
                }}
              >
                COK<span style={{ color: "var(--neon-primary)" }}>TECH</span>
              </span>
              <span style={{ fontFamily: DM, fontWeight: 500, fontSize: "11px", color: "var(--neon-primary)", opacity: 0.6 }}>
                .digital
              </span>
            </Link>
            <p
              style={{
                fontFamily: DM,
                fontWeight: 400,
                fontSize: "13px",
                color: "rgba(200,196,208,0.3)",
                lineHeight: 1.7,
                maxWidth: 320,
                marginBottom: "1.5rem",
              }}
            >
              Digital Studio & AI Automation<br />
              Levice, Slovensko
            </p>

            <Link
              to="/kontakt"
              className="ft-cta inline-flex items-center gap-2 px-6 py-3 mb-8"
              style={{
                fontFamily: MONO,
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: "var(--neon-primary)",
              }}
            >
              [ ZAČAŤ PROJEKT ] <ArrowUpRight size={12} />
            </Link>

            <ColHeader>Signal</ColHeader>
            <SocialLinks />
          </div>

          {/* Služby — color coded */}
          <div>
            <ColHeader>Služby</ColHeader>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.to}
                    className="ft-link flex items-center"
                    style={{ fontFamily: DM, fontSize: "13px", "--ft-accent": s.color } as FtStyle}
                  >
                    <span aria-hidden className="ft-caret">&gt;</span>
                    <span
                      className="ft-code"
                      style={{ fontFamily: MONO, fontSize: "8px", color: s.color, letterSpacing: "0.1em", minWidth: 34, flexShrink: 0 }}
                    >
                      {s.code}
                    </span>
                    <span className="ft-label">{s.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigácia */}
          <div>
            <ColHeader>Navigácia</ColHeader>
            <ul className="space-y-3">
              {NAV.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="ft-link flex items-center"
                    style={{ fontFamily: DM, fontSize: "13px" }}
                  >
                    <span aria-hidden className="ft-caret">&gt;</span>
                    <span className="ft-label">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <ColHeader>Kontakt</ColHeader>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:studio@coktech.tech"
                  className="ft-link flex items-center gap-2"
                  style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.03em" }}
                >
                  <Mail size={11} style={{ opacity: 0.35, flexShrink: 0 }} /> studio@coktech.tech
                </a>
              </li>
              <li>
                <a
                  href="tel:+421911640660"
                  className="ft-link flex items-center gap-2"
                  style={{ fontFamily: MONO, fontSize: "10px", letterSpacing: "0.03em" }}
                >
                  <Phone size={11} style={{ opacity: 0.35, flexShrink: 0 }} /> +421 911 640 660
                </a>
              </li>
              <li
                className="flex items-center gap-2"
                style={{ fontFamily: MONO, fontSize: "10px", color: "rgba(200,196,208,0.2)", letterSpacing: "0.03em" }}
              >
                <MapPin size={11} style={{ opacity: 0.25, flexShrink: 0 }} /> Levice, Slovensko
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom line ── */}
        <div
          aria-hidden
          className="h-px mb-6 pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontFamily: DM, fontSize: "11px", color: "rgba(200,196,208,0.18)" }}>
            &copy; {year} CokTech Digital. Všetky práva vyhradené.
          </p>

          <div className="flex items-center gap-4">
            <div aria-hidden className="flex items-center gap-2 pointer-events-none">
              {["#00ffaa", "#FF8C00", "#FF3D71", "#4A9EFF"].map((c) => (
                <div key={c} style={{ width: 3, height: 3, background: c, opacity: 0.3 }} />
              ))}
            </div>
            <span style={{ fontFamily: MONO, fontSize: "8px", color: "rgba(200,196,208,0.22)", letterSpacing: "0.18em" }}>
              BUILD v2.4
            </span>
          </div>

          <p
            className="ft-egg"
            style={{ fontFamily: MONO, fontSize: "7px", letterSpacing: "0.12em", cursor: "none" }}
            onClick={() => (window.location.href = "/void")}
          >
            SECTOR 04 // LEVICE{" "}
            <span aria-hidden className="ft-cursor" style={{ color: "var(--neon-primary)" }}>█</span>
          </p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
