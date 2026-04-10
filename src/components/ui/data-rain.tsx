import { useEffect, useRef } from "react";

/**
 * Matrix-style data rain — lightweight canvas effect.
 * Only draws a sparse set of columns at low FPS for minimal CPU use.
 */
const DataRain = ({ opacity = 0.04, color = "#00ffaa" }: { opacity?: number; color?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      const fontSize = 12;
      // Only use ~1/3 of possible columns for sparsity
      columns = Math.floor(w / fontSize / 3);
      drops = Array.from({ length: columns }, () => Math.random() * -(h / fontSize));
    };
    resize();
    window.addEventListener("resize", resize);

    const chars = "01アイウエオカキクケコサシスセソ";
    const fontSize = 12;

    let animId: number;
    let lastTime = 0;
    const INTERVAL = 100; // ~10 FPS — plenty for this effect

    const tick = (time: number) => {
      animId = requestAnimationFrame(tick);
      if (time - lastTime < INTERVAL) return;
      lastTime = time;

      // Strong fade so characters don't accumulate
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        // Spread columns evenly across width with some randomness
        const x = (i * 3 + (i % 2)) * fontSize;
        const y = drops[i] * fontSize;

        // Head character — brighter
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity * 1.5;
        ctx.fillText(char, x, y);

        // Reset when off screen
        if (y > h) {
          drops[i] = Math.random() * -20;
        }
        drops[i] += 0.4 + Math.random() * 0.2;
      }

      ctx.globalAlpha = 1;
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [opacity, color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1, opacity: 0.35 }}
    />
  );
};

export default DataRain;
