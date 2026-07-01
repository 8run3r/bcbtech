/**
 * StoryScroll3D — Full 8-bit game world story scroll.
 * Scroll-driven vertical descent through 8 stations with 3D models,
 * intro sequence, and outro. Inspired by igloo.inc + retro gaming.
 */
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useScroll, useMotionValueEvent, AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNavAccent } from "@/components/landing/Navbar";
import { useIsMobile } from "@/hooks/use-mobile";
import ContactModal from "@/components/ContactModal";
import { STATIONS } from "./stations";
import ZonePortals from "./GridFloor";
import Voxels from "./Voxels";
import StationTitle from "./StationTitle";
import ScrollCameraRig from "./ScrollCameraRig";
import DraggableModel, { type ModelVariant } from "./DraggableModel";
import StationOverlay from "./StationOverlay";
import ProgressBar from "./ProgressBar";
import ZoneLighting from "./ZoneLighting";
import Atmosphere from "./Atmosphere";
import PostFX from "./PostFX";

/* ── Model config per station (8 stations) ── */
interface ModelData {
  offset: [number, number, number];
  color: string;
  variant: ModelVariant;
  scale: number;
}

const MODEL_CONFIGS: ModelData[] = [
  { offset: [2.5, 0.8, 1.5],   color: "#00ffaa", variant: "webKnot",   scale: 1.1 },  // Web
  { offset: [-3, 0.5, -2],     color: "#00e5ff", variant: "showcase",  scale: 1.2 },  // E-Commerce
  { offset: [3, 0.6, -2],      color: "#FF3D71", variant: "crystal",   scale: 1.1 },  // Marketing
  { offset: [-2.5, 0.8, 1.5],  color: "#a855f7", variant: "beacon",    scale: 1.2 },  // Full Stack
  { offset: [2, 0.5, 1],       color: "#FF8C00", variant: "autoLoops", scale: 1.2 },  // Workflow
  { offset: [-3, 0.6, -1.5],   color: "#ff4757", variant: "webKnot",   scale: 1.0 },  // AI
  { offset: [2.5, 0.8, 1],     color: "#4A9EFF", variant: "crystal",   scale: 1.1 },  // Why
  { offset: [2, 0.5, 1],       color: "#00ffaa", variant: "beacon",    scale: 1.2 },  // Connect
];

/* ── 3D Scene ── */
const Scene3D = ({
  progressRef,
  onModelClick,
  reducedMotion,
}: {
  progressRef: React.MutableRefObject<number>;
  onModelClick: (stationIndex: number) => void;
  reducedMotion: boolean;
}) => {
  const models = useMemo(
    () =>
      MODEL_CONFIGS.map((m, i) => ({
        ...m,
        position: [
          STATIONS[i].pos[0] + m.offset[0],
          STATIONS[i].pos[1] + m.offset[1],
          STATIONS[i].pos[2] + m.offset[2],
        ] as [number, number, number],
      })),
    []
  );

  return (
    <>
      <ZoneLighting progressRef={progressRef} />
      <fog attach="fog" args={["#000000", 4, 26]} />

      <ZonePortals />
      <Voxels />
      <Atmosphere progressRef={progressRef} />

      {STATIONS.map((s, i) => (
        <StationTitle key={i} text={s.title} color={s.color} stationPos={s.pos} />
      ))}

      {models.map((m, i) => (
        <DraggableModel
          key={i}
          position={m.position}
          color={m.color}
          variant={m.variant}
          scale={m.scale}
          onClick={() => onModelClick(i)}
        />
      ))}

      <ScrollCameraRig progressRef={progressRef} reducedMotion={reducedMotion} />
      <PostFX reducedMotion={reducedMotion} />
    </>
  );
};

