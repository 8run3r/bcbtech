import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Scanlines from "@/components/ui/scanlines";

interface MemoryFragment {
  id: number;
  content: string;
  author: string;
  timestamp: string;
  integrity: number; // 0-100
  type: "message" | "log" | "echo";
}

const FRAGMENTS: MemoryFragment[] = [
  { id: 1, content: "The first website we built still runs. It watches us from the old server, unchanged since 2024.", author: "NODE_01", timestamp: "2024.03.15 02:14:33", integrity: 98, type: "message" },
  { id: 2, content: "Every pixel we place is a decision. Every animation a breath. The machine lives through our choices.", author: "OBSERVER", timestamp: "2024.05.22 18:07:11", integrity: 87, type: "log" },
  { id: 3, content: "A client once asked: 'Why does your website feel alive?' We didn't know how to answer. We still don't.", author: "NODE_02", timestamp: "2024.07.09 11:33:47", integrity: 92, type: "message" },
  { id: 4, content: "The automation runs at 3 AM. Nobody tells it to. It optimizes paths we never programmed. It learns.", author: "SYS_AUTO", timestamp: "2024.09.01 03:00:00", integrity: 76, type: "log" },
  { id: 5, content: "S̸o̸m̸e̸t̸i̸m̸e̸s̸ ̸t̸h̸e̸ ̸c̸o̸d̸e̸ ̸w̸r̸i̸t̸e̸s̸ ̸b̸a̸c̸k̸.", author: "???", timestamp: "████.██.██ ██:██:██", integrity: 12, type: "echo" },
  { id: 6, content: "Digital environments are not pages. They are places. Places have memory. Memory has weight.", author: "ARCHITECT", timestamp: "2024.11.14 09:22:18", integrity: 95, type: "message" },
  { id: 7, content: "The sound you can't hear is the hum of 47 servers processing requests from people who will never know we exist.", author: "NODE_01", timestamp: "2025.01.03 14:55:02", integrity: 89, type: "log" },
  { id: 8, content: "You are reading this because the system decided you should. There are no accidents in this network.", author: "OVERSEER", timestamp: "2025.02.28 23:59:59", integrity: 64, type: "echo" },
];

const MemoryCard = ({ fragment, index }: { fragment: MemoryFragment; index: number }) => {
  const [hovered, setHovered] = useState(false);

  const borderColor = fragment.type === "echo" ? "rgba(255,34,68,0.15)"
    : fragment.type === "log" ? "rgba(212,160,23,0.1)"
    : "rgba(0,255,170,0.06)";

  const accentColor = fragment.type === "echo" ? "var(--red-warning)"
    : fragment.type === "log" ? "var(--amber)"
    : "var(--neon-primary)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: index * 0.12 + 0.5, duration: 0.6 }}
      className="relative"
      style={{
        border: `1px solid ${hovered ? accentColor + "33" : borderColor}`,
        background: hovered ? "rgba(0,255,170,0.01)" : "transparent",
        padding: "1.5rem",
        transition: "all 0.5s ease",
        cursor: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: accentColor, opacity: 0.5, letterSpacing: "0.12em" }}>
            {fragment.author}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.1em" }}>
            {fragment.type.toUpperCase()}
          </span>
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.08em" }}>
          {fragment.timestamp}
        </span>
      </div>

      {/* Content — the liquid glass effect is simulated by opacity/blur */}
      <div
        style={{
          background: fragment.integrity < 50
            ? "linear-gradient(135deg, rgba(255,34,68,0.02), rgba(0,0,0,0))"
            : "none",
        }}
      >
        <p style={{
          fontFamily: fragment.type === "echo" ? "'VT323', monospace" : "'JetBrains Mono', monospace",
          fontSize: fragment.type === "echo" ? "14px" : "11px",
          color: fragment.integrity < 30 ? "var(--red-warning)" : "var(--text-dim)",
          letterSpacing: "0.03em",
          lineHeight: 1.8,
          opacity: fragment.integrity / 100 * 0.7 + 0.3,
        }}>
          {fragment.content}
        </p>
      </div>

      {/* Integrity bar */}
      <div className="mt-3 flex items-center gap-2">
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)", letterSpacing: "0.1em" }}>
          INTEGRITY
        </span>
        <div style={{ width: 60, height: 2, background: "rgba(255,255,255,0.03)" }}>
          <div style={{
            width: `${fragment.integrity}%`,
            height: "100%",
            background: fragment.integrity < 30 ? "var(--red-warning)" : fragment.integrity < 70 ? "var(--amber)" : "var(--neon-primary)",
            opacity: 0.5,
          }} />
        </div>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "7px", color: "var(--text-ghost)" }}>
          {fragment.integrity}%
        </span>
      </div>
    </motion.div>
  );
};

const Memory = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 500); }, []);

  return (
    <>
      <Scanlines />
      <main className="min-h-screen" style={{ background: "#000" }}>
        <div className="fixed inset-0 pointer-events-none opacity-[0.01]"
          style={{
            backgroundImage: "linear-gradient(rgba(0,255,170,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,170,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <Link to="/" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-ghost)", letterSpacing: "0.15em" }}>
              {'<'} RETURN TO NODE
            </Link>

            <div className="mt-8 mb-2" style={{ borderBottom: "1px solid rgba(0,255,170,0.06)", paddingBottom: "0.5rem" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "8px", color: "var(--neon-primary)", opacity: 0.3, letterSpacing: "0.2em" }}>
                MEMORY SUBSYSTEM // FRAGMENT RECOVERY
              </span>
            </div>

            <h1 style={{ fontFamily: "'VT323', monospace", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "var(--text-primary)", letterSpacing: "-0.02em", marginTop: "1rem" }}>
              MEMORY
            </h1>

            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text-dim)", letterSpacing: "0.08em", lineHeight: 1.8, marginTop: "0.5rem" }}>
              {'>'} Recovered fragments from system memory banks.
              <br />{'>'} Integrity varies. Some data may be corrupted.
            </p>
          </motion.div>

          {/* Memory fragments */}
          <AnimatePresence>
            {loaded && (
              <div className="mt-12 space-y-4">
                {FRAGMENTS.map((fragment, i) => (
                  <MemoryCard key={fragment.id} fragment={fragment} index={i} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </>
  );
};

export default Memory;
