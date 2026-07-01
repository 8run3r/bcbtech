import { useEffect, useRef } from "react";

/**
 * NeuralNetCanvas — full-page fixed 2D particle network.
 * Drifting nodes linked by distance-based lines; nodes near the cursor
 * get attracted + highlighted, and lines toward the cursor glow.
 * Tinted by `accent` (lerps smoothly when it changes).
 * Capped at ~30fps, pauses on tab hide / off-screen, and renders a single
 * static frame under prefers-reduced-motion.
 */

interface NeuralNetCanvasProps {
  /** Hex accent color, e.g. "#00ffaa" — transitions smoothly when it changes */
  accent?: string;
  /** Overall layer opacity */
  opacity?: number;
}

interface NetNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = Number.parseInt(full, 16);
  if (full.length !== 6 || Number.isNaN(num)) return [0, 255, 170];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const NeuralNetCanvas = ({ accent = "#00ffaa", opacity = 0.55 }: NeuralNetCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRgbRef = useRef<[number, number, number]>(hexToRgb(accent));
  const staticRedrawRef = useRef<(() => void) | null>(null);

  // Accent changes only move the target — the running loop lerps toward it.
  useEffect(() => {
    targetRgbRef.current = hexToRgb(accent);
    staticRedrawRef.current?.();
  }, [accent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const NODE_COUNT = window.innerWidth < 768 ? 35 : 70;
    const LINK_DIST = 120;
    const CURSOR_DIST = 160;
    const FRAME_MS = 1000 / 30;

    let w = window.innerWidth;
    let h = window.innerHeight;

    const nodes: NetNode[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 1 + Math.random() * 1.6,
    }));

    const mouse = { x: -9999, y: -9999 };
    const rgb: [number, number, number] = [
      targetRgbRef.current[0],
      targetRgbRef.current[1],
      targetRgbRef.current[2],
    ];

    const applySize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const n of nodes) {
        if (n.x > w) n.x = Math.random() * w;
        if (n.y > h) n.y = Math.random() * h;
      }
    };
    applySize();

    const step = () => {
      // lerp tint toward the active section accent
      rgb[0] += (targetRgbRef.current[0] - rgb[0]) * 0.07;
      rgb[1] += (targetRgbRef.current[1] - rgb[1]) * 0.07;
      rgb[2] += (targetRgbRef.current[2] - rgb[2]) * 0.07;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // gentle cursor attraction
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CURSOR_DIST * CURSOR_DIST) {
          const d = Math.sqrt(d2) || 1;
          const pull = (1 - d / CURSOR_DIST) * 0.012;
          n.x += dx * pull;
          n.y += dy * pull;
        }

        // wrap around edges
        if (n.x < -20) n.x = w + 20;
        else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        else if (n.y > h + 20) n.y = -20;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const cr = Math.round(rgb[0]);
      const cg = Math.round(rgb[1]);
      const cb = Math.round(rgb[2]);

      // node ↔ node links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.22;
          ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // node → cursor links, brighter glow
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > CURSOR_DIST * CURSOR_DIST) continue;
        const t = 1 - Math.sqrt(d2) / CURSOR_DIST;
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(t * 0.5).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      // nodes — small squares, highlighted near cursor
      for (const n of nodes) {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const near = dx * dx + dy * dy < CURSOR_DIST * CURSOR_DIST;
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${near ? 0.9 : 0.45})`;
        const s = near ? n.size + 1 : n.size;
        ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
      }
    };

    // ── Reduced motion: one static frame, no loop, no pointer tracking ──
    if (reduced) {
      const drawStatic = () => {
        rgb[0] = targetRgbRef.current[0];
        rgb[1] = targetRgbRef.current[1];
        rgb[2] = targetRgbRef.current[2];
        draw();
      };
      const onResizeStatic = () => {
        applySize();
        drawStatic();
      };
      staticRedrawRef.current = drawStatic;
      drawStatic();
      window.addEventListener("resize", onResizeStatic);
      return () => {
        staticRedrawRef.current = null;
        window.removeEventListener("resize", onResizeStatic);
      };
    }

    // ── Animated loop — ~30fps cap via delta accumulation ──
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let running = false;
    let disposed = false;
    let tabVisible = document.visibilityState === "visible";
    let onScreen = true;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      acc += now - last;
      last = now;
      if (acc < FRAME_MS) return;
      acc = Math.min(acc % FRAME_MS, FRAME_MS);
      step();
      draw();
    };

    const start = () => {
      if (running || disposed) return;
      running = true;
      last = performance.now();
      acc = FRAME_MS;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    };
    const sync = () => {
      if (tabVisible && onScreen) start();
      else stop();
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onResize = () => applySize();
    const onVisibility = () => {
      tabVisible = document.visibilityState === "visible";
      sync();
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(canvas);

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    sync();

    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity, width: "100%", height: "100%" }}
    />
  );
};

export default NeuralNetCanvas;
