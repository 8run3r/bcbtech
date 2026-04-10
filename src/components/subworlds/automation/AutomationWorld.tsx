import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CircuitBoard from "./CircuitBoard";
import PixelProgressBar from "../shared/PixelProgressBar";
import PixelCard from "../shared/PixelCard";
import StationModel from "../shared/StationModel";
import WorldTransition from "../shared/WorldTransition";
import type { ModelVariant } from "@/components/story-scroll/DraggableModel";

const STATIONS: {
  label: string; title: string; desc: string; techs: string[];
  cta: string; route: string; model: ModelVariant; modelScale: number;
}[] = [
  {
    label: "ROOM A1",
    title: "Workflow Automation",
    desc: "n8n, Make, Zapier — prepojenie nastrojov, automaticke notifikacie, pipeline bez manualnej prace.",
    techs: ["n8n", "Make", "Zapier", "Webhooks"],
    cta: "[ AUTOMATIZOVAT ]",
    route: "/balicky?tab=automation",
    model: "autoLoops",
    modelScale: 1.2,
  },
  {
    label: "ROOM B2",
    title: "AI Integracia",
    desc: "Custom AI agenti s Claude API. Chatboty, klasifikacia, sumarizacia, generovanie obsahu.",
    techs: ["Claude API", "GPT", "LangChain", "RAG"],
    cta: "[ AI RIESENIE ]",
    route: "/balicky?tab=automation",
    model: "crystal",
    modelScale: 1.1,
  },
  {
    label: "ROOM C3",
    title: "Data Pipelines",
    desc: "ETL procesy, data transformacie, automaticka fakturacia, reporting a analyticke dashboardy.",
    techs: ["ETL", "Supabase", "PostgreSQL", "APIs"],
    cta: "[ DATA PIPELINE ]",
    route: "/balicky?tab=automation",
    model: "webKnot",
    modelScale: 1.0,
  },
  {
    label: "FINAL ROOM",
    title: "Full Automation",
    desc: "Kompletna automatizacia biznisu na mieru. SLA, 24/7 podpora, end-to-end riesenie.",
    techs: ["Enterprise", "SLA", "Custom", "24/7"],
    cta: "[ KONZULTACIA ]",
    route: "/kontakt",
    model: "beacon",
    modelScale: 1.2,
  },
];

const COLOR = "#FF8C00";

