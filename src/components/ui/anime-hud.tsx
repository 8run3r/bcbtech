import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimeHudProps {
  world: 1 | 2;
  className?: string;
}

const BAR_COUNT = 3;

const ProgressBar = ({ color, delay }: { color: string; delay: number }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWidth((prev) => {
        const next = prev + (0.4 + Math.random() * 0.3);
        return next >= 100 ? 0 : next;
      });
    }, 80 + delay * 30);
    return () => clearInterval(interval);
  }, [delay]);

  return (
    <div
      className="h-px w-16 rounded-full overflow-hidden"
      style={{ background: `${color}22` }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color, width: `${width}%` }}
        transition={{ ease: "linear" }}
      />
    </div>
  );
};

const AnimeHud = ({ world, className }: AnimeHudProps) => {
  const color = world === 1 ? "var(--neon-primary)" : "var(--neon-secondary)";
  const label =
    world === 1 ? "[ WORLD_01 // デジタル ]" : "[ WORLD_02 // 自動化 ]";

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-1.5 pointer-events-none",
        className
      )}
    >
      {/* Glass backing */}
      <div
        className="flex flex-col items-end gap-1.5 px-3 py-2 rounded-sm"
        style={{
          background: "var(--bg-glass)",
          border: "1px solid var(--border-glass)",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* World label + cursor */}
        <div
          className="flex items-center gap-1"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color,
            letterSpacing: "0.05em",
          }}
        >
          <span>{label}</span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "steps(1)" }}
          >
            ▮
          </motion.span>
        </div>

        {/* Progress bars */}
        <div className="flex flex-col items-end gap-0.5">
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <ProgressBar key={i} color={color} delay={i} />
          ))}
        </div>

        {/* Status row */}
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "9px",
            color,
            opacity: 0.5,
            letterSpacing: "0.1em",
          }}
        >
          STATUS: ONLINE
        </div>
      </div>
    </div>
  );
};

export default AnimeHud;