/* ── Intro overlay ── */
const IntroOverlay = ({ visible, onSkip }: { visible: boolean; onSkip: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0=loading, 1=ready

  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const duration = 2200;
    let frame: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setProgress(p);
      if (p < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setPhase(1);
        setTimeout(onSkip, 400);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, onSkip]);

  const BOOT_MSGS = [
    "Načítavam herný svet...",
    "Inicializujem AI agentov...",
    "Kalibrujem priestor...",
    "Spúšťam world engine...",
    "Systém pripravený.",
  ];
  const msgIdx = Math.min(Math.floor(progress * BOOT_MSGS.length), BOOT_MSGS.length - 1);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)" }}
        >
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: "linear-gradient(rgba(0,255,170,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          {/* Corner brackets */}
          {["top-6 left-6 border-t border-l", "top-6 right-6 border-t border-r", "bottom-6 left-6 border-b border-l", "bottom-6 right-6 border-b border-r"].map((cls, i) => (
            <motion.span
              key={i}
              className={`absolute w-6 h-6 ${cls}`}
              style={{ borderColor: "rgba(0,255,170,0.12)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * i }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-center"
            style={{ width: "min(400px, 90vw)" }}
          >
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 8,
              color: "var(--neon-primary)",
              opacity: 0.35,
              letterSpacing: "0.35em",
              marginBottom: 20,
            }}>
              STORY MODE // 8 LEVELS
            </p>

            <h2 style={{
              fontFamily: "'VT323', monospace",
              fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
              color: "var(--text-primary)",
              letterSpacing: "0.02em",
              marginBottom: 6,
            }}>
              CokTech World
            </h2>

            <p style={{
              fontFamily: "'VT323', monospace",
              fontSize: 15,
              color: "var(--neon-primary)",
              opacity: 0.4,
              letterSpacing: "0.05em",
              marginBottom: 40,
            }}>
              「冒険」 Adventure
            </p>

            {/* Boot log */}
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: "rgba(0,255,170,0.5)",
              letterSpacing: "0.06em",
              marginBottom: 20,
              minHeight: 14,
              transition: "opacity 0.3s",
            }}>
              {phase === 0 ? `> ${BOOT_MSGS[msgIdx]}` : "> Systém pripravený. ▪"}
            </div>

            {/* Progress bar */}
            <div style={{
              width: "100%",
              height: 2,
              background: "rgba(0,255,170,0.1)",
              marginBottom: 28,
            }}>
              <motion.div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, rgba(0,255,170,0.6), var(--neon-primary))",
                  boxShadow: "0 0 8px var(--neon-primary)",
                  width: `${progress * 100}%`,
                }}
              />
            </div>

            {/* Station dots */}
            <div className="flex items-center justify-center gap-3">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    background: progress > i / 8 ? STATIONS[i].color : "rgba(255,255,255,0.08)",
                    boxShadow: progress > i / 8 ? `0 0 6px ${STATIONS[i].color}60` : "none",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Outro overlay ── */
const OutroOverlay = ({ visible }: { visible: boolean }) => {
  const navigate = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center"
            >
              <p style={{
                fontFamily: "'VT323', monospace",
                fontSize: 14,
                color: "var(--neon-primary)",
                opacity: 0.4,
                letterSpacing: "0.15em",
                marginBottom: 16,
              }}>
                「完了」 COMPLETE
              </p>

              <h2 style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                color: "var(--text-primary)",
                letterSpacing: "-0.03em",
                marginBottom: 12,
              }}>
                Ste pripravení?
              </h2>

              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: "rgba(200,196,208,0.35)",
                lineHeight: 1.7,
                maxWidth: 360,
                margin: "0 auto 32px",
              }}>
                Všetkých 8 levelov preskúmaných. Poďme vytvoriť niečo výnimočné.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setContactOpen(true)}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "#000",
                    background: "var(--neon-primary)",
                    border: "none",
                    padding: "10px 24px",
                    letterSpacing: "0.1em",
                    cursor: "none",
                  }}
                >
                  [ KONTAKT ]
                </button>
                <button
                  onClick={() => navigate("/balicky")}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: "var(--neon-secondary)",
                    background: "transparent",
                    border: "1px solid rgba(255,140,0,0.3)",
                    padding: "10px 24px",
                    letterSpacing: "0.1em",
                    cursor: "none",
                  }}
                >
                  [ BALÍČKY ]
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
};

/* ── Scroll hint ── */
const ScrollHint = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute bottom-12 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
  >
    <span style={{ fontSize: 8, color: "var(--text-ghost)", letterSpacing: "0.25em", fontFamily: "'JetBrains Mono', monospace" }}>
      SCROLL TO DESCEND
    </span>
    <motion.div
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: 1, height: 24, background: "linear-gradient(to bottom, rgba(0,255,170,0.3), transparent)" }}
    />
  </motion.div>
);

