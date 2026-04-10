import { motion } from "framer-motion";

/** "WARP ZONE" portal at the bottom of each world to jump to the other */
const WorldTeleporter = ({
  targetWorld,
  color,
  onTeleport,
}: {
  targetWorld: "digital" | "automation";
  color: string;
  onTeleport: () => void;
}) => {
  const label = targetWorld === "digital" ? "WORLD_01 // DIGITAL" : "WORLD_02 // AUTOMATION";

  return (
    <div className="flex flex-col items-center py-16">
      {/* Divider line */}
      <div className="w-full max-w-xs mb-8" style={{ height: 1, background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />

      <motion.div
        className="flex flex-col items-center gap-4 cursor-none"
        whileHover={{ scale: 1.03 }}
        onClick={onTeleport}
      >
        {/* Portal frame */}
        <div
          className="relative px-10 py-6 flex flex-col items-center"
          style={{ border: `2px solid ${color}30` }}
        >
          {/* Blinking corners */}
          {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((pos, i) => (
            <motion.span
              key={i}
              className={`absolute ${pos} w-2 h-2`}
              style={{ background: color }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}

          <span style={{ fontFamily: "'VT323', monospace", fontSize: 11, color, opacity: 0.5, letterSpacing: "0.3em" }}>
            WARP ZONE
          </span>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 18, color: "var(--text-primary)", marginTop: 4 }}>
            {label}
          </span>
          <motion.span
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color, marginTop: 8, letterSpacing: "0.15em" }}
          >
            [ ENTER ]
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
};

export default WorldTeleporter;
