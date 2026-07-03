import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MONO = "'JetBrains Mono', monospace";

/* Known destinations for the interactive prompt */
const ROUTES: Record<string, string> = {
  "": "/",
  "/": "/",
  home: "/",
  domov: "/",
  portfolio: "/portfolio",
  balicky: "/balicky",
  agenti: "/balicky?tab=agents",
  logika: "/logika",
  kontakt: "/kontakt",
  doom: "/doom",
  archive: "/archive",
  memory: "/memory",
  void: "/void",
};

/* ── Void canvas — the site's network, with one lost red node drifting away ── */
const LostSignalCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = W < 640;

    // The healthy network — faint green nodes on the left 2/3
    const NODE_COUNT = isSmall ? 26 : 48;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * 0.66,
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00016,
      vy: (Math.random() - 0.5) * 0.00016,
      r: 1 + Math.random() * 1.4,
    }));

    // The lost node — drifts into the void on the right
    const lost = { x: 0.8, y: 0.38, phase: Math.random() * Math.PI * 2 };

    let raf = 0;
    let running = true;
    const FRAME_MS = 1000 / 30;
    let last = 0;
    let t = 0;

    const draw = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(draw);
      if (now - last < FRAME_MS) return;
      last = now;
      t += 1 / 30;

      ctx.clearRect(0, 0, W, H);

      // drift
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > 0.7) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      }

      // links between close nodes
      const LINK = isSmall ? 90 : 120;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = (nodes[i].x - nodes[j].x) * W;
          const dy = (nodes[i].y - nodes[j].y) * H;
          const d = Math.hypot(dx, dy);
          if (d > LINK) continue;
          const a = (1 - d / LINK) * 0.07;
          ctx.strokeStyle = `rgba(0,255,170,${a})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x * W, nodes[i].y * H);
          ctx.lineTo(nodes[j].x * W, nodes[j].y * H);
          ctx.stroke();
        }
      }

      // nodes
      for (const n of nodes) {
        ctx.fillStyle = "rgba(0,255,170,0.28)";
        ctx.fillRect(n.x * W - n.r / 2, n.y * H - n.r / 2, n.r, n.r);
      }

      // the lost node drifts further out, slowly
      lost.x = Math.min(lost.x + 0.00002, 0.94);
      lost.y = 0.38 + Math.sin(t * 0.4 + lost.phase) * 0.03;
      const lx = lost.x * W;
      const ly = lost.y * H;

      // broken tether — from the nearest healthy node, flickering
      let nearest = nodes[0];
      let best = Infinity;
      for (const n of nodes) {
        const d = Math.hypot((n.x - lost.x) * W, (n.y - lost.y) * H);
        if (d < best) { best = d; nearest = n; }
      }
      const flicker = Math.random();
      if (flicker > 0.45) {
        ctx.setLineDash([4, 7]);
        ctx.strokeStyle = `rgba(255,61,113,${0.1 + flicker * 0.12})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nearest.x * W, nearest.y * H);
        ctx.lineTo(lx, ly);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // lost node itself — red, pulsing distress beacon
      const pulse = 0.5 + Math.abs(Math.sin(t * 2.4)) * 0.5;
      ctx.fillStyle = `rgba(255,61,113,${0.5 + pulse * 0.4})`;
      ctx.fillRect(lx - 2, ly - 2, 4, 4);
      const ringR = 6 + ((t * 14) % 26);
      ctx.strokeStyle = `rgba(255,61,113,${Math.max(0, 0.3 - ringR / 90)})`;
      ctx.beginPath();
      ctx.arc(lx, ly, ringR, 0, Math.PI * 2);
      ctx.stroke();
    };

    if (reducedMotion) {
      // single static frame
      last = -FRAME_MS;
      running = true;
      draw(0);
      running = false;
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ opacity: 0.8 }} />;
};

