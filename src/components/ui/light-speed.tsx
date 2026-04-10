'use client';
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LightSpeedProps {
  className?: string;
  color?: string;
  count?: number;
  speed?: number;
  opacity?: number;
}

export const LightSpeed = ({
  className,
  color = "#7B61FF",
  count = 120,
  speed = 0.018,
  opacity = 0.55,
}: LightSpeedProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Parse hex color to RGB
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Each star: angle from center, distance, speed multiplier
    const stars = Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 0.5,
      speed: 0.3 + Math.random() * 0.7,
      width: 0.5 + Math.random() * 1.5,
    }));

    const draw = () => {
      ctx.fillStyle = "rgba(5,5,8,0.18)";
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy);

      for (const s of stars) {
        s.dist += speed * s.speed;
        if (s.dist > 1) {
          s.dist = 0.01;
          s.angle = Math.random() * Math.PI * 2;
        }

        const r1 = s.dist * maxR;
        const r2 = (s.dist + speed * s.speed * 6) * maxR;
        const x1 = cx + Math.cos(s.angle) * r1;
        const y1 = cy + Math.sin(s.angle) * r1;
        const x2 = cx + Math.cos(s.angle) * r2;
        const y2 = cy + Math.sin(s.angle) * r2;

        const alpha = Math.min(opacity, s.dist * opacity * 2);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = s.width * (0.5 + s.dist);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [color, count, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full", className)}
    />
  );
};

export default LightSpeed;
