import { useEffect, useRef } from "react";

/** Parallax pixel cityscape — 3 layers of procedural buildings */
const CityScape = ({ progress }: { progress: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buildingsRef = useRef<{ layers: { x: number; w: number; h: number; windows: number[] }[][] } | null>(null);

  // Generate buildings once
  if (!buildingsRef.current) {
    const gen = (count: number, minH: number, maxH: number, minW: number, maxW: number) => {
      const arr: { x: number; w: number; h: number; windows: number[] }[] = [];
      let cx = 0;
      for (let i = 0; i < count; i++) {
        const w = minW + Math.random() * (maxW - minW);
        const h = minH + Math.random() * (maxH - minH);
        const wins: number[] = [];
        const rows = Math.floor(h / 12);
        const cols = Math.floor(w / 10);
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++)
            if (Math.random() > 0.35) wins.push(r * 100 + c);
        arr.push({ x: cx, w, h, windows: wins });
        cx += w + 2 + Math.random() * 6;
      }
      return arr;
    };
    buildingsRef.current = {
      layers: [
        gen(30, 40, 100, 20, 50),  // far
        gen(20, 60, 160, 30, 60),  // mid
        gen(15, 80, 200, 40, 80),  // near
      ],
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    const layers = buildingsRef.current!.layers;
    const speeds = [0.15, 0.35, 0.6];
    const alphas = [0.08, 0.12, 0.18];
    const windowAlphas = [0.15, 0.25, 0.4];

    for (let li = 0; li < 3; li++) {
      const offsetX = -progress * speeds[li] * w * 3;
      ctx.save();
      ctx.translate(offsetX % (w * 2), 0);

      for (const b of layers[li]) {
        const bx = b.x % (w * 2);
        const by = h - b.h;

        // Building body
        ctx.fillStyle = `rgba(0,255,170,${alphas[li]})`;
        ctx.fillRect(bx, by, b.w, b.h);

        // Outline
        ctx.strokeStyle = `rgba(0,255,170,${alphas[li] + 0.05})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, b.w, b.h);

        // Windows
        const cols = Math.floor(b.w / 10);
        for (const win of b.windows) {
          const wr = Math.floor(win / 100);
          const wc = win % 100;
          const wx = bx + 4 + wc * 10;
          const wy = by + 4 + wr * 12;
          if (wx < bx + b.w - 4 && wy < h - 4) {
            const lit = Math.random() > 0.3;
            ctx.fillStyle = lit
              ? `rgba(0,255,170,${windowAlphas[li]})`
              : `rgba(0,255,170,${windowAlphas[li] * 0.2})`;
            ctx.fillRect(wx, wy, 4, 4);
          }
        }
      }
      ctx.restore();
    }

    // Stars in background
    ctx.fillStyle = "rgba(0,255,170,0.15)";
    for (let i = 0; i < 60; i++) {
      const sx = ((i * 137.5 + progress * 20) % w);
      const sy = (i * 73.1) % (h * 0.4);
      ctx.fillRect(sx, sy, 1, 1);
    }
  }, [progress]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
};

export default CityScape;
