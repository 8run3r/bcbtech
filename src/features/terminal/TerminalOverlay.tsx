import { useEffect, useRef, useState } from "react";
import { subscribeOverlay } from "./events";
import type { OverlayKind } from "./types";

const TerminalOverlay = () => {
  const [kind, setKind] = useState<OverlayKind>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return subscribeOverlay((newKind, durationMs) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setKind(newKind);
      if (newKind && durationMs) {
        timeoutRef.current = window.setTimeout(() => setKind(null), durationMs);
      }
    });
  }, []);

  // Esc to dismiss
  useEffect(() => {
    if (!kind) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setKind(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [kind]);

  if (!kind) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        pointerEvents: kind === "boot" || kind === "matrix" ? "auto" : "none",
      }}
    >
      {kind === "matrix" && <MatrixRain />}
      {kind === "glitch" && <GlitchOverlay />}
      {kind === "panic" && <PanicOverlay />}
      {kind === "boot" && <BootOverlay />}
      {kind === "scan" && <ScanOverlay />}
      {kind === "vacuum" && <VacuumOverlay />}
    </div>
  );
};

export default TerminalOverlay;

/* ── Matrix rain — Canvas, classic green katakana ── */
const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const fontSize = 16;
    const cols = Math.floor(w / fontSize);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    const chars = "アァカサタナハマヤラワガザダバパｱｲｳｴｵ0123456789@#$%&*+-?!";
    let raf = 0;

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = drops[i] * fontSize < 0 ? "rgba(0,255,170,0.0)" : `rgba(0,255,170,${0.6 + Math.random() * 0.4})`;
        ctx.fillText(ch, x, y);
        // head highlight
        if (Math.random() > 0.96) {
          ctx.fillStyle = "rgba(255,255,255,0.85)";
          ctx.fillText(ch, x, y);
        }
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.92)" }}
    />
  );
};

/* ── Glitch — chromatic aberration + shake on whole document body ── */
const GlitchOverlay = () => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("ct-glitch");
    return () => root.classList.remove("ct-glitch");
  }, []);
  return (
    <>
      <style>{`
        .ct-glitch body {
          animation: ct-glitch-shake 0.18s steps(2) infinite;
          filter: contrast(1.1) saturate(1.2);
        }
        .ct-glitch body::before {
          content: '';
          position: fixed; inset: 0;
          background: linear-gradient(rgba(255,0,80,0.04), rgba(0,255,170,0.04));
          mix-blend-mode: screen;
          pointer-events: none; z-index: 99998;
          animation: ct-glitch-rgb 0.15s steps(2) infinite;
        }
        .ct-glitch body::after {
          content: '';
          position: fixed; inset: 0;
          background: repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.4) 3px, transparent 4px);
          pointer-events: none; z-index: 99997;
        }
        @keyframes ct-glitch-shake {
          0% { transform: translate(0,0) }
          25% { transform: translate(-2px,1px) }
          50% { transform: translate(2px,-1px) }
          75% { transform: translate(-1px,2px) }
          100% { transform: translate(1px,-2px) }
        }
        @keyframes ct-glitch-rgb {
          0%   { background: linear-gradient(rgba(255,0,80,0.06), rgba(0,255,170,0.04)); }
          50%  { background: linear-gradient(rgba(0,255,170,0.06), rgba(255,0,80,0.04)); }
          100% { background: linear-gradient(rgba(255,200,0,0.04), rgba(0,200,255,0.04)); }
        }
      `}</style>
    </>
  );
};

/* ── Panic — red alert flash ── */
const PanicOverlay = () => (
  <>
    <style>{`
      @keyframes ct-panic {
        0%, 100% { background: rgba(255,0,40,0); }
        50% { background: rgba(255,0,40,0.35); }
      }
    `}</style>
    <div
      style={{
        position: "absolute", inset: 0,
        animation: "ct-panic 0.32s ease-in-out infinite",
        boxShadow: "inset 0 0 200px rgba(255,0,40,0.6)",
      }}
    />
    <div
      style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        color: "#ff2244", fontFamily: "'JetBrains Mono', monospace",
        fontSize: 64, fontWeight: 800, letterSpacing: "0.2em",
        textShadow: "0 0 30px rgba(255,40,80,0.8)",
        animation: "ct-panic 0.32s ease-in-out infinite",
      }}
    >
      PANIC
    </div>
  </>
);

