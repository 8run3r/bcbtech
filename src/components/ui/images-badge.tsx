import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImagesBadgeProps {
  text: string;
  images: string[];
  className?: string;
  href?: string;
  target?: string;
  hoverTranslateY?: number;
  hoverSpread?: number;
  hoverRotation?: number;
}

const MAX_VISIBLE = 3;

export const ImagesBadge = ({
  text,
  images,
  className,
  href,
  target,
  hoverTranslateY = -38,
  hoverSpread = 22,
  hoverRotation = 14,
}: ImagesBadgeProps) => {
  const [hovered, setHovered] = useState(false);
  const visible = images.slice(0, MAX_VISIBLE);

  const rotations = [-hoverRotation, 0, hoverRotation];
  const offsets = [-hoverSpread, 0, hoverSpread];

  const inner = (
    <motion.div
      className={cn(
        "inline-flex items-center gap-2 glass rounded-full px-4 py-2 cursor-pointer select-none",
        className
      )}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Stacked images */}
      <div className="relative flex items-end" style={{ width: 48, height: 32 }}>
        {visible.map((src, i) => (
          <motion.img
            key={i}
            src={src}
            alt=""
            className="absolute rounded-sm object-cover border border-white/10"
            style={{
              width: 20,
              height: 14,
              left: "50%",
              bottom: 0,
              originX: "50%",
              originY: "100%",
              zIndex: i,
            }}
            animate={
              hovered
                ? {
                    x: offsets[i] ?? 0,
                    y: hoverTranslateY,
                    rotate: rotations[i] ?? 0,
                    width: 48,
                    height: 32,
                    opacity: 1,
                  }
                : {
                    x: i * 4 - 8,
                    y: 0,
                    rotate: 0,
                    width: 20,
                    height: 14,
                    opacity: 0.85 + i * 0.05,
                  }
            }
            transition={{ type: "spring", stiffness: 350, damping: 28, delay: i * 0.04 }}
          />
        ))}
      </div>

      <span
        className="font-mono text-xs whitespace-nowrap"
        style={{ color: "var(--text-muted)" }}
      >
        {text}
      </span>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target={target} rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return inner;
};

export default ImagesBadge;
