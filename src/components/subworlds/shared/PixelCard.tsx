import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * Station card — TSUKI-inspired typography:
 * Syne 800 for titles, DM Sans for body, VT323/mono only for HUD labels.
 */
const PixelCard = ({
  stationLabel,
  title,
  description,
  techs,
  ctaText,
  ctaRoute,
  color = "#00ffaa",
  isActive,
}: {
  stationLabel: string;
  title: string;
  description: string;
  techs: string[];
  ctaText: string;
  ctaRoute: string;
  color?: string;
  isActive: boolean;
}) => {
  const navigate = useNavigate();
  const colorDim = color + "35";
  const colorBg = color + "07";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative max-w-lg w-full mx-auto"
      style={{
        border: `1px solid ${isActive ? color + "40" : color + "10"}`,
        background: isActive ? colorBg : "rgba(0,0,0,0.5)",
        padding: "28px 26px",
        transition: "border-color 0.4s, background 0.4s",
      }}
    >
      {/* Pixel corner dots */}
      {["-top-px -left-px", "-top-px -right-px", "-bottom-px -left-px", "-bottom-px -right-px"].map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos} w-1.5 h-1.5`}
          style={{ background: isActive ? color : "transparent", transition: "background 0.3s" }}
        />
      ))}

      {/* Station label — keep terminal style for the "system" label */}
      <div className="flex items-center gap-2.5 mb-5">
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color,
            letterSpacing: "0.22em",
            opacity: 0.45,
            textTransform: "uppercase",
          }}
        >
          {stationLabel}
        </span>
        {isActive && (
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ width: 5, height: 5, background: color, display: "inline-block" }}
          />
        )}
      </div>

      {/* Title — Syne 800, large, editorial */}
      <h3
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(1.6rem, 3.2vw, 2.2rem)",
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
          lineHeight: 1.05,
          marginBottom: 14,
        }}
      >
        {title}
      </h3>

      {/* Description — DM Sans, clean body text */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 400,
          fontSize: 13,
          color: "rgba(200,196,208,0.55)",
          lineHeight: 1.75,
          marginBottom: 20,
          letterSpacing: "0.01em",
        }}
      >
        {description}
      </p>

      {/* Tech tags — mono style, small */}
      <div className="flex flex-wrap gap-1.5 mb-7">
        {techs.map((t) => (
          <span
            key={t}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color,
              border: `1px solid ${colorDim}`,
              padding: "2px 8px",
              opacity: 0.6,
              letterSpacing: "0.04em",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* CTA button */}
      <button
        onClick={() => navigate(ctaRoute)}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          fontSize: 11,
          color: isActive ? "#000" : color,
          background: isActive ? color : "transparent",
          border: `1px solid ${isActive ? color : color + "30"}`,
          padding: "9px 22px",
          letterSpacing: "0.06em",
          cursor: "none",
          transition: "all 0.2s",
          display: "inline-block",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.filter = "brightness(1.15)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.filter = "none";
        }}
      >
        {ctaText.replace(/^\[|\]$/g, "")}
      </button>
    </motion.div>
  );
};

export default PixelCard;