/* ── Scan — horizontal scan bar over grid ── */
const ScanOverlay = () => (
  <>
    <style>{`
      @keyframes ct-scan { 0% { top: -10% } 100% { top: 110% } }
    `}</style>
    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.78)" }} />
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "linear-gradient(rgba(0,255,170,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.07) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
    }} />
    <div style={{
      position: "absolute", left: 0, right: 0, height: 40, top: "0%",
      background: "linear-gradient(180deg, transparent, rgba(0,255,170,0.4), transparent)",
      animation: "ct-scan 1.6s linear infinite",
    }} />
    <div style={{
      position: "absolute", top: 24, left: "50%", transform: "translateX(-50%)",
      color: "rgba(0,255,170,0.6)", fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11, letterSpacing: "0.3em",
    }}>
      ⏵ RECON SCAN ACTIVE
    </div>
  </>
);

/* ── Boot — fake OS boot sequence ── */
const BOOT_LINES = [
  "[ 0.000 ] Booting CokTech_OS v2.4.1",
  "[ 0.012 ] CPU: detected — 16-core neural lattice",
  "[ 0.045 ] MEM: 32 GB + 12 TB swap (galaxy-mounted)",
  "[ 0.097 ] Loading kernel modules...",
  "[ 0.182 ] mod_brand          ✓",
  "[ 0.241 ] mod_supabase       ✓",
  "[ 0.318 ] mod_three          ✓",
  "[ 0.402 ] mod_framer         ✓",
  "[ 0.521 ] mod_tailwind       ✓",
  "[ 0.611 ] Mounting / as ro... ok",
  "[ 0.732 ] Spawning daemons   ✓",
  "[ 0.901 ] Network: 100% ✓",
  "[ 1.044 ] Coffee level: ▓▓▓▓▓▓▓▓░░ 80%",
  "[ 1.200 ] WELCOME, BRUNO",
];
const BootOverlay = () => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      if (i > BOOT_LINES.length) {
        clearInterval(id);
        return;
      }
      setShown(i);
    }, 280);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      position: "absolute", inset: 0, background: "#000",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 12, color: "#00ffaa",
      padding: "60px 40px",
      overflow: "hidden",
    }}>
      {BOOT_LINES.slice(0, shown).map((l, i) => (
        <div key={i} style={{ marginBottom: 4, opacity: i === shown - 1 ? 1 : 0.6 }}>{l}</div>
      ))}
      {shown >= BOOT_LINES.length && (
        <div style={{ marginTop: 24, color: "#fff", fontSize: 18, letterSpacing: "0.2em" }}>
          ▸ SYSTEM READY
        </div>
      )}
    </div>
  );
};

/* ── Vacuum — sucks the whole #root toward the center ── */
const VacuumOverlay = () => {
  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) return;
    const original = root.style.cssText;
    root.style.transformOrigin = "center";
    root.style.transition = "transform 4.8s cubic-bezier(0.55, 0, 1, 0.45), filter 4.8s ease-in";
    requestAnimationFrame(() => {
      root.style.transform = "scale(0.04) rotate(720deg)";
      root.style.filter = "blur(2px)";
    });
    const restoreId = window.setTimeout(() => {
      root.style.transition = "transform 0.4s ease-out, filter 0.4s ease-out";
      root.style.transform = "scale(1) rotate(0deg)";
      root.style.filter = "blur(0)";
      window.setTimeout(() => {
        root.style.cssText = original;
      }, 500);
    }, 5200);
    return () => {
      window.clearTimeout(restoreId);
      root.style.cssText = original;
    };
  }, []);
  return null;
};
