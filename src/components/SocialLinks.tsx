import { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, Github, Instagram, Twitter } from "lucide-react";

interface Social {
  icon: React.ElementType;
  href: string;
  label: string;
  hoverColor: string;
  glowColor: string;
  borderColor: string;
  bgColor: string;
}

const socials: Social[] = [
  {
    icon: Linkedin,
    href: "https://linkedin.com/in/brunocok",
    label: "LinkedIn",
    hoverColor: "#0A66C2",
    glowColor: "rgba(10,102,194,0.3)",
    borderColor: "rgba(10,102,194,0.3)",
    bgColor: "rgba(10,102,194,0.08)",
  },
  {
    icon: Github,
    href: "https://github.com/8run3r",
    label: "GitHub",
    hoverColor: "#ffffff",
    glowColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.2)",
    bgColor: "rgba(255,255,255,0.06)",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/coktech.tech",
    label: "Instagram",
    hoverColor: "#E1306C",
    glowColor: "rgba(225,48,108,0.3)",
    borderColor: "rgba(225,48,108,0.3)",
    bgColor: "rgba(225,48,108,0.08)",
  },
  {
    icon: Twitter,
    href: "https://x.com/coktech",
    label: "X",
    hoverColor: "#ffffff",
    glowColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.2)",
    bgColor: "rgba(255,255,255,0.06)",
  },
];

interface SocialLinksProps {
  className?: string;
}

const SocialLinks = ({ className = "" }: SocialLinksProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex items-center gap-1 ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "9999px",
        padding: "8px 16px",
        backdropFilter: "blur(12px)",
        width: "fit-content",
      }}
    >
      {socials.map((s, i) => {
        const Icon = s.icon;
        const isHovered = hoveredIndex === i;

        return (
          <motion.a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            onHoverStart={() => setHoveredIndex(i)}
            onHoverEnd={() => setHoveredIndex(null)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isHovered ? s.bgColor : "transparent",
              border: `1px solid ${isHovered ? s.borderColor : "transparent"}`,
              boxShadow: isHovered ? `0 0 12px ${s.glowColor}` : "none",
              transition: "background 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
              cursor: "pointer",
              minWidth: 44,
              minHeight: 44,
            }}
          >
            <Icon
              size={16}
              style={{
                color: isHovered ? s.hoverColor : "rgba(255,255,255,0.35)",
                transition: "color 200ms ease",
                flexShrink: 0,
              }}
            />
          </motion.a>
        );
      })}
    </motion.div>
  );
};

export default SocialLinks;
