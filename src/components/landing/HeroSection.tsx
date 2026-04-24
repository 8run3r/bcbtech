import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import MagneticButton from "@/components/ui/magnetic-button";

/* ── Glitch text — scrambles then settles ── */
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`01";

const GlitchText = ({
  text,
  delay = 0,
  speed = 40,
  style,
  className,
}: {
  text: string;
  delay?: number;
  speed?: number;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let idx = 0;
    let scrambleCount = 0;

    const tick = () => {
      if (idx > text.length) { setDone(true); return; }
      const settled = text.slice(0, idx);
      const remaining = text.length - idx;
      const scrambled = Array.from({ length: Math.min(remaining, 4) }, () =>
        GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
      ).join("");
      setDisplay(settled + scrambled);
      scrambleCount++;
      if (scrambleCount >= 2) { idx++; scrambleCount = 0; }
      timeout = setTimeout(tick, speed);
    };

    const startTimeout = setTimeout(tick, delay);
    return () => { clearTimeout(startTimeout); clearTimeout(timeout); };
  }, [text, delay, speed]);

  return (
    <span className={className} style={{ ...style, opacity: done ? 1 : 0.9 }}>
      {display || "\u00A0"}
    </span>
  );
};

/* ── Canvas — data rain + aurora + grid ── */
const HeroCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

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

    // Data rain columns
    const colW = 18;
    const cols = Math.ceil(W / colW) + 2;
    const drops = Array.from({ length: cols }, () => ({
      y: -Math.random() * H * 2,
      speed: 0.3 + Math.random() * 1.2,
      colorIdx: Math.floor(Math.random() * COLORS.length),
      chars: Array.from({ length: 8 + Math.floor(Math.random() * 12) }, () =>
        String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
      ),
    }));

    // Floating orbs
    const orbs = Array.from({ length: 5 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 60 + Math.random() * 120,
      colorIdx: Math.floor(Math.random() * COLORS.length),
      speedX: (Math.random() - 0.5) * 0.0002,
      speedY: (Math.random() - 0.5) * 0.0002,
    }));

    let t = 0;

    const draw = () => {
      t += 0.016;
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, W, H);

      // Grid dots
      const spacing = 50;
      const cx = W / 2, cy = H / 2;
      for (let gx = 0; gx * spacing < W; gx++) {
        for (let gy = 0; gy * spacing < H; gy++) {
          const bx = gx * spacing, by = gy * spacing;
          const dist = Math.hypot(bx - cx, by - cy);
          const maxDist = Math.max(W, H) * 0.6;
          if (dist > maxDist) continue;
          const wave = Math.sin(bx * 0.008 + t * 0.4) * 2 + Math.cos(by * 0.008 + t * 0.3) * 2;
          const fade = 1 - dist / maxDist;
          const alpha = 0.035 * fade * fade;
          if (alpha < 0.003) continue;
          const ci = ((gx + gy) % COLORS.length);
          ctx.fillStyle = `rgba(${COLORS[ci]},${alpha})`;
          ctx.fillRect(bx + wave - 0.5, by - 0.5, 1, 1);
        }
      }

      // Ambient orbs
      for (const orb of orbs) {
        orb.x += orb.speedX; orb.y += orb.speedY;
        if (orb.x < -0.1 || orb.x > 1.1) orb.speedX *= -1;
        if (orb.y < -0.1 || orb.y > 1.1) orb.speedY *= -1;
        const grad = ctx.createRadialGradient(orb.x * W, orb.y * H, 0, orb.x * W, orb.y * H, orb.r);
        grad.addColorStop(0, `rgba(${COLORS[orb.colorIdx]},0.03)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(orb.x * W - orb.r, orb.y * H - orb.r, orb.r * 2, orb.r * 2);
      }

      // Data rain
      ctx.font = "11px 'JetBrains Mono', monospace";
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const x = i * colW;
        d.y += d.speed;
        if (d.y > H + 200) { d.y = -Math.random() * 300; d.colorIdx = Math.floor(Math.random() * COLORS.length); }

        for (let j = 0; j < d.chars.length; j++) {
          const charY = d.y - j * 14;
          if (charY < -14 || charY > H + 14) continue;
          const alpha = j === 0 ? 0.12 : Math.max(0, 0.06 - j * 0.004);
          if (alpha < 0.003) continue;
          ctx.fillStyle = `rgba(${COLORS[d.colorIdx]},${alpha})`;
          // Randomly change char
          if (Math.random() < 0.02) d.chars[j] = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
          ctx.fillText(d.chars[j], x, charY);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // Clear first
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

/* ── Ambient stats ── */
const StatReadout = ({ label, value, delay, color }: { label: string; value: string; delay: number; color: string }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: "0.1em" }}
    >
      <span style={{ color: "var(--text-ghost)" }}>{label} </span>
      <span style={{ color, opacity: 0.6 }}>{value}</span>
    </motion.div>
  );
};

