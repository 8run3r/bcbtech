import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import MagneticButton from "@/components/ui/magnetic-button";

/* ── Canvas — aurora + floating mesh with 4-color palette ── */
const HeroCanvas = () => {
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
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W; canvas.height = H;
    });
    ro.observe(canvas);

    const COLORS = ["0,255,170", "255,140,0", "255,61,113", "74,158,255"];

    const auroraBands = [
      { yBase: 0.18, freq: 0.003, amp: 20, speed: 0.14, colorIdx: 0, thickness: 35 },
      { yBase: 0.40, freq: 0.004, amp: 18, speed: 0.18, colorIdx: 1, thickness: 30 },
      { yBase: 0.62, freq: 0.0035, amp: 22, speed: 0.12, colorIdx: 2, thickness: 32 },
      { yBase: 0.82, freq: 0.005, amp: 14, speed: 0.22, colorIdx: 3, thickness: 25 },
    ];

    // Floating particles
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.8 + Math.random() * 1.5,
      speedY: -0.0001 - Math.random() * 0.0003,
      speedX: (Math.random() - 0.5) * 0.0001,
      colorIdx: Math.floor(Math.random() * COLORS.length),
      pulse: Math.random() * Math.PI * 2,
    }));

    let last = performance.now();

    const draw = (now: number) => {
      const dt = (now - last) / 1000; last = now;
      timeRef.current += dt;
      const t = timeRef.current;

      ctx.clearRect(0, 0, W, H);

      // ── Dot mesh grid ──
      const spacing = 48;
      const cx = W / 2; const cy = H / 2;
      for (let gx = 0; gx * spacing < W; gx++) {
        for (let gy = 0; gy * spacing < H; gy++) {
          const bx = gx * spacing; const by = gy * spacing;
          const dist = Math.sqrt((bx - cx) ** 2 + (by - cy) ** 2);
          const maxDist = Math.max(W, H) * 0.55;
          if (dist > maxDist) continue;
          const wave = Math.sin(bx * 0.008 + t * 0.35) * 2.5 + Math.cos(by * 0.008 + t * 0.25) * 2.5;
          const dx = bx + wave; const dy = by + Math.sin(bx * 0.005 + by * 0.005 + t * 0.18) * 2.5;
          const distFade = 1 - dist / maxDist;
          const dotAlpha = 0.04 * distFade * distFade;
          if (dotAlpha < 0.003) continue;
          // Color based on position quadrant
          const qx = bx < W / 2 ? 0 : 1;
          const qy = by < H / 2 ? 0 : 1;
          const ci = qx + qy * 2;
          ctx.fillStyle = `rgba(${COLORS[ci]},${dotAlpha})`;
          ctx.fillRect(dx - 0.6, dy - 0.6, 1.2, 1.2);
        }
      }

      // ── Aurora bands ──
      for (const band of auroraBands) {
        const y = band.yBase * H;
        const rgb = COLORS[band.colorIdx];
        ctx.beginPath();
        ctx.moveTo(0, y - band.thickness);
        for (let x = 0; x <= W; x += 8) {
          const wave = Math.sin(x * band.freq + t * band.speed) * band.amp;
          ctx.lineTo(x, y + wave);
        }
        ctx.lineTo(W, y + band.thickness + 15);
        ctx.lineTo(0, y + band.thickness + 15);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, y - band.thickness, 0, y + band.thickness + 15);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.4, `rgba(${rgb},0.018)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ── Floating particles ──
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += dt * 0.8;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        if (p.x < -0.05 || p.x > 1.05) p.speedX *= -1;

        const px = p.x * W;
        const py = p.y * H;
        const pulseAlpha = 0.06 + Math.sin(p.pulse) * 0.03;
        ctx.fillStyle = `rgba(${COLORS[p.colorIdx]},${pulseAlpha})`;
        ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

/* ── Main HeroSection — minimal, one world ── */
const HeroSection = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timer);
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

      {/* CRT vignette */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />

      {/* Content — centered */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-5 sm:px-10">
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 8,
                color: "var(--neon-primary)",
                opacity: 0.35,
                letterSpacing: "0.2em",
                marginBottom: 16,
                textTransform: "uppercase",
              }}>
                Digital Studio · Levice SK
              </p>

              <h1 style={{ lineHeight: 0.92 }}>
                <span style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(3rem, 8vw, 5.5rem)",
                  color: "var(--text-primary)",
                  display: "block",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}>
                  COK<span style={{
                    color: "var(--neon-primary)",
                    textShadow: "0 0 40px rgba(0,255,170,0.15)",
                  }}>TECH</span>
                </span>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)",
                  color: "var(--neon-primary)",
                  opacity: 0.75,
                  letterSpacing: "0.04em",
                  textShadow: "0 0 35px rgba(0,255,170,0.2)",
                }}>
                  .digital
                </span>
              </h1>

              {/* Color accent dots */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-3 mt-4"
              >
                <div style={{ width: 20, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,255,170,0.3))" }} />
                {["#00ffaa", "#FF8C00", "#FF3D71", "#4A9EFF"].map((c) => (
                  <div key={c} style={{ width: 3, height: 3, background: c, boxShadow: `0 0 6px ${c}40` }} />
                ))}
                <div style={{ width: 20, height: 1, background: "linear-gradient(270deg, transparent, rgba(74,158,255,0.3))" }} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-center mt-5"
            >
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(13px, 1.3vw, 15px)",
                color: "rgba(200,196,208,0.38)",
                lineHeight: 1.7,
                maxWidth: 340,
                margin: "0 auto",
              }}>
                Weby, e-shopy a AI automatizácia<br />
                pre firmy, ktoré chcú výsledky.
              </p>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: 1,
                  background: "linear-gradient(90deg, transparent, rgba(0,255,170,0.15), rgba(255,140,0,0.1), transparent)",
                  marginTop: "1.2rem",
                  transformOrigin: "center",
                  maxWidth: 220,
                  margin: "1.2rem auto 0",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Single enter button */}
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
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
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,170,0.5)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 0 25px rgba(0,255,170,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,255,170,0.2)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
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
          animate={{ opacity: visible ? 0.2 : 0 }}
          transition={{ delay: 1 }}
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

      {/* Hidden zones */}
      <div className="absolute top-0 left-0 w-16 h-16 z-30 secret-zone" onClick={() => window.location.href = "/archive"} style={{ cursor: "none" }} />
      <div className="absolute bottom-0 right-0 w-16 h-16 z-30 secret-zone" onClick={() => window.location.href = "/memory"} style={{ cursor: "none" }} />
    </section>
  );
};

export default HeroSection;