const AutomationWorld = ({ onTeleport }: { onTeleport: () => void }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showTransition, setShowTransition] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const progress = activeIdx / Math.max(1, STATIONS.length - 1);

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("automation-world");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p = Math.max(0, Math.min(1,
        (window.innerHeight - rect.top) / (el.offsetHeight + window.innerHeight)
      ));
      setScrollProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goNext = useCallback(() => {
    if (activeIdx < STATIONS.length - 1) {
      setDirection(1);
      setActiveIdx((i) => i + 1);
    } else {
      setShowTransition(true);
      setTimeout(() => {
        setShowTransition(false);
        onTeleport();
      }, 1200);
    }
  }, [activeIdx, onTeleport]);

  const goPrev = useCallback(() => {
    if (activeIdx > 0) {
      setDirection(-1);
      setActiveIdx((i) => i - 1);
    }
  }, [activeIdx]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const autoEl = document.getElementById("automation-world");
      if (!autoEl) return;
      const rect = autoEl.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === "ArrowRight" || e.key === "d") goNext();
      if (e.key === "ArrowLeft" || e.key === "a") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div
      id="automation-world"
      className="relative overflow-hidden"
      style={{ height: "100vh", background: "#050200" }}
    >
      {/* Tile grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${COLOR}05 1px, transparent 1px), linear-gradient(90deg, ${COLOR}05 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* Circuit board canvas */}
      <div className="absolute inset-0 z-0" style={{ opacity: 0.65 }}>
        <CircuitBoard progress={progress} activeRoom={activeIdx} />
      </div>

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: "repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        }}
      />

      {/* HUD frame */}
      <div className="absolute inset-0 z-20 flex flex-col p-4 sm:p-6 pointer-events-none">
        <div className="flex items-start justify-between">
          <div>
            <span style={{ fontFamily: "'VT323', monospace", fontSize: 11, color: COLOR, opacity: 0.5, letterSpacing: "0.2em", display: "block" }}>
              WORLD_02 // AUTOMATION SECTOR
            </span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, color: COLOR, opacity: 0.2, letterSpacing: "0.1em", display: "block", marginTop: 2 }}>
              ROOM {activeIdx + 1} OF {STATIONS.length}
            </span>
          </div>
          <MiniMap activeIdx={activeIdx} total={STATIONS.length} color={COLOR} />
        </div>

        <div className="mt-auto flex items-end justify-between">
          <PixelProgressBar progress={(activeIdx + 1) / STATIONS.length} color={COLOR} label="PROGRESS" />
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: COLOR, opacity: 0.4 }}>
            {STATIONS[activeIdx].label}
          </span>
        </div>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 z-30 flex items-center justify-center px-4 sm:px-8 pointer-events-none">
        <div className="w-full max-w-5xl flex flex-col md:flex-row-reverse items-center gap-6">
          {/* Model */}
          <div className="w-full md:w-1/2 h-[200px] sm:h-[280px] pointer-events-none">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={`model-${activeIdx}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full h-full"
              >
                <StationModel
                  variant={STATIONS[activeIdx].model}
                  color={COLOR}
                  scale={STATIONS[activeIdx].modelScale}
                  scrollProgress={scrollProgress}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card */}
          <div className="w-full md:w-1/2 pointer-events-auto">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={`card-${activeIdx}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              >
                <PixelCard
                  stationLabel={STATIONS[activeIdx].label}
                  title={STATIONS[activeIdx].title}
                  description={STATIONS[activeIdx].desc}
                  techs={STATIONS[activeIdx].techs}
                  ctaText={STATIONS[activeIdx].cta}
                  ctaRoute={STATIONS[activeIdx].route}
                  color={COLOR}
                  isActive={true}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4">
        <NavButton onClick={goPrev} disabled={activeIdx === 0} color={COLOR} label="◄ BACK" />
        <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: COLOR, opacity: 0.35, letterSpacing: "0.15em" }}>
          {activeIdx + 1} / {STATIONS.length}
        </span>
        <NavButton
          onClick={goNext}
          color={COLOR}
          label={activeIdx === STATIONS.length - 1 ? "BACK TO DIGITAL ►" : "NEXT ►"}
          highlight={activeIdx === STATIONS.length - 1}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 7, color: COLOR, opacity: 0.2, letterSpacing: "0.15em" }}>
          ← A / D → | ARROW KEYS
        </span>
      </div>

      <WorldTransition
        visible={showTransition}
        targetLabel="WORLD_01 // DIGITAL SECTOR"
        targetColor="#00ffaa"
        targetColorRgb="0,255,170"
      />
    </div>
  );
};

const MiniMap = ({ activeIdx, total, color }: { activeIdx: number; total: number; color: string }) => {
  const positions = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }];
  return (
    <div className="flex flex-col items-end gap-1">
      <span style={{ fontFamily: "'VT323', monospace", fontSize: 9, color, opacity: 0.4, letterSpacing: "0.15em" }}>MAP</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 12px)", gap: 2 }}>
        {positions.slice(0, total).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              background: i === activeIdx ? color + "50" : i < activeIdx ? color + "20" : "transparent",
              borderColor: i <= activeIdx ? color + "70" : color + "20",
            }}
            transition={{ duration: 0.3 }}
            style={{ width: 12, height: 12, border: "1px solid" }}
          />
        ))}
      </div>
      <span style={{ fontFamily: "'VT323', monospace", fontSize: 9, color, opacity: 0.35 }}>
        {activeIdx + 1}/{total}
      </span>
    </div>
  );
};

const NavButton = ({
  onClick, disabled, color, label, highlight,
}: {
  onClick: () => void;
  disabled?: boolean;
  color: string;
  label: string;
  highlight?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      fontFamily: "'VT323', monospace",
      fontSize: 13,
      color: disabled ? color + "25" : highlight ? "#000" : color,
      background: highlight ? color : "transparent",
      border: `1px solid ${disabled ? color + "15" : color + (highlight ? "ff" : "40")}`,
      padding: "6px 16px",
      letterSpacing: "0.12em",
      cursor: disabled ? "default" : "none",
      transition: "all 0.2s",
      opacity: disabled ? 0.4 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled && !highlight) {
        (e.currentTarget as HTMLElement).style.borderColor = color + "80";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${color}20`;
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled && !highlight) {
        (e.currentTarget as HTMLElement).style.borderColor = color + "40";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }
    }}
  >
    {label}
  </button>
);

export default AutomationWorld;
