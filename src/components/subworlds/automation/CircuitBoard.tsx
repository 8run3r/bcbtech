import { useEffect, useRef } from "react";

/** Top-down circuit board tile map with animated traces */
const CircuitBoard = ({ progress, activeRoom }: { progress: number; activeRoom: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;

    frameRef.current++;
    const frame = frameRef.current;

    ctx.clearRect(0, 0, w, h);

    const TILE = 16;
    const cols = Math.ceil(w / TILE);
    const rows = Math.ceil(h / TILE);
    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);

    // Draw tile grid
    ctx.strokeStyle = "rgba(255,140,0,0.03)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
      }
    }

    // Room positions (relative to center)
    const rooms = [
      { rx: cx - 8, ry: cy - 4, label: "A1" },
      { rx: cx + 4, ry: cy - 4, label: "B2" },
      { rx: cx - 4, ry: cy + 4, label: "C3" },
      { rx: cx + 6, ry: cy + 4, label: "FINAL" },
    ];

    // Draw circuit traces between rooms
    const traceColor = "rgba(255,140,0,0.12)";
    const traceActiveColor = "rgba(255,140,0,0.35)";
    ctx.lineWidth = 2;

    for (let i = 0; i < rooms.length - 1; i++) {
      const a = rooms[i];
      const b = rooms[i + 1];
      const fromX = a.rx * TILE + TILE * 2;
      const fromY = a.ry * TILE + TILE * 2;
      const toX = b.rx * TILE + TILE * 2;
      const toY = b.ry * TILE + TILE * 2;

      const active = i < activeRoom;
      ctx.strokeStyle = active ? traceActiveColor : traceColor;
      ctx.setLineDash(active ? [] : [4, 4]);

      // L-shaped path
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();

      // Animated data packets on active traces
      if (active) {
        const packetT = ((frame * 0.02 + i * 0.3) % 1);
        const px = fromX + (toX - fromX) * Math.min(packetT * 2, 1);
        const py = fromY + (toY - fromY) * Math.max(0, (packetT - 0.5) * 2);
        ctx.fillStyle = "rgba(255,140,0,0.6)";
        ctx.fillRect(px - 2, py - 2, 4, 4);
      }
    }

    ctx.setLineDash([]);

    // Draw rooms
    for (let i = 0; i < rooms.length; i++) {
      const r = rooms[i];
      const isActive = i === activeRoom;
      const isVisited = i < activeRoom;
      const x = r.rx * TILE;
      const y = r.ry * TILE;
      const size = TILE * 4;

      // Room background
      ctx.fillStyle = isActive
        ? "rgba(255,140,0,0.08)"
        : isVisited
          ? "rgba(255,140,0,0.03)"
          : "rgba(255,140,0,0.01)";
      ctx.fillRect(x, y, size, size);

      // Room border
      ctx.strokeStyle = isActive
        ? "rgba(255,140,0,0.5)"
        : isVisited
          ? "rgba(255,140,0,0.2)"
          : "rgba(255,140,0,0.06)";
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(x, y, size, size);

      // Room glow when active
      if (isActive) {
        const pulseAlpha = 0.06 + Math.sin(frame * 0.05) * 0.04;
        const grad = ctx.createRadialGradient(
          x + size / 2, y + size / 2, 0,
          x + size / 2, y + size / 2, size * 1.5
        );
        grad.addColorStop(0, `rgba(255,140,0,${pulseAlpha})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(x - size, y - size, size * 3, size * 3);
      }

      // Corner dots
      const dotAlpha = isActive ? 0.6 : 0.15;
      ctx.fillStyle = `rgba(255,140,0,${dotAlpha})`;
      ctx.fillRect(x, y, 2, 2);
      ctx.fillRect(x + size - 2, y, 2, 2);
      ctx.fillRect(x, y + size - 2, 2, 2);
      ctx.fillRect(x + size - 2, y + size - 2, 2, 2);
    }

    // Scattered ambient dots
    ctx.fillStyle = "rgba(255,140,0,0.06)";
    for (let i = 0; i < 40; i++) {
      const dx = (i * 197.3 + frame * 0.5) % w;
      const dy = (i * 83.7) % h;
      ctx.fillRect(dx, dy, 1, 1);
    }
  }, [progress, activeRoom]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
};

export default CircuitBoard;
