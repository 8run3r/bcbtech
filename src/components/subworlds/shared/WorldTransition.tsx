import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Cinematic world-transition notification.
 * Auto-appears when user scrolls past a threshold — no button needed.
 * Shows a horizontal glitch bar with the destination world name.
 */
const WorldTransition = ({
  visible,
  targetLabel,
  targetColor,
  targetColorRgb,
}: {
  visible: boolean;
  targetLabel: string;
  targetColor: string;
  targetColorRgb: string;
}) => {
  const [glitchOffset, setGlitchOffset] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!visible) return;
    // Glitch bursts
    intervalRef.current = setInterval(() => {
      setGlitchActive(true);
      setGlitchOffset(Math.random() * 6 - 3);
      setTimeout(() => {
        setGlitchActive(false);
        setGlitchOffset(0);
      }, 80 + Math.random() * 120);
    }, 400 + Math.random() * 600);

    return () => clearInterval(intervalRef.current);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
        >
          {/* Full-width horizontal bars */}
          <div className="w-full relative">
            {/* Top scan line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: 1, background: targetColor, opacity: 0.8, transformOrigin: "center" }}
            />

            {/* Content bar */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden"
              style={{
                background: `rgba(0,0,0,0.92)`,
                borderTop: `1px solid ${targetColor}15`,
                borderBottom: `1px solid ${targetColor}15`,
                transformOrigin: "center",
              }}
            >
              {/* Glitch duplicate */}
              {glitchActive && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `translateX(${glitchOffset}px)`,
                    opacity: 0.4,
                    mixBlendMode: "screen",
                  }}
                >
                  <span style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: 14,
                    color: targetColor,
                    letterSpacing: "0.4em",
                  }}>
                    {targetLabel}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center py-5 gap-6">
                {/* Left decorative */}
                <div className="hidden sm:flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ width: 4, height: 4, background: targetColor }}
                  />
                  <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${targetColor}60, transparent)` }} />
                </div>

                <div className="flex flex-col items-center gap-1">
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 0.5, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8,
                      color: targetColor,
                      letterSpacing: "0.35em",
                    }}
                  >
                    TRANSITIONING TO
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                      fontFamily: "'VT323', monospace",
                      fontSize: 18,
                      color: "var(--text-primary)",
                      letterSpacing: "0.25em",
                      transform: `translateX(${glitchActive ? glitchOffset : 0}px)`,
                      transition: "transform 0.05s",
                    }}
                  >
                    {targetLabel}
                  </motion.span>
                  {/* Loading bar */}
                  <motion.div
                    className="mt-1 overflow-hidden"
                    style={{ width: 120, height: 2, background: `${targetColor}15` }}
                  >
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
                      style={{ height: "100%", background: targetColor, opacity: 0.6 }}
                    />
                  </motion.div>
                </div>

                {/* Right decorative */}
                <div className="hidden sm:flex items-center gap-2">
                  <div style={{ width: 40, height: 1, background: `linear-gradient(270deg, ${targetColor}60, transparent)` }} />
                  <motion.div
                    animate={{ opacity: [0.2, 0.6, 0.2] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    style={{ width: 4, height: 4, background: targetColor }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Bottom scan line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: 1, background: targetColor, opacity: 0.8, transformOrigin: "center" }}
            />

            {/* Side glow bleed */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: `0 0 60px ${targetColor}15, 0 0 120px ${targetColor}08`,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WorldTransition;