/* ── Pixel HUD ── */
const PixelHUD = ({ station, index }: { station: (typeof STATIONS)[0]; index: number }) => (
  <>
    {/* Top left — zone label */}
    <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 pointer-events-none">
      <span style={{ fontFamily: "'VT323', monospace", fontSize: 11, color: station.color, opacity: 0.5, letterSpacing: "0.2em", display: "block" }}>
        {station.label} {station.subtitle}
      </span>
      <span className="hidden sm:block" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: station.color, opacity: 0.2, letterSpacing: "0.1em", marginTop: 2 }}>
        {'>'} {station.modelHint}
      </span>
    </div>

    {/* Top right — counter */}
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30" style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: station.color, opacity: 0.3, letterSpacing: "0.05em" }}>
      {String(index + 1).padStart(2, "0")} / {String(STATIONS.length).padStart(2, "0")}
    </div>

    {/* Bottom — pixel HP bar */}
    <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 pointer-events-none">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 10, color: station.color, opacity: 0.4 }}>HP</span>
        <div className="flex gap-px">
          {STATIONS.map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 3,
                background: i <= index ? station.color : "rgba(255,255,255,0.06)",
                transition: "background 0.5s",
                boxShadow: i === index ? `0 0 6px ${station.color}40` : "none",
              }}
            />
          ))}
        </div>
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 10, color: station.color, opacity: 0.3 }}>
          {Math.floor(((index + 1) / STATIONS.length) * 100)}%
        </span>
      </div>
    </div>

    {/* Bottom right — interaction hint (hidden on mobile) */}
    <div className="absolute bottom-6 right-6 z-30 pointer-events-none hidden sm:block">
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: station.color, opacity: 0.15, letterSpacing: "0.1em" }}>
        CLICK · DRAG · SCROLL
      </span>
    </div>
  </>
);

/* ── Color hex → raw RGB for AccentProvider ── */
const COLOR_RAW: Record<string, string> = {
  "#00ffaa": "0,255,170",
  "#00e5ff": "0,229,255",
  "#FF3D71": "255,61,113",
  "#a855f7": "168,85,247",
  "#FF8C00": "255,140,0",
  "#ff4757": "255,71,87",
  "#4A9EFF": "74,158,255",
};

