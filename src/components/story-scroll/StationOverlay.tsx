import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Station } from "./stations";

interface StationOverlayProps {
  station: Station;
  index: number;
  onNavigate: (route: string) => void;
}

const StationOverlay = ({ station, index, onNavigate }: StationOverlayProps) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, x: -28, filter: "blur(6px)" }}
    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
    exit={{ opacity: 0, x: 20, filter: "blur(6px)" }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    className="absolute bottom-20 left-4 right-4 sm:right-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-12 z-20 max-w-xs sm:max-w-sm"
  >
    <div
      className="relative px-5 py-4 sm:px-6 sm:py-5 overflow-hidden"
      style={{
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${station.color}10`,
      }}
    >
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l pointer-events-none" style={{ borderColor: `${station.color}45` }} />
      <span className="absolute top-0 right-0 w-3 h-3 border-t border-r pointer-events-none" style={{ borderColor: `${station.color}45` }} />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b border-l pointer-events-none" style={{ borderColor: `${station.color}45` }} />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r pointer-events-none" style={{ borderColor: `${station.color}45` }} />

      {/* Scan line sweep on entrance */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.2 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${station.color}, transparent)`,
          transformOrigin: "left",
        }}
      />
      {/* Subtitle with system code feel */}
      <div className="flex items-center gap-2 mb-1">
        <div
          style={{
            width: 4,
            height: 4,
            background: station.color,
            opacity: 0.6,
            boxShadow: `0 0 6px ${station.color}`,
          }}
        />
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "9px",
          color: station.color,
          letterSpacing: "0.15em",
          opacity: 0.7,
        }}>
          {station.subtitle}
        </p>
      </div>

      {/* Japanese label */}
      <p style={{
        fontFamily: "'VT323', monospace",
        fontSize: "14px",
        color: station.color,
        opacity: 0.3,
        marginBottom: "0.75rem",
        letterSpacing: "0.05em",
      }}>
        {station.label}
      </p>

      {/* Title — VT323 terminal style */}
      <h3
        className="glitch-text"
        data-text={station.title}
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
          color: "var(--text-primary)",
          marginBottom: "0.5rem",
          letterSpacing: "0.02em",
          textShadow: `0 0 20px ${station.color}15`,
        }}
      >
        {station.title}
      </h3>

      {/* Body */}
      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "10px",
        color: "var(--text-dim)",
        lineHeight: 1.8,
        marginBottom: "1rem",
        letterSpacing: "0.02em",
      }}>
        {station.body}
      </p>

      {/* CTA button — terminal style */}
      <button
        onClick={() => onNavigate(station.route)}
        className="inline-flex items-center gap-1.5 transition-all duration-300"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "10px",
          padding: "6px 14px",
          background: "transparent",
          border: `1px solid ${station.color}30`,
          color: station.color,
          letterSpacing: "0.1em",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = `${station.color}66`;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${station.color}15`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = `${station.color}30`;
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        [ {station.cta.toUpperCase()} ]
        <ArrowUpRight size={11} />
      </button>
    </div>
  </motion.div>
);

export default StationOverlay;
