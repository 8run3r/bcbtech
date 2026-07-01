import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/**
 * LogicCircuit — animated SVG "decision circuit".
 * [VÁŠ BIZNIS] → decision gates (CENA? / RÝCHLOSŤ? / KVALITA?) → [COKTECH].
 * Paths draw in on view (stroke pathLength), then repeating signal pulses
 * travel along each branch (SVG animateMotion — no JS loop).
 * Desktop: horizontal. Mobile: vertical simplified spine.
 * Fully decorative — pointer-events-none, static under reduced motion.
 */

const MONO = "'JetBrains Mono', monospace";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Gate {
  label: string;
  tag: string;
  color: string;
}

const GATES: Gate[] = [
  { label: "CENA?", tag: "GATE_01", color: "#00ffaa" },
  { label: "RÝCHLOSŤ?", tag: "GATE_02", color: "#FF8C00" },
  { label: "KVALITA?", tag: "GATE_03", color: "#FF3D71" },
];

/* ── Desktop geometry (viewBox 860×340) ── */
const D_GY = [70, 170, 270];
const dIn = (gy: number): string => `M 170 170 C 270 170, 310 ${gy}, 396 ${gy}`;
const dOut = (gy: number): string => `M 464 ${gy} C 550 ${gy}, 590 170, 690 170`;
const dPulse = (gy: number): string =>
  `${dIn(gy)} L 464 ${gy} C 550 ${gy}, 590 170, 690 170`;

/* ── Mobile geometry (viewBox 320×600) ── */
const M_GY = [170, 300, 430];
const M_SEGS = [
  "M 160 72 L 160 141",
  "M 160 199 L 160 271",
  "M 160 329 L 160 401",
  "M 160 459 L 160 528",
];
const M_PULSE = "M 160 72 L 160 528";

interface CircuitSvgProps {
  drawn: boolean;
  reduced: boolean;
  pulsesOn: boolean;
  accent: string;
}

