import { motion, type MotionValue } from "framer-motion";
import { STATIONS } from "./stations";

interface ProgressBarProps {
  progress: MotionValue<number>;
  currentStation: number;
}

/**
 * Right-side vertical progress — driven directly by the scroll MotionValue,
 * so the fill animates without a single React re-render.
 */
const ProgressBar = ({ progress, currentStation }: ProgressBarProps) => (
  <div className="absolute right-4 sm:right-6 top-1/3 sm:top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none">
    {/* Vertical track */}
    <div className="relative w-px h-24 sm:h-40 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
      <motion.div
        className="absolute top-0 left-0 w-full h-full origin-top"
        style={{
          background: STATIONS[currentStation].color,
          scaleY: progress,
        }}
      />
    </div>

    {/* Station dots */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-24 sm:h-40 flex flex-col justify-between">
      {STATIONS.map((s, i) => {
        const active = i <= currentStation;
        return (
          <div key={i} className="flex items-center gap-2">
            <span
              className="block rounded-full transition-all duration-500"
              style={{
                width: i === currentStation ? 8 : 4,
                height: i === currentStation ? 8 : 4,
                background: active ? s.color : "rgba(255,255,255,0.15)",
                boxShadow: i === currentStation ? `0 0 8px ${s.color}` : "none",
              }}
            />
            <span
              className="font-mono transition-opacity duration-300 whitespace-nowrap"
              style={{
                fontSize: 9,
                color: active ? s.color : "var(--text-muted)",
                opacity: i === currentStation ? 1 : 0,
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

export default ProgressBar;
