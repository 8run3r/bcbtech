import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowUpRight } from "lucide-react";
import SocialLinks from "@/components/SocialLinks";

const TERMINAL_LINES = [
  "> ESTABLISHING SECURE CHANNEL...",
  "> ENCRYPTION: ACTIVE",
  "> READY FOR TRANSMISSION",
];

/* ── Animated wave pattern canvas (Tsuki-style flowing mesh) ── */
const FooterCanvas = ({ inView }: { inView: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const ro = new ResizeObserver(() => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    });
    ro.observe(canvas);

    // Wave parameters
    const waves = [
      { y: 0.15, freq: 0.004, amp: 25, speed: 0.3, color: "0,255,170", alpha: 0.06 },
      { y: 0.25, freq: 0.006, amp: 18, speed: 0.4, color: "255,140,0", alpha: 0.04 },
      { y: 0.35, freq: 0.005, amp: 22, speed: 0.25, color: "0,255,170", alpha: 0.03 },
      { y: 0.60, freq: 0.003, amp: 15, speed: 0.35, color: "255,140,0", alpha: 0.025 },
      { y: 0.80, freq: 0.007, amp: 12, speed: 0.5, color: "0,255,170", alpha: 0.02 },
    ];

    // Floating particles
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1 + Math.random() * 2,
      speedY: -0.0002 - Math.random() * 0.0004,
      speedX: (Math.random() - 0.5) * 0.0002,
      isGreen: Math.random() > 0.4,
    }));

    // Grid dots
    const gridSpacing = 50;

    // Cap at 30fps, pause when footer leaves the viewport
    const FRAME_MS = 1000 / 30;
    let last = 0;
    let onScreen = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; });
    io.observe(canvas);

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (!onScreen) return;
      if (now - last < FRAME_MS) return;
      last = now;
      const dt = 1 / 30;
      timeRef.current += dt;
      const t = timeRef.current;

      ctx.clearRect(0, 0, W, H);

      // ── Dot grid with wave distortion ──
      ctx.fillStyle = "rgba(0,255,170,0.015)";
      const cols = Math.ceil(W / gridSpacing);
      const rows = Math.ceil(H / gridSpacing);
      for (let gx = 0; gx < cols; gx++) {
        for (let gy = 0; gy < rows; gy++) {
          const bx = gx * gridSpacing;
          const by = gy * gridSpacing;
          const wave = Math.sin(bx * 0.005 + t * 0.3) * 3 + Math.cos(by * 0.005 + t * 0.2) * 3;
          ctx.fillRect(bx + wave - 0.5, by + wave - 0.5, 1, 1);
        }
      }

      // ── Flowing wave lines ──
      for (const w of waves) {
        const baseY = w.y * H;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const y = baseY + Math.sin(x * w.freq + t * w.speed) * w.amp
            + Math.sin(x * w.freq * 2.1 + t * w.speed * 1.6) * w.amp * 0.25;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${w.color},${w.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Glow fill below wave
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, baseY, 0, baseY + 80);
        grad.addColorStop(0, `rgba(${w.color},${w.alpha * 0.3})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ── Floating particles ──
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        if (p.x < -0.05 || p.x > 1.05) p.speedX *= -1;

        const px = p.x * W;
        const py = p.y * H;
        const rgb = p.isGreen ? "0,255,170" : "255,140,0";
        ctx.fillStyle = `rgba(${rgb},0.12)`;
        ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
      }

      // ── Geometric accents in corners ──
      const cornerAlpha = 0.04 + Math.sin(t * 0.5) * 0.02;

      // Top-left hexagonal pattern
      ctx.strokeStyle = `rgba(0,255,170,${cornerAlpha})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 3; i++) {
        const r = 30 + i * 25;
        const cx = 80;
        const cy = 80;
        ctx.beginPath();
        for (let j = 0; j <= 6; j++) {
          const angle = (j / 6) * Math.PI * 2 + t * 0.1 * (i + 1);
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Bottom-right diamond pattern
      ctx.strokeStyle = `rgba(255,140,0,${cornerAlpha})`;
      for (let i = 0; i < 3; i++) {
        const r = 25 + i * 20;
        const cx2 = W - 80;
        const cy2 = H - 80;
        ctx.beginPath();
        ctx.moveTo(cx2, cy2 - r);
        ctx.lineTo(cx2 + r, cy2);
        ctx.lineTo(cx2, cy2 + r);
        ctx.lineTo(cx2 - r, cy2);
        ctx.closePath();
        ctx.stroke();
      }
    };

    if (inView) {
      if (reducedMotion) {
        // Single static frame — no animation loop
        last = -FRAME_MS;
        timeRef.current = 2;
        draw(0);
        cancelAnimationFrame(rafRef.current);
      } else {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
    };
  }, [inView]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
};

const FooterCTA = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  useEffect(() => {
    if (!inView) return;
    const ids = TERMINAL_LINES.map((line, i) =>
      setTimeout(() => setTerminalLines(prev => [...prev, line]), 300 * i + 500)
    );
    return () => ids.forEach(clearTimeout);
  }, [inView]);

  return (
    <footer
      ref={ref}
      id="contact"
      className="relative overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* Top border — gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-px z-10"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,170,0.2), rgba(255,140,0,0.15), transparent)" }}
      />

      {/* Animated canvas background */}
      <FooterCanvas inView={inView} />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-12">
        {/* Terminal section */}
        <div className="mb-20">
          {/* Terminal header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-6"
            style={{
              borderBottom: "1px solid rgba(0,255,170,0.06)",
              paddingBottom: "0.75rem",
            }}
          >
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "8px",
              color: "var(--neon-primary)",
              letterSpacing: "0.2em",
              opacity: 0.4,
            }}>
              SECTOR_04 // CONTACT_PROTOCOL // SECURE
            </span>
          </motion.div>

          {/* Terminal output */}
          <div className="mb-8" style={{ minHeight: 60 }}>
            {terminalLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 0.35, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "9px",
                  color: "var(--neon-primary)",
                  letterSpacing: "0.08em",
                  lineHeight: 2,
                }}
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* Big CTA — Syne 800 editorial headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.8rem, 6.5vw, 5rem)",
              color: "var(--text-primary)",
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
            }}
          >
            Postavme niečo
            <br />
            <span
              className="glitch-text"
              data-text="výnimočné."
              style={{ color: "var(--neon-primary)", textShadow: "0 0 40px rgba(0,255,170,0.18)" }}
            >
              výnimočné.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-5 max-w-sm"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: "14px",
              color: "rgba(200,196,208,0.38)",
              lineHeight: 1.75,
              letterSpacing: "0.01em",
            }}
          >
            Máte nápad? Ozvite sa.<br />Prvá konzultácia je zadarmo — odpovieme do 24 hodín.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-wrap gap-4 mt-8"
          >
            <Link
              to="/kontakt"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 transition-all duration-300 relative overflow-hidden group"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: "13px",
                color: "#000",
                background: "var(--neon-primary)",
                letterSpacing: "0.02em",
              }}
            >
              <span className="relative z-10">Začať projekt</span>
              <ArrowUpRight size={13} className="relative z-10" />
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </Link>
            <a
              href="mailto:studio@coktech.tech"
              className="inline-flex items-center gap-2 px-6 py-3.5 transition-all duration-300"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: "13px",
                color: "rgba(200,196,208,0.55)",
                border: "1px solid rgba(200,196,208,0.1)",
                background: "transparent",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,170,0.3)";
                (e.currentTarget as HTMLElement).style.color = "var(--neon-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,196,208,0.1)";
                (e.currentTarget as HTMLElement).style.color = "rgba(200,196,208,0.55)";
              }}
            >
              <Mail size={13} />
              studio@coktech.tech
            </a>
          </motion.div>
        </div>

        {/* ── Pattern divider ── */}
        <div className="relative mb-12" style={{ height: 40 }}>
          <div className="absolute left-0 right-0 top-1/2 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,170,0.08), rgba(255,140,0,0.06), transparent)" }} />
          {/* Center diamond accent */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ width: 8, height: 8, border: "1px solid rgba(0,255,170,0.15)", transform: "rotate(45deg)" }}
            />
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-baseline gap-0.5 mb-4 group">
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 900,
                fontSize: "16px",
                color: "var(--text-primary)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                transition: "color 0.3s",
              }}
                className="group-hover:text-[var(--neon-primary)]"
              >
                COK<span style={{ color: "var(--neon-primary)" }}>TECH</span>
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "10px", color: "var(--neon-primary)", opacity: 0.6 }}>
                .digital
              </span>
            </Link>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              color: "rgba(200,196,208,0.3)",
              lineHeight: 1.8,
              letterSpacing: "0.01em",
            }}>
              Digital Studio & AI Automation<br />
              Levice, Slovensko
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--text-ghost)", marginTop: 6, opacity: 0.4 }}>
              NODE CT-7X29
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.22em", marginBottom: "1rem", textTransform: "uppercase" }}>
              Navigácia
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Portfólio", to: "/portfolio" },
                { label: "Balíčky", to: "/balicky" },
                { label: "Prečo my", to: "/logika" },
                { label: "Kontakt", to: "/kontakt" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="transition-colors duration-300"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "13px", color: "rgba(200,196,208,0.35)", letterSpacing: "0.01em" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--neon-primary)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(200,196,208,0.35)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.22em", marginBottom: "1rem", textTransform: "uppercase" }}>
              Služby
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Web aplikácie", to: "/balicky?tab=web", hoverColor: "var(--neon-primary)" },
                { label: "AI automatizácia", to: "/balicky?tab=automation", hoverColor: "var(--neon-secondary)" },
                { label: "AI Marketing", to: "/balicky?tab=marketing", hoverColor: "var(--neon-accent)" },
                { label: "Hybrid riešenia", to: "/balicky?tab=hybrid", hoverColor: "var(--neon-cold)" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="transition-colors duration-300"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, fontSize: "13px", color: "rgba(200,196,208,0.35)", letterSpacing: "0.01em" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = link.hoverColor)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(200,196,208,0.35)")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.22em", marginBottom: "1rem", textTransform: "uppercase" }}>
              Signal
            </h4>
            <SocialLinks />
          </div>
        </div>

        {/* Copyright bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(0,255,170,0.04)" }}
        >
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "rgba(200,196,208,0.2)", letterSpacing: "0.01em" }}>
            &copy; {new Date().getFullYear()} CokTech Digital. Všetky práva vyhradené.
          </p>
          <p
            className="glow-word"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--text-ghost)", letterSpacing: "0.1em", cursor: "none" }}
            onClick={() => window.location.href = "/void"}
          >
            SECTOR 04 // LEVICE
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterCTA;
