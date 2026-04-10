import { useEffect, useRef } from "react";

/**
 * VHS tracking line — primarily sweeps top→bottom like a real CRT,
 * but with random speed changes, brief freezes, position glitches,
 * and static-noise bursts that make it feel like a broken old TV.
 */
const VhsLine = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf: number;
    let pos = -2; // start above viewport (vh)
    let speed = 0.12; // vh per frame — base sweep speed
    let frozen = false;
    let freezeEnd = 0;
    let glitching = false;
    let glitchEnd = 0;

    const t = () => performance.now();

    const tick = () => {
      const now = t();

      // ── Freeze: line sticks in place, slight flicker ──
      if (!frozen && Math.random() < 0.0015) {
        frozen = true;
        freezeEnd = now + 150 + Math.random() * 500;
      }
      if (frozen && now > freezeEnd) {
        frozen = false;
        // after freeze, 30% chance to jump to random position
        if (Math.random() < 0.3) pos = Math.random() * 100;
      }

      // ── Glitch burst: static noise effect ──
      if (!glitching && Math.random() < 0.003) {
        glitching = true;
        glitchEnd = now + 50 + Math.random() * 180;
      }
      if (glitching && now > glitchEnd) {
        glitching = false;
        // reset to normal appearance
        el.style.height = "2px";
        el.style.width = "100%";
        el.style.left = "0";
        el.style.boxShadow = "none";
      }

      // ── Movement ──
      if (!frozen) {
        // occasional speed wobble (like unstable VHS motor)
        if (Math.random() < 0.01) {
          speed = 0.06 + Math.random() * 0.22;
        }
        // rare sudden jump (tracking error)
        if (Math.random() < 0.002) {
          pos += (Math.random() - 0.5) * 30;
        }

        pos += speed;

        // wrap: once past bottom, reappear at top
        if (pos > 102) {
          pos = -2;
          speed = 0.08 + Math.random() * 0.18;
        }
      }

      // ── Apply position ──
      el.style.top = `${pos}vh`;

      // ── Apply visual state ──
      if (glitching) {
        // static noise: thicker line, random opacity, slight horizontal shift
        const thick = 1 + Math.random() * 5;
        const shift = (Math.random() - 0.5) * 8;
        const w = 70 + Math.random() * 30;
        const op = Math.random() < 0.2 ? 0 : 0.06 + Math.random() * 0.12;
        el.style.height = `${thick}px`;
        el.style.width = `${w}%`;
        el.style.left = `${shift}px`;
        el.style.opacity = `${op}`;
        // occasional bright flash
        if (Math.random() < 0.15) {
          el.style.boxShadow = `0 0 ${4 + Math.random() * 8}px rgba(255,255,255,0.08)`;
        } else {
          el.style.boxShadow = "none";
        }
      } else if (frozen) {
        // frozen: subtle flicker
        el.style.opacity = Math.random() < 0.06 ? "0" : "0.08";
      } else {
        // normal sweep
        el.style.opacity = "0.08";
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed left-0 pointer-events-none"
      style={{
        width: "100%",
        height: 2,
        background: "rgba(255,255,255,0.08)",
        zIndex: 9997,
        top: 0,
      }}
    />
  );
};

const Scanlines = () => (
  <>
    {/* CRT Scanlines */}
    <div
      className="fixed inset-0 z-[9990] pointer-events-none"
      style={{
        background: "repeating-linear-gradient(transparent, transparent 1px, rgba(0,0,0,0.04) 1px, rgba(0,0,0,0.04) 2px)",
      }}
    />

    {/* CRT screen curvature vignette */}
    <div className="crt-curve" />

    {/* VHS tracking line */}
    <VhsLine />

    {/* Noise grain overlay */}
    <div className="noise-overlay fixed inset-0 z-[9992] pointer-events-none" />

    {/* Edge shadow */}
    <div
      className="fixed inset-0 z-[9989] pointer-events-none"
      style={{
        boxShadow: "inset 0 0 150px rgba(0,0,0,0.6), inset 0 0 80px rgba(0,0,0,0.3)",
      }}
    />
  </>
);

export default Scanlines;
