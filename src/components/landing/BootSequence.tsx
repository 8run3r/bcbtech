import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GLITCH_CHARS = "█▓▒░╗╔╝╚═║┐┘┌└│─┤├┬┴┼◆◇○●";
const ACCENT_COLORS = ["0,255,170", "255,140,0", "255,61,113", "74,158,255"];

const BootSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"glitch" | "reveal" | "done">("glitch");
  const [glitchText, setGlitchText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  // Skip if already seen this session
  useEffect(() => {
    if (sessionStorage.getItem("ct-boot-seen") === "yes") {
      onComplete();
    }
  }, [onComplete]);

  // Glitch canvas — multicolor digital noise burst
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, W, H);

      // Digital noise lines — fade out over time, cycle through accent colors
      const intensity = Math.max(0, 1 - elapsed / 1.4);
      const lineCount = Math.floor(intensity * 30);

      for (let i = 0; i < lineCount; i++) {
        const y = Math.random() * H;
        const w = Math.random() * W * 0.6;
        const x = Math.random() * W;
        const rgb = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
        ctx.fillStyle = `rgba(${rgb},${0.03 + Math.random() * 0.07 * intensity})`;
        ctx.fillRect(x, y, w, 1);
      }

      // Occasional glitch blocks — multicolor
      if (Math.random() < intensity * 0.35) {
        const bx = Math.random() * W;
        const by = Math.random() * H;
        const bw = 20 + Math.random() * 100;
        const bh = 2 + Math.random() * 8;
        const rgb = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
        ctx.fillStyle = `rgba(${rgb},${0.04 + Math.random() * 0.1})`;
        ctx.fillRect(bx, by, bw, bh);
      }

      // Center convergence effect — lines pull toward center as reveal approaches
      if (elapsed > 0.6 && intensity > 0) {
        const cx = W / 2;
        const cy = H / 2;
        const convergence = Math.min(1, (elapsed - 0.6) / 0.8);
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = (1 - convergence) * Math.max(W, H) * 0.4 + 20;
          const lx = cx + Math.cos(angle) * dist;
          const ly = cy + Math.sin(angle) * dist;
          const len = 30 + Math.random() * 60;
          ctx.strokeStyle = `rgba(0,255,170,${0.04 * intensity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx + Math.cos(angle + Math.PI) * len, ly + Math.sin(angle + Math.PI) * len);
          ctx.stroke();
        }
      }

      if (elapsed < 2.5) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Glitch text scramble → reveal
  useEffect(() => {
    const target = "COKTECH.digital";
    let frame = 0;
    const totalFrames = 28;

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      if (progress >= 1) {
        setGlitchText(target);
        clearInterval(interval);
        setTimeout(() => {
          setPhase("reveal");
          setRevealed(true);
        }, 300);
        setTimeout(() => {
          setPhase("done");
          sessionStorage.setItem("ct-boot-seen", "yes");
          setTimeout(onComplete, 500);
        }, 1500);
        return;
      }

      // Scramble: progressively reveal real characters
      const chars = target.split("").map((ch, i) => {
        const charProgress = (progress * target.length - i) / 3;
        if (charProgress > 1) return ch;
        if (charProgress > 0) return Math.random() > 0.5 ? ch : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      });
      setGlitchText(chars.join(""));
    }, 35);

    return () => clearInterval(interval);
  }, [onComplete]);

  if (sessionStorage.getItem("ct-boot-seen") === "yes") return null;

  return (
    <AnimatePresence>
      {phase !== "done" ? (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ background: "#000" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Noise canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: 0.9 }}
          />

          {/* Scanlines overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "repeating-linear-gradient(transparent, transparent 1px, rgba(0,0,0,0.06) 1px, rgba(0,0,0,0.06) 2px)",
            }}
          />

          {/* Center logo */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Horizontal glitch line — multicolor */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: [0, 0.7, 0.35] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                width: 240,
                height: 1,
                background: "linear-gradient(90deg, transparent, #FF3D71, #00ffaa, #FF8C00, transparent)",
                marginBottom: 24,
              }}
            />

            {/* Logo text — glitch scramble */}
            <motion.h1
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(2.4rem, 7vw, 4.5rem)",
                color: "var(--text-primary)",
                letterSpacing: "0.08em",
                lineHeight: 1,
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              <span>{glitchText.slice(0, 3)}</span>
              <span style={{
                color: "var(--neon-primary)",
                textShadow: revealed ? "0 0 40px rgba(0,255,170,0.35)" : "none",
                transition: "text-shadow 0.5s, color 0.5s",
              }}>
                {glitchText.slice(3, 7)}
              </span>
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 500,
                fontSize: "clamp(1rem, 3vw, 1.8rem)",
                color: revealed ? "var(--neon-primary)" : "var(--text-dim)",
                opacity: 0.7,
                transition: "color 0.5s",
              }}>
                {glitchText.slice(7)}
              </span>
            </motion.h1>

            {/* Subtitle — appears after reveal */}
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: revealed ? 0.4 : 0, y: revealed ? 0 : 4 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 500,
                fontSize: 11,
                color: "var(--text-dim)",
                letterSpacing: "0.25em",
                marginTop: 16,
                textTransform: "uppercase",
              }}
            >
              Digital Studio · Levice
            </motion.p>

            {/* Color dots — 4 accent colors */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: revealed ? 1 : 0, scaleX: revealed ? 1 : 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 mt-5"
            >
              {["#00ffaa", "#FF8C00", "#FF3D71", "#4A9EFF"].map((c, i) => (
                <motion.div
                  key={c}
                  initial={{ scale: 0 }}
                  animate={{ scale: revealed ? 1 : 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                  style={{
                    width: 4,
                    height: 4,
                    background: c,
                    boxShadow: `0 0 8px ${c}50`,
                  }}
                />
              ))}
            </motion.div>

            {/* Bottom line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: revealed ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 140,
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(0,255,170,0.25), transparent)",
                marginTop: 16,
                transformOrigin: "center",
              }}
            />
          </div>

          {/* Skip */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 0.6 }}
            whileHover={{ opacity: 0.5 }}
            onClick={() => {
              sessionStorage.setItem("ct-boot-seen", "yes");
              onComplete();
            }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              color: "var(--text-dim)",
              letterSpacing: "0.2em",
              background: "none",
              border: "none",
              cursor: "none",
            }}
          >
            [ SKIP ]
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default BootSequence;
