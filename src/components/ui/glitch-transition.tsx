import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Full-screen glitch transition overlay.
 * Plays horizontal slice distortion then fades.
 */
const GlitchTransition = ({ active, onComplete }: { active: boolean; onComplete?: () => void }) => {
  const [slices, setSlices] = useState<{ y: number; offset: number; height: number }[]>([]);

  useEffect(() => {
    if (!active) return;

    // Generate random horizontal slices
    const newSlices: typeof slices = [];
    let y = 0;
    while (y < 100) {
      const height = 2 + Math.random() * 8;
      newSlices.push({
        y,
        offset: (Math.random() - 0.5) * 20,
        height: Math.min(height, 100 - y),
      });
      y += height;
    }
    setSlices(newSlices);

    const timer = setTimeout(() => onComplete?.(), 600);
    return () => clearTimeout(timer);
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ background: "#000" }}
        >
          {slices.map((slice, i) => (
            <motion.div
              key={i}
              initial={{ x: slice.offset * 3, opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.15, delay: i * 0.008 }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${slice.y}%`,
                height: `${slice.height}%`,
                background: i % 3 === 0
                  ? "rgba(0,255,170,0.03)"
                  : i % 3 === 1
                  ? "rgba(255,140,0,0.02)"
                  : "transparent",
                borderTop: Math.random() > 0.7 ? "1px solid rgba(0,255,170,0.06)" : "none",
              }}
            />
          ))}

          {/* Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.2, times: [0, 0.5, 1] }}
            className="absolute inset-0"
            style={{ background: "var(--neon-primary)" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlitchTransition;