const CircuitDesktop = ({ drawn, reduced, pulsesOn, accent }: CircuitSvgProps) => (
  <svg viewBox="0 0 860 340" className="w-full h-auto" style={{ overflow: "visible" }}>
    {/* input wiring — biznis → gates */}
    {GATES.map((g, i) => (
      <motion.path
        key={`in-${g.tag}`}
        d={dIn(D_GY[i])}
        fill="none"
        stroke={accent}
        strokeOpacity={0.3}
        strokeWidth={1}
        initial={reduced ? false : { pathLength: 0 }}
        animate={drawn ? { pathLength: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.15 + i * 0.15, ease: EASE }}
      />
    ))}

    {/* output wiring — gates → coktech, tinted by verdict */}
    {GATES.map((g, i) => (
      <motion.path
        key={`out-${g.tag}`}
        d={dOut(D_GY[i])}
        fill="none"
        stroke={g.color}
        strokeOpacity={0.3}
        strokeWidth={1}
        initial={reduced ? false : { pathLength: 0 }}
        animate={drawn ? { pathLength: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.95 + i * 0.15, ease: EASE }}
      />
    ))}

    {/* input node */}
    <motion.g
      initial={reduced ? false : { opacity: 0, x: -12 }}
      animate={drawn ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <rect x={30} y={142} width={140} height={56} fill="rgba(255,255,255,0.02)" stroke={accent} strokeOpacity={0.4} strokeWidth={1} />
      <text x={30} y={130} fill={accent} opacity={0.35} style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.25em" }}>
        INPUT_01
      </text>
      <text x={100} y={175} textAnchor="middle" fill="#c8c4d0" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em" }}>
        VÁŠ BIZNIS
      </text>
    </motion.g>

    {/* decision gates — diamonds */}
    {GATES.map((g, i) => {
      const gy = D_GY[i];
      return (
        <motion.g
          key={g.tag}
          initial={reduced ? false : { opacity: 0, scale: 0.5 }}
          animate={drawn ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.7 + i * 0.15, ease: EASE }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        >
          <rect
            x={407}
            y={gy - 23}
            width={46}
            height={46}
            fill="rgba(0,0,0,0.6)"
            stroke={g.color}
            strokeOpacity={0.7}
            strokeWidth={1}
            transform={`rotate(45 430 ${gy})`}
          />
          <text x={470} y={gy - 34} fill={g.color} opacity={0.3} style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.2em" }}>
            {g.tag}
          </text>
          <text x={430} y={gy + 46} textAnchor="middle" fill={g.color} opacity={0.85} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.15em" }}>
            {g.label}
          </text>
          <text x={505} y={gy - 8} fill={g.color} opacity={0.3} style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.15em" }}>
            TRUE →
          </text>
        </motion.g>
      );
    })}

    {/* output node — glowing */}
    <motion.g
      initial={reduced ? false : { opacity: 0, scale: 0.85 }}
      animate={drawn ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: 1.5, ease: EASE }}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    >
      <rect
        x={690}
        y={138}
        width={140}
        height={64}
        fill="rgba(0,255,170,0.05)"
        stroke="#00ffaa"
        strokeOpacity={0.8}
        strokeWidth={1}
        style={{ filter: "drop-shadow(0 0 10px rgba(0,255,170,0.35))" }}
      />
      {!reduced && (
        <motion.rect
          x={684}
          y={132}
          width={152}
          height={76}
          fill="none"
          stroke="#00ffaa"
          strokeWidth={1}
          animate={{ strokeOpacity: [0.05, 0.3, 0.05] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <text x={690} y={126} fill="#00ffaa" opacity={0.35} style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.25em" }}>
        OUTPUT
      </text>
      <text x={760} y={168} textAnchor="middle" fill="#00ffaa" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "0.06em" }}>
        COKTECH
      </text>
      <text x={760} y={186} textAnchor="middle" fill="#00ffaa" opacity={0.4} style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.25em" }}>
        OPTIMAL_PATH
      </text>
    </motion.g>

    {/* signal pulses — travel the whole branch */}
    {pulsesOn &&
      GATES.map((g, i) => (
        <g key={`pulse-${g.tag}`}>
          <circle r={5} fill={g.color} opacity={0.18}>
            <animateMotion dur="2.6s" begin={`${i * 0.85}s`} repeatCount="indefinite" path={dPulse(D_GY[i])} />
          </circle>
          <circle r={2} fill={g.color} opacity={0.9}>
            <animateMotion dur="2.6s" begin={`${i * 0.85}s`} repeatCount="indefinite" path={dPulse(D_GY[i])} />
          </circle>
        </g>
      ))}
  </svg>
);

const CircuitMobile = ({ drawn, reduced, pulsesOn, accent }: CircuitSvgProps) => {
  const segColors = [accent, GATES[0].color, GATES[1].color, GATES[2].color];
  return (
    <svg viewBox="0 0 320 600" className="w-full h-auto" style={{ overflow: "visible" }}>
      {/* spine segments */}
      {M_SEGS.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke={segColors[i]}
          strokeOpacity={0.35}
          strokeWidth={1}
          initial={reduced ? false : { pathLength: 0 }}
          animate={drawn ? { pathLength: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.2, ease: EASE }}
        />
      ))}

      {/* input node */}
      <motion.g
        initial={reduced ? false : { opacity: 0, y: -10 }}
        animate={drawn ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <rect x={90} y={24} width={140} height={48} fill="rgba(255,255,255,0.02)" stroke={accent} strokeOpacity={0.4} strokeWidth={1} />
        <text x={90} y={14} fill={accent} opacity={0.35} style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.25em" }}>
          INPUT_01
        </text>
        <text x={160} y={52} textAnchor="middle" fill="#c8c4d0" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em" }}>
          VÁŠ BIZNIS
        </text>
      </motion.g>

      {/* gates */}
      {GATES.map((g, i) => {
        const gy = M_GY[i];
        return (
          <motion.g
            key={g.tag}
            initial={reduced ? false : { opacity: 0, scale: 0.5 }}
            animate={drawn ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.45, delay: 0.25 + i * 0.2, ease: EASE }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <rect
              x={140}
              y={gy - 20}
              width={40}
              height={40}
              fill="rgba(0,0,0,0.6)"
              stroke={g.color}
              strokeOpacity={0.7}
              strokeWidth={1}
              transform={`rotate(45 160 ${gy})`}
            />
            <text x={200} y={gy - 8} fill={g.color} opacity={0.3} style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.2em" }}>
              {g.tag}
            </text>
            <text x={200} y={gy + 8} fill={g.color} opacity={0.85} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em" }}>
              {g.label}
            </text>
          </motion.g>
        );
      })}

      {/* output node */}
      <motion.g
        initial={reduced ? false : { opacity: 0, scale: 0.85 }}
        animate={drawn ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 1.1, ease: EASE }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <rect
          x={90}
          y={528}
          width={140}
          height={60}
          fill="rgba(0,255,170,0.05)"
          stroke="#00ffaa"
          strokeOpacity={0.8}
          strokeWidth={1}
          style={{ filter: "drop-shadow(0 0 10px rgba(0,255,170,0.35))" }}
        />
        {!reduced && (
          <motion.rect
            x={84}
            y={522}
            width={152}
            height={72}
            fill="none"
            stroke="#00ffaa"
            strokeWidth={1}
            animate={{ strokeOpacity: [0.05, 0.3, 0.05] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <text x={90} y={518} fill="#00ffaa" opacity={0.35} style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.25em" }}>
          OUTPUT
        </text>
        <text x={160} y={560} textAnchor="middle" fill="#00ffaa" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: "0.06em" }}>
          COKTECH
        </text>
        <text x={160} y={576} textAnchor="middle" fill="#00ffaa" opacity={0.4} style={{ fontFamily: MONO, fontSize: 7, letterSpacing: "0.25em" }}>
          OPTIMAL_PATH
        </text>
      </motion.g>

      {/* single signal pulse down the spine */}
      {pulsesOn && (
        <g>
          <circle r={5} fill={accent} opacity={0.18}>
            <animateMotion dur="3.2s" repeatCount="indefinite" path={M_PULSE} />
          </circle>
          <circle r={2} fill={accent} opacity={0.9}>
            <animateMotion dur="3.2s" repeatCount="indefinite" path={M_PULSE} />
          </circle>
        </g>
      )}
    </svg>
  );
};

interface LogicCircuitProps {
  /** Hex accent for the frame + input wiring, e.g. "#4A9EFF" */
  accent?: string;
  className?: string;
}

const LogicCircuit = ({ accent = "#4A9EFF", className = "" }: LogicCircuitProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [narrow, setNarrow] = useState(false);
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [pulsesOn, setPulsesOn] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setNarrow(mq.matches);
    const handler = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setTimeout(() => setPulsesOn(true), 1700);
    return () => window.clearTimeout(t);
  }, [inView, reduced]);

  const drawn = reduced || inView;

  return (
    <div
      ref={ref}
      aria-hidden
      className={`relative select-none pointer-events-none ${className}`}
      style={{ border: `1px solid ${accent}14`, background: "rgba(0,0,0,0.25)", padding: "20px 16px 14px" }}
    >
      {/* corner brackets */}
      {["top-0 left-0 border-t border-l", "top-0 right-0 border-t border-r", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((cls) => (
        <span key={cls} className={`absolute w-3 h-3 ${cls}`} style={{ borderColor: `${accent}40` }} />
      ))}

      {/* header strip */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span style={{ fontFamily: MONO, fontSize: 8, color: accent, letterSpacing: "0.25em", opacity: 0.5 }}>
          DECISION_MATRIX // v2.1
        </span>
        <span className="flex items-center gap-2">
          {reduced ? (
            <span className="inline-block w-1 h-1" style={{ background: "#00ffaa", opacity: 0.7 }} />
          ) : (
            <motion.span
              className="inline-block w-1 h-1"
              style={{ background: "#00ffaa" }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <span style={{ fontFamily: MONO, fontSize: 8, color: "#00ffaa", letterSpacing: "0.2em", opacity: 0.5 }}>
            LIVE
          </span>
        </span>
      </div>

      {narrow ? (
        <CircuitMobile drawn={drawn} reduced={reduced} pulsesOn={pulsesOn} accent={accent} />
      ) : (
        <CircuitDesktop drawn={drawn} reduced={reduced} pulsesOn={pulsesOn} accent={accent} />
      )}
    </div>
  );
};

export default LogicCircuit;
