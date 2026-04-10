import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

const ParticleField = ({
  className = "",
  density = 2500,
  particleSize = 2.5,
  color = "255,255,255",
  particleOpacityScale = 1,
  connectionDistance = 100,
  connectionOpacity = 0.08,
}: {
  className?: string;
  density?: number;
  particleSize?: number;
  color?: string;
  particleOpacityScale?: number;
  connectionDistance?: number;
  connectionOpacity?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const raf = useRef<number>(0);

  const createParticle = useCallback((w: number, h: number): Particle => {
    const maxLife = 300 + Math.random() * 500;
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3 - 0.15,
      size: Math.random() * particleSize + 0.8,
      opacity: Math.random() * 0.7 + 0.2,
      life: Math.random() * maxLife,
      maxLife,
    };
  }, [particleSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const count = Math.min(Math.floor((canvas.offsetWidth * canvas.offsetHeight) / density), 350);
    particles.current = Array.from({ length: count }, () => createParticle(canvas.offsetWidth, canvas.offsetHeight));

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        p.life++;

        if (p.life > p.maxLife) {
          particles.current[i] = createParticle(w, h);
          continue;
        }

        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150 && dist > 0) {
          const force = (150 - dist) / 150 * 1.2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const lifeRatio = p.life / p.maxLife;
        const fade = lifeRatio < 0.1 ? lifeRatio / 0.1 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1;
        const alpha = p.opacity * Math.max(0, fade) * particleOpacityScale;

        // Glow halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha * 0.08})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fill();
      }

      // Connecting lines between nearby particles
      if (connectionDistance > 0) {
        const pts = particles.current;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          const aLife = a.life / a.maxLife;
          const aFade = aLife < 0.1 ? aLife / 0.1 : aLife > 0.8 ? (1 - aLife) / 0.2 : 1;
          if (aFade <= 0) continue;
          for (let j = i + 1; j < pts.length; j++) {
            const b = pts[j];
            const ddx = a.x - b.x;
            const ddy = a.y - b.y;
            const d = ddx * ddx + ddy * ddy;
            const maxD = connectionDistance * connectionDistance;
            if (d < maxD) {
              const bLife = b.life / b.maxLife;
              const bFade = bLife < 0.1 ? bLife / 0.1 : bLife > 0.8 ? (1 - bLife) / 0.2 : 1;
              if (bFade <= 0) continue;
              const proximity = 1 - Math.sqrt(d) / connectionDistance;
              const lineAlpha = proximity * connectionOpacity * Math.min(aFade, bFade) * particleOpacityScale;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(${color}, ${lineAlpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      raf.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [createParticle, density]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: "none" }}
    />
  );
};

export default ParticleField;
