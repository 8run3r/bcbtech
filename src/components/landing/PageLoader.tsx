import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const BOOT_FRAGMENTS = [
  "INIT_SYS",
  "LOAD_ENV",
  "MAP_NODES",
  "SYNC_DATA",
  "RENDER_UI",
  "COMPLETE",
];

const PageLoader = ({ progress = 0 }: { progress?: number }) => {
  const [fragment, setFragment] = useState(0);

  useEffect(() => {
    const idx = Math.min(Math.floor(progress / 18), BOOT_FRAGMENTS.length - 1);
    setFragment(idx);
  }, [progress]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: "#000" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,255,170,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(transparent, transparent 1px, rgba(0,0,0,0.06) 1px, rgba(0,0,0,0.06) 2px)",
        }}
      />

      {/* Central content */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Hex ring */}
        <div className="relative w-20 h-20">
          <motion.div
            className="absolute inset-0"
            style={{
              border: "1px solid rgba(0,255,170,0.15)",
              borderTop: "1px solid rgba(0,255,170,0.6)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2"
            style={{
              border: "1px solid rgba(0,255,170,0.08)",
              borderBottom: "1px solid rgba(0,255,170,0.4)",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {/* Center pulse */}
          <motion.div
            className="absolute inset-0 m-auto w-2 h-2"
            style={{ background: "var(--neon-primary)" }}
            animate={{ scale: [1, 1.8, 1], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Progress bar */}
        <div className="w-56 h-px" style={{ background: "rgba(0,255,170,0.1)" }}>
          <motion.div
            className="h-full"
            style={{ background: "var(--neon-primary)", boxShadow: "0 0 8px rgba(0,255,170,0.3)" }}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.max(progress, 3)}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </div>

        {/* Boot fragment text */}
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color: "var(--neon-primary)",
              letterSpacing: "0.15em",
              opacity: 0.6,
            }}
          >
            {BOOT_FRAGMENTS[fragment]}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "9px",
              color: "var(--text-dim)",
              letterSpacing: "0.1em",
            }}
          >
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Corner decorations */}
      {["top-4 left-4 border-t border-l", "top-4 right-4 border-t border-r", "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((cls, i) => (
        <motion.div
          key={i}
          className={`absolute w-5 h-5 ${cls}`}
          style={{ borderColor: "rgba(0,255,170,0.12)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 * i }}
        />
      ))}

      {/* Timestamp */}
      <motion.div
        className="absolute bottom-4 right-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 0.3 }}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "8px",
          color: "var(--text-dim)",
          letterSpacing: "0.1em",
        }}
      >
        CT-7X29 // {new Date().toISOString().replace("T", " ").split(".")[0]}
      </motion.div>
    </motion.div>
  );
};

export default PageLoader;
