import { useEffect, useRef, useCallback } from "react";

/**
 * Pixelated retro pointer cursor — white hand/arrow style.
 * All state is ref-based to avoid re-renders that tear down listeners.
 */

// 8x12 pixel art arrow cursor (1 = white, 2 = black outline, 0 = transparent)
const ARROW_PIXELS = [
  [1,0,0,0,0,0,0,0],
  [1,1,0,0,0,0,0,0],
  [1,2,1,0,0,0,0,0],
  [1,2,2,1,0,0,0,0],
  [1,2,2,2,1,0,0,0],
  [1,2,2,2,2,1,0,0],
  [1,2,2,2,2,2,1,0],
  [1,2,2,2,2,2,2,1],
  [1,2,2,2,2,1,1,0],
  [1,2,1,1,2,2,1,0],
  [1,1,0,0,1,2,1,0],
  [0,0,0,0,0,1,1,0],
];

// 10x14 pixel art open hand cursor — realistic proportions, 8-bit style
const HAND_PIXELS = [
  [0,0,0,1,1,0,1,1,0,0],
  [0,0,1,2,2,1,2,2,1,0],
  [0,0,1,2,2,1,2,2,1,0],
  [0,0,1,2,2,2,2,2,1,0],
  [1,1,1,2,2,2,2,2,1,0],
  [1,2,2,2,2,2,2,2,2,1],
  [1,2,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,2,1],
  [0,1,2,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,2,1,0],
  [0,0,1,2,2,2,2,1,0,0],
  [0,0,0,1,2,2,2,1,0,0],
  [0,0,0,1,2,2,1,0,0,0],
  [0,0,0,0,1,1,0,0,0,0],
];

const PIXEL_SIZE = 2;

const drawCursor = (canvas: HTMLCanvasElement, pixels: number[][], glitch: boolean) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = pixels[0].length * PIXEL_SIZE;
  const h = pixels.length * PIXEL_SIZE;
  canvas.width = w + 2;
  canvas.height = h + 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      const val = pixels[y][x];
      if (val === 0) continue;

      const gx = glitch && Math.random() > 0.85 ? x + (Math.random() > 0.5 ? 1 : -1) : x;

      if (val === 1) {
        ctx.fillStyle = "#ffffff";
      } else {
        ctx.fillStyle = glitch && Math.random() > 0.9 ? "#00ffaa" : "#000000";
      }
      ctx.fillRect(gx * PIXEL_SIZE + 1, y * PIXEL_SIZE + 1, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
};

const RetroCursor = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const hovering = useRef(false);
  const isVisible = useRef(false);

  const redraw = useCallback((glitch = false) => {
    if (!canvasRef.current) return;
    drawCursor(canvasRef.current, hovering.current ? HAND_PIXELS : ARROW_PIXELS, glitch);
    // adjust canvas offset for hand vs arrow
    canvasRef.current.style.marginLeft = hovering.current ? "-8px" : "-1px";
    canvasRef.current.style.marginTop = "-1px";
  }, []);

  useEffect(() => {
    // Skip on touch devices — don't hide cursor on mobile
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    // Hide native cursor
    const style = document.createElement("style");
    style.id = "retro-cursor-hide";
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(style);

    // Initial draw
    redraw();

    const setVis = (v: boolean) => {
      isVisible.current = v;
      if (mainRef.current) mainRef.current.style.opacity = v ? "1" : "0";
      if (trailRef.current) trailRef.current.style.opacity = v ? "0.4" : "0";
    };

    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible.current) {
        // snap trail to position on first move to prevent lerp from old pos
        trailPos.current = { x: e.clientX, y: e.clientY };
        setVis(true);
      }

      const target = e.target as HTMLElement;
      const isInteractive = !!target.closest("a, button, [role='button'], input, textarea, select, .secret-zone, .glow-word");
      if (isInteractive !== hovering.current) {
        hovering.current = isInteractive;
        redraw();
      }
    };

    const handleLeave = () => setVis(false);
    const handleEnter = () => setVis(true);

    let frame: number;
    const animate = () => {
      if (mainRef.current) {
        mainRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      trailPos.current.x += (pos.current.x - trailPos.current.x) * 0.1;
      trailPos.current.y += (pos.current.y - trailPos.current.y) * 0.1;
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px)`;
      }
      frame = requestAnimationFrame(animate);
    };

    // Glitch interval
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        redraw(true);
        setTimeout(() => redraw(false), 80);
      }
    }, 3000);

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);
    frame = requestAnimationFrame(animate);

    return () => {
      const el = document.getElementById("retro-cursor-hide");
      if (el) document.head.removeChild(el);
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
      cancelAnimationFrame(frame);
      clearInterval(glitchInterval);
    };
  }, [redraw]);

  return (
    <>
      {/* Ghost trail */}
      <div
        ref={trailRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: 99999,
          width: 4,
          height: 4,
          marginLeft: -2,
          marginTop: -2,
          background: "rgba(255,255,255,0.15)",
          willChange: "transform",
          opacity: 0,
        }}
      />

      {/* Main pixel cursor */}
      <div
        ref={mainRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{ zIndex: 100000, willChange: "transform", opacity: 0 }}
      >
        <canvas
          ref={canvasRef}
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </>
  );
};

export default RetroCursor;