/* ══════════════════════════════════════════
   Mobile station card — InView animated
═══════════════════════════════════════════ */
const MobileStationCard = ({
  station,
  index,
  onNavigate,
}: {
  station: (typeof STATIONS)[0];
  index: number;
  onNavigate: (route: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-20% 0px -20% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0.15, y: 20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-4 mb-6"
    >
      {/* Card */}
      <div
        className="relative px-5 py-5 overflow-hidden"
        style={{
          background: "rgba(5,5,8,0.85)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${station.color}15`,
        }}
      >
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: `${station.color}40` }} />
        <span className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: `${station.color}40` }} />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: `${station.color}40` }} />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: `${station.color}40` }} />

        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 5,
                height: 5,
                background: station.color,
                boxShadow: `0 0 8px ${station.color}60`,
              }}
            />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: station.color,
              letterSpacing: "0.15em",
              opacity: 0.8,
            }}>
              {station.subtitle}
            </span>
          </div>
          <span style={{
            fontFamily: "'VT323', monospace",
            fontSize: 16,
            color: station.color,
            opacity: 0.25,
          }}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Label */}
        <p style={{
          fontFamily: "'VT323', monospace",
          fontSize: 13,
          color: station.color,
          opacity: 0.3,
          letterSpacing: "0.05em",
          marginBottom: 6,
        }}>
          {station.label}
        </p>

        {/* Title */}
        <h3 style={{
          fontFamily: "'VT323', monospace",
          fontSize: "1.4rem",
          color: "var(--text-primary)",
          letterSpacing: "0.02em",
          marginBottom: 8,
          textShadow: `0 0 20px ${station.color}15`,
        }}>
          {station.title}
        </h3>

        {/* Body */}
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "var(--text-dim)",
          lineHeight: 1.8,
          marginBottom: 12,
          letterSpacing: "0.02em",
        }}>
          {station.body}
        </p>

        {/* CTA */}
        <button
          onClick={() => onNavigate(station.route)}
          className="inline-flex items-center gap-1.5"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            padding: "7px 16px",
            background: `${station.color}08`,
            border: `1px solid ${station.color}30`,
            color: station.color,
            letterSpacing: "0.1em",
          }}
        >
          [ {station.cta.toUpperCase()} ]
        </button>

        {/* Decorative scan line */}
        <motion.div
          animate={inView ? { scaleX: 1, opacity: 0.15 } : { scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${station.color}, transparent)`,
            transformOrigin: "left",
          }}
        />
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   Mobile progress indicator (left rail)
═══════════════════════════════════════════ */
const MobileProgressRail = ({ activeIndex }: { activeIndex: number }) => (
  <div className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5">
    {STATIONS.map((s, i) => (
      <div
        key={i}
        className="transition-all duration-500"
        style={{
          width: i === activeIndex ? 3 : 2,
          height: i === activeIndex ? 16 : 6,
          background: i <= activeIndex ? s.color : "rgba(255,255,255,0.1)",
          boxShadow: i === activeIndex ? `0 0 6px ${s.color}60` : "none",
        }}
      />
    ))}
  </div>
);

/* ══════════════════════════════════════════
   Mobile StoryScroll — card-based vertical scroll
═══════════════════════════════════════════ */
const MobileStoryScroll = () => {
  const navigate = useNavigate();
  const { setAccent } = useNavAccent();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);

  const handleNavigate = useCallback(
    (route: string) => navigate(route),
    [navigate]
  );

  // Track which station is in view via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cards = container.querySelectorAll("[data-station-idx]");
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.stationIdx);
            if (!isNaN(idx)) setActiveIndex(idx);
          }
        }
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  // Sync navbar accent
  useEffect(() => {
    const color = STATIONS[activeIndex].color;
    const raw = COLOR_RAW[color] || "0,255,170";
    setAccent(color, raw);
    return () => setAccent("var(--neon-primary)", "0,255,170");
  }, [activeIndex, setAccent]);

  return (
    <section
      ref={containerRef}
      id="coktech-world"
      className="relative"
      style={{ background: "#000" }}
    >
      {/* Scanlines overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[45]"
        style={{ background: "repeating-linear-gradient(transparent,transparent 1px,rgba(0,0,0,0.04) 1px,rgba(0,0,0,0.04) 2px)" }}
      />

      {/* Left progress rail */}
      <MobileProgressRail activeIndex={activeIndex} />

      {/* Header */}
      <div className="pt-24 pb-8 px-6 text-center">
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 8,
          color: "var(--neon-primary)",
          opacity: 0.35,
          letterSpacing: "0.35em",
          marginBottom: 12,
        }}>
          STORY MODE // 8 LEVELS
        </p>
        <h2 style={{
          fontFamily: "'VT323', monospace",
          fontSize: "2rem",
          color: "var(--text-primary)",
          letterSpacing: "0.02em",
          marginBottom: 4,
        }}>
          CokTech World
        </h2>
        <p style={{
          fontFamily: "'VT323', monospace",
          fontSize: 14,
          color: "var(--neon-primary)",
          opacity: 0.35,
        }}>
          「冒険」 Adventure
        </p>
      </div>

      {/* Station cards */}
      <div className="pb-8">
        {STATIONS.map((station, i) => (
          <div key={i} data-station-idx={i}>
            <MobileStationCard
              station={station}
              index={i}
              onNavigate={handleNavigate}
            />
          </div>
        ))}
      </div>

      {/* Outro CTA */}
      <div className="px-6 pb-20 text-center">
        <p style={{
          fontFamily: "'VT323', monospace",
          fontSize: 13,
          color: "var(--neon-primary)",
          opacity: 0.4,
          letterSpacing: "0.15em",
          marginBottom: 12,
        }}>
          「完了」 COMPLETE
        </p>
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "1.6rem",
          color: "var(--text-primary)",
          marginBottom: 10,
        }}>
          Ste pripravení?
        </h2>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          color: "rgba(200,196,208,0.35)",
          lineHeight: 1.7,
          maxWidth: 300,
          margin: "0 auto 24px",
        }}>
          Všetkých 8 levelov preskúmaných. Poďme vytvoriť niečo výnimočné.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setContactOpen(true)}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#000",
              background: "var(--neon-primary)",
              border: "none",
              padding: "10px 20px",
              letterSpacing: "0.1em",
            }}
          >
            [ KONTAKT ]
          </button>
          <button
            onClick={() => navigate("/balicky")}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "var(--neon-secondary)",
              background: "transparent",
              border: "1px solid rgba(255,140,0,0.3)",
              padding: "10px 20px",
              letterSpacing: "0.1em",
            }}
          >
            [ BALÍČKY ]
          </button>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
};

/* ══════════════════════════════════════════
   Desktop StoryScroll — full 3D experience
═══════════════════════════════════════════ */
const DesktopStoryScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [currentStation, setCurrentStation] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showOutro, setShowOutro] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const navigate = useNavigate();
  const { setAccent } = useNavAccent();
  const reducedMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Continuous progress lives in a ref — the 3D scene reads it in useFrame.
  // React state only changes on discrete station/phase transitions, so
  // scrolling no longer re-renders the whole tree every frame.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    setCurrentStation(Math.round(v * (STATIONS.length - 1)));
    setShowOutro(v > 0.965);
    setShowHint(v < 0.03);
    if (v > 0.01) setShowIntro(false);
  });

  const handleNavigate = useCallback(
    (route: string) => navigate(route),
    [navigate]
  );

  const handleModelClick = useCallback(
    (stationIndex: number) => handleNavigate(STATIONS[stationIndex].route),
    [handleNavigate]
  );

  const handleStart = useCallback(() => {
    setShowIntro(false);
  }, []);

  // Sync navbar accent with current station color
  useEffect(() => {
    const color = STATIONS[currentStation].color;
    const raw = COLOR_RAW[color] || "0,255,170";
    setAccent(color, raw);
    return () => setAccent("var(--neon-primary)", "0,255,170");
  }, [currentStation, setAccent]);

  const bgColor = useMemo(() => {
    const c = STATIONS[currentStation].color;
    if (c === "#00e5ff") return "#000304";
    if (c === "#FF3D71") return "#030002";
    if (c === "#a855f7") return "#020004";
    if (c === "#FF8C00") return "#030204";
    if (c === "#ff4757") return "#040001";
    if (c === "#4A9EFF") return "#000204";
    return "#000000";
  }, [currentStation]);

  return (
    <div ref={containerRef} id="coktech-world" style={{ height: "1200vh" }}>
      <div
        className="sticky top-0 overflow-hidden"
        style={{
          height: "100vh",
          minHeight: 500,
          background: bgColor,
          transition: "background 1.5s ease",
        }}
      >
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none z-[40]"
          style={{ background: "repeating-linear-gradient(transparent,transparent 1px,rgba(0,0,0,0.05) 1px,rgba(0,0,0,0.05) 2px)" }}
        />

        {/* HUD corners */}
        {["top-4 left-4 border-t border-l", "top-4 right-4 border-t border-r", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((cls, i) => (
          <span
            key={i}
            className={`absolute w-5 h-5 pointer-events-none z-30 ${cls}`}
            style={{ borderColor: `${STATIONS[currentStation].color}30`, transition: "border-color 0.5s" }}
          />
        ))}

        {/* Three.js canvas */}
        <Canvas
          camera={{ position: [4.6, 3.1, 5.6], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ position: "absolute", inset: 0 }}
          eventSource={typeof document !== "undefined" ? document.body : undefined}
        >
          <Scene3D progressRef={progressRef} onModelClick={handleModelClick} reducedMotion={reducedMotion} />
        </Canvas>

        {/* Pixel HUD */}
        <PixelHUD station={STATIONS[currentStation]} index={currentStation} />

        {/* Station overlay */}
        <AnimatePresence mode="wait">
          {!showIntro && !showOutro && (
            <StationOverlay
              station={STATIONS[currentStation]}
              index={currentStation}
              onNavigate={handleNavigate}
            />
          )}
        </AnimatePresence>

        {/* Right-side progress */}
        <ProgressBar progress={scrollYProgress} currentStation={currentStation} />

        {/* Intro */}
        <IntroOverlay visible={showIntro} onSkip={handleStart} />

        {/* Outro */}
        <OutroOverlay visible={showOutro} />

        {/* Scroll hint */}
        <AnimatePresence>
          {showHint && !showIntro && <ScrollHint />}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ── Main export — hybrid: 3D desktop / card-scroll mobile ── */
const StoryScroll3D = () => {
  const isMobile = useIsMobile();
  return isMobile ? <MobileStoryScroll /> : <DesktopStoryScroll />;
};

export default StoryScroll3D;
