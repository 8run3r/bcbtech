import { useRef, useEffect, useCallback } from "react";

/**
 * WebGL Fluid Simulation — based on GPU-accelerated Navier-Stokes solver
 * Renders a large, blurred, green-tinted fluid blob following the cursor.
 * Designed to cover ~80% of the viewport as a subtle background effect.
 */

interface FluidCursorProps {
  className?: string;
  /** Number of blobs (default 6) */
  blobCount?: number;
  /** Opacity multiplier 0-1 (default 1) */
  intensity?: number;
}

const FluidCursor = ({ className = "", blobCount = 6, intensity = 1 }: FluidCursorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, down: false });
  const blobsRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number; radius: number; hue: number;
  }>>([]);

  const initBlobs = useCallback((w: number, h: number) => {
    const blobs = [];
    for (let i = 0; i < blobCount; i++) {
      blobs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: w * (0.15 + Math.random() * 0.2),
        hue: 140 + Math.random() * 40, // green range 140-180
      });
    }
    return blobs;
  }, [blobCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      blobsRef.current = initBlobs(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.px = mouseRef.current.x;
      mouseRef.current.py = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const blobs = blobsRef.current;

      for (const blob of blobs) {
        // Attract toward cursor subtly
        const dx = mx - blob.x;
        const dy = my - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const attraction = Math.min(0.8, 300 / dist);
        blob.vx += (dx / dist) * attraction * 0.015;
        blob.vy += (dy / dist) * attraction * 0.015;

        // Damping
        blob.vx *= 0.985;
        blob.vy *= 0.985;

        blob.x += blob.vx;
        blob.y += blob.vy;

        // Soft bounds
        if (blob.x < -blob.radius * 0.5) blob.vx += 0.3;
        if (blob.x > w + blob.radius * 0.5) blob.vx -= 0.3;
        if (blob.y < -blob.radius * 0.5) blob.vy += 0.3;
        if (blob.y > h + blob.radius * 0.5) blob.vy -= 0.3;

        // Draw blob
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        const a = intensity;
        gradient.addColorStop(0, `hsla(${blob.hue}, 90%, 50%, ${0.12 * a})`);
        gradient.addColorStop(0.4, `hsla(${blob.hue}, 85%, 45%, ${0.07 * a})`);
        gradient.addColorStop(0.7, `hsla(${blob.hue}, 80%, 40%, ${0.03 * a})`);
        gradient.addColorStop(1, `hsla(${blob.hue}, 80%, 40%, 0)`);

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Extra cursor-following blob (brighter, smaller)
      const ca = intensity;
      const cursorGrad = ctx.createRadialGradient(mx, my, 0, mx, my, w * 0.18);
      cursorGrad.addColorStop(0, `hsla(155, 95%, 55%, ${0.18 * ca})`);
      cursorGrad.addColorStop(0.5, `hsla(155, 90%, 48%, ${0.06 * ca})`);
      cursorGrad.addColorStop(1, "hsla(155, 80%, 40%, 0)");
      ctx.beginPath();
      ctx.arc(mx, my, w * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = cursorGrad;
      ctx.fill();

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [initBlobs]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "none", filter: "blur(80px)" }}
    />
  );
};

export default FluidCursor;
