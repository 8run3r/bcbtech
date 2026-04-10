import { useState, type ElementType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Linkedin, Github, Instagram } from "lucide-react";

interface Social {
  icon: ElementType;
  href: string;
  label: string;
  tag: string;
  color: string;
  glow: string;
}

const socials: Social[] = [
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/brunocok",
    label: "LinkedIn",
    tag: "LI",
    color: "#0A66C2",
    glow: "rgba(10,102,194,0.5)",
  },
  {
    icon: Github,
    href: "https://github.com/8run3r",
    label: "GitHub",
    tag: "GH",
    color: "#00ffaa",
    glow: "rgba(0,255,170,0.4)",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/coktech.tech",
    label: "Instagram",
    tag: "IG",
    color: "#E1306C",
    glow: "rgba(225,48,108,0.5)",
  },
];

const SocialLinks = ({ className = "" }: { className?: string }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {socials.map((s, i) => {
        const Icon = s.icon;
        const isHovered = hovered === i;

        return (
          <motion.a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(null)}
            whileTap={{ scale: 0.93 }}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 10px",
              background: isHovered ? `rgba(0,0,0,0.7)` : "rgba(0,0,0,0.4)",
              border: `1px solid ${isHovered ? s.color : "rgba(255,255,255,0.08)"}`,
              borderRadius: 2,
              cursor: "pointer",
              textDecoration: "none",
              overflow: "hidden",
              minHeight: 44,
              minWidth: 44,
              justifyContent: "center",
              transition: "border-color 0.2s, background 0.2s",
              boxShadow: isHovered
                ? `0 0 12px ${s.glow}, inset 0 0 8px rgba(0,0,0,0.5)`
                : "none",
            }}
          >
            {/* Scan line on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ top: "-100%" }}
                  animate={{ top: "200%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "linear" }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 1,
                    background: `linear-gradient(90deg, transparent, ${s.color}, transparent)`,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
              )}
            </AnimatePresence>

            {/* Corner brackets */}
            {isHovered && (
              <>
                <span style={{
                  position: "absolute", top: 2, left: 2,
                  width: 5, height: 5,
                  borderTop: `1px solid ${s.color}`,
                  borderLeft: `1px solid ${s.color}`,
                  pointerEvents: "none",
                }} />
                <span style={{
                  position: "absolute", bottom: 2, right: 2,
                  width: 5, height: 5,
                  borderBottom: `1px solid ${s.color}`,
                  borderRight: `1px solid ${s.color}`,
                  pointerEvents: "none",
                }} />
              </>
            )}

            <Icon
              size={14}
              style={{
                color: isHovered ? s.color : "rgba(255,255,255,0.4)",
                transition: "color 0.2s",
                flexShrink: 0,
                position: "relative",
                zIndex: 2,
              }}
            />

            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              letterSpacing: "0.1em",
              color: isHovered ? s.color : "rgba(255,255,255,0.25)",
              transition: "color 0.2s",
              position: "relative",
              zIndex: 2,
              textTransform: "uppercase",
            }}>
              {s.tag}
            </span>
          </motion.a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
