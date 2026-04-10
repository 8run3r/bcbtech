/**
 * WorldEntryAnimation — Full-screen 5-second "entering the world" transition.
 *
 * Visual: tunnel warp effect with expanding rings, particle burst,
 * color-coded to the selected world (green=Digital, orange=Automation).
 * After animation completes, calls onComplete callback.
 */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface WorldEntryAnimationProps {
  active: boolean;
  world: "digital" | "automation";
  onComplete: () => void;
}

const DURATION = 4500; // ms

const RINGS = Array.from({ length: 8 }, (_, i) => i);
const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  angle: (i / 30) * Math.PI * 2 + Math.random() * 0.5,
  speed: 0.5 + Math.random() * 1.5,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 0.8,
}));

const WorldEntryAnimation = ({ active, world, onComplete }: WorldEntryAnimationProps) => {
  const [phase, setPhase] = useState<"idle" | "warp" | "flash" | "fade">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const color = world === "digital" ? "#00ffaa" : "#FF8C00";
  const colorRgb = world === "digital" ? "0,255,170" : "255,140,0";
  const label = world === "digital" ? "WORLD_01 // デジタル" : "WORLD_02 // 自動化";

  useEffect(() => {
    if (!active) {
      setPhase("idle");
      return;
    }

    setPhase("warp");

    // Canvas tunnel animation
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d")!;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;

      const startTime = performance.now();

      const draw = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / DURATION, 1);

        ctx.fillStyle = `rgba(5,5,8,${0.15 + t * 0.1})`;
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        // Tunnel rings expanding outward
        const ringCount = 12;
        for (let i = 0; i < ringCount; i++) {
          const ringT = ((t * 3 + i / ringCount) % 1);
          const radius = ringT * Math.max(w, h) * 0.8;
          const alpha = (1 - ringT) * (0.3 + t * 0.4);

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${colorRgb},${alpha})`;
          ctx.lineWidth = 1 + (1 - ringT) * 3;
          ctx.stroke();
        }

        // Speed lines from center
        const lineCount = 40;
        for (let i = 0; i < lineCount; i++) {
          const angle = (i / lineCount) * Math.PI * 2;
          const innerR = 20 + t * 60;
          const outerR = innerR + 100 + t * 400;
          const alpha = 0.1 + t * 0.3;

          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
          ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
          ctx.strokeStyle = `rgba(${colorRgb},${alpha * (0.3 + Math.random() * 0.7)})`;
          ctx.lineWidth = 0.5 + Math.random() * 1.5;
          ctx.stroke();
        }

        // Central glow
        const glowRadius = 50 + t * 200;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
        gradient.addColorStop(0, `rgba(${colorRgb},${0.4 * t})`);
        gradient.addColorStop(0.5, `rgba(${colorRgb},${0.1 * t})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - glowRadius, cy - glowRadius, glowRadius * 2, glowRadius * 2);

        // Floating particles
        for (const p of PARTICLES) {
          const pt = Math.max(0, t - p.delay);
          if (pt <= 0) continue;
          const dist = pt * p.speed * Math.max(w, h) * 0.5;
          const px = cx + Math.cos(p.angle) * dist;
          const py = cy + Math.sin(p.angle) * dist;
          const pa = Math.max(0, 1 - pt * 1.5) * 0.8;

          ctx.beginPath();
          ctx.arc(px, py, p.size * (1 + pt), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorRgb},${pa})`;
          ctx.fill();
        }

        if (t < 1) {
          rafRef.current = requestAnimationFrame(draw);
        }
      };

      rafRef.current = requestAnimationFrame(draw);
    }

    // Phase transitions
    timerRef.current = setTimeout(() => {
      setPhase("flash");
      setTimeout(() => {
        setPhase("fade");
        setTimeout(() => {
          onComplete();
        }, 600);
      }, 400);
    }, DURATION - 1000);

    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, color, colorRgb, onComplete]);

  return (
    <AnimatePresence>
      {active && phase !== "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "#050508" }}
        >
          {/* Canvas tunnel */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
            style={{ opacity: phase === "flash" ? 0 : 1, transition: "opacity 0.3s" }}
          />

          {/* White flash */}
          {phase === "flash" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
              style={{ background: color, mixBlendMode: "screen" }}
            />
          )}

          {/* Center label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: phase === "warp" ? [0, 1, 1, 0.8] : 0,
              scale: phase === "warp" ? [0.8, 1, 1, 1.5] : 2,
            }}
            transition={{
              duration: DURATION / 1000,
              times: [0, 0.1, 0.7, 1],
              ease: "easeInOut",
            }}
            className="relative z-10 text-center pointer-events-none"
          >
            <p
              className="font-mono text-xs tracking-[0.3em] mb-3"
              style={{ color, fontFamily: "'JetBrains Mono',monospace" }}
            >
              ENTERING
            </p>
            <h2
              className="font-bold text-3xl sm:text-5xl tracking-tight"
              style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}
            >
              {label}
            </h2>

            {/* Loading bar */}
            <div className="mt-6 w-48 mx-auto h-px overflow-hidden" style={{ background: `rgba(${colorRgb},0.2)` }}>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: DURATION / 1000 - 0.5, ease: "easeInOut" }}
                style={{ height: "100%", background: color }}
              />
            </div>
          </motion.div>

          {/* Corner brackets */}
          {["top-6 left-6 border-t border-l", "top-6 right-6 border-t border-r", "bottom-6 left-6 border-b border-l", "bottom-6 right-6 border-b border-r"].map(
            (cls, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`absolute w-6 h-6 pointer-events-none ${cls}`}
                style={{ borderColor: color }}
              />
            )
          )}

          {/* HUD text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs tracking-widest"
            style={{ color, fontFamily: "'JetBrains Mono',monospace", fontSize: 9 }}
          >
            INITIALIZING SYSTEMS...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorldEntryAnimation;
