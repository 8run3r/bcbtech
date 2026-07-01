import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import SocialLinks from "@/components/SocialLinks";

/* ── Minimal canvas grid with wave distortion ── */
const FooterGrid = ({ inView }: { inView: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const ro = new ResizeObserver(() => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    });
    ro.observe(canvas);

    const COLORS = ["0,255,170", "255,140,0", "255,61,113", "74,158,255"];
    const spacing = 40;

    const draw = () => {
      tRef.current += 1 / 60;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);

      // Dot grid with wave + color quadrants
      const cols = Math.ceil(W / spacing);
      const rows = Math.ceil(H / spacing);
      for (let gx = 0; gx <= cols; gx++) {
        for (let gy = 0; gy <= rows; gy++) {
          const bx = gx * spacing;
          const by = gy * spacing;
          const wave = Math.sin(bx * 0.004 + t * 0.3) * 4 + Math.cos(by * 0.006 + t * 0.2) * 3;
          const dx = bx + wave;
          const dy = by + Math.sin(bx * 0.003 + by * 0.003 + t * 0.15) * 3;

          // Fade from center outward
          const cx = W / 2; const cy = H / 2;
          const dist = Math.sqrt((bx - cx) ** 2 + (by - cy) ** 2);
          const maxDist = Math.max(W, H) * 0.6;
          const fade = Math.max(0, 1 - dist / maxDist);

          // Color cycling based on position
          const ci = (gx + gy) % COLORS.length;
          const alpha = 0.025 * fade * fade;
          if (alpha < 0.003) continue;

          ctx.fillStyle = `rgba(${COLORS[ci]},${alpha})`;
          ctx.fillRect(dx - 0.5, dy - 0.5, 1, 1);
        }
      }

      // Horizontal scan line
      const scanY = (t * 30) % H;
      ctx.fillStyle = "rgba(0,255,170,0.02)";
      ctx.fillRect(0, scanY, W, 1);

      rafRef.current = requestAnimationFrame(draw);
    };

    if (inView) rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [inView]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

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
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [year] = useState(new Date().getFullYear());

  return (
    <footer
      ref={ref}
      className="relative z-10 overflow-hidden"
      style={{ background: "#000" }}
    >
      {/* Top gradient border */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,170,0.12), rgba(255,140,0,0.08), rgba(255,61,113,0.06), transparent)" }} />

      {/* Canvas background */}
      <FooterGrid inView={inView} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-8">

        {/* ── Top section: Brand + CTA ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <Link to="/" className="inline-flex items-baseline gap-0.5 mb-4 group">
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 900,
                fontSize: "20px",
                color: "var(--text-primary)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                transition: "text-shadow 0.3s",
              }}
              className="group-hover:[text-shadow:0_0_12px_rgba(0,255,170,0.3)]"
              >
                COK<span style={{ color: "var(--neon-primary)" }}>TECH</span>
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: "11px", color: "var(--neon-primary)", opacity: 0.6 }}>
                .digital
              </span>
            </Link>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              color: "rgba(200,196,208,0.3)",
              lineHeight: 1.7,
              maxWidth: 320,
            }}>
              Digital Studio & AI Automation<br />
              Levice, Slovensko
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Link
              to="/kontakt"
              className="inline-flex items-center gap-2 px-6 py-3 transition-all duration-300 group"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                letterSpacing: "0.12em",
                color: "var(--neon-primary)",
                border: "1px solid rgba(0,255,170,0.15)",
                background: "rgba(0,255,170,0.03)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,170,0.4)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,255,170,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,170,0.15)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              [ ZAČAŤ PROJEKT ] <ArrowUpRight size={12} />
            </Link>
          </motion.div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px mb-12" style={{ background: "linear-gradient(90deg, rgba(0,255,170,0.06), rgba(255,255,255,0.03), transparent)" }} />

        {/* ── Grid: Nav + Services + Contact ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-14">

          {/* Navigation */}
          <div>
            <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.25em", marginBottom: "1.25rem", textTransform: "uppercase" }}>
              Navigácia
            </h4>
            <ul className="space-y-3">
              {NAV.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 group transition-colors duration-300"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(200,196,208,0.32)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(200,196,208,0.32)")}
                  >
                    <span style={{ width: 8, height: 1, background: "rgba(0,255,170,0.2)", display: "inline-block", transition: "width 0.3s" }} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services — color coded */}
          <div>
            <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.25em", marginBottom: "1.25rem", textTransform: "uppercase" }}>
              Služby
            </h4>
            <ul className="space-y-3">
              {SERVICES.map((s) => (
                <li key={s.label}>
                  <Link
                    to={s.to}
                    className="flex items-center gap-2.5 group transition-colors duration-300"
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "rgba(200,196,208,0.32)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = s.color)}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(200,196,208,0.32)")}
                  >
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: s.color, opacity: 0.4, letterSpacing: "0.1em", minWidth: 28 }}>{s.code}</span>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.25em", marginBottom: "1.25rem", textTransform: "uppercase" }}>
              Kontakt
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:studio@coktech.tech" className="flex items-center gap-2 transition-colors duration-300"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(200,196,208,0.3)", letterSpacing: "0.03em" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--neon-primary)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(200,196,208,0.3)")}
                >
                  <Mail size={11} style={{ opacity: 0.35, flexShrink: 0 }} /> studio@coktech.tech
                </a>
              </li>
              <li>
                <a href="tel:+421911640660" className="flex items-center gap-2 transition-colors duration-300"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(200,196,208,0.3)", letterSpacing: "0.03em" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--neon-primary)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(200,196,208,0.3)")}
                >
                  <Phone size={11} style={{ opacity: 0.35, flexShrink: 0 }} /> +421 911 640 660
                </a>
              </li>
              <li className="flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "rgba(200,196,208,0.2)", letterSpacing: "0.03em" }}>
                <MapPin size={11} style={{ opacity: 0.25, flexShrink: 0 }} /> Levice, Slovensko
              </li>
            </ul>
          </div>

          {/* Signal / Social */}
          <div>
            <h4 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.25em", marginBottom: "1.25rem", textTransform: "uppercase" }}>
              Signal
            </h4>
            <SocialLinks />
            <p className="mt-5" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--text-ghost)", opacity: 0.4, letterSpacing: "0.08em" }}>
              NODE CT-7X29
            </p>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)" }} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "rgba(200,196,208,0.18)" }}>
            &copy; {year} CokTech Digital. Všetky práva vyhradené.
          </p>

          {/* 4 color accent dots */}
          <div className="flex items-center gap-2">
            {["#00ffaa", "#FF8C00", "#FF3D71", "#4A9EFF"].map((c) => (
              <div key={c} style={{ width: 3, height: 3, background: c, opacity: 0.3 }} />
            ))}
          </div>

          <p
            className="transition-colors duration-300"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.12em", cursor: "none" }}
            onClick={() => window.location.href = "/void"}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--neon-primary)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--text-ghost)")}
          >
            SECTOR 04 // LEVICE
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