/* ── Typed diagnostic log ── */
const useDiagnostics = (pathname: string) => {
  const lines = useMemo(
    () => [
      `> trasujem ${pathname} ...`,
      "> kontrolujem mapu sveta ... 0 zhôd",
      "> signál stratený vo voide",
      "> odporúčanie: návrat na základňu",
    ],
    [pathname]
  );
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(lines.length);
      return;
    }
    setVisible(0);
    const ids = lines.map((_, i) =>
      window.setTimeout(() => setVisible(i + 1), 500 + i * 450)
    );
    return () => ids.forEach(clearTimeout);
  }, [lines]);

  return { lines, visible };
};

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lines, visible } = useDiagnostics(location.pathname);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const responseTimer = useRef<number>();

  // Live prompt — type anywhere, Enter navigates to a known route
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter") {
        const cmd = input.trim().toLowerCase().replace(/^\//, "");
        // Own-property check — "constructor" & co. must not resolve via the prototype chain
        const target = Object.prototype.hasOwnProperty.call(ROUTES, cmd) ? ROUTES[cmd] : undefined;
        if (target !== undefined) {
          navigate(target);
        } else {
          setResponse(`sh: ${cmd || "␀"}: príkaz nenájdený — skús "home"`);
          setInput("");
          window.clearTimeout(responseTimer.current);
          responseTimer.current = window.setTimeout(() => setResponse(null), 2600);
        }
        return;
      }
      if (e.key === "Backspace") {
        setInput((p) => p.slice(0, -1));
        return;
      }
      if (e.key.length === 1 && input.length < 24) {
        setInput((p) => p + e.key);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(responseTimer.current);
    };
  }, [input, navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#000" }}>
      <LostSignalCanvas />

      {/* Vignette + scanlines */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.7) 100%)" }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)" }} />

      {/* Corner brackets */}
      {[
        "top-5 left-5 border-t border-l",
        "top-5 right-5 border-t border-r",
        "bottom-5 left-5 border-b border-l",
        "bottom-5 right-5 border-b border-r",
      ].map((cls) => (
        <span key={cls} className={`fixed w-6 h-6 pointer-events-none ${cls}`} style={{ borderColor: "rgba(255,61,113,0.25)" }} />
      ))}

      {/* HUD corners */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 pointer-events-none" style={{ fontFamily: MONO, fontSize: 8, color: "var(--neon-accent)", letterSpacing: "0.3em", opacity: 0.5 }}>
        SIGNAL LOST // SECTOR ∅
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center w-full max-w-xl"
        >
          <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.25em", color: "var(--neon-accent)", opacity: 0.7, marginBottom: 14 }}>
            // ERROR_404 — ROUTE_NOT_FOUND
          </p>

          {/* Glitching 404 — uses the site-wide .glitch-text effect */}
          <h1
            className="glitch-text"
            data-text="404"
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(5.5rem, 20vw, 13rem)",
              fontWeight: 800,
              lineHeight: 0.95,
              color: "var(--text-primary)",
              letterSpacing: "-0.05em",
              textShadow: "0 0 80px rgba(255,61,113,0.15)",
              marginBottom: 20,
            }}
          >
            404
          </h1>

          {/* Diagnostic log — types itself out */}
          <div
            className="mx-auto text-left mb-8"
            style={{
              maxWidth: 380,
              padding: "14px 18px",
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,61,113,0.12)",
              backdropFilter: "blur(8px)",
            }}
          >
            <p style={{ fontFamily: MONO, fontSize: 8, color: "var(--text-ghost)", letterSpacing: "0.2em", marginBottom: 10 }}>
              // DIAGNOSTIKA
            </p>
            {lines.slice(0, visible).map((line, i) => (
              <p
                key={line}
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  lineHeight: 1.9,
                  color: i === lines.length - 1 ? "var(--neon-primary)" : "rgba(255,61,113,0.75)",
                  wordBreak: "break-all",
                }}
              >
                {line}
              </p>
            ))}
            {visible < lines.length && (
              <span className="blink-cursor" style={{ fontFamily: MONO, fontSize: 11, color: "var(--neon-accent)" }} />
            )}

            {/* Live prompt — desktop only (needs a keyboard) */}
            {visible >= lines.length && (
              <div className="hidden sm:block" style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontFamily: MONO, fontSize: 11, color: "var(--text-dim)" }}>
                  <span style={{ color: "var(--neon-primary)", opacity: 0.7 }}>guest@coktech</span>
                  <span style={{ opacity: 0.4 }}>:~$ </span>
                  <span style={{ color: "var(--text-primary)" }}>{input}</span>
                  <span className="blink-cursor" />
                </p>
                {response && (
                  <p style={{ fontFamily: MONO, fontSize: 10, color: "var(--red-warning)", marginTop: 4 }}>{response}</p>
                )}
                {!input && !response && (
                  <p style={{ fontFamily: MONO, fontSize: 8, color: "var(--text-ghost)", letterSpacing: "0.1em", marginTop: 4 }}>
                    píš kamkoľvek — "home", "portfolio", "kontakt" + Enter
                  </p>
                )}
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a
              href="/"
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "#000",
                background: "var(--neon-primary)",
                padding: "11px 24px",
                textDecoration: "none",
                display: "inline-block",
                boxShadow: "0 0 25px rgba(0,255,170,0.15)",
                transition: "box-shadow 0.3s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 0 40px rgba(0,255,170,0.3)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "0 0 25px rgba(0,255,170,0.15)")}
            >
              [ SPÄŤ NA ZÁKLADŇU ]
            </a>
            <a
              href="/balicky"
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "var(--neon-accent)",
                background: "transparent",
                border: "1px solid rgba(255,61,113,0.3)",
                padding: "10px 20px",
                textDecoration: "none",
                display: "inline-block",
                transition: "border-color 0.3s, background 0.3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,61,113,0.6)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,61,113,0.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,61,113,0.3)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              [ BALÍČKY ]
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