/* ── Main HeroSection ── */
const HeroSection = () => {
  const [phase, setPhase] = useState(0); // 0=boot, 1=reveal, 2=full

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const scrollToWorld = useCallback(() => {
    const el = document.getElementById("coktech-world");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: "100svh", minHeight: 520, background: "#000" }}
    >
      <HeroCanvas />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "repeating-linear-gradient(transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)" }} />

      {/* Corner frames */}
      {[
        "top-4 left-4 border-t border-l sm:top-6 sm:left-6",
        "top-4 right-4 border-t border-r sm:top-6 sm:right-6",
        "bottom-4 left-4 border-b border-l sm:bottom-6 sm:left-6",
        "bottom-4 right-4 border-b border-r sm:bottom-6 sm:right-6",
      ].map((cls, i) => (
        <motion.span
          key={i}
          className={`absolute w-5 h-5 sm:w-8 sm:h-8 z-20 pointer-events-none ${cls}`}
          style={{ borderColor: "rgba(0,255,170,0.15)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 1 ? 1 : 0 }}
          transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
        />
      ))}

      {/* Top-left stats */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-10 z-20 flex flex-col gap-1 pointer-events-none hidden sm:flex">
        <StatReadout label="NODE" value="CT-7X29" delay={800} color="var(--neon-primary)" />
        <StatReadout label="STATUS" value="NOMINAL" delay={1000} color="#00ff99" />
        <StatReadout label="UPTIME" value="99.97%" delay={1200} color="#4A9EFF" />
      </div>

      {/* Top-right stats */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-10 z-20 flex flex-col gap-1 items-end pointer-events-none hidden sm:flex">
        <StatReadout label="SECTOR" value="04" delay={900} color="var(--neon-primary)" />
        <StatReadout label="FREQ" value="427.3MHz" delay={1100} color="#FF8C00" />
        <StatReadout label="ENC" value="AES-512" delay={1300} color="#FF3D71" />
      </div>

      {/* Main content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 sm:px-10">
        {/* Boot line */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: "var(--neon-primary)",
                opacity: 0.3,
                letterSpacing: "0.2em",
                marginBottom: 20,
              }}
            >
              <GlitchText text="SYSTEM INITIALIZED // DIGITAL STUDIO" delay={0} speed={25} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <h1 style={{ lineHeight: 0.92 }}>
                <span style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(3rem, 12vw, 7rem)",
                  color: "var(--text-primary)",
                  display: "block",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  <GlitchText text="COK" delay={200} speed={50} />
                  <span style={{
                    color: "var(--neon-primary)",
                    textShadow: "0 0 60px rgba(0,255,170,0.2), 0 0 120px rgba(0,255,170,0.05)",
                  }}>
                    <GlitchText text="TECH" delay={350} speed={50} />
                  </span>
                </span>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 0.7, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: "clamp(1.2rem, 3.5vw, 2.8rem)",
                    color: "var(--neon-primary)",
                    letterSpacing: "0.04em",
                    textShadow: "0 0 35px rgba(0,255,170,0.2)",
                  }}
                >
                  .digital
                </motion.span>
              </h1>

              {/* Color bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-1 mt-5"
                style={{ transformOrigin: "center" }}
              >
                {["#00ffaa","#00e5ff","#FF3D71","#a855f7","#FF8C00","#ff4757","#4A9EFF"].map((c, i) => (
                  <motion.div
                    key={c}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 + i * 0.06 }}
                    style={{
                      width: i === 0 || i === 6 ? 16 : 6,
                      height: 2,
                      background: c,
                      boxShadow: `0 0 8px ${c}50`,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtitle */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mt-5"
            >
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(13px, 1.4vw, 16px)",
                color: "rgba(200,196,208,0.4)",
                lineHeight: 1.8,
                maxWidth: 380,
                margin: "0 auto",
              }}>
                Weby, e-shopy a AI automatizácia<br />
                pre firmy, ktoré chcú výsledky.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <MagneticButton
                onClick={scrollToWorld}
                strength={0.25}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  fontSize: 11,
                  color: "var(--neon-primary)",
                  background: "rgba(0,255,170,0.04)",
                  border: "1px solid rgba(0,255,170,0.2)",
                  padding: "10px 28px",
                  letterSpacing: "0.12em",
                  cursor: "none",
                  display: "inline-block",
                  transition: "border-color 0.3s, box-shadow 0.3s, background 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,170,0.5)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 30px rgba(0,255,170,0.1)";
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,255,170,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,170,0.2)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,255,170,0.04)";
                }}
              >
                [ VSTÚPIŤ DO SVETA ]
              </MagneticButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 0.2 : 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 flex flex-col items-center gap-1"
        >
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: "var(--neon-primary)", letterSpacing: "0.15em" }}
          >
            SCROLL
          </motion.div>
          <motion.div
            animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 1, height: 16, background: "var(--neon-primary)", transformOrigin: "top" }}
          />
        </motion.div>
      </div>

      {/* Hidden zones — easter eggs */}
      <div className="absolute top-0 left-0 w-16 h-16 z-30 secret-zone" onClick={() => window.location.href = "/archive"} style={{ cursor: "none" }} />
      <div className="absolute bottom-0 right-0 w-16 h-16 z-30 secret-zone" onClick={() => window.location.href = "/memory"} style={{ cursor: "none" }} />
    </section>
  );
};

export default HeroSection;
