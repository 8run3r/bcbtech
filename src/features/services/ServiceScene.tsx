import { useEffect, useRef } from "react";

interface SceneProps {
  variant?: "ac-mist" | "camera-grid" | "circuit" | "solar" | "alarm-pulse";
  accent: string;
  accentRaw: string;
}

/**
 * Lightweight canvas-based hero scene per service slug.
 * No Three.js — keeps bundle small. Reduced motion respected.
 */
const ServiceScene = ({ variant = "ac-mist", accent, accentRaw }: SceneProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let t = 0;

    /* ─ AC mist: cool particles flowing right with sinusoidal drift ─ */
    const mistParticles = Array.from({ length: reduced ? 30 : 90 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0.4 + Math.random() * 1.6,
      r: 1 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      a: 0.15 + Math.random() * 0.4,
    }));

    /* ─ Camera grid: rotating scan line + grid pulse ─ */
    const gridSize = 40;

    /* ─ Circuit: directed edges in a graph that pulse on/off ─ */
    const nodes = Array.from({ length: 14 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
    }));
    const edges = nodes.flatMap((_, i) =>
      [i + 1, i + 3].filter((j) => j < nodes.length).map((j) => ({ a: i, b: j, p: Math.random() }))
    );

    /* ─ Solar: orbital rings with rotating sun glyph ─ */

    /* ─ Alarm pulse: concentric rings with stochastic glitch ─ */

    const drawAcMist = () => {
      ctx.clearRect(0, 0, w, h);

      // background gradient subtle
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, `rgba(${accentRaw},0.04)`);
      grad.addColorStop(1, `rgba(${accentRaw},0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // emission line on the left (vent)
      ctx.strokeStyle = `rgba(${accentRaw},0.5)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, h * 0.3);
      ctx.lineTo(20, h * 0.7);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${accentRaw},0.2)`;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(20, h * 0.5 + i * 18);
        ctx.lineTo(40, h * 0.5 + i * 18);
        ctx.stroke();
      }

      for (const p of mistParticles) {
        if (!reduced) {
          p.x += p.vx;
          p.y += Math.sin(t * 0.05 + p.phase) * 0.3;
        }
        if (p.x > w + 10) {
          p.x = -10;
          p.y = h * 0.35 + Math.random() * h * 0.3;
        }

        const fade = 1 - p.x / w;
        ctx.fillStyle = `rgba(${accentRaw},${p.a * fade})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawCameraGrid = () => {
      ctx.clearRect(0, 0, w, h);

      // grid
      ctx.strokeStyle = `rgba(${accentRaw},0.08)`;
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // scan line
      const scanY = ((reduced ? 0.5 : (Math.sin(t * 0.012) + 1) * 0.5) * h);
      const scanGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30);
      scanGrad.addColorStop(0, `rgba(${accentRaw},0)`);
      scanGrad.addColorStop(0.5, `rgba(${accentRaw},0.4)`);
      scanGrad.addColorStop(1, `rgba(${accentRaw},0)`);
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, w, 60);

      // crosshair
      const cx = w * 0.55;
      const cy = h * 0.5;
      ctx.strokeStyle = `rgba(${accentRaw},0.7)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 50, cy);
      ctx.lineTo(cx - 10, cy);
      ctx.moveTo(cx + 10, cy);
      ctx.lineTo(cx + 50, cy);
      ctx.moveTo(cx, cy - 50);
      ctx.lineTo(cx, cy - 10);
      ctx.moveTo(cx, cy + 10);
      ctx.lineTo(cx, cy + 50);
      ctx.stroke();

      // REC indicator
      ctx.fillStyle = `rgba(${accentRaw},${(Math.sin(t * 0.1) + 1) * 0.4 + 0.2})`;
      ctx.beginPath();
      ctx.arc(w - 30, 30, 6, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCircuit = () => {
      ctx.clearRect(0, 0, w, h);

      // edges with directed pulse
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        ctx.strokeStyle = `rgba(${accentRaw},0.18)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        if (!reduced) e.p = (e.p + 0.006) % 1;
        const px = a.x + (b.x - a.x) * e.p;
        const py = a.y + (b.y - a.y) * e.p;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodes
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${accentRaw},0.5)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = accent;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const drawSolar = () => {
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const angle = reduced ? 0 : t * 0.005;

      // orbital rings
      [60, 100, 150].forEach((r, i) => {
        ctx.strokeStyle = `rgba(${accentRaw},${0.1 + i * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // orbiting dot
        const a = angle * (i % 2 === 0 ? 1 : -1) + i;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // sun core
      const pulse = (Math.sin(t * 0.05) + 1) * 0.5;
      ctx.fillStyle = `rgba(${accentRaw},${0.3 + pulse * 0.3})`;
      ctx.beginPath();
      ctx.arc(cx, cy, 24 + pulse * 6, 0, Math.PI * 2);
      ctx.fill();

      // sun rays
      ctx.strokeStyle = `rgba(${accentRaw},0.4)`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + angle * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 32, cy + Math.sin(a) * 32);
        ctx.lineTo(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44);
        ctx.stroke();
      }
    };

    const drawAlarm = () => {
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;

      // expanding rings
      for (let i = 0; i < 4; i++) {
        const phase = (t * 0.008 + i * 0.25) % 1;
        const r = phase * Math.max(w, h) * 0.6;
        ctx.strokeStyle = `rgba(${accentRaw},${(1 - phase) * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // glitch ticks
      if (!reduced && Math.random() < 0.05) {
        const gy = Math.random() * h;
        ctx.fillStyle = `rgba(${accentRaw},0.6)`;
        ctx.fillRect(0, gy, w, 1);
      }

      // center diamond
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.5;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-12, -12, 24, 24);
      ctx.restore();
    };

    const draw = () => {
      switch (variant) {
        case "camera-grid":
          drawCameraGrid();
          break;
        case "circuit":
          drawCircuit();
          break;
        case "solar":
          drawSolar();
          break;
        case "alarm-pulse":
          drawAlarm();
          break;
        case "ac-mist":
        default:
          drawAcMist();
      }
      t++;
      if (!reduced) rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [variant, accent, accentRaw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
      aria-hidden
    />
  );
};

export default ServiceScene;
